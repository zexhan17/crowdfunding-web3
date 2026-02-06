import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { walletAddress, email, username } = await req.json()

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            )
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
        })

        // If user doesn't exist, create new user
        if (!user) {
            user = await prisma.user.create({
                data: {
                    walletAddress: walletAddress.toLowerCase(),
                    email,
                    username,
                },
            })
        } else if (email || username) {
            // Update user if email or username provided
            user = await prisma.user.update({
                where: { walletAddress: walletAddress.toLowerCase() },
                data: {
                    ...(email && { email }),
                    ...(username && { username }),
                },
            })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Error in auth route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const walletAddress = searchParams.get('walletAddress')

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
            include: {
                campaigns: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { campaigns: true, transactions: true },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
