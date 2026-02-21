#!/bin/bash
set -e

# VoiceWrite MCP - Startup Script
# Starts TTS service and builds the Node agent

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TTS_URL="http://localhost:8000"
TTS_HEALTH_TIMEOUT=60  # seconds
NODE_AGENT_DIR="${SCRIPT_DIR}/node-agent"

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

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running or not installed."
        echo "Please start Docker Desktop or run: sudo systemctl start docker"
        exit 1
    fi
    log_success "Docker is running"
}

check_tts_service() {
    log_info "Waiting for TTS service at ${TTS_URL}..."
    
    local elapsed=0
    while ! curl -s "${TTS_URL}/health" > /dev/null 2>&1; do
        if [ $elapsed -ge $TTS_HEALTH_TIMEOUT ]; then
            log_error "TTS service failed to start within ${TTS_HEALTH_TIMEOUT} seconds"
            log_error "Check logs: docker logs voicewrite-tts"
            exit 1
        fi
        sleep 1
        elapsed=$((elapsed + 1))
        
        # Show progress every 5 seconds
        if [ $((elapsed % 5)) -eq 0 ]; then
            log_info "Still waiting... (${elapsed}s)"
        fi
    done
    
    log_success "TTS Service is ready! (${elapsed}s)"
}

build_node_agent() {
    log_info "Building VoiceWrite Node Agent..."
    
    cd "${NODE_AGENT_DIR}"
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install --silent
    fi
    
    log_info "Compiling TypeScript..."
    npm run build --silent
    
    if [ $? -eq 0 ]; then
        log_success "Node Agent built successfully"
    else
        log_error "Failed to build Node Agent"
        exit 1
    fi
    
    cd "${SCRIPT_DIR}"
}

start_tts_service() {
    log_info "Starting TTS Microservice (Docker)..."
    
    # Check if already running
    if docker ps | grep -q voicewrite-tts; then
        log_warning "TTS service is already running"
        read -p "Do you want to restart it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose restart tts-service
        else
            log_info "Keeping existing TTS service"
            return 0
        fi
    else
        docker compose up -d tts-service
    fi
    
    # Check if container started
    if [ $? -ne 0 ]; then
        log_error "Failed to start TTS service"
        log_error "Check docker-compose.yml for errors"
        exit 1
    fi
}

show_usage_info() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  VoiceWrite MCP System Ready!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "To use with your MCP client, configure:"
    echo ""
    echo "  ${YELLOW}command:${NC} node"
    echo "  ${YELLOW}args:${NC} [\"${NODE_AGENT_DIR}/dist/index.js\", \"--voice\", \"--overlay\"]"
    echo ""
    echo "Optional flags:"
    echo "  --mode <silent|minimal|full>  Narration mode (default: full)"
    echo "  --headless                     Run browser without UI"
    echo "  --debug                        Enable verbose logging"
    echo ""
    echo "Quick test:"
    echo "  node ${NODE_AGENT_DIR}/dist/index.js --headless --debug"
    echo ""
    echo "To stop all services:"
    echo "  ./stop.sh"
    echo ""
}

# Main execution
main() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   VoiceWrite MCP - Startup Script      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # Step 1: Check Docker
    check_docker
    
    # Step 2: Start TTS Service
    start_tts_service
    
    # Step 3: Wait for TTS health check
    check_tts_service
    
    # Step 4: Build Node Agent
    build_node_agent
    
    # Step 5: Show usage info
    show_usage_info
    
    # Auto-run agent if --run flag is passed
    if [ "$1" == "--run" ]; then
        log_info "Running Agent in foreground..."
        shift
        node "${NODE_AGENT_DIR}/dist/index.js" "$@"
    fi
}

# Run main function
main "$@"
