import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/campaign-card'
import { prisma } from '@/lib/prisma'
import { runWithRetries } from '@/lib/db'

async function getFeaturedCampaigns() {
  try {
    const campaigns = await runWithRetries(() => prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
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
      take: 6,
    }))
    return campaigns
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

export default async function HomePage() {
  const campaigns = await getFeaturedCampaigns()

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Fund Ideas with Web3
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A decentralized crowdfunding platform where every transaction is transparent,
          secure, and powered by blockchain technology.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/campaigns">Browse Campaigns</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/create">Start a Campaign</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Wallet-Based Auth</h3>
            <p className="text-muted-foreground">
              Connect your Web3 wallet - no passwords needed
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-semibold mb-2">Direct Funding</h3>
            <p className="text-muted-foreground">
              Funds go directly to creators - no middleman
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <p className="text-muted-foreground">
              Track fulfilled campaigns and build reputation
            </p>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Campaigns</h2>
          <Button variant="outline" asChild>
            <Link href="/campaigns">View All</Link>
          </Button>
        </div>
        {campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign: any) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No campaigns yet. Be the first to create one!
          </div>
        )}
      </section>
    </div>
  )
}
