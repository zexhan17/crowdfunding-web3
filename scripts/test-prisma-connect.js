require('dotenv').config({ path: '.env' })
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function run() {
    try {
        console.log('Running test query...')
        const campaigns = await prisma.campaign.findMany({ where: { status: 'ACTIVE' }, take: 1 })
        console.log('Result:', campaigns)
    } catch (e) {
        console.error('Error from test query:')
        console.error(e)
        process.exitCode = 1
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

run()
