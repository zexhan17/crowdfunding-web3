import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    pool: Pool | undefined
}

// Create pg pool with increased timeouts matching DATABASE_URL params.
// Increase max connections and timeouts to improve stability with remote poolers.
const pool = globalForPrisma.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.PGPOOL_MAX || '10', 10),
    // Time in ms before giving up on establishing a new connection
    connectionTimeoutMillis: parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || '60000', 10),
    // Time in ms a client must sit idle in the pool and not be checked out
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10),
    // Keep TCP connections alive to reduce reconnects
    keepAlive: true,
})

const adapter = new PrismaPg(pool)

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        // In development, show warnings but avoid repeating every transient error
        log: process.env.NODE_ENV === 'development' ? ['warn'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    globalForPrisma.pool = pool
}

