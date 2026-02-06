import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { title, content } = body

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            )
        }

        const update = await prisma.campaignUpdate.create({
            data: {
                campaignId: id,
                title,
                content,
            },
        })

        return NextResponse.json({ update }, { status: 201 })
    } catch (error) {
        console.error('Error creating campaign update:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
