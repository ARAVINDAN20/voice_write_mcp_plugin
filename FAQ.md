# ❓ VoiceWrite MCP - FAQ

**Frequently Asked Questions**

---

## 🔊 TTS & Voice Questions

### Q: Do I need to download the Kokoro model?

**A: NO!** VoiceWrite uses **Edge TTS** (Microsoft Edge's cloud-based TTS), not Kokoro.

**Why Edge TTS?**
- ✅ **No downloads** - Kokoro model is 310MB, Edge TTS is 0MB
- ✅ **Free** - No API key, no credit card
- ✅ **High quality** - Neural voices comparable to Kokoro
- ✅ **Always updated** - Microsoft maintains voices
- ✅ **Multiple voices** - 10+ voice options

**How it works:**
1. You send text to TTS service
2. TTS service calls Microsoft Edge API
3. Returns MP3 audio (1-2 seconds)
4. Plays through your speakers
5. Voice is cached locally for faster subsequent calls

**First call:** 2-3 seconds (fetch voice)  
**Subsequent calls:** <1 second (cached)

---

### Q: Can I use Kokoro instead of Edge TTS?

**A:** The current implementation uses Edge TTS for simplicity and zero setup. If you want to use Kokoro locally:

1. Kokoro requires 310MB model download
2. Requires additional dependencies (kokoro-onnx)
3. More complex setup
4. Runs offline (advantage)

**To add Kokoro support:**
```bash
# In tts-service/
pip install kokoro-onnx

# Modify main.py to use Kokoro instead of Edge TTS
# See old Kokoro implementation in git history
```

**Recommendation:** Use Edge TTS unless you have specific needs for offline TTS.

---

### Q: Where are voices stored?

**A:** Edge TTS voices are:
- **Not stored** - Fetched from Microsoft on-demand
- **Cached temporarily** - In Python's edge-tts cache
- **Auto-cleaned** - Old voices removed automatically

If you want to clear cache:
```bash
docker compose restart tts-service
```

---

### Q: Can I use custom voices?

**A:** Currently supported voices (in `tts-service/main.py`):

```python
VOICE_MAP = {
    "af_heart": "en-US-AriaNeural",
    "af_bella": "en-US-JennyNeural",
    "af_nicole": "en-US-GuyNeural",
    "af_nova": "en-US-DavisNeural",
    "af_river": "en-US-TonyNeural",
    "am_adam": "en-US-ChristopherNeural",
    "am_michael": "en-US-EricNeural",
    "am_onyx": "en-US-BrandonNeural",
    "am_echo": "en-US-JasonNeural",
    "am_puck": "en-US-SteffanNeural",
}
```

To add more voices, edit the `VOICE_MAP` in `tts-service/main.py`.

Available Edge TTS voices: https://github.com/rany2/edge-tts

---

## 🐛 Troubleshooting

### Q: No voice is playing

**A:** Check these in order:

1. **TTS service running:**
   ```bash
   docker compose ps
   # Should show: voicewrite-tts - Up (healthy)
   ```

2. **Test TTS directly:**
   ```bash
   curl -X POST http://localhost:8000/speak-sync \
     -H "Content-Type: application/json" \
     -d '{"text":"Test", "voice":"af_heart"}'
   ```
   You should hear: "Test"

3. **Check audio device:**
   ```bash
   aplay -l  # Linux
   pactl info  # Check PulseAudio
   ```

4. **Check Docker audio access:**
   ```bash
   docker logs voicewrite-tts
   # Should show: "✅ Audio played via ffplay"
   ```

5. **Restart TTS service:**
   ```bash
   docker compose restart tts-service
   ```

---

### Q: First TTS call is slow

**A:** This is normal! First call fetches the voice from Microsoft (2-3 seconds).

**Solution:** Subsequent calls are instant (<1 second) because voices are cached.

**To pre-cache voices:**
```bash
# Warm up common voices
curl -X POST http://localhost:8000/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Ready", "voice":"af_heart"}'
```

---

### Q: Can I use VoiceWrite offline?

**A:** **No**, Edge TTS requires internet connection.

**For offline use:**
1. Use Kokoro TTS (310MB download)
2. Use other offline TTS (Piper, Coqui TTS, etc.)
3. Modify `tts-service/main.py` to use offline TTS

**Note:** Browser automation also requires internet for most websites.

---

## 🔧 Configuration

### Q: How do I change the default voice?

**A:** Edit `tts-service/main.py`:

```python
VOICE_MAP = {
    "af_heart": "en-US-AriaNeural",  # Change this line
    # ...
}
```

Then restart:
```bash
docker compose restart tts-service
```

---

### Q: Can I adjust voice speed?

**A:** Yes! The `speed` parameter in TTS requests:

```json
{
  "text": "Hello",
  "voice": "af_heart",
  "speed": 1.5  # 1.5x speed
}
```

**Range:** 0.5 (slow) to 2.0 (fast)  
**Default:** 1.0 (normal)

---

## 📦 Installation

### Q: Do I need Docker?

**A:** **Yes**, for the TTS service.

**Why Docker?**
- ✅ Consistent environment
- ✅ All dependencies included (ffmpeg, Python, etc.)
- ✅ Easy to start/stop
- ✅ Isolated from host system

**Alternative:** Install TTS dependencies on host (not recommended):
```bash
# On host system
pip install edge-tts
apt install ffmpeg
python tts-service/main.py
```

---

### Q: Can I run without Docker?

**A:** Yes, but not recommended.

**Steps:**
1. Install Python 3.10+
2. Install Node.js 18+
3. Install FFmpeg
4. Install Python deps: `pip install edge-tts fastapi uvicorn`
5. Install Node deps: `cd node-agent && npm install`
6. Run TTS: `python tts-service/main.py`
7. Run agent: `node node-agent/dist/index.js`

**Docker is easier!**

---

## 🎯 Usage

### Q: What browsers are supported?

**A:** VoiceWrite uses **Playwright** which supports:
- ✅ Chromium (default)
- ✅ Firefox (configure in agent)
- ✅ WebKit (configure in agent)

**Default:** Chromium (Chrome-like)

---

### Q: Can I use VoiceWrite with [X] MCP client?

**A:** Yes! If it supports MCP protocol:
- ✅ Claude Desktop
- ✅ Cursor IDE
- ✅ VS Code (with MCP extension)
- ✅ Windsurf
- ✅ Any MCP-compatible client

**Configuration:** See [README.md](./README.md#-mcp-client-integration)

---

## 🆘 Support

### Q: I found a bug!

**A:** Please report it:
1. Check existing issues: https://github.com/ARAVINDAN20/voice_write_mcp_plugin/issues
2. Create new issue with:
   - Description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Logs (`docker logs voicewrite-tts`)

---

### Q: I have a feature request!

**A:** Great! Submit it:
1. Check existing discussions
2. Create GitHub discussion: https://github.com/ARAVINDAN20/voice_write_mcp_plugin/discussions
3. Describe your feature idea
4. Explain use case

---

### Q: How do I contact the developer?

**A:** 
- **Email:** aravindanm@karunya.edu.in
- **GitHub:** https://github.com/ARAVINDAN20
- **Issues:** https://github.com/ARAVINDAN20/voice_write_mcp_plugin/issues

---

## 📚 More Documentation

- **README.md** - Main documentation
- **INSTALLATION.md** - Installation guide
- **USAGE.md** - Usage examples
- **ARCHITECTURE.md** - Technical architecture
- **API.md** - API reference
- **CONTRIBUTING.md** - Contribution guide

---

**Still have questions?** Open an issue on GitHub!
