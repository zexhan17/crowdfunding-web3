import { CampaignCard } from '@/components/campaign-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { prisma } from '@/lib/prisma'
import { runWithRetries } from '@/lib/db'

async function getCampaigns() {
    try {
        const campaigns = await runWithRetries(() => prisma.campaign.findMany({
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
        }))
        return campaigns
    } catch (error) {
        console.error('Error fetching campaigns:', error)
        return []
    }
}

export default async function CampaignsPage() {
    const allCampaigns = await getCampaigns()
    const activeCampaigns = allCampaigns.filter((c: any) => c.status === 'ACTIVE')
    const fulfilledCampaigns = allCampaigns.filter((c: any) => c.status === 'FULFILLED')

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">All Campaigns</h1>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="all">All ({allCampaigns.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({activeCampaigns.length})</TabsTrigger>
                    <TabsTrigger value="fulfilled">Fulfilled ({fulfilledCampaigns.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    {allCampaigns.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allCampaigns.map((campaign: any) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No campaigns yet
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="active">
                    {activeCampaigns.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCampaigns.map((campaign: any) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No active campaigns
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="fulfilled">
                    {fulfilledCampaigns.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {fulfilledCampaigns.map((campaign: any) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No fulfilled campaigns yet
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
