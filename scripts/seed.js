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

async function seed() {
    try {
        console.log('Seeding database...')

        // Create users
        const alice = await prisma.user.upsert({
            where: { walletAddress: '0xAlice' },
            update: {},
            create: {
                walletAddress: '0xAlice',
                email: 'alice@example.com',
                username: 'alice',
            },
        })

        const bob = await prisma.user.upsert({
            where: { walletAddress: '0xBob' },
            update: {},
            create: {
                walletAddress: '0xBob',
                email: 'bob@example.com',
                username: 'bob',
            },
        })

        // Create campaigns
        const camp1 = await prisma.campaign.create({
            data: {
                creatorWallet: alice.walletAddress,
                title: 'Build an Open-Source Toolkit',
                description: 'Funding to build an open-source toolkit for developers.',
                goalAmount: '5000',
                currentAmount: '1200',
                status: 'ACTIVE',
                email: 'alice@example.com',
                category: 'Software',
                imageUrl: null,
            },
        })

        const camp2 = await prisma.campaign.create({
            data: {
                creatorWallet: bob.walletAddress,
                title: 'Community Art Mural',
                description: 'A mural project to beautify the neighborhood.',
                goalAmount: '2000',
                currentAmount: '800',
                status: 'ACTIVE',
                email: 'bob@example.com',
                category: 'Art',
                imageUrl: null,
            },
        })

        // Optionally add a transaction
        await prisma.transaction.create({
            data: {
                campaignId: camp1.id,
                donorWallet: bob.walletAddress,
                amount: '100',
                transactionHash: `tx-${Date.now()}`,
            },
        })

        console.log('Seeding complete.')
    } catch (e) {
        console.error('Seed error:', e)
        process.exitCode = 1
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

seed()
