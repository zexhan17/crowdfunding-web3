import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CampaignCard } from '@/components/campaign-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatEther } from 'viem'
import { prisma } from '@/lib/prisma'

async function getUser(walletAddress: string) {
    try {
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
        return user
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}

async function getUserTransactions(walletAddress: string) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { donorWallet: walletAddress.toLowerCase() },
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
        return transactions
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return []
    }
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ wallet: string }>
}) {
    const { wallet } = await params
    const user = await getUser(wallet)
    const transactions = await getUserTransactions(wallet)

    if (!user) {
        notFound()
    }

    const activeCampaigns = user.campaigns.filter((c: any) => c.status === 'ACTIVE')
    const fulfilledCampaigns = user.campaigns.filter((c: any) => c.status === 'FULFILLED')

    const totalRaised = user.campaigns.reduce((sum: number, c: any) => {
        return sum + parseFloat(formatEther(BigInt(c.currentAmount)))
    }, 0)

    const totalBacked = transactions.reduce((sum: number, tx: any) => {
        return sum + parseFloat(formatEther(BigInt(tx.amount)))
    }, 0)

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    {user.username || 'Anonymous User'}
                                </h1>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {wallet}
                                </p>
                                {user.email && (
                                    <p className="text-sm">{user.email}</p>
                                )}
                            </div>
                            <Badge variant="outline">
                                Member since {new Date(user.createdAt).toLocaleDateString()}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Campaigns Created
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{user._count.campaigns}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Raised
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{totalRaised.toFixed(4)} ETH</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Backed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{totalBacked.toFixed(4)} ETH</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaigns */}
                <Tabs defaultValue="campaigns" className="w-full">
                    <TabsList>
                        <TabsTrigger value="campaigns">
                            My Campaigns ({user.campaigns.length})
                        </TabsTrigger>
                        <TabsTrigger value="backed">
                            Backed ({transactions.length})
                        </TabsTrigger>
                        <TabsTrigger value="achievements">
                            Achievements ({fulfilledCampaigns.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="campaigns" className="mt-6">
                        {user.campaigns.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {user.campaigns.map((campaign: any) => (
                                    <CampaignCard key={campaign.id} campaign={{
                                        ...campaign,
                                        creator: {
                                            walletAddress: user.walletAddress,
                                            username: user.username,
                                        },
                                        _count: { transactions: 0 }
                                    }} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-12 text-muted-foreground">
                                No campaigns created yet
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="backed" className="mt-6">
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((tx: any) => (
                                    <Card key={tx.id}>
                                        <CardContent className="flex items-center justify-between py-4">
                                            <div>
                                                <p className="font-medium">{tx.campaign.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="font-bold">
                                                {parseFloat(formatEther(BigInt(tx.amount))).toFixed(4)} ETH
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-12 text-muted-foreground">
                                No campaigns backed yet
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-6">
                        {fulfilledCampaigns.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {fulfilledCampaigns.map((campaign: any) => (
                                    <CampaignCard key={campaign.id} campaign={{
                                        ...campaign,
                                        creator: {
                                            walletAddress: user.walletAddress,
                                            username: user.username,
                                        },
                                        _count: { transactions: 0 }
                                    }} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-12 text-muted-foreground">
                                No fulfilled campaigns yet
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
