import { CampaignCard } from '@/components/campaign-card'
import { AchievementsClient } from '@/components/achievements-client'
import { prisma } from '@/lib/prisma'
import { runWithRetries } from '@/lib/db'

async function getAchievements() {
    try {
        const campaigns = await runWithRetries(() => prisma.campaign.findMany({
            where: { status: 'FULFILLED' },
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
            orderBy: { fulfilledAt: 'desc' },
        }))
        return campaigns
    } catch (error) {
        // Log detailed Prisma error info to aid debugging
        try {
            console.error('Error fetching achievements:', {
                name: (error as any)?.name,
                code: (error as any)?.code,
                message: (error as any)?.message,
                meta: (error as any)?.meta,
            })
        } catch (e) {
            console.error('Error fetching achievements (fallback):', error)
        }

        return []
    }
}

export default async function AchievementsPage() {
    const achievements = await getAchievements()

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Achievements</h1>
                <p className="text-muted-foreground">
                    Successfully funded campaigns that reached their goals
                </p>
            </div>

            {achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((campaign: any) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-2xl font-semibold mb-2">No achievements yet</h2>
                    <p className="text-muted-foreground">
                        Be the first to successfully fund a campaign!
                    </p>
                </div>
            )}

            <AchievementsClient />

        </div>
    )
}
