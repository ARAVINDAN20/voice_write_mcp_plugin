# 📦 VoiceWrite MCP - Installation Guide

**Complete step-by-step installation instructions for all platforms**

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Install (5 minutes)](#quick-install-5-minutes)
3. [Detailed Installation](#detailed-installation)
4. [Docker Setup](#docker-setup)
5. [Local Development Setup](#local-development-setup)
6. [Production Deployment](#production-deployment)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **OS** | Linux/macOS/WSL2 | Windows via WSL2 only |
| **CPU** | 2 cores | 4+ recommended |
| **RAM** | 4 GB | 8+ GB recommended |
| **Storage** | 2 GB free | SSD recommended |
| **Network** | Internet | For TTS generation |
| **Audio** | Speakers/Headphones | USB audio recommended |

### Software Requirements

| Software | Version | Required |
|----------|---------|----------|
| **Docker** | 24+ | ✅ Yes |
| **Docker Compose** | 2.24+ | ✅ Yes |
| **Node.js** | 18+ | ✅ Yes |
| **npm** | 9+ | ✅ Yes |
| **Git** | 2.0+ | ✅ Yes |
| **FFmpeg** | 7.1+ | ✅ Yes (in Docker) |

---

## Quick Install (5 minutes)

### Step 1: Clone Repository

```bash
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin
```

### Step 2: Start TTS Service

```bash
docker compose up -d
```

### Step 3: Verify TTS

```bash
curl http://localhost:8000/health
# Expected: {"status":"ready","tts_available":true}
```

### Step 4: Install Agent Dependencies

```bash
cd node-agent
npm install
npm run build
```

### Step 5: Test Voice Output

```bash
curl -X POST http://localhost:8000/speak-sync \
  -H "Content-Type: application/json" \
  -d '{"text":"Installation successful! VoiceWrite is ready.", "voice":"af_heart"}'
```

**🎉 You should hear:** *"Installation successful! VoiceWrite is ready."*

> **💡 About TTS Voices:**
>
> VoiceWrite uses **Edge TTS** (Microsoft Edge's cloud TTS service):
> - **No model downloads required** (saves 500MB+ disk space)
> - **Free to use** - No API key or credit card needed
> - **Automatic caching** - Voices cached locally after first use
> - **High quality** - Neural voices from Microsoft
> - **Always updated** - Latest voices automatically
>
> **First call note:** The first TTS request may take 2-3 seconds to fetch the voice. Subsequent calls are instant (cached).

---

## Detailed Installation

### Platform-Specific Instructions

#### Ubuntu/Debian Linux

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install Git
sudo apt install -y git

# Verify installations
docker --version
docker compose version
node --version
npm --version
ffmpeg -version

# Logout and login for Docker group changes
exit
```

#### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Node.js
brew install node@18

# Install FFmpeg
brew install ffmpeg

# Install Git (if not installed)
brew install git

# Verify installations
docker --version
docker compose version
node --version
npm --version
ffmpeg -version

# Start Docker Desktop
open -a Docker
```

#### Windows (WSL2)

```powershell
# In PowerShell (Admin)
# Enable WSL
wsl --install

# Install WSL2 kernel
wsl --update

# Set WSL2 as default
wsl --set-default-version 2

# Install Docker Desktop
winget install Docker.DockerDesktop

# Install Git
winget install Git.Git

# Restart computer
Restart-Computer
```

```bash
# In WSL2 (Ubuntu)
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Verify installations
node --version
npm --version
ffmpeg -version
```

---

## Docker Setup

### Step 1: Verify Docker Installation

```bash
docker --version
# Expected: Docker version 24.x.x

docker compose version
# Expected: Docker Compose version 2.24.x
```

### Step 2: Configure Docker for Audio

Create or edit `/etc/docker/daemon.json`:

```json
{
  "default-runtime": "runc",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### Step 3: Build TTS Service

```bash
cd voice_write_mcp_plugin
docker compose build tts-service
```

### Step 4: Start TTS Service

```bash
docker compose up -d tts-service
```

### Step 5: Verify Service

```bash
# Check container status
docker compose ps

# Expected output:
# NAME                STATUS          PORTS
# voicewrite-tts      Up (healthy)    0.0.0.0:8000->8000/tcp

# Check health
curl http://localhost:8000/health

# Check logs
docker logs voicewrite-tts
```

### Step 6: Configure Audio Permissions (Linux)

```bash
# Add user to audio group
sudo usermod -aG audio $USER

# Verify PulseAudio socket exists
ls -la /run/user/$(id -u)/pulse/native

# Test audio playback
speaker-test -t wav
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin
```

### Step 2: Install Node.js Dependencies

```bash
cd node-agent

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Build TypeScript

```bash
npm run build

# Verify build
ls -la dist/
# Expected: index.js, overlay.js
```

### Step 4: Configure Environment

Create `.env` file in project root:

```bash
# TTS Service
TTS_SERVICE_URL=http://localhost:8000

# Agent Settings
NARRATION_MODE=full
DEBUG=true
```

### Step 5: Test Agent

```bash
# Test help
node dist/index.js --help

# Test with debug
node dist/index.js --debug --headless

# Expected output:
# [LOG] Starting VoiceWrite MCP...
# [LOG] Config: {"voice":true,"overlay":true,"mode":"full"}
```

---

## Production Deployment

### Prerequisites

- Production server (Ubuntu 22.04+ recommended)
- Domain name (optional)
- SSL certificate (recommended)
- Systemd service manager

### Step 1: Install System Dependencies

```bash
sudo apt update
sudo apt install -y docker.io docker-compose nodejs npm ffmpeg git
```

### Step 2: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
sudo chown -R $USER:$USER voice_write_mcp_plugin
cd voice_write_mcp_plugin
```

### Step 3: Configure Systemd Service

Create `/etc/systemd/system/voicewrite-tts.service`:

```ini
[Unit]
Description=VoiceWrite TTS Service
After=network.target docker.service
Requires=docker.service

[Service]
Restart=always
WorkingDirectory=/opt/voice_write_mcp_plugin
ExecStart=/usr/bin/docker compose up -d tts-service
ExecStop=/usr/bin/docker compose stop tts-service

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/voicewrite-agent.service`:

```ini
[Unit]
Description=VoiceWrite MCP Agent
After=network.target voicewrite-tts.service
Requires=voicewrite-tts.service

[Service]
Type=simple
User=voicewrite
Group=voicewrite
WorkingDirectory=/opt/voice_write_mcp_plugin/node-agent
ExecStart=/usr/bin/node dist/index.js --voice --overlay
Restart=on-failure
Environment=NODE_ENV=production
Environment=TTS_SERVICE_URL=http://localhost:8000

[Install]
WantedBy=multi-user.target
```

### Step 4: Create System User

```bash
sudo useradd -r -s /bin/false voicewrite
sudo chown -R voicewrite:voicewrite /opt/voice_write_mcp_plugin
```

### Step 5: Enable and Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable voicewrite-tts
sudo systemctl enable voicewrite-agent

# Start services
sudo systemctl start voicewrite-tts
sudo systemctl start voicewrite-agent

# Check status
sudo systemctl status voicewrite-tts
sudo systemctl status voicewrite-agent
```

### Step 6: Configure Firewall (if applicable)

```bash
# Allow TTS port (if accessing remotely)
sudo ufw allow 8000/tcp

# Verify
sudo ufw status
```

---

## Verification

### Complete Verification Checklist

```bash
# 1. Check Docker containers
docker compose ps
# ✅ voicewrite-tts should be "Up (healthy)"

# 2. Check TTS health
curl http://localhost:8000/health
# ✅ Expected: {"status":"ready","tts_available":true}

# 3. Check available voices
curl http://localhost:8000/voices
# ✅ Expected: List of voices (af_heart, af_bella, etc.)

# 4. Test TTS generation
curl -X POST http://localhost:8000/speak-sync \
  -H "Content-Type: application/json" \
  -d '{"text":"Verification test", "voice":"af_heart"}'
# ✅ Expected: {"status":"played","size":XXXXX}
# ✅ You should hear: "Verification test"

# 5. Check agent build
cd node-agent && ls -la dist/
# ✅ Expected: index.js, overlay.js

# 6. Test agent help
node dist/index.js --help
# ✅ Expected: Help message with options

# 7. Test agent startup (headless)
node dist/index.js --headless --debug &
# ✅ Expected: [LOG] VoiceWrite MCP Agent running

# 8. Check audio output
aplay -l  # Linux
# ✅ Expected: List of audio devices
```

### Automated Verification Script

Create `scripts/verify-install.sh`:

```bash
#!/bin/bash

echo "🔍 VoiceWrite MCP Installation Verification"
echo "==========================================="

# Check Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    echo "✅ $(docker --version)"
else
    echo "❌ Not installed"
    exit 1
fi

# Check Docker Compose
echo -n "Docker Compose: "
if command -v docker compose &> /dev/null; then
    echo "✅ $(docker compose version)"
else
    echo "❌ Not installed"
    exit 1
fi

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo "✅ $(node --version)"
else
    echo "❌ Not installed"
    exit 1
fi

# Check TTS Service
echo -n "TTS Service: "
if curl -s http://localhost:8000/health | grep -q "ready"; then
    echo "✅ Running"
else
    echo "❌ Not running"
    exit 1
fi

# Check Agent Build
echo -n "Agent Build: "
if [ -f "node-agent/dist/index.js" ]; then
    echo "✅ Built"
else
    echo "❌ Not built"
    exit 1
fi

echo ""
echo "🎉 All checks passed! VoiceWrite MCP is ready."
```

Make executable and run:

```bash
chmod +x scripts/verify-install.sh
./scripts/verify-install.sh
```

---

## Troubleshooting

### Common Installation Issues

#### Docker Permission Denied

**Error:** `Got permission denied while trying to connect to the Docker daemon socket`

**Solution:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### TTS Service Won't Start

**Error:** Container exits immediately

**Solution:**
```bash
# Check logs
docker logs voicewrite-tts

# Rebuild
docker compose build --no-cache tts-service
docker compose up -d tts-service
```

#### No Audio Output

**Error:** TTS generates audio but no sound

**Solution:**
```bash
# Check audio devices
aplay -l

# Test audio
speaker-test -t wav

# Check PulseAudio
pactl info

# Restart PulseAudio
pulseaudio -k
pulseaudio --start
```

#### Node.js Version Too Old

**Error:** `SyntaxError: Unexpected token`

**Solution:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v18.x.x or higher
```

#### FFmpeg Not Found

**Error:** `ffplay: command not found`

**Solution:**
```bash
# Install FFmpeg
sudo apt install -y ffmpeg

# Verify
ffmpeg -version
ffplay -version
```

#### Agent Build Fails

**Error:** TypeScript compilation errors

**Solution:**
```bash
cd node-agent

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for errors
npm run build 2>&1 | tee build.log
```

### Getting Help

If you encounter issues not covered here:

1. **Check Logs:**
   ```bash
   docker logs voicewrite-tts
   journalctl -u voicewrite-agent
   ```

2. **Check GitHub Issues:**
   https://github.com/ARAVINDAN20/voice_write_mcp_plugin/issues

3. **Contact Support:**
   Email: aravindanm@karunya.edu.in

---

## Next Steps

After successful installation:

1. ✅ **Read [USAGE.md](./USAGE.md)** - Learn how to use VoiceWrite
2. ✅ **Configure MCP Client** - See [README.md](./README.md#-mcp-client-integration)
3. ✅ **Try Sample Prompts** - See [USAGE.md](./USAGE.md#-sample-prompts-library)
4. ✅ **Run Tests** - Verify everything works with test suite

---

**Installation complete! You're ready to use VoiceWrite MCP.** 🎉
