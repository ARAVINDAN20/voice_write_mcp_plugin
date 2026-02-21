# 🔌 VoiceWrite MCP - API Reference

**Complete API documentation for TTS service and MCP tools**

---

## 📋 Table of Contents

1. [TTS Service API](#tts-service-api)
2. [MCP Tools API](#mcp-tools-api)
3. [Error Codes](#error-codes)
4. [Rate Limiting](#rate-limiting)

---

## TTS Service API

Base URL: `http://localhost:8000`

### Health Check

**Endpoint:** `GET /health`

**Description:** Check TTS service health status

**Response:**
```json
{
  "status": "ready",
  "tts_available": true
}
```

**Status Codes:**
- `200` - Service healthy
- `503` - Service unavailable

---

### List Voices

**Endpoint:** `GET /voices`

**Description:** Get available TTS voices

**Response:**
```json
{
  "voices": [
    "af_heart",
    "af_bella",
    "af_nicole",
    "af_nova",
    "af_river",
    "am_adam",
    "am_michael",
    "am_onyx",
    "am_echo",
    "am_puck"
  ],
  "tts_available": true
}
```

---

### Generate Speech (Async)

**Endpoint:** `POST /speak`

**Description:** Generate speech and play asynchronously

**Request Body:**
```json
{
  "text": "string (required, max 500 chars)",
  "voice": "string (optional, default: af_heart)",
  "speed": "number (optional, default: 1.0)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World", "voice":"af_heart", "speed":1.0}'
```

**Response:** `200 OK` with audio stream (MP3)

**Headers:**
```
Content-Type: audio/mpeg
Content-Disposition: inline
Cache-Control: no-cache
```

---

### Generate Speech (Sync)

**Endpoint:** `POST /speak-sync`

**Description:** Generate speech and wait for playback completion

**Request Body:** Same as `/speak`

**Example Request:**
```bash
curl -X POST http://localhost:8000/speak-sync \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World"}'
```

**Response:**
```json
{
  "status": "played",
  "size": 31680
}
```

---

## MCP Tools API

### Tool: browser_navigate

**Schema:**
```json
{
  "name": "browser_navigate",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL to navigate to"
      }
    },
    "required": ["url"]
  }
}
```

**Success Response:**
```json
{
  "content": [
    {"type": "text", "text": "Navigated to https://example.com"},
    {"type": "text", "text": "\nAccessibility Snapshot:\n..."}
  ]
}
```

**Error Response:**
```json
{
  "isError": true,
  "content": [{"type": "text", "text": "Error: Timeout exceeded"}]
}
```

---

### Tool: browser_click

**Schema:**
```json
{
  "name": "browser_click",
  "inputSchema": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector"
      },
      "narration": {
        "type": "string",
        "description": "Custom narration text"
      }
    },
    "required": ["selector"]
  }
}
```

---

### Tool: browser_type

**Schema:**
```json
{
  "name": "browser_type",
  "inputSchema": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector"
      },
      "text": {
        "type": "string",
        "description": "Text to type"
      }
    },
    "required": ["selector", "text"]
  }
}
```

---

### Tool: browser_scroll

**Schema:**
```json
{
  "name": "browser_scroll",
  "inputSchema": {
    "type": "object",
    "properties": {
      "direction": {
        "type": "string",
        "enum": ["up", "down"]
      },
      "amount": {
        "type": "number",
        "default": 500
      }
    },
    "required": ["direction"]
  }
}
```

---

### Tool: browser_screenshot

**Schema:**
```json
{
  "name": "browser_screenshot",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

**Success Response:**
```json
{
  "content": [
    {
      "type": "image",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    },
    {"type": "text", "text": "Screenshot taken (11025 bytes)"}
  ]
}
```

---

### Tool: browser_evaluate

**Schema:**
```json
{
  "name": "browser_evaluate",
  "inputSchema": {
    "type": "object",
    "properties": {
      "script": {
        "type": "string",
        "description": "JavaScript code to execute"
      }
    },
    "required": ["script"]
  }
}
```

---

## Error Codes

### TTS Service Errors

| Code | Message | Description |
|------|---------|-------------|
| 400 | Empty text | Text parameter is empty or whitespace |
| 400 | Text too long | Text exceeds 500 character limit |
| 503 | Model loading | TTS engine not ready yet |
| 500 | TTS Error | Internal TTS generation error |

### Agent Errors

| Error | Description | Solution |
|-------|-------------|----------|
| Timeout exceeded | Action took too long | Increase timeout or check selector |
| Element not found | Selector doesn't match | Verify CSS selector |
| Navigation failed | Page didn't load | Check URL and network |
| Screenshot failed | Capture failed | Ensure page is loaded |

---

## Rate Limiting

### TTS Service

- **Default:** No limit (local deployment)
- **Recommended:** 100 requests/minute
- **Audio Queue:** Processes one at a time

### Agent

- **Tool Calls:** Sequential (one at a time)
- **TTS Calls:** 800ms minimum between calls
- **Browser Actions:** As page loads allow

---

## Example API Usage

### Complete Flow

```bash
# 1. Check health
curl http://localhost:8000/health

# 2. Get voices
curl http://localhost:8000/voices

# 3. Generate speech
curl -X POST http://localhost:8000/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome to VoiceWrite", "voice":"af_heart"}' \
  --output welcome.mp3

# 4. Play audio
ffplay -nodisp -autoexit welcome.mp3
```

---

**For usage examples, see [USAGE.md](./USAGE.md)**
