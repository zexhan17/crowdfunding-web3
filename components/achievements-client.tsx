"use client"

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatEther, parseEther } from 'viem'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const DUMMY_ACHIEVEMENTS = [
    {
        id: 'd1',
        title: 'Community Food Drive',
        description: 'Provided meals to 100 families in need.',
        goalAmount: '5000000000000000000', // 5 ETH
        currentAmount: '5000000000000000000', // 5 ETH
        status: 'FULFILLED',
        creator: { walletAddress: '0xDemo1', username: 'DemoOrg' },
        _count: { transactions: 128 },
    },
    {
        id: 'd2',
        title: 'Clean Water Initiative',
        description: 'Built wells to supply clean water.',
        goalAmount: '3000000000000000000', // 3 ETH
        currentAmount: '3000000000000000000', // 3 ETH
        status: 'FULFILLED',
        creator: { walletAddress: '0xDemo2', username: 'DemoWater' },
        _count: { transactions: 64 },
    },
    {
        id: 'd3',
        title: 'School Supplies Drive',
        description: 'Supplied stationery to 500 students.',
        goalAmount: '2000000000000000000', // 2 ETH
        currentAmount: '2000000000000000000', // 2 ETH
        status: 'FULFILLED',
        creator: { walletAddress: '0xDemo3', username: 'DemoEd' },
        _count: { transactions: 42 },
    },
]

export function AchievementsClient() {
    const { isConnected } = useAccount()
    const [mounted, setMounted] = useState(false)
    const [items, setItems] = useState(() => DUMMY_ACHIEVEMENTS.map((a) => ({ ...a })))
    const [amounts, setAmounts] = useState<Record<string, string>>({})

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent rendering during the first client render to avoid
    // hydration mismatches with the server HTML.
    if (!mounted || !isConnected) return null

    const handleDemoFund = (id: string) => {
        const val = amounts[id]
        if (!val || Number(val) <= 0) {
            toast.error('Enter a valid amount')
            return
        }

        try {
            const addWei = parseEther(val)
            setItems((prev) => prev.map((it) => {
                if (it.id !== id) return it
                const current = BigInt(it.currentAmount || '0')
                const updated = (current + BigInt(addWei)).toString()
                return { ...it, currentAmount: updated }
            }))

            toast.success(`Added ${parseFloat(val).toFixed(4)} ETH (demo only)`)
            setAmounts((s) => ({ ...s, [id]: '' }))
        } catch (e) {
            toast.error('Invalid amount')
        }
    }

    return (
        <div className="mt-10">
            <div className="mb-4">
                <h2 className="text-2xl font-semibold">Demo Achievements</h2>
                <p className="text-sm text-muted-foreground">These achievements are dummy data for demo purposes.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((a) => {
                    const current = parseFloat(formatEther(BigInt(a.currentAmount)))
                    const goal = parseFloat(formatEther(BigInt(a.goalAmount)))
                    const progress = goal > 0 ? (current / goal) * 100 : 0

                    return (
                        <Card key={a.id} className="h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="line-clamp-2">{a.title}</CardTitle>

                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{a.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold">{current.toFixed(4)} ETH</span>
                                        <span className="text-muted-foreground">of {goal.toFixed(4)} ETH</span>
                                    </div>
                                    <Progress value={Math.min(progress, 100)} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{progress.toFixed(1)}% funded</span>
                                        <span>{a._count.transactions} backers</span>
                                    </div>
                                </div>


                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
