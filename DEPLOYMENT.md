# 🚀 VoiceWrite MCP - Deployment Guide

**Complete guide for deploying VoiceWrite MCP on any system**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment (5 minutes)](#quick-deployment-5-minutes)
3. [Linux Deployment](#linux-deployment)
4. [macOS Deployment](#macos-deployment)
5. [Windows Deployment (WSL2)](#windows-deployment-wsl2)
6. [Docker Deployment](#docker-deployment)
7. [Production Deployment](#production-deployment)
8. [Cloud Deployment](#cloud-deployment)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### **System Requirements**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 2 GB | 5+ GB SSD |
| **Network** | 1 Mbps | 10+ Mbps |
| **Audio** | Speakers/Headphones | USB Audio Device |

### **Software Requirements**

```bash
# Required
Docker >= 24.0
Docker Compose >= 2.24
Node.js >= 18.0
npm >= 9.0
Git >= 2.40

# Optional (for development)
Python >= 3.10
VS Code / Cursor
```

---

## ⚡ Quick Deployment (5 minutes)

### **Step 1: Clone Repository**

```bash
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin
```

### **Step 2: Start TTS Service**

```bash
docker compose up -d
```

### **Step 3: Verify TTS**

```bash
curl http://localhost:8000/health
# Expected: {"status":"ready","tts_available":true}
```

### **Step 4: Build Agent**

```bash
cd node-agent
npm install
npm run build
```

### **Step 5: Test Voice**

```bash
curl -X POST http://localhost:8000/speak-sync \
  -H "Content-Type: application/json" \
  -d '{"text":"VoiceWrite is ready!", "voice":"af_heart"}'
```

**🎉 You should hear voice through your speakers!**

---

## 🐧 Linux Deployment

### **Ubuntu/Debian**

#### **1. Install Docker**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose Plugin
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

#### **2. Install Node.js**

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### **3. Install FFmpeg**

```bash
sudo apt install -y ffmpeg
ffmpeg -version
```

#### **4. Deploy VoiceWrite**

```bash
# Clone repository
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin

# Start TTS service
docker compose up -d

# Build agent
cd node-agent
npm install
npm run build

# Test
node dist/index.js --help
```

#### **5. Configure Audio**

```bash
# Verify audio devices
aplay -l

# Test audio
speaker-test -t wav

# If using PulseAudio
pactl info
```

---

### **Fedora/RHEL**

```bash
# Install Docker
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install Node.js
sudo dnf install nodejs npm

# Install FFmpeg
sudo dnf install ffmpeg

# Deploy VoiceWrite
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin
docker compose up -d
cd node-agent && npm install && npm run build
```

---

## 🍎 macOS Deployment

### **1. Install Docker Desktop**

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop
open -a Docker
```

### **2. Install Node.js**

```bash
brew install node@18
node --version
```

### **3. Install FFmpeg**

```bash
brew install ffmpeg
```

### **4. Deploy VoiceWrite**

```bash
# Clone repository
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin

# Start TTS service
docker compose up -d

# Build agent
cd node-agent
npm install
npm run build

# Test
node dist/index.js --help
```

### **5. Configure Audio (macOS)**

```bash
# Audio is automatic on macOS
# Check System Preferences > Sound > Output
# Select your speakers/headphones
```

---

## 🪟 Windows Deployment (WSL2)

### **1. Install WSL2**

```powershell
# In PowerShell (Admin)
wsl --install
wsl --set-default-version 2
```

**Restart computer after installation**

### **2. Install Docker Desktop**

```powershell
# In PowerShell (Admin)
winget install Docker.DockerDesktop
```

**Configure Docker Desktop:**
- Open Docker Desktop
- Settings > Resources > WSL Integration
- Enable integration with your WSL distro

### **3. Install in WSL2**

```bash
# In WSL2 (Ubuntu)

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Clone repository
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin

# Start TTS service
docker compose up -d

# Build agent
cd node-agent
npm install
npm run build
```

### **4. Configure Audio (Windows)**

```bash
# Audio should work automatically through Windows
# If not, check WSL audio configuration

# Test audio
speaker-test -t wav
```

---

## 🐳 Docker Deployment

### **Docker Compose (Recommended)**

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  tts-service:
    build: ./tts-service
    container_name: voicewrite-tts
    ports:
      - "8000:8000"
    restart: unless-stopped
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./tts-service:/app
      - voicewrite-tts-models:/root/.cache
      - /dev/snd:/dev/snd  # Audio device
    devices:
      - /dev/snd:/dev/snd
    group_add:
      - audio

volumes:
  voicewrite-tts-models:
```

### **Start Services**

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f tts-service

# Stop services
docker compose down
```

### **Run Agent in Docker (Optional)**

**Create:** `node-agent/Dockerfile`

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js", "--voice", "--overlay"]
```

**Update:** `docker-compose.yml`

```yaml
services:
  tts-service:
    # ... (as above)
  
  node-agent:
    build: ./node-agent
    container_name: voicewrite-agent
    depends_on:
      - tts-service
    environment:
      - TTS_SERVICE_URL=http://tts-service:8000
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix
    network_mode: "host"
```

---

## 🏭 Production Deployment

### **Systemd Service (Linux)**

#### **1. Create Service File**

**File:** `/etc/systemd/system/voicewrite-tts.service`

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

#### **2. Create Agent Service**

**File:** `/etc/systemd/system/voicewrite-agent.service`

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

#### **3. Enable Services**

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

---

## ☁️ Cloud Deployment

### **AWS EC2**

#### **1. Launch Instance**

```bash
# Instance Type: t3.medium (2 vCPU, 4 GB RAM)
# AMI: Ubuntu 22.04 LTS
# Storage: 20 GB GP2
# Security Group: Allow SSH (22), HTTP (80)
```

#### **2. Install Dependencies**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg
```

#### **3. Deploy VoiceWrite**

```bash
# Clone repository
git clone https://github.com/ARAVINDAN20/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin

# Start services
docker compose up -d

# Build agent
cd node-agent
npm install
npm run build
```

### **Google Cloud Platform (GCP)**

```bash
# Create VM Instance
gcloud compute instances create voicewrite-vm \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB

# SSH into instance
gcloud compute ssh voicewrite-vm

# Follow AWS installation steps
```

### **DigitalOcean**

```bash
# Create Droplet (Ubuntu 22.04, 4 GB RAM)
# SSH into droplet
# Follow AWS installation steps
```

---

## 🔧 Troubleshooting

### **Docker Issues**

#### **Problem:** Docker permission denied

```bash
# Solution: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### **Problem:** Container won't start

```bash
# Check logs
docker logs voicewrite-tts

# Rebuild container
docker compose build --no-cache tts-service
docker compose up -d tts-service
```

### **Audio Issues**

#### **Problem:** No audio playback

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

# Check Docker audio access
docker exec voicewrite-tts aplay -l
```

#### **Problem:** FFmpeg not found

```bash
# Install FFmpeg
sudo apt install -y ffmpeg

# Verify
ffmpeg -version
ffplay -version
```

### **Node.js Issues**

#### **Problem:** Node version too old

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v18.x.x
```

#### **Problem:** npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### **TTS Service Issues**

#### **Problem:** TTS service not responding

```bash
# Check health
curl http://localhost:8000/health

# Check logs
docker logs voicewrite-tts

# Restart service
docker compose restart tts-service
```

#### **Problem:** Voice not generating

```bash
# Test directly
curl -X POST http://localhost:8000/speak-sync \
  -H "Content-Type: application/json" \
  -d '{"text":"Test", "voice":"af_heart"}'

# Check logs
docker logs voicewrite-tts | grep "TTS"
```

### **Network Issues**

#### **Problem:** Cannot connect to TTS service

```bash
# Check if service is running
docker compose ps

# Check port binding
netstat -tlnp | grep 8000

# Test connectivity
curl http://localhost:8000/health
```

#### **Problem:** Firewall blocking

```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp
sudo ufw status

# CentOS/RHEL
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

---

## 📊 Deployment Checklist

### **Pre-Deployment**

- [ ] System meets minimum requirements
- [ ] Docker installed and running
- [ ] Node.js 18+ installed
- [ ] FFmpeg installed
- [ ] Audio devices configured
- [ ] Network connectivity verified

### **Deployment**

- [ ] Repository cloned
- [ ] TTS service started
- [ ] Agent built successfully
- [ ] Voice test successful
- [ ] Browser opens correctly
- [ ] Overlay appears

### **Post-Deployment**

- [ ] All tests passing
- [ ] Logs clean (no errors)
- [ ] Resource usage acceptable
- [ ] Documentation accessible
- [ ] Backup strategy in place

---

## 📞 Support

### **Documentation**

- [README.md](./README.md) - Main documentation
- [INSTALLATION.md](./INSTALLATION.md) - Installation guide
- [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md) - Technology details
- [FAQ.md](./FAQ.md) - Frequently asked questions

### **Contact**

- **GitHub Issues:** https://github.com/ARAVINDAN20/voice_write_mcp_plugin/issues
- **Email:** aravindanm@karunya.edu.in
- **Discussions:** https://github.com/ARAVINDAN20/voice_write_mcp_plugin/discussions

---

**Last Updated:** February 23, 2026  
**Version:** 1.0.0  
**Maintainer:** ARAVINDAN20
