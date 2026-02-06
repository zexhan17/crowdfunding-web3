import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            creatorWallet,
            title,
            description,
            goalAmount,
            email,
            deadline,
            category,
            imageUrl,
            milestones,
        } = body

        // Validation
        if (!creatorWallet || !title || !description || !goalAmount || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create campaign
        const campaign = await prisma.campaign.create({
            data: {
                creatorWallet: creatorWallet.toLowerCase(),
                title,
                description,
                goalAmount,
                email,
                deadline: deadline ? new Date(deadline) : null,
                category,
                imageUrl,
                milestones: milestones
                    ? {
                        create: milestones.map((m: any, index: number) => ({
                            title: m.title,
                            description: m.description,
                            targetAmount: m.targetAmount,
                            order: index,
                        })),
                    }
                    : undefined,
            },
            include: {
                milestones: true,
            },
        })

        return NextResponse.json({ campaign }, { status: 201 })
    } catch (error) {
        console.error('Error creating campaign:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const excludeFulfilled = searchParams.get('excludeFulfilled') === 'true'
        const creatorWallet = searchParams.get('creatorWallet')

        const campaigns = await prisma.campaign.findMany({
            where: {
                ...(status && { status: status as any }),
                ...(creatorWallet && { creatorWallet: creatorWallet.toLowerCase() }),
                ...(excludeFulfilled && { NOT: { status: 'FULFILLED' } }),
            },
            include: {
                creator: {
                    select: {
                        walletAddress: true,
                        username: true,
                    },
                },
                _count: {
                    select: { transactions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ campaigns })
    } catch (error) {
        console.error('Error fetching campaigns:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
