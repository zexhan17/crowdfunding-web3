import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatEther } from 'viem'

interface Campaign {
    id: string
    title: string
    description: string
    goalAmount: string
    currentAmount: string
    status: string
    category?: string
    deadline?: string
    creator: {
        walletAddress: string
        username?: string | null
    }
    _count: {
        transactions: number
    }
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
    const current = parseFloat(formatEther(BigInt(campaign.currentAmount)))
    const goal = parseFloat(formatEther(BigInt(campaign.goalAmount)))
    const progress = goal > 0 ? (current / goal) * 100 : 0
    const remaining = Math.max(goal - current, 0)

    const statusColors = {
        ACTIVE: 'bg-green-500',
        FULFILLED: 'bg-blue-500',
        FAILED: 'bg-red-500',
        CLOSED: 'bg-gray-500',
    }

    return (
        <Link href={`/campaign/${campaign.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                        <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                            {campaign.status}
                        </Badge>
                    </div>
                    {campaign.category && (
                        <Badge variant="outline" className="w-fit">
                            {campaign.category}
                        </Badge>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {campaign.description}
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-semibold">{current.toFixed(4)} ETH raised</span>
                            <span className="text-muted-foreground">{remaining.toFixed(4)} ETH left</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{progress.toFixed(1)}% funded</span>
                            <span>{campaign._count.transactions} backers</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    by {campaign.creator.username || `${campaign.creator.walletAddress.slice(0, 6)}...${campaign.creator.walletAddress.slice(-4)}`}
                </CardFooter>
            </Card>
        </Link>
    )
}
