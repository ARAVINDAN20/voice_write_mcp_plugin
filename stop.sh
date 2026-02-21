#!/bin/bash

# VoiceWrite MCP - Shutdown Script
# Stops all services and cleans up resources

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Main execution
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   VoiceWrite MCP - Shutdown Script     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running"
    exit 1
fi

# Stop TTS service
log_info "Stopping TTS service..."
if docker ps | grep -q voicewrite-tts; then
    docker compose stop tts-service
    log_success "TTS service stopped"
else
    log_warning "TTS service is not running"
fi

# Remove containers (optional cleanup)
read -p "Do you want to remove the containers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Removing containers..."
    docker compose down
    log_success "Containers removed"
else
    log_info "Containers kept for faster restart"
fi

# Kill any remaining node processes
log_info "Checking for orphaned Node processes..."
ORPHANED=$(pgrep -f "node.*voicewrite.*dist/index.js" || true)
if [ -n "$ORPHANED" ]; then
    log_warning "Found orphaned Node processes: $ORPHANED"
    read -p "Do you want to kill them? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "node.*voicewrite.*dist/index.js"
        log_success "Orphaned processes killed"
    fi
else
    log_info "No orphaned Node processes found"
fi

# Cleanup status
echo ""
log_success "VoiceWrite MCP shutdown complete!"
echo ""
echo "To start again, run:"
echo "  ./start.sh"
echo ""
