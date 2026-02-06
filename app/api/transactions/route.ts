import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            campaignId,
            donorWallet,
            amount,
            transactionHash,
            blockNumber,
            isAnonymous = false,
        } = body

        // Validation
        if (!campaignId || !donorWallet || !amount || !transactionHash) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if transaction already exists
        const existingTx = await prisma.transaction.findUnique({
            where: { transactionHash },
        })

        if (existingTx) {
            return NextResponse.json(
                { error: 'Transaction already recorded' },
                { status: 409 }
            )
        }

        // Create transaction and update campaign in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    campaignId,
                    donorWallet: donorWallet.toLowerCase(),
                    amount,
                    transactionHash,
                    blockNumber,
                    isAnonymous,
                },
            })

            // Get current campaign
            const campaign = await tx.campaign.findUnique({
                where: { id: campaignId },
                include: { milestones: true },
            })

            if (!campaign) {
                throw new Error('Campaign not found')
            }

            // Calculate new amount
            const currentAmount = BigInt(campaign.currentAmount)
            const donationAmount = BigInt(amount)
            const newAmount = currentAmount + donationAmount
            const goalAmount = BigInt(campaign.goalAmount)

            // Check if goal is reached
            const isFulfilled = newAmount >= goalAmount

            // Update campaign
            const updatedCampaign = await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    currentAmount: newAmount.toString(),
                    ...(isFulfilled && campaign.status === 'ACTIVE'
                        ? {
                            status: 'FULFILLED',
                            fulfilledAt: new Date(),
                        }
                        : {}),
                },
            })

            // Update milestones
            for (const milestone of campaign.milestones) {
                if (!milestone.isReached) {
                    const targetAmount = BigInt(milestone.targetAmount)
                    if (newAmount >= targetAmount) {
                        await tx.milestone.update({
                            where: { id: milestone.id },
                            data: {
                                isReached: true,
                                reachedAt: new Date(),
                            },
                        })
                    }
                }
            }

            return { transaction, campaign: updatedCampaign }
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error('Error creating transaction:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const campaignId = searchParams.get('campaignId')
        const donorWallet = searchParams.get('donorWallet')

        const transactions = await prisma.transaction.findMany({
            where: {
                ...(campaignId && { campaignId }),
                ...(donorWallet && { donorWallet: donorWallet.toLowerCase() }),
            },
            include: {
                campaign: {
                    select: {
                        title: true,
                        id: true,
                    },
                },
                donor: {
                    select: {
                        walletAddress: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
