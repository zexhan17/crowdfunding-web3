import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
        return NextResponse.json({ error: 'Missing wallet' }, { status: 400 })
    }

    try {
        // Only return campaigns created by the provided wallet
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: 'FULFILLED',
                creatorWallet: wallet,
            },
            include: {
                creator: { select: { walletAddress: true, username: true } },
                _count: { select: { transactions: true } },
            },
            orderBy: { fulfilledAt: 'desc' },
        })

        return NextResponse.json({ campaigns })
    } catch (error) {
        console.error('Error fetching user achievements', error)
        return NextResponse.json({ campaigns: [] })
    }
}
