require('dotenv').config({ path: '.env' })
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

const id = process.argv[2]
if (!id) {
    console.error('Usage: node scripts/find-campaign.js <campaignId>')
    process.exit(1)
}

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
        console.log('Querying campaign id=', id)
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: { creator: true, transactions: true }
        })
        if (!campaign) {
            console.log('Not found')
        } else {
            console.log('Found:', campaign)
        }
    } catch (e) {
        console.error('Error querying campaign:')
        console.error(e)
        process.exitCode = 1
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

run()
