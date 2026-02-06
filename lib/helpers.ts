export function formatWalletAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function calculateProgress(current: string, goal: string): number {
    const currentBigInt = BigInt(current)
    const goalBigInt = BigInt(goal)

    if (goalBigInt === BigInt(0)) return 0

    return Number((currentBigInt * BigInt(100)) / goalBigInt)
}

export function isDeadlinePassed(deadline: string | Date | null): boolean {
    if (!deadline) return false
    return new Date(deadline) < new Date()
}
