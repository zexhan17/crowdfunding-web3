#!/bin/bash

echo "🚀 Setting up Web3 Crowdfunding Platform..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created. Please edit it with your configuration."
  echo ""
else
  echo "✅ .env file already exists"
  echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
  echo "✅ PostgreSQL connection successful"
  echo ""
  
  # Generate Prisma client
  echo "🔧 Generating Prisma client..."
  npx prisma generate
  echo ""
  
  # Run migrations
  echo "🗄️  Running database migrations..."
  npx prisma migrate dev --name init
  echo ""
  
  echo "✅ Database setup complete!"
else
  echo "⚠️  Could not connect to PostgreSQL."
  echo "Please make sure:"
  echo "  1. PostgreSQL is installed and running"
  echo "  2. DATABASE_URL in .env is correct"
  echo ""
  echo "After fixing the database connection, run:"
  echo "  npx prisma generate"
  echo "  npx prisma migrate dev --name init"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Get a WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "  3. Run 'npm run dev' to start the development server"
echo ""
