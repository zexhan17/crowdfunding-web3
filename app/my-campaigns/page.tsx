"use client"

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { parseEther, formatEther } from 'viem'

export default function MyCampaignsPage() {
    const { address, isConnected } = useAccount()
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        if (!isConnected || !address) {
            setCampaigns([])
            setLoading(false)
            return
        }
        fetchCampaigns()
    }, [isConnected, address])

    async function fetchCampaigns() {
        setLoading(true)
        try {
            const res = await fetch(`/api/campaigns?creatorWallet=${address}&excludeFulfilled=true`)
            const data = await res.json()
            setCampaigns(data.campaigns || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this campaign? This cannot be undone.')) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterWallet: address }),
            })
            if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'Failed to delete campaign')
                return
            }
            await fetchCampaigns()
        } catch (err) {
            console.error(err)
        } finally {
            setDeleting(null)
        }
    }

    function startEdit(campaign: any) {
        setEditingId(campaign.id)
        const goalEth = formatEther(BigInt(campaign.goalAmount))
        setForm({
            title: campaign.title,
            description: campaign.description,
            goalAmount: goalEth,
            category: campaign.category || '',
            deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().slice(0, 10) : '',
        })
    }

    async function submitEdit(id: string) {
        setSaving(true)
        try {
            const updates: any = {
                title: form.title,
                description: form.description,
                category: form.category || null,
                requesterWallet: address,
            }

            if (form.goalAmount) {
                try {
                    const wei = parseEther(form.goalAmount)
                    updates.goalAmount = wei.toString()
                } catch {
                    alert('Invalid goal amount')
                    return
                }
            }

            if (form.deadline) {
                updates.deadline = new Date(form.deadline).toISOString()
            }

            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })

            if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'Failed to update campaign')
                return
            }

            setEditingId(null)
            await fetchCampaigns()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    // Note: do not early-return based on `isConnected` to keep the DOM
    // structure stable between server and client renders and avoid
    // hydration mismatches. Render a connect prompt in the content area instead.

    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-green-500',
        FULFILLED: 'bg-blue-500',
        FAILED: 'bg-red-500',
        CLOSED: 'bg-gray-500',
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Campaigns</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your campaigns — edit details or remove them.
                    </p>
                </div>
                <Link href="/create">
                    <Button>+ Create New</Button>
                </Link>
            </div>

            {!isConnected ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔌</div>
                    <h2 className="text-2xl font-semibold mb-2">Connect your wallet</h2>
                    <p className="text-muted-foreground">Connect your wallet to view and manage your campaigns.</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Loading your campaigns...</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-2xl font-semibold mb-2">No campaigns yet</h2>
                    <p className="text-muted-foreground mb-6">
                        You haven&apos;t created any campaigns. Start one now!
                    </p>
                    <Link href="/create">
                        <Button>Create Campaign</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((c) => {
                        const current = parseFloat(formatEther(BigInt(c.currentAmount)))
                        const goal = parseFloat(formatEther(BigInt(c.goalAmount)))
                        const progress = goal > 0 ? (current / goal) * 100 : 0
                        const isEditing = editingId === c.id
                        const isDeleting = deleting === c.id

                        return (
                            <Card key={c.id} className="h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="line-clamp-2">{c.title}</CardTitle>
                                        <Badge className={statusColors[c.status] || 'bg-gray-500'}>
                                            {c.status}
                                        </Badge>
                                    </div>
                                    {c.category && (
                                        <Badge variant="outline" className="w-fit">
                                            {c.category}
                                        </Badge>
                                    )}
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col">
                                    {!isEditing && (
                                        <>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                {c.description}
                                            </p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-semibold">{current.toFixed(4)} ETH</span>
                                                    <span className="text-muted-foreground">of {goal.toFixed(4)} ETH</span>
                                                </div>
                                                <Progress value={Math.min(progress, 100)} />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{progress.toFixed(1)}% funded</span>
                                                    <span>{c._count?.transactions ?? 0} backers</span>
                                                </div>
                                            </div>

                                            {c.deadline && (
                                                <p className="text-xs text-muted-foreground mb-4">
                                                    Deadline: {new Date(c.deadline).toLocaleDateString()}
                                                </p>
                                            )}

                                            <Separator className="my-2" />

                                            <div className="mt-auto flex gap-2 pt-4">
                                                <Link href={`/campaign/${c.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => startEdit(c)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(c.id)}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {isEditing && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={form.title}
                                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    rows={4}
                                                    value={form.description}
                                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="goalAmount">Goal (ETH)</Label>
                                                <Input
                                                    id="goalAmount"
                                                    type="number"
                                                    step="0.0001"
                                                    value={form.goalAmount}
                                                    onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Input
                                                    id="category"
                                                    value={form.category}
                                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="deadline">Deadline</Label>
                                                <Input
                                                    id="deadline"
                                                    type="date"
                                                    value={form.deadline}
                                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    onClick={() => submitEdit(c.id)}
                                                    disabled={saving}
                                                    className="flex-1"
                                                >
                                                    {saving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setEditingId(null)}
                                                    disabled={saving}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
