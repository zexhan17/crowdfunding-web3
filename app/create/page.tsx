'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CreateCampaignPage() {
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [milestones, setMilestones] = useState<Array<{ title: string; targetAmount: string }>>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!isConnected || !address) {
            toast.error('Please connect your wallet first')
            return
        }

        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            creatorWallet: address,
            title: formData.get('title'),
            description: formData.get('description'),
            goalAmount: (parseFloat(formData.get('goalAmount') as string) * 1e18).toString(),
            email: formData.get('email'),
            category: formData.get('category'),
            deadline: formData.get('deadline') || null,
            milestones: milestones.length > 0
                ? milestones.map(m => ({
                    ...m,
                    targetAmount: (parseFloat(m.targetAmount) * 1e18).toString()
                }))
                : undefined,
        }

        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                const result = await response.json()
                toast.success('Campaign created successfully!')
                router.push(`/campaign/${result.campaign.id}`)
            } else {
                toast.error('Failed to create campaign')
            }
        } catch (error) {
            console.error('Error creating campaign:', error)
            toast.error('An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const addMilestone = () => {
        setMilestones([...milestones, { title: '', targetAmount: '' }])
    }

    const updateMilestone = (index: number, field: 'title' | 'targetAmount', value: string) => {
        const updated = [...milestones]
        updated[index][field] = value
        setMilestones(updated)
    }

    const removeMilestone = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index))
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Create Campaign</h1>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Connect Wallet</CardTitle>
                        <CardDescription>
                            You need to connect your wallet to create a campaign
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Create Campaign</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input id="title" name="title" required placeholder="My Amazing Project" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={6}
                                    placeholder="Describe your project in detail..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goalAmount">Funding Goal (ETH) *</Label>
                                    <Input
                                        id="goalAmount"
                                        name="goalAmount"
                                        type="number"
                                        step="0.001"
                                        required
                                        placeholder="10.0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" placeholder="Technology" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Contact Email *</Label>
                                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deadline">Deadline (Optional)</Label>
                                <Input id="deadline" name="deadline" type="date" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Milestones (Optional)</CardTitle>
                            <CardDescription>
                                Break your funding goal into smaller milestones
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones.map((milestone, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Milestone title"
                                        value={milestone.title}
                                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="ETH"
                                        className="w-32"
                                        value={milestone.targetAmount}
                                        onChange={(e) => updateMilestone(index, 'targetAmount', e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeMilestone(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addMilestone}>
                                Add Milestone
                            </Button>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Campaign'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
