# 📖 VoiceWrite MCP - Usage Guide

**Complete guide to using VoiceWrite MCP with examples and sample prompts**

---

## 📋 Table of Contents

1. [Basic Usage](#basic-usage)
2. [MCP Tools Reference](#mcp-tools-reference)
3. [Sample Prompts Library](#-sample-prompts-library)
4. [MCP Client Configuration](#mcp-client-configuration)
5. [Advanced Usage](#advanced-usage)
6. [Best Practices](#best-practices)
7. [Common Workflows](#common-workflows)

---

## Basic Usage

### Starting VoiceWrite

```bash
# Start TTS service
docker compose up -d

# Start agent
cd node-agent
node dist/index.js --voice --overlay
```

### Using with MCP Client

Once configured in your MCP client (Claude Desktop, Cursor, etc.), simply ask:

```text
Open https://github.com and search for "playwright"
```

VoiceWrite will:
1. 🔊 Say: *"Navigating to github.com"*
2. 🌐 Open GitHub
3. 🔊 Say: *"Typing into search box"*
4. ⌨️ Type "playwright"
5. 🔊 Say: *"Clicking search button"*
6. 👆 Click search

---

## MCP Tools Reference

### 1. browser_navigate

**Description:** Navigate to a URL

**Parameters:**
```json
{
  "url": "string (required) - URL to navigate to"
}
```

**Example:**
```json
{
  "name": "browser_navigate",
  "arguments": {
    "url": "https://www.google.com"
  }
}
```

**Voice:** *"Navigating to google.com"*

---

### 2. browser_click

**Description:** Click an element

**Parameters:**
```json
{
  "selector": "string (required) - CSS selector",
  "narration": "string (optional) - Custom voice text"
}
```

**Example:**
```json
{
  "name": "browser_click",
  "arguments": {
    "selector": "#login-button",
    "narration": "Clicking the login button to sign in"
  }
}
```

**Voice:** *"Clicking the login button to sign in"*

---

### 3. browser_type

**Description:** Type text into a field

**Parameters:**
```json
{
  "selector": "string (required) - CSS selector",
  "text": "string (required) - Text to type"
}
```

**Example:**
```json
{
  "name": "browser_type",
  "arguments": {
    "selector": "input[name='q']",
    "text": "VoiceWrite MCP"
  }
}
```

**Voice:** *"Typing into input[name='q']"*

---

### 4. browser_scroll

**Description:** Scroll the page

**Parameters:**
```json
{
  "direction": "string (required) - 'up' or 'down'",
  "amount": "number (optional) - Pixels to scroll (default: 500)"
}
```

**Example:**
```json
{
  "name": "browser_scroll",
  "arguments": {
    "direction": "down",
    "amount": 800
  }
}
```

**Voice:** *"Scrolling down"* (smooth 1.5s animation)

---

### 5. browser_screenshot

**Description:** Take a screenshot

**Parameters:** None

**Example:**
```json
{
  "name": "browser_screenshot",
  "arguments": {}
}
```

**Voice:** *"Taking a screenshot"*

**Returns:** Base64 PNG image

---

### 6. browser_evaluate

**Description:** Execute JavaScript

**Parameters:**
```json
{
  "script": "string (required) - JavaScript code"
}
```

**Example:**
```json
{
  "name": "browser_evaluate",
  "arguments": {
    "script": "document.title"
  }
}
```

**Voice:** (Silent - no narration)

**Returns:** Script result

---

## 📚 Sample Prompts Library

### 🔰 Beginner Prompts (1-10)

```text
1. Open example.com and tell me what you see

2. Navigate to google.com

3. Go to github.com and show me the trending page

4. Open wikipedia.org

5. Navigate to hacker-news.firebaseapp.com

6. Go to reddit.com and show me the front page

7. Open youtube.com

8. Navigate to twitter.com

9. Go to linkedin.com

10. Open stackoverflow.com
```

### 🛒 E-commerce Testing (11-20)

```text
11. Open Amazon.com, search for "wireless headphones", 
    filter by 4 stars and above, open the first product, 
    read me the title and price

12. Go to eBay, search for "iPhone 15 case", sort by 
    lowest price, click the first item, check if it's in stock

13. Navigate to bestbuy.com, search for "laptop stand", 
    filter by price $20 to $50, open first result, 
    tell me the product name and availability

14. Open target.com, search for "coffee maker", 
    filter by brand "Keurig", click first product, 
    read the product description

15. Go to walmart.com, search for "bluetooth speaker", 
    sort by best seller, open top result, 
    tell me the price and customer rating

16. Navigate to etsy.com, search for "handmade jewelry", 
    filter by ships to United States, click first item, 
    read the item description and shipping info

17. Open aliexpress.com, search for "phone case", 
    filter by orders 1000+, open first product, 
    tell me the price and estimated delivery

18. Go to newegg.com, search for "mechanical keyboard", 
    filter by brand "Corsair", click first result, 
    read the specifications

19. Navigate to wayfair.com, search for "desk lamp", 
    filter by color "black", open first product, 
    tell me the dimensions and price

20. Open homedepot.com, search for "power drill", 
    filter by rating 4.5+, click first item, 
    read the product features
```

### 📝 Form Automation (21-30)

```text
21. Navigate to https://httpbin.org/forms/post, 
    fill in: Name=John Doe, Email=john@example.com, 
    Message=Testing VoiceWrite automation, 
    submit the form and show me the response

22. Go to a login page, enter username "testuser" 
    and password "testpass123", click login, 
    verify successful login

23. Open a registration form, fill in all required 
    fields with test data, submit, and confirm 
    account creation

24. Navigate to a contact form, fill in name, email, 
    subject, and message, submit, and verify 
    confirmation message

25. Go to a survey form, answer all questions 
    honestly, submit, and show me the results

26. Open a checkout page, fill in shipping 
    address, select shipping method, proceed 
    to payment (don't complete purchase)

27. Navigate to a job application form, upload 
    resume, fill in work experience, education, 
    and submit application

28. Go to a feedback form, rate 5 stars, 
    write positive feedback, submit, and 
    verify thank you message

29. Open a newsletter signup form, enter email, 
    select preferences, subscribe, and confirm 
    subscription

30. Navigate to a password reset form, enter 
    email address, submit, and check for 
    confirmation message
```

### 🎯 Advanced Workflows (31-40)

```text
31. Open Hacker News, click the top story, 
    summarize the article in 3 sentences, 
    return to homepage, click the second story, 
    compare the two articles

32. Navigate to a product page, take a screenshot, 
    scroll down to reviews, read the top 3 
    positive and negative reviews, summarize 
    customer sentiment

33. Open Google Flights, search for flights from 
    NYC to London next month, filter by non-stop, 
    sort by price, tell me the cheapest option

34. Go to a real estate website, search for 
    houses in Seattle under $800k, filter by 
    3+ bedrooms, open first listing, read the 
    property details

35. Navigate to a stock trading platform, 
    search for "AAPL", check current price, 
    52-week high/low, and market cap

36. Open a news website, find the top 5 headlines, 
    summarize each in one sentence, identify 
    common themes

37. Go to a weather website, check the forecast 
    for New York for the next 7 days, tell me 
    the warmest and coldest days

38. Navigate to a sports website, check the 
    latest scores for NBA games, identify the 
    highest scoring game

39. Open a recipe website, search for "chicken 
    pasta", filter by 30 minutes or less, 
    open first recipe, list the ingredients

40. Go to a movie database, search for "Christopher 
    Nolan", list his top 5 rated movies with 
    their IMDB scores
```

### 🐛 Error Handling Tests (41-50)

```text
41. Open example.com, try to click an element 
    with selector "#does-not-exist", explain 
    what error occurred and how you handled it

42. Navigate to an invalid URL like 
    "https://thissitedoesnotexist12345.com", 
    describe the error page

43. Try to type into a non-existent input 
    field, explain what went wrong

44. Open a page, try to screenshot before it 
    loads, describe the error

45. Navigate to a page with a cookie consent, 
    try to click without accepting cookies, 
    explain what happens

46. Try to submit a form with required fields 
    empty, describe the validation error

47. Open a login page, enter wrong credentials, 
    click login, describe the error message

48. Navigate to a paywalled article, try to 
    read the full content, explain the 
    paywall message

49. Try to click a disabled button, describe 
    what happens

50. Open a page with infinite scroll, try to 
    scroll to the bottom, explain the behavior
```

---

## MCP Client Configuration

### Claude Desktop

**Config File:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "voicewrite": {
      "command": "node",
      "args": [
        "/absolute/path/to/voice_write_mcp_plugin/node-agent/dist/index.js",
        "--voice",
        "--overlay",
        "--mode", "full"
      ]
    }
  }
}
```

**Restart Claude Desktop** after saving config.

### Cursor IDE

**Config File:** `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "voicewrite": {
      "command": "node",
      "args": [
        "/path/to/voice_write_mcp_plugin/node-agent/dist/index.js",
        "--voice",
        "--overlay"
      ]
    }
  }
}
```

### VS Code (MCP Extension)

**Config File:** `.vscode/mcp.json` (workspace) or `~/.vscode/mcp.json` (global)

```json
{
  "servers": {
    "voicewrite": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/node-agent/dist/index.js",
        "--voice",
        "--overlay"
      ]
    }
  }
}
```

### Windsurf

**Config File:** `~/.windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "voicewrite": {
      "command": "node",
      "args": [
        "/path/to/voice_write_mcp_plugin/node-agent/dist/index.js",
        "--voice",
        "--overlay",
        "--debug"
      ]
    }
  }
}
```

---

## Advanced Usage

### Narration Modes

#### Silent Mode (Errors Only)

```bash
node dist/index.js --mode silent
```

**Use Case:** Testing, debugging, production environments

**Behavior:** Only narrates errors

#### Minimal Mode (Navigation Only)

```bash
node dist/index.js --mode minimal
```

**Use Case:** Quick automation, experienced users

**Behavior:** Narrates navigation and errors only

#### Full Mode (Everything)

```bash
node dist/index.js --mode full
```

**Use Case:** Demos, accessibility, learning

**Behavior:** Narrates all actions

### Voice Customization

The TTS service supports multiple voices:

```bash
# Get available voices
curl http://localhost:8000/voices

# Response:
{
  "voices": [
    "af_heart", "af_bella", "af_nicole",
    "am_adam", "am_michael", "am_onyx"
  ]
}
```

To change voice, modify the TTS request in the agent code.

### Headless Mode

For automated testing without UI:

```bash
node dist/index.js --headless --voice
```

**Use Case:** CI/CD, automated testing, servers

### Debug Mode

For troubleshooting:

```bash
node dist/index.js --debug
```

**Output:**
```
[LOG] Starting VoiceWrite MCP...
[LOG] Config: {"voice":true,"overlay":true,"mode":"full"}
[DEBUG] TTS called with text: "Navigating to github.com"
[INFO] Narrating: "Navigating to github.com"
```

---

## Best Practices

### 1. Use Specific Selectors

**Good:**
```javascript
'#login-button'
'input[name="email"]'
'.product-card:first-child h2 a'
```

**Bad:**
```javascript
'button'  // Too generic
'div'     // Way too generic
'*'       // Don't do this
```

### 2. Add Delays Between Actions

For complex workflows, add small delays:

```javascript
// In browser_evaluate
await new Promise(r => setTimeout(r, 1000));
```

### 3. Handle Errors Gracefully

Always check if elements exist before clicking:

```javascript
// Check first
const exists = await page.$('#element');
if (exists) {
  await page.click('#element');
}
```

### 4. Use Meaningful Narration

Custom narration helps users understand:

```json
{
  "selector": "#submit",
  "narration": "Submitting the form to create your account"
}
```

### 5. Take Screenshots at Key Points

Capture state after important actions:

```text
"Navigate to the product page, take a screenshot, 
add to cart, take another screenshot to confirm"
```

---

## Common Workflows

### Workflow 1: Product Research

```text
1. Navigate to Amazon
2. Search for product
3. Filter by rating
4. Open top 3 products
5. Take screenshots
6. Compare prices
7. Report findings
```

### Workflow 2: Form Testing

```text
1. Navigate to form
2. Fill all fields
3. Validate inputs
4. Submit form
5. Verify success
6. Screenshot result
```

### Workflow 3: Content Monitoring

```text
1. Navigate to website
2. Scroll to content
3. Screenshot section
4. Extract text
5. Compare with previous
6. Report changes
```

### Workflow 4: E2E Testing

```text
1. Navigate to app
2. Login
3. Perform action
4. Verify result
5. Logout
6. Screenshot proof
```

---

## Getting Help

- **Documentation:** See [README.md](./README.md)
- **Installation:** See [INSTALLATION.md](./INSTALLATION.md)
- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Reference:** See [API.md](./API.md)
- **Troubleshooting:** See [README.md](./README.md#-troubleshooting)

---

**Happy automating with VoiceWrite MCP!** 🎉
