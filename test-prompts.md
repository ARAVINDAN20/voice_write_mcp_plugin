# VoiceWrite MCP - Test Prompts

Production-quality test prompts for VoiceWrite MCP browser automation with voice narration.

---

## ✅ 1. BASIC TEST (Navigation + Search)

**Purpose:** Test core functionality - navigation, typing, clicking, narration

```text
Open https://www.wikipedia.org.

Search for "Artificial Intelligence".

Click the first article result.

Scroll down and summarize what Artificial Intelligence means.

Narrate each major action while performing it.
```

**Tests:**
- `browser_navigate`
- `browser_type`
- `browser_click`
- `browser_scroll`
- Snapshot parsing
- Narration flow
- Overlay audio

---

## ✅ 2. REAL-WORLD TASK (Shopping Simulation)

**Purpose:** Test complex navigation, filtering, multiple clicks

```text
Open https://www.amazon.com.

Search for "wireless headphones".

Filter results to 4 stars and above.

Open the first product.

Read the title and price.

Narrate what you are doing step by step.
```

**Tests:**
- Complex navigation
- Filtering UI
- Multiple clicks
- Snapshot extraction
- Narration clarity

---

## ✅ 3. FORM INTERACTION TEST

**Purpose:** Test form filling, submission, state changes

```text
Open https://httpbin.org/forms/post.

Fill in the form with:
- Name: John Doe
- Email: john@example.com
- Message: Testing VoiceWrite automation

Submit the form.

Explain what you are doing during each step.
```

**Tests:**
- `browser_type`
- Form submission
- State change detection
- Narration of user input actions

---

## ✅ 4. ERROR HANDLING TEST

**Purpose:** Test error narration and graceful failure

```text
Open https://example.com.

Try to click an element with selector "#does-not-exist".

Explain what happens and how you handle the error.
```

**Tests:**
- Error narration prompt
- Graceful failure explanation
- TTS on failure
- Error recovery

---

## ✅ 5. MULTI-STEP WORKFLOW TEST

**Purpose:** Test tab management, page transitions, context switching

```text
Open https://news.ycombinator.com.

Click the first news article.

Open it in a new tab if possible.

Summarize what the article is about.

Return to the previous page.

Narrate your actions clearly.
```

**Tests:**
- Tab management
- Page transitions
- Snapshot parsing
- Narration context switching

---

## ✅ 6. SCREENSHOT TEST

**Purpose:** Test image capture and return

```text
Open https://www.github.com.

Take a screenshot of the homepage.

Describe what you see in the screenshot.
```

**Tests:**
- `browser_screenshot`
- Image data return
- Visual description

---

## ✅ 7. SCROLLING TEST

**Purpose:** Test page navigation and scrolling

```text
Open https://www.bbc.com/news.

Scroll down the page three times.

Describe the headlines you see.

Scroll back to the top.
```

**Tests:**
- `browser_scroll`
- Multiple scroll actions
- Content visibility

---

## ✅ 8. JAVASCRIPT EXECUTION TEST

**Purpose:** Test custom script execution

```text
Open https://example.com.

Execute JavaScript to get the page title and URL.

Report back what you found.
```

**Tests:**
- `browser_evaluate`
- Custom JavaScript
- Data extraction

---

## 🎙 9. MAXIMUM NARRATION TEST (Full Mode)

**Purpose:** Test verbose narration in full mode

```text
Voice mode: FULL

Open google.com.
Search for "latest AI news".
Open the first result.
Explain what the article discusses.
```

---

## 🔴 10. ALT+J TOGGLE TEST

**Purpose:** Test mute/unmute functionality

**Steps:**

1. Start any narration task
2. While it is speaking, press: `Alt + J`

**Expected:**
- Overlay turns grey
- Audio stops
- Next narration skipped

3. Press `Alt + J` again

**Expected:**
- Overlay turns red
- Voice resumes

---

## 🧪 11. QUICK SMOKE TEST

**Purpose:** Minimal validation that system works

```text
Open example.com and describe the page.
```

---

## 🏆 12. COMPLETE DEMO TEST

**Purpose:** Professional demo showcasing all features

```text
Open https://github.com.

Search for "playwright".

Open the official Playwright repository.

Read the description.

Explain what Playwright is used for.

Narrate clearly while performing each action.
```

---

## 🎯 NARRATION MODE TESTS

### Silent Mode
```text
Set mode to silent.
Open example.com.
Click on any link.
Take a screenshot.
```
**Expected:** No narration except errors

### Minimal Mode
```text
Set mode to minimal.
Open wikipedia.org.
Search for "Python".
Click first result.
```
**Expected:** Only navigation narrated

### Full Mode
```text
Set mode to full.
Open wikipedia.org.
Search for "Machine Learning".
Click first result.
Scroll down.
```
**Expected:** All actions narrated

---

## 📋 TESTING CHECKLIST

Use this checklist to validate your VoiceWrite installation:

- [ ] Docker containers start successfully
- [ ] TTS service health check passes (`http://localhost:8000/health`)
- [ ] Browser opens when navigating
- [ ] Overlay appears (red bubble in bottom-right)
- [ ] Audio plays when action is performed
- [ ] Alt+J toggles mute state
- [ ] Overlay changes color when muted (grey) / active (red)
- [ ] Narration modes work (silent/minimal/full)
- [ ] Screenshots return images
- [ ] Errors are narrated
- [ ] Multiple actions don't overlap audio (rate limiting)
- [ ] Long text is truncated properly (500 char limit)
- [ ] TTS retries on failure
- [ ] Browser closes on shutdown

---

## 🚀 RUNNING TESTS

### Manual Testing

```bash
# Start the system
cd voicewrite
./start.sh

# In another terminal, test with a prompt
# (Use your MCP client - Claude Desktop, Gemini CLI, etc.)
```

### Automated Test Client

```bash
node voicewrite/test-client.js
```

---

## 📝 NOTES

1. **TTS Service** must be running before the agent starts
2. **Overlay** is injected automatically on page load
3. **Rate limiting** prevents audio overlap (800ms minimum between narrations)
4. **Timeouts**: TTS calls timeout after 5 seconds with 2 retries
5. **Max text length**: 500 characters (truncated with "...")

---

## 🎛 CLI FLAGS FOR TESTING

```bash
# Full narration with overlay (default)
node dist/index.js --voice --overlay --mode full

# Silent mode (no voice)
node dist/index.js --no-voice --overlay

# Minimal narration
node dist/index.js --voice --overlay --mode minimal

# Debug mode (verbose logging)
node dist/index.js --debug --headless

# Custom TTS URL
node dist/index.js --tts-url http://localhost:8000
```

---

## 🔧 TROUBLESHOOTING

### No Audio
- Check TTS service: `curl http://localhost:8000/health`
- Check overlay is loaded (red bubble visible)
- Check browser volume

### Overlay Not Showing
- Ensure `--overlay` flag is set (default: true)
- Check browser console for `[VoiceWrite] Overlay Active`

### TTS Service Fails
- Check Docker: `docker ps | grep voicewrite-tts`
- Check logs: `docker logs voicewrite-tts`
- Restart: `docker-compose restart tts-service`

### Browser Won't Open
- Check for existing instances: `pkill -f chromium`
- Run with `--headless` for debugging
- Check Docker permissions

---

For more information, see the main [README.md](../README.md).
