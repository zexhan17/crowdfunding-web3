import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function performReset() {
    const seedWallets = ['0xAlice', '0xBob']

    // Delete transactions from non-seed donors
    await prisma.transaction.deleteMany({ where: { donorWallet: { notIn: seedWallets } } })

    // Find campaigns created by non-seed creators
    const campaignsToDelete: { id: string }[] = await prisma.campaign.findMany({
        where: { creatorWallet: { notIn: seedWallets } },
        select: { id: true },
    })
    const campaignIds = campaignsToDelete.map((c) => c.id)

    if (campaignIds.length > 0) {
        // Remove transactions attached to those campaigns
        await prisma.transaction.deleteMany({ where: { campaignId: { in: campaignIds } } })
        // Delete campaigns (milestones & updates have cascade on delete)
        await prisma.campaign.deleteMany({ where: { id: { in: campaignIds } } })
    }

    // Delete users that are not seed users
    await prisma.user.deleteMany({ where: { walletAddress: { notIn: seedWallets } } })

    // Re-insert seed users and campaigns (idempotent via upsert)
    const alice = await prisma.user.upsert({
        where: { walletAddress: '0xAlice' },
        update: {},
        create: { walletAddress: '0xAlice', email: 'alice@example.com', username: 'alice' },
    })

    const bob = await prisma.user.upsert({
        where: { walletAddress: '0xBob' },
        update: {},
        create: { walletAddress: '0xBob', email: 'bob@example.com', username: 'bob' },
    })

    // Create seed campaigns if they don't exist (title is not unique in schema,
    // so use findFirst + create instead of upsert).
    const existing1 = await prisma.campaign.findFirst({ where: { title: 'Build an Open-Source Toolkit' } })
    if (!existing1) {
        await prisma.campaign.create({
            data: {
                creatorWallet: alice.walletAddress,
                title: 'Build an Open-Source Toolkit',
                description: 'Funding to build an open-source toolkit for developers.',
                goalAmount: '5000',
                currentAmount: '1200',
                status: 'ACTIVE',
                email: 'alice@example.com',
                category: 'Software',
            },
        })
    }

    const existing2 = await prisma.campaign.findFirst({ where: { title: 'Community Art Mural' } })
    if (!existing2) {
        await prisma.campaign.create({
            data: {
                creatorWallet: bob.walletAddress,
                title: 'Community Art Mural',
                description: 'A mural project to beautify the neighborhood.',
                goalAmount: '2000',
                currentAmount: '800',
                status: 'ACTIVE',
                email: 'bob@example.com',
                category: 'Art',
            },
        })
    }

    return { ok: true, removedCampaigns: campaignIds.length }
}

export async function GET() {
    try {
        const result = await performReset()
        return NextResponse.json(result)
    } catch (error) {
        console.error('Cron reset error', error)
        return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
    }
}
