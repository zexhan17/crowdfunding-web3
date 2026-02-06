import { AchievementsClient } from '@/components/achievements-client'

export default function AchievementsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Achievements</h1>
                <p className="text-muted-foreground">Successfully funded campaigns that reached their goals</p>
            </div>

            {/* Server-side listing of all DB achievements was removed to avoid
                exposing real data to unauthenticated visitors. The client
                component will show demo achievements and fetch the connected
                user's completed campaigns when a wallet connects. */}

            <AchievementsClient />
        </div>
    )
}
