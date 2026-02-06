# Web3 Crowdfunding Platform

A decentralized, non-custodial crowdfunding platform built with Next.js, Wagmi, Viem and Prisma. Users connect with wallets, create campaigns, and fund projects using EVM-compatible chains.

Highlights
- Wallet-based authentication (MetaMask, WalletConnect, Coinbase Wallet)
- Create/manage campaigns with milestones and updates
- Non-custodial funding: funds go directly to creator wallets
- PostgreSQL + Prisma schema included, with a seed script for sample data

Tech stack
- Framework: Next.js (16.x)
- UI: shadcn/ui + Tailwind CSS
- Web3: wagmi + viem
- DB: Prisma + PostgreSQL

Quick Start

Prerequisites
- Node.js 18+
- PostgreSQL (local or hosted)

Install
```bash
git clone <your-repo-url>
cd crowdfunding-web3
npm install
```

Environment
Create a `.env` file in the project root. At minimum provide:

- `DATABASE_URL` — Postgres connection string used by Prisma and the app
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud Project ID
- `NEXT_PUBLIC_APP_URL` — App origin (e.g. `http://localhost:3000`)

Optional Postgres tuning variables used by `lib/prisma.ts`:
- `PGPOOL_MAX` — max connections (default: 10)
- `PG_CONNECTION_TIMEOUT_MS` — connection timeout in ms (default: 60000)
- `PG_IDLE_TIMEOUT_MS` — idle timeout in ms (default: 30000)

Local database setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates schema and applies migrations)
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

Run the app
```bash
npm run dev
```

Useful scripts (from `package.json`)
- `npm run dev` — Start Next.js in development
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run db:generate` — `prisma generate`
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:studio` — Open Prisma Studio
- `npm run db:reset` — `prisma migrate reset`
- `npm run db:seed` — Run `scripts/seed.js`
- `npm run setup` — Runs project `setup.sh` (if provided)

Database schema
The Prisma schema is in `prisma/schema.prisma`. Main models include `User`, `Campaign`, `Transaction`, `Milestone`, and `CampaignUpdate`. Amounts are stored as strings to avoid JavaScript number precision issues.

Web3 configuration
Chains and connectors are configured in `lib/web3/config.ts`. By default the app includes: Ethereum mainnet, Polygon, Base, and Sepolia (testnet). Provide your WalletConnect Project ID via `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

Seeding
Run `npm run db:seed` to populate the database with sample users, campaigns, and a sample transaction. The seeder (`scripts/seed.js`) uses its own connection pooling and disconnect logic.

Deployment

Recommended provider: Vercel. When deploying, set the required environment variables (`DATABASE_URL`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_APP_URL`, and any Postgres tuning variables you need).

Security
- Funds are non-custodial — users send funds directly to creator wallets.
- Verify wallet signatures for sensitive actions and secure any server-side APIs.

Contributing
Contributions and PRs welcome. Please open issues for bugs or feature requests.

License
MIT

Files referenced in this README:
- `package.json` — project scripts and dependencies
- `prisma/schema.prisma` — database schema
- `lib/prisma.ts` and `lib/db.ts` — Prisma client and DB helpers
- `lib/web3/config.ts` — chain/connectors configuration
# Web3 Crowdfunding Platform

A decentralized crowdfunding platform built with Next.js, Web3 technologies, and modern UI components. Fund projects directly with cryptocurrency using wallet-based authentication.

## Features

### Core Features
- 🔐 **Wallet-Based Authentication** - Connect with MetaMask, WalletConnect, or Coinbase Wallet
- 💰 **Direct Funding** - Send funds directly to creators via blockchain transactions
- 📊 **Campaign Management** - Create and manage fundraising campaigns
- 🏆 **Achievements System** - Track successfully funded campaigns
- 📈 **Real-time Progress** - Live updates on funding goals and milestones
- 👥 **Donor Transparency** - View all backers and contributions (with optional anonymity)

### Advanced Features
- 🎯 **Milestones** - Break funding goals into smaller, trackable milestones
- 📢 **Campaign Updates** - Creators can post updates to backers
- 📧 **Email Contact** - Direct communication with campaign creators
- 🗓️ **Deadline Management** - Set campaign end dates
- 🏷️ **Categories** - Organize campaigns by type
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Web3**: wagmi + viem
- **Blockchain**: EVM-compatible chains (Ethereum, Polygon, Base, Sepolia)
- **Database**: Prisma + PostgreSQL
- **Authentication**: Web3 wallet-based
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- WalletConnect Project ID ([Get one here](https://cloud.walletconnect.com/))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd crowdfunding-web3
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/crowdfunding_web3"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
crowdfunding-web3/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # User authentication
│   │   ├── campaigns/    # Campaign CRUD
│   │   └── transactions/ # Transaction handling
│   ├── campaign/[id]/    # Campaign detail page
│   ├── campaigns/        # All campaigns page
│   ├── create/           # Create campaign page
│   ├── profile/[wallet]/ # User profile page
│   ├── achievements/     # Achievements page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── providers/        # Context providers
│   ├── wallet-connect.tsx
│   ├── campaign-card.tsx
│   ├── fund-button.tsx
│   └── header.tsx
├── lib/
│   ├── web3/
│   │   └── config.ts     # Web3 configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## Database Schema

### User
- Stores wallet address (primary identifier)
- Optional username and email
- Tracks created campaigns and transactions

### Campaign
- Title, description, goal amount
- Current funding amount and status
- Creator relationship
- Optional deadline and category
- Milestones and updates

### Transaction
- Records all funding transactions
- Links donors to campaigns
- Stores transaction hash for verification
- Optional anonymous donations

### Milestone
- Campaign funding milestones
- Target amounts and completion status

### CampaignUpdate
- Creator updates to backers
- Timestamped announcements

## Usage Guide

### Connecting Your Wallet

1. Click "Connect Wallet" in the header
2. Select your preferred wallet provider
3. Approve the connection request
4. Your profile is automatically created

### Creating a Campaign

1. Connect your wallet
2. Navigate to "Create" or `/create`
3. Fill in campaign details:
   - Title and description
   - Funding goal (in ETH)
   - Contact email
   - Optional: deadline, category, milestones
4. Submit to create your campaign

### Funding a Campaign

1. Browse campaigns at `/campaigns`
2. Click on a campaign to view details
3. Click "Fund This Campaign"
4. Enter the amount you want to contribute
5. Confirm the transaction in your wallet
6. Wait for blockchain confirmation

### Tracking Progress

- View all campaigns on your profile
- Check fulfilled campaigns in "Achievements"
- Monitor milestone progress
- View donor list and updates

## Configuration

### Blockchain Networks

Supported networks are configured in `lib/web3/config.ts`:
- Ethereum Mainnet
- Polygon
- Base
- Sepolia (testnet)

To add more networks, modify the config file.

### WalletConnect Setup

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Add it to `.env` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Development

### Running Prisma Studio

View and edit your database:
```bash
npx prisma studio
```

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

### Database Hosting

Recommended PostgreSQL providers:
- [Neon](https://neon.tech/) - Serverless Postgres
- [Supabase](https://supabase.com/) - Open source alternative
- [Railway](https://railway.app/) - Full-stack platform

## Security Considerations

- All funds are sent **directly** to creator wallets (non-custodial)
- Wallet signatures should be validated for sensitive actions
- Transaction hashes are stored for verification
- Consider implementing admin moderation for spam prevention

## Roadmap

- [ ] Email notifications (SendGrid/Resend)
- [ ] Social sharing with OG images
- [ ] On-chain proof of campaigns
- [ ] Multi-chain support expansion
- [ ] Campaign comments/discussion
- [ ] NFT rewards for backers
- [ ] DAO governance for platform decisions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Web3 integration via [wagmi](https://wagmi.sh/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
