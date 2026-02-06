"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FundButton } from '@/components/fund-button'
import { formatEther } from 'viem'

export function CampaignClient({ id }: { id: string }) {
    const [campaign, setCampaign] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        fetch(`/api/campaigns/${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return
                if (data?.campaign) {
                    setCampaign(data.campaign)
                } else {
                    setError('Campaign not found')
                }
            })
            .catch((e) => {
                console.error('Error fetching campaign (client):', e)
                if (!mounted) return
                setError('Temporary error fetching campaign')
            })
            .finally(() => {
                if (!mounted) return
                setLoading(false)
            })

        return () => {
            mounted = false
        }
    }, [id])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-muted-foreground">Loading campaign...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-semibold mb-2">{error}</h2>
                    <p className="text-muted-foreground">Try refreshing the page.</p>
                </div>
            </div>
        )
    }

    const current = parseFloat(formatEther(BigInt(campaign.currentAmount)))
    const goal = parseFloat(formatEther(BigInt(campaign.goalAmount)))
    const progress = goal > 0 ? (current / goal) * 100 : 0

    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-green-500',
        FULFILLED: 'bg-blue-500',
        FAILED: 'bg-red-500',
        CLOSED: 'bg-gray-500',
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-4xl font-bold">{campaign.title}</h1>
                            <Badge className={statusColors[campaign.status] || 'bg-gray-500'}>
                                {campaign.status}
                            </Badge>
                        </div>
                        {campaign.category && <Badge variant="outline">{campaign.category}</Badge>}
                    </div>

                    <Tabs defaultValue="description" className="w-full">
                        <TabsList>
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="updates">Updates ({campaign.updates?.length || 0})</TabsTrigger>
                            <TabsTrigger value="backers">Backers ({campaign.transactions?.length || 0})</TabsTrigger>
                            {campaign.milestones?.length > 0 && <TabsTrigger value="milestones">Milestones</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="description" className="pt-6">
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap">{campaign.description}</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="updates" className="pt-6">
                            {campaign.updates && campaign.updates.length > 0 ? (
                                <div className="space-y-4">
                                    {campaign.updates.map((update: any) => (
                                        <Card key={update.id}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{update.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{new Date(update.createdAt).toLocaleDateString()}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="whitespace-pre-wrap">{update.content}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No updates yet</p>
                            )}
                        </TabsContent>

                        <TabsContent value="backers" className="pt-6">
                            {campaign.transactions && campaign.transactions.length > 0 ? (
                                <div className="space-y-3">
                                    {campaign.transactions.map((tx: any) => (
                                        <Card key={tx.id}>
                                            <CardContent className="flex items-center justify-between py-4">
                                                <div>
                                                    <p className="font-medium">{tx.isAnonymous ? 'Anonymous' : tx.donor.username || `${tx.donor.walletAddress.slice(0, 6)}...${tx.donor.walletAddress.slice(-4)}`}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className="font-bold">{parseFloat(formatEther(BigInt(tx.amount))).toFixed(4)} ETH</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No backers yet</p>
                            )}
                        </TabsContent>

                        {campaign.milestones?.length > 0 && (
                            <TabsContent value="milestones" className="pt-6">
                                <div className="space-y-4">
                                    {campaign.milestones.map((milestone: any) => (
                                        <Card key={milestone.id}>
                                            <CardContent className="py-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">{milestone.title}</h4>
                                                        {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
                                                    </div>
                                                    {milestone.isReached && <Badge className="bg-green-500">Reached</Badge>}
                                                </div>
                                                <p className="text-sm">Target: {parseFloat(formatEther(BigInt(milestone.targetAmount))).toFixed(4)} ETH</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Funding Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-semibold">{current.toFixed(4)} ETH raised</p>
                                        <p className="text-muted-foreground">{Math.max(goal - current, 0).toFixed(4)} ETH left</p>
                                    </div>
                                </div>
                                <Progress value={Math.min(progress, 100)} />
                            </div>
                            <Separator />
                            {/* show until not fullfilled */}
                            {campaign.status === 'ACTIVE' &&
                                <FundButton campaignId={campaign.id} creatorWallet={campaign.creatorWallet} />
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
