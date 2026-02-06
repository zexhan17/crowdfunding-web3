import { http, createConfig } from 'wagmi'
import { mainnet, polygon, base, sepolia } from 'wagmi/chains'
import { walletConnect, metaMask, coinbaseWallet } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const config = createConfig({
    chains: [mainnet, polygon, base, sepolia],
    connectors: [
        walletConnect({ projectId }),
        metaMask(),
        coinbaseWallet({ appName: 'Web3 Crowdfunding' }),
    ],
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [base.id]: http(),
        [sepolia.id]: http(),
    },
})
