'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isConnected && address) {
            // Auto-create/fetch user on wallet connection
            fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address }),
            })
        }
    }, [isConnected, address])

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <Button variant="outline">Connect Wallet</Button>
    }

    if (isConnected && address) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">{formatAddress(address)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${address}`)}>
                        My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/create')}>
                        Create Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => disconnect()}>
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>Connect Wallet</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {connectors.map((connector) => (
                    <DropdownMenuItem
                        key={connector.id}
                        onClick={() => connect({ connector })}
                    >
                        {connector.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
