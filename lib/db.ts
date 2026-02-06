export async function runWithRetries(
    fn: () => Promise<any>,
    attempts = 3,
    baseDelay = 500
) {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

    let lastError: any
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn()
        } catch (error: any) {
            lastError = error

            // Broad transient detection: network-level codes and common Prisma connection errors
            const transientCodes = [
                'ETIMEDOUT',
                'ECONNRESET',
                'EPIPE',
                'ENETUNREACH',
                'ECONNREFUSED',
            ]

            const prismaTransientCodes = ['P1001', 'P1010']

            const code = error?.code
            const message = String(error?.message || '').toLowerCase()

            const isTransient =
                transientCodes.includes(code) ||
                prismaTransientCodes.includes(code) ||
                message.includes('timeout') ||
                message.includes('timed out') ||
                message.includes('connection') && message.includes('closed')

            if (!isTransient || i === attempts - 1) break

            // Sleep with exponential backoff but avoid noisy per-attempt logging.
            const delay = baseDelay * Math.pow(2, i)
            await sleep(delay)
        }
    }

    // If the final error appears to be a transient DB/network error, return null
    // to allow callers to handle an empty result rather than letting the
    // raw Prisma error bubble up and produce noisy logs in dev.
    try {
        const code = lastError?.code
        const message = String(lastError?.message || '').toLowerCase()
        const transientCodes = ['ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ENETUNREACH', 'ECONNREFUSED']
        const prismaTransientCodes = ['P1001', 'P1010']

        const isTransient =
            transientCodes.includes(code) ||
            prismaTransientCodes.includes(code) ||
            message.includes('timeout') ||
            message.includes('timed out') ||
            (message.includes('connection') && message.includes('closed'))

        if (isTransient) {
            console.warn('Final DB error appears transient; returning null to caller.')
            return null
        }
    } catch (e) {
        // If anything goes wrong while analyzing the error, fall back to throwing.
    }

    throw lastError
}
