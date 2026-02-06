import { CampaignClient } from '@/components/campaign-client'

export default async function CampaignPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    // Render client-side to avoid SSR DB transient timeouts.
    return <CampaignClient id={id} />
}
