#!/bin/bash

# Production Deployment Script
# Market Intelligence Module

set -e

echo "🚀 Starting Production Deployment..."

# Configuration
ENVIRONMENT="production"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
DOCKER_REGISTRY="your-registry.com"
IMAGE_NAME="market-intelligence"
IMAGE_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "config/production/docker-compose.prod.yml" ]; then
        log_error "Production docker-compose file not found"
        exit 1
    fi
    
    if [ ! -f "config/production/env.production" ]; then
        log_error "Production environment file not found"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment
    if docker-compose -f config/production/docker-compose.prod.yml ps | grep -q "Up"; then
        log_info "Backing up current deployment..."
        docker-compose -f config/production/docker-compose.prod.yml exec postgres pg_dump -U postgres market_intelligence_db > "$BACKUP_DIR/database.sql"
        docker-compose -f config/production/docker-compose.prod.yml exec redis redis-cli BGSAVE
        log_info "Backup created at $BACKUP_DIR"
    else
        log_warn "No running deployment found, skipping database backup"
    fi
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building Docker image..."
    
    # Build the image
    docker build -f Dockerfile.prod -t $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG .
    
    # Push to registry (uncomment when ready)
    # docker push $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
    
    log_info "Docker image built successfully"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Copy production environment file
    cp config/production/env.production .env.production
    
    # Deploy with docker-compose
    docker-compose -f config/production/docker-compose.prod.yml down
    docker-compose -f config/production/docker-compose.prod.yml up -d
    
    log_info "Application deployed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for application to start
    sleep 30
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run migrations (adjust command based on your migration tool)
    docker-compose -f config/production/docker-compose.prod.yml exec app npm run migrate
    
    log_info "Database migrations completed"
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Remove old backups (keep last 5)
    ls -t ./backups/ | tail -n +6 | xargs -I {} rm -rf ./backups/{}
    
    log_info "Cleanup completed"
}

# Rollback function
rollback() {
    log_error "Deployment failed, rolling back..."
    
    if [ -d "$BACKUP_DIR" ]; then
        # Restore database from backup
        docker-compose -f config/production/docker-compose.prod.yml exec postgres psql -U postgres -d market_intelligence_db < "$BACKUP_DIR/database.sql"
        log_info "Rollback completed"
    else
        log_error "No backup available for rollback"
    fi
    
    exit 1
}

# Main deployment process
main() {
    log_info "Starting Market Intelligence Module deployment to $ENVIRONMENT"
    
    # Trap errors and rollback
    trap rollback ERR
    
    check_prerequisites
    create_backup
    build_and_push_image
    deploy_application
    run_migrations
    health_check
    cleanup
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Application is available at https://your-domain.com"
}

# Execute main function
main "$@"