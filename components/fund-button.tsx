'use client'

import { useState } from 'react'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

interface FundButtonProps {
    campaignId: string
    creatorWallet: string
}

export function FundButton({ campaignId, creatorWallet }: FundButtonProps) {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const { address } = useAccount()
    const [saving, setSaving] = useState(false)

    const handleFund = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!address) {
            toast.error('Please connect your wallet')
            return
        }

        // Instead of performing an on-chain transaction, record the funding
        // directly in the database as a demo/local record. Generate a demo
        // transaction hash to store as the transaction identifier.
        setSaving(true)
        try {
            const demoHash = `demo-${Date.now()}`
            await recordTransaction(demoHash)
        } catch (error: any) {
            console.error(error)
            toast.error('Failed to record funding')
        } finally {
            setSaving(false)
        }
    }

    const recordTransaction = async (txHash: string) => {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    donorWallet: address,
                    amount: parseEther(amount).toString(),
                    transactionHash: txHash,
                    // Mark demo so server/clients can treat this appropriately
                    meta: { demo: true },
                }),
            })

            if (response.ok) {
                toast.success('Funding recorded (demo)!')
                setOpen(false)
                setAmount('')
                // Reload page to show updated data
                window.location.reload()
            } else {
                const data = await response.json().catch(() => ({}))
                toast.error(data.error || 'Failed to record funding')
            }
        } catch (error) {
            console.error('Error recording transaction:', error)
            toast.error('Error recording transaction')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                    Fund This Campaign
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fund Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (ETH)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.001"
                            placeholder="0.1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground">
                        This records a demo contribution in the database only — no real
                        wallet transaction will be performed.
                    </div>
                    <Button
                        onClick={handleFund}
                        disabled={saving}
                        className="w-full"
                    >
                        {saving ? 'Saving...' : 'Record Funding (demo)'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
