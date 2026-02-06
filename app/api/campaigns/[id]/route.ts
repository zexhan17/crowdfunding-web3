import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        walletAddress: true,
                        username: true,
                        email: true,
                    },
                },
                transactions: {
                    include: {
                        donor: {
                            select: {
                                walletAddress: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                milestones: {
                    orderBy: { order: 'asc' },
                },
                updates: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ campaign })
    } catch (error) {
        console.error('Error fetching campaign:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { requesterWallet, ...updateData } = body

        const existing = await prisma.campaign.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // Verify the requester is the campaign creator
        if (requesterWallet && existing.creatorWallet !== requesterWallet.toLowerCase()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const campaign = await prisma.campaign.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({ campaign })
    } catch (error) {
        console.error('Error updating campaign:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json().catch(() => ({}))
        const requester = (body as any).requesterWallet

        const existing = await prisma.campaign.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // If requester wallet provided, verify it matches the creator
        if (requester && existing.creatorWallet !== requester.toLowerCase()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        await prisma.campaign.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting campaign:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
