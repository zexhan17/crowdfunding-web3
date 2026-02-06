import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This endpoint deletes all data that is not part of the seed and then
// re-inserts the canonical seed rows. To prevent accidental use in
// production, a matching `ADMIN_RESET_TOKEN` env var must be provided
// in the `x-admin-token` header.

export async function POST(req: Request) {
    const token = req.headers.get('x-admin-token')
    if (!process.env.ADMIN_RESET_TOKEN || token !== process.env.ADMIN_RESET_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Define seed rows to preserve / restore
    const seedWallets = ['0xAlice', '0xBob']

    try {
        // Delete transactions from non-seed donors
        const deletedTx = await prisma.transaction.deleteMany({
            where: { donorWallet: { notIn: seedWallets } },
        })

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

        // Remove any leftover milestones/updates that somehow remain.
        // Guard against empty `campaignIds` arrays which can produce an
        // invalid Prisma `notIn: []` invocation in some environments.
        if (campaignIds.length > 0) {
            await prisma.milestone.deleteMany({ where: { campaignId: { notIn: campaignIds } } }).catch(() => { })
            await prisma.campaignUpdate.deleteMany({ where: { campaignId: { notIn: campaignIds } } }).catch(() => { })
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

        const camp1 = await prisma.campaign.upsert({
            where: { title: 'Build an Open-Source Toolkit' },
            update: {},
            create: {
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

        const camp2 = await prisma.campaign.upsert({
            where: { title: 'Community Art Mural' },
            update: {},
            create: {
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

        return NextResponse.json({
            ok: true,
            deletedTx: deletedTx.count,
            removedCampaigns: campaignIds.length,
            seed: { alice: alice.walletAddress, bob: bob.walletAddress, camp1: camp1.id, camp2: camp2.id },
        })
    } catch (error) {
        console.error('Admin reset error', error)
        return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
    }
}
