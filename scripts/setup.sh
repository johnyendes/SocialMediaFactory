#!/bin/bash

# Social Media Factory - Setup Script

set -e

echo "🚀 Setting up Social Media Factory..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be >= 18.0.0${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 is not installed (required for agent execution)${NC}"
else
    echo -e "${GREEN}✅ Python version: $(python3 --version)${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and configure your environment variables${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Setup backend
echo -e "${BLUE}🔧 Setting up backend...${NC}"
cd backend
npm install

# Initialize database
echo -e "${YELLOW}🗄️  Initializing database...${NC}"
if [ -f prisma/dev.db ]; then
    echo -e "${YELLOW}⚠️  Database already exists${NC}"
else
    npm run db:push
    npm run db:seed
fi

cd ..

# Setup frontend
echo -e "${BLUE}🎨 Setting up frontend...${NC}"
cd frontend
npm install
cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "  1. Edit .env and configure environment variables"
echo "  2. Run 'npm run dev' to start development servers"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo -e "${BLUE}📖 Useful commands:${NC}"
echo "  npm run dev              - Start all services"
echo "  npm run dev:frontend     - Start frontend only"
echo "  npm run dev:backend      - Start backend only"
echo "  npm run db:studio        - Open Prisma Studio"
echo "  npm run test             - Run tests"
echo ""
echo -e "${GREEN}🎉 Social Media Factory is ready to use!${NC}"