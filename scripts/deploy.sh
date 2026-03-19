#!/bin/bash

# Social Media Factory - Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
echo -e "${YELLOW}📝 Loading environment variables...${NC}"
export $(cat .env | grep -v '^#' | xargs)

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}🔧 Deploying backend...${NC}"
    cd backend
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Run migrations
    echo "Running database migrations..."
    npm run db:push
    
    # Build
    echo "Building backend..."
    npm run build
    
    # Start backend
    echo "Starting backend server..."
    npm run start &
    
    cd ..
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}🎨 Deploying frontend...${NC}"
    cd frontend
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Build
    echo "Building frontend..."
    npm run build
    
    # Start frontend
    echo "Starting frontend server..."
    npm run start &
    
    cd ..
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
}

# Main deployment
case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        sleep 5
        deploy_frontend
        ;;
    *)
        echo "Usage: $0 {backend|frontend|all}"
        echo ""
        echo "Commands:"
        echo "  backend   - Deploy backend only"
        echo "  frontend  - Deploy frontend only"
        echo "  all       - Deploy both backend and frontend"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📊 Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"