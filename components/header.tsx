import Link from 'next/link'
import { WalletConnect } from './wallet-connect'

export function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold">
                    Web3 Crowdfunding
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/campaigns" className="hover:text-primary transition-colors">
                        Campaigns
                    </Link>

                    <Link href="/achievements" className="hover:text-primary transition-colors">
                        Achievements
                    </Link>
                    <Link href="/my-campaigns" className="hover:text-primary transition-colors">
                        My Campaigns
                    </Link>
                    <Link href="/create" className="hover:text-primary transition-colors">
                        Create
                    </Link>
                </nav>
                <WalletConnect />
            </div>
        </header>
    )
}
