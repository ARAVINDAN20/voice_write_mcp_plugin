# 🤝 Contributing to VoiceWrite MCP

**Thank you for your interest in contributing!**

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Guidelines](#pull-request-guidelines)
5. [Coding Standards](#coding-standards)
6. [Testing Requirements](#testing-requirements)

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions professional and on-topic

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/voice_write_mcp_plugin.git
cd voice_write_mcp_plugin
```

### 2. Set Up Development Environment

```bash
# Install dependencies
cd node-agent && npm install
cd ../tts-service && pip install -r requirements.txt

# Build agent
cd ../node-agent && npm run build
```

### 3. Create Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### 1. Make Changes

- Edit code in `node-agent/src/` or `tts-service/`
- Follow existing code style
- Add comments for complex logic

### 2. Test Locally

```bash
# Run tests
npm test

# Test TTS
curl -X POST http://localhost:8000/speak-sync \
  -d '{"text":"Test"}'

# Manual testing
node dist/index.js --debug
```

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Format:**
```
feat: Add new feature
fix: Fix bug in browser_click
docs: Update README
test: Add test cases
refactor: Refactor TTS service
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create Pull Request on GitHub.

---

## Pull Request Guidelines

### PR Title Format

```
feat: Add voice speed control
fix: Resolve audio playback issue
docs: Improve installation guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs
2. **Code Review** - Maintainer reviews code
3. **Testing** - Changes tested manually
4. **Merge** - Approved PRs merged to main

---

## Coding Standards

### TypeScript (Node Agent)

```typescript
// Use meaningful variable names
const navigationUrl = "https://example.com";

// Add type annotations
async function navigate(url: string): Promise<void> {
  // Implementation
}

// Use async/await
async function fetchTTS(text: string): Promise<string> {
  const response = await axios.post('/speak', { text });
  return response.data;
}

// Error handling
try {
  await page.click(selector);
} catch (error) {
  logger.error(`Click failed: ${error.message}`);
  throw error;
}
```

### Python (TTS Service)

```python
# Use type hints
async def generate_speech(text: str, voice: str = "af_heart") -> bytes:
    """Generate speech audio from text."""
    # Implementation

# Docstrings
def play_audio(filepath: str) -> None:
    """
    Play audio file through system speakers.
    
    Args:
        filepath: Path to audio file
    """
    # Implementation

# Error handling
try:
    audio = await tts.generate(text)
except TTSException as e:
    logger.error(f"TTS failed: {e}")
    raise
```

### General Guidelines

- **Naming:** Use descriptive, meaningful names
- **Comments:** Explain why, not what
- **Functions:** Keep functions small and focused
- **Error Handling:** Always handle errors gracefully
- **Logging:** Use appropriate log levels (DEBUG, INFO, ERROR)

---

## Testing Requirements

### Unit Tests

```typescript
// node-agent/tests/narration.test.ts
describe('Narration Engine', () => {
  test('should skip narration in silent mode', async () => {
    const agent = new Agent({ mode: 'silent' });
    await agent.navigate('https://example.com');
    expect(ttsMock.call).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```bash
# Test complete flow
node tests/test-todo-page.js
```

### Manual Testing Checklist

- [ ] Voice narration works
- [ ] Overlay appears correctly
- [ ] All tools function properly
- [ ] Error handling works
- [ ] No console errors
- [ ] Performance acceptable

---

## Submitting Changes

### Before Submitting

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No debug logs left in code
- [ ] Commit messages are clear

### After Submission

- Monitor PR for review comments
- Respond to feedback promptly
- Make requested changes
- Rebase if needed

---

## Questions?

- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and ideas
- **Email:** aravindanm@karunya.edu.in

---

**Thank you for contributing to VoiceWrite MCP!** 🎉
