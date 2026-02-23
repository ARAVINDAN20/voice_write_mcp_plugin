# 🏗️ VoiceWrite MCP - Technology Stack

**Complete technical overview of the VoiceWrite MCP system**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Components](#architecture-components)
4. [Dependencies](#dependencies)
5. [Infrastructure](#infrastructure)
6. [Development Tools](#development-tools)
7. [Production Requirements](#production-requirements)

---

## 🎯 System Overview

VoiceWrite MCP is a **browser automation system with real-time voice narration** built on the Model Context Protocol (MCP).

### Core Functionality:
- Browser automation via Playwright
- Real-time voice narration via Edge TTS
- Visual overlay with mute control
- MCP-compliant tool interface
- Docker-based deployment

---

## 💻 Technology Stack

### **Backend Services**

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **TTS Service** | FastAPI (Python) | 0.109.0 | REST API for TTS |
| **TTS Engine** | Edge TTS | 7.2.7 | Microsoft Neural TTS |
| **Audio Playback** | FFmpeg (ffplay) | 7.1.3 | System audio output |
| **MCP Agent** | Node.js | 18+ | MCP protocol handler |
| **Browser Engine** | Playwright | 1.59+ | Browser automation |
| **Language** | TypeScript | 5.0+ | Type-safe JavaScript |

### **Frontend Components**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Overlay UI** | Vanilla JavaScript | Red bubble indicator |
| **Audio Player** | Web Audio API | In-browser audio playback |
| **CSS Animations** | CSS3 | Pulse animation |

### **Infrastructure**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Containerization** | Docker | 24+ |
| **Orchestration** | Docker Compose | 2.24+ |
| **Audio System** | PulseAudio/ALSA | System audio |

---

## 🏛️ Architecture Components

### **1. TTS Service (Python/FastAPI)**

**Location:** `tts-service/`

**Files:**
```
tts-service/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Container configuration
└── .env                # Environment variables
```

**Key Technologies:**
- FastAPI 0.109.0 - Async web framework
- Edge TTS 7.2.7 - Microsoft TTS engine
- Uvicorn 0.27.0 - ASGI server
- SoundFile 0.13.1 - Audio file handling

**API Endpoints:**
```python
GET  /health     # Health check
GET  /voices     # List available voices
POST /speak      # Async TTS (non-blocking)
POST /speak-sync # Sync TTS (blocking)
```

### **2. Node Agent (Node.js/TypeScript)**

**Location:** `node-agent/`

**Files:**
```
node-agent/
├── src/
│   ├── index.ts          # Main MCP server
│   └── overlay.ts        # Browser overlay script
├── dist/                 # Compiled JavaScript
├── package.json          # Node dependencies
├── tsconfig.json        # TypeScript config
└── Dockerfile           # Container config
```

**Key Technologies:**
- @modelcontextprotocol/sdk 1.25+ - MCP protocol
- Playwright 1.59+ - Browser automation
- Axios 1.6+ - HTTP client
- Commander 11.1+ - CLI parsing

**MCP Tools:**
```typescript
browser_navigate   // Navigate to URL
browser_click      // Click element
browser_type       // Type text
browser_scroll     // Scroll page
browser_screenshot // Capture screenshot
browser_evaluate   // Execute JavaScript
```

### **3. Browser Overlay (JavaScript)**

**Location:** `node-agent/src/overlay.ts`

**Features:**
- Red bubble indicator (bottom-right)
- Pulse animation while speaking
- Alt+J mute toggle
- Audio injection via Web Audio API
- State management (muted/speaking)

---

## 📦 Dependencies

### **Python Dependencies** (`tts-service/requirements.txt`)

```txt
fastapi==0.109.0          # Web framework
uvicorn==0.27.0           # ASGI server
edge-tts>=6.1.0          # Microsoft TTS
soundfile>=0.12.1        # Audio I/O
```

### **Node.js Dependencies** (`node-agent/package.json`)

```json
{
  "@modelcontextprotocol/sdk": "^1.25.2",
  "playwright": "^1.59.0",
  "axios": "^1.6.0",
  "commander": "^11.1.0"
}
```

### **System Dependencies**

```bash
# Docker
docker >= 24.0
docker-compose >= 2.24

# Audio
ffmpeg >= 7.0
pulseaudio OR alsa-utils

# Node.js
nodejs >= 18.0
npm >= 9.0

# Python (for TTS service - in Docker)
python >= 3.10
```

---

## 🌐 Infrastructure

### **Docker Architecture**

```
┌─────────────────────────────────────────┐
│         Docker Host System              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Container: voicewrite-tts      │   │
│  │  - Python 3.12-slim             │   │
│  │  - FastAPI + Edge TTS           │   │
│  │  - Port: 8000                   │   │
│  │  - Volume: /dev/snd (audio)     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Host: Node Agent               │   │
│  │  - Node.js 18+                  │   │
│  │  - Playwright                   │   │
│  │  - MCP Server                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Browser: Chromium              │   │
│  │  - Playwright controlled        │   │
│  │  - Overlay injected             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### **Network Configuration**

| Service | Port | Protocol | Access |
|---------|------|----------|--------|
| TTS Service | 8000 | HTTP | localhost |
| MCP Agent | stdio | IPC | MCP Client |
| Browser | N/A | N/A | Local display |

---

## 🛠️ Development Tools

### **Required Tools**

```bash
# Version Control
git >= 2.40

# Code Editor
VS Code / Cursor / any editor

# Testing
curl           # API testing
docker logs    # Container logs
npm test       # Node tests
```

### **Optional Tools**

```bash
# Monitoring
htop           # System monitoring
docker stats   # Container stats

# Debugging
node --inspect # Node.js debugger
pdb            # Python debugger
```

---

## 🚀 Production Requirements

### **Minimum System Requirements**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 2 GB | 5+ GB SSD |
| **Network** | 1 Mbps | 10+ Mbps |
| **Audio** | Speakers/Headphones | USB Audio Device |

### **Operating System Support**

| OS | Support | Notes |
|----|---------|-------|
| **Linux** | ✅ Native | Ubuntu 22.04+, Debian 11+ |
| **macOS** | ✅ Native | macOS 12+ |
| **Windows** | ⚠️ WSL2 | Windows 11 + WSL2 |
| **Docker** | ✅ Required | Version 24+ |

### **Network Requirements**

| Requirement | Details |
|-------------|---------|
| **Internet** | Required for Edge TTS |
| **Firewall** | Allow outbound HTTPS (443) |
| **DNS** | Standard DNS resolution |
| **Proxy** | Supported via environment vars |

---

## 📊 Performance Metrics

### **TTS Performance**

| Metric | Value |
|--------|-------|
| **Voice Generation** | 1-2 seconds |
| **Audio Playback** | Real-time |
| **Voice Quality** | 24 kHz, 48 kbps MP3 |
| **Voices Available** | 10 neural voices |

### **Browser Performance**

| Metric | Value |
|--------|-------|
| **Page Load** | Standard browser speed |
| **Scroll Animation** | 1.5 seconds |
| **Screenshot** | <500ms |
| **Overlay Overhead** | <1% CPU |

### **System Resource Usage**

| Component | CPU | RAM |
|-----------|-----|-----|
| **TTS Service** | <5% | ~200MB |
| **Node Agent** | <10% | ~300MB |
| **Browser** | 20-50% | ~500MB |
| **Total** | ~65% | ~1GB |

---

## 🔐 Security Considerations

### **Data Flow**

```
User Input → MCP Client → Node Agent → TTS Service → Microsoft Azure
                ↓              ↓
          Localhost      Localhost
          (encrypted)    (plaintext)
```

### **Security Features**

- ✅ Localhost-only communication
- ✅ No data persistence
- ✅ No user data stored
- ✅ Docker isolation for TTS
- ✅ No external API keys required

### **Security Recommendations**

- 🔒 Run in isolated network
- 🔒 Use firewall rules
- 🔒 Regular security updates
- 🔒 Monitor resource usage
- 🔒 Audit logs regularly

---

## 📝 Configuration Files

### **Environment Variables**

```bash
# .env file
TTS_SERVICE_URL=http://localhost:8000
NARRATION_MODE=full
DEBUG=false
```

### **Docker Compose**

```yaml
version: '3.8'

services:
  tts-service:
    build: ./tts-service
    container_name: voicewrite-tts
    ports:
      - "8000:8000"
    volumes:
      - /dev/snd:/dev/snd
      - voicewrite-tts-models:/root/.cache

volumes:
  voicewrite-tts-models:
```

### **MCP Client Config**

```json
{
  "mcpServers": {
    "voicewrite": {
      "command": "node",
      "args": [
        "/path/to/voicewrite/node-agent/dist/index.js",
        "--voice",
        "--overlay"
      ]
    }
  }
}
```

---

## 🎯 Technology Decisions

### **Why Edge TTS?**

| Factor | Edge TTS | Alternatives |
|--------|----------|--------------|
| **Quality** | High (Neural) | Varies |
| **Cost** | Free | Paid (AWS, Google) |
| **Setup** | Simple | Complex |
| **Model Size** | 0 MB (cloud) | 500MB+ (local) |
| **Voices** | 10+ | Varies |

### **Why Playwright?**

| Factor | Playwright | Alternatives |
|--------|------------|--------------|
| **Browser Support** | Chromium, Firefox, WebKit | Varies |
| **Speed** | Fast | Varies |
| **Reliability** | High | Varies |
| **TypeScript** | Native | Varies |

### **Why FastAPI?**

| Factor | FastAPI | Alternatives |
|--------|---------|--------------|
| **Performance** | High | High |
| **Async Support** | Native | Varies |
| **Documentation** | Auto-generated | Manual |
| **Type Safety** | Pydantic | Varies |

---

## 📚 Additional Resources

### **Documentation Links**

- [README.md](./README.md) - Main documentation
- [INSTALLATION.md](./INSTALLATION.md) - Installation guide
- [USAGE.md](./USAGE.md) - Usage examples
- [API.md](./API.md) - API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details

### **External Links**

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Edge TTS GitHub](https://github.com/rany2/edge-tts)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Last Updated:** February 23, 2026  
**Version:** 1.0.0  
**Maintainer:** ARAVINDAN20
