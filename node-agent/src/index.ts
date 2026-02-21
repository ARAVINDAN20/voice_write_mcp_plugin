#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { chromium, Browser, BrowserContext, Page } from "playwright";
import axios, { AxiosError } from "axios";
import { program } from "commander";
import { OVERLAY_SCRIPT } from "./overlay.js";

// --- CLI Configuration ---
program
  .name("voicewrite")
  .description("VoiceWrite MCP: Self-explaining browser automation agent")
  .version("1.0.0")
  .option("-v, --voice", "Enable voice narration", true)
  .option("--no-voice", "Disable voice narration")
  .option("-o, --overlay", "Enable visual overlay", true)
  .option("--no-overlay", "Disable visual overlay")
  .option("--mode <mode>", "Narration mode: silent, minimal, full", "full")
  .option("--tts-url <url>", "TTS Service URL", process.env.TTS_SERVICE_URL || "http://localhost:8000")
  .option("--debug", "Enable debug logging", false)
  .option("--headless", "Run browser in headless mode", false)
  .parse(process.argv);

const OPTIONS = program.opts<{
  voice: boolean;
  overlay: boolean;
  mode: "silent" | "minimal" | "full";
  ttsUrl: string;
  debug: boolean;
  headless: boolean;
}>();

// --- Narration Mode Configuration ---
interface NarrationMode {
  navigate: boolean;
  click: boolean;
  type: boolean;
  screenshot: boolean;
  error: boolean;
  success: boolean;
  scroll?: boolean;
}

const NARRATION_MODES: Record<string, NarrationMode> = {
  silent: {
    navigate: false,
    click: false,
    type: false,
    screenshot: false,
    error: true,
    success: false,
    scroll: false
  },
  minimal: {
    navigate: true,
    click: false,
    type: false,
    screenshot: false,
    error: true,
    success: false,
    scroll: false
  },
  full: {
    navigate: true,
    click: true,
    type: true,
    screenshot: true,
    error: true,
    success: true,
    scroll: true
  }
};

const MODE: NarrationMode = NARRATION_MODES[OPTIONS.mode] || NARRATION_MODES.full;

// --- Logger ---
const logger = {
  info: (msg: string) => OPTIONS.debug && console.error(`[INFO] ${msg}`),
  error: (msg: string, err?: unknown) => console.error(`[ERROR] ${msg}`, err || ""),
  log: (msg: string) => console.error(`[LOG] ${msg}`),
  debug: (msg: string) => OPTIONS.debug && console.error(`[DEBUG] ${msg}`)
};

if (OPTIONS.debug) {
    logger.log(`Starting VoiceWrite MCP...`);
    logger.log(`Config: ${JSON.stringify(OPTIONS, null, 2)}`);
    logger.log(`Narration Mode: ${OPTIONS.mode}`);
}

// --- Browser State ---
let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

// --- TTS Rate Limiter ---
let lastTTSCall = 0;
const TTS_MIN_INTERVAL = 800; // Minimum 800ms between TTS calls

// --- Helper: Initialize Browser ---
async function ensureBrowser(): Promise<void> {
  if (browser && context && page) return;

  logger.log("Launching browser...");
  try {
      browser = await chromium.launch({
        headless: OPTIONS.headless,
        args: [
            "--disable-infobars",
            "--window-size=1280,800",
            "--no-sandbox", // Required for Docker
            "--autoplay-policy=no-user-gesture-required", // Allow autoplay audio
            "--use-fake-ui-for-media-stream", // Allow media without prompts
            "--disable-features=TranslateUI", // Disable translate popup
            "--disable-component-extensions-with-background-pages" // Reduce noise
        ],
      });

      context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });

      if (OPTIONS.overlay) {
          // Inject Overlay on every page load
          await context.addInitScript(OVERLAY_SCRIPT);
      }

      page = await context.newPage();
      logger.log("Browser ready.");
  } catch (e: unknown) {
      logger.error("Failed to launch browser", e);
      throw e;
  }
}

// --- Helper: TTS with Rate Limiting and Retry ---
async function callTTS(text: string, retries = 2): Promise<string | null> {
  const now = Date.now();
  const timeSinceLastCall = now - lastTTSCall;
  
  if (timeSinceLastCall < TTS_MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, TTS_MIN_INTERVAL - timeSinceLastCall));
  }
  
  lastTTSCall = Date.now();
  
  try {
    const response = await axios.post(
      `${OPTIONS.ttsUrl}/speak`,
      { text, voice: "af_heart", speed: 1.0 },
      {
        responseType: "arraybuffer",
        timeout: 5000, // 5s timeout
        maxRedirects: 0,
        validateStatus: (status) => status === 200
      }
    );
    return Buffer.from(response.data, "binary").toString("base64");
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (retries > 0 && axiosError.response?.status !== 400) {
      logger.debug(`TTS retry (${retries} left): ${axiosError.message}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return callTTS(text, retries - 1);
    }
    logger.debug(`TTS failed: ${axiosError.message}`);
    return null;
  }
}

// --- Helper: Narration Logic ---
async function narrate(text: string, actionType: string = "general"): Promise<void> {
  if (!OPTIONS.voice) return;
  if (!page) return;
  
  // Check mode
  const modeFlag = MODE[actionType as keyof NarrationMode];
  if (modeFlag === false) {
    logger.debug(`Skipping narration for ${actionType} in ${OPTIONS.mode} mode`);
    return;
  }

  // Guard: Max Length
  if (text.length > 500) {
      text = text.substring(0, 497) + "...";
  }

  logger.info(`Narrating: "${text}"`);

  // Call TTS with rate limiting
  const audioBase64 = await callTTS(text);
  
  if (!audioBase64) {
    logger.debug("TTS returned no audio, skipping playback");
    return;
  }

  // Inject into browser
  try {
    if (page && !page.isClosed()) {
      await page.evaluate((b64: string) => {
        const win = window as Window & typeof globalThis & { playVoiceWriteAudio?: (b64: string) => void };
        if (win.playVoiceWriteAudio) {
          win.playVoiceWriteAudio(b64);
        }
      }, audioBase64);
    }
  } catch (e: unknown) {
    logger.error("Failed to inject audio into page", e);
  }
}

// --- Helper: Snapshot ---
async function getSnapshot(pageObj: Page): Promise<string> {
  try {
    const snapshot = await (pageObj as any).accessibility?.snapshot();
    if (!snapshot) return "Snapshot unavailable.";
    return JSON.stringify(snapshot, null, 2).slice(0, 5000);
  } catch (e: unknown) {
    const err = e as Error;
    logger.debug(`Snapshot error: ${err.message}`);
    return "Snapshot unavailable.";
  }
}

// --- MCP Server ---
const server = new Server(
  {
    name: "voicewrite-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- Tool Handlers ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "browser_navigate",
        description: "Navigates to a URL. Narrates the action based on mode setting.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The URL to navigate to" },
          },
          required: ["url"],
        },
      },
      {
        name: "browser_click",
        description: "Clicks an element. Narrates the action based on mode setting.",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector" },
            narration: { type: "string", description: "Optional custom spoken text" },
          },
          required: ["selector"],
        },
      },
      {
        name: "browser_type",
        description: "Types text into a field. Narrates the action based on mode setting.",
        inputSchema: {
            type: "object",
            properties: {
                selector: { type: "string", description: "CSS selector" },
                text: { type: "string", description: "Text to type" }
            },
            required: ["selector", "text"]
        }
      },
      {
          name: "browser_screenshot",
          description: "Takes a screenshot and returns it as an image.",
          inputSchema: { type: "object", properties: {} }
      },
      {
          name: "browser_scroll",
          description: "Scrolls the page up or down.",
          inputSchema: {
              type: "object",
              properties: {
                  direction: { type: "string", enum: ["up", "down"], description: "Scroll direction" },
                  amount: { type: "number", description: "Pixels to scroll (default: 500)" }
              },
              required: ["direction"]
          }
      },
      {
          name: "browser_evaluate",
          description: "Executes JavaScript in the browser context.",
          inputSchema: {
              type: "object",
              properties: {
                  script: { type: "string", description: "JavaScript code to execute" }
              },
              required: ["script"]
          }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  await ensureBrowser();
  if (!page) throw new Error("Browser failed to initialize");

  let resultText = "";
  let narrationText = "";
  let shouldNarrate = false;

  try {
    switch (name) {
      case "browser_navigate": {
        const url = String(args?.url);
        if (!url) {
          throw new Error("URL is required");
        }
        
        const hostname = new URL(url).hostname;
        narrationText = `Navigating to ${hostname}`;
        
        logger.log(`Navigating to: ${url}`);
        
        // 🎤 SPEAK FIRST, then navigate (voice plays during action)
        if (OPTIONS.voice) {
          await narrate(narrationText, "navigate");
          // Small delay to let voice finish before action
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await page.goto(url, { waitUntil: "commit", timeout: 30000 });
        resultText = `Navigated to ${url}`;
        break;
      }

      case "browser_click": {
        const selector = String(args?.selector);
        if (!selector) {
          throw new Error("Selector is required");
        }
        
        narrationText = args?.narration ? String(args.narration) : `Clicking ${selector}`;
        
        logger.log(`Clicking: ${selector}`);
        
        // 🎤 SPEAK FIRST, then click (voice plays during action)
        if (OPTIONS.voice) {
          await narrate(narrationText, "click");
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await page.click(selector, { timeout: 5000 });
        resultText = `Clicked ${selector}`;
        break;
      }

      case "browser_type": {
          const selector = String(args?.selector);
          const text = String(args?.text);
          if (!selector || !text) {
            throw new Error("Selector and text are required");
          }
          
          narrationText = `Typing into ${selector}`;
          shouldNarrate = true;
          
          logger.log(`Typing into: ${selector}`);
          
          // 🎤 SPEAK FIRST, then type (voice plays during action)
          if (shouldNarrate && narrationText) {
            narrate(narrationText, name.replace("browser_", ""));
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          await page.fill(selector, text, { timeout: 5000 });
          resultText = `Typed text into ${selector}`;
          break;
      }

      case "browser_screenshot": {
          logger.log("Taking screenshot...");
          
          narrationText = "Taking a screenshot";
          
          // 🎤 SPEAK FIRST, then take screenshot
          if (OPTIONS.voice) {
            await narrate(narrationText, "screenshot");
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          const screenshot = await page.screenshot({ type: "png", fullPage: false });
          const base64 = screenshot.toString("base64");
          
          resultText = `Screenshot taken (${screenshot.byteLength} bytes)`;
          
          // Return image content
          return {
            content: [
              { 
                type: "image", 
                data: base64,
                mimeType: "image/png"
              },
              { type: "text", text: resultText }
            ],
          };
      }

      case "browser_scroll": {
          const direction = String(args?.direction || "down");
          const amount = Number(args?.amount || 500);
          
          narrationText = `Scrolling ${direction}`;
          
          // 🎤 SPEAK FIRST, then scroll with smooth animation
          if (OPTIONS.voice) {
            await narrate(narrationText, "scroll");
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Smooth scroll animation (visible to user)
          await page.evaluate((params: { direction: string; amount: number }) => {
            return new Promise<void>((resolve) => {
              const scrollAmount = params.direction === "up" ? -params.amount : params.amount;
              const startPosition = window.scrollY;
              const targetPosition = startPosition + scrollAmount;
              const distance = Math.abs(scrollAmount);
              const duration = 1500; // 1.5 seconds for visible animation
              let startTime: number | null = null;
              
              function easeInOutQuad(t: number): number {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
              }
              
              function animate(currentTime: number) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const ease = easeInOutQuad(progress);
                
                window.scrollTo(0, startPosition + (scrollAmount * ease));
                
                if (timeElapsed < duration) {
                  requestAnimationFrame(animate);
                } else {
                  resolve();
                }
              }
              
              requestAnimationFrame(animate);
            });
          }, { direction, amount });
          
          resultText = `Scrolled ${direction} by ${amount}px`;
          break;
      }

      case "browser_evaluate": {
          const script = String(args?.script);
          if (!script) {
            throw new Error("Script is required");
          }
          
          logger.log("Executing JavaScript...");
          const result = await page.evaluate(script);
          
          resultText = `Script executed. Result: ${JSON.stringify(result)}`;
          break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Narrate after successful action
    if (shouldNarrate && narrationText) {
      await narrate(narrationText, name.replace("browser_", ""));
    }

    const snapshot = await getSnapshot(page);

    return {
      content: [
        { type: "text", text: resultText },
        { type: "text", text: `\nAccessibility Snapshot:\n${snapshot}` },
      ],
    };

  } catch (error: unknown) {
    const err = error as Error;
    const errorMsg = `Error executing ${name}: ${err.message}`;
    logger.error(errorMsg);
    
    // Narrate errors
    if (MODE.error) {
      const errorNarration = `I encountered an error: ${err.message.substring(0, 50)}`;
      await narrate(errorNarration, "error");
    }
    
    return {
      isError: true,
      content: [{ type: "text", text: errorMsg }],
    };
  }
});

// --- Graceful Shutdown ---
process.on("SIGINT", async () => {
  logger.log("Shutting down...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// --- Start ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.log("VoiceWrite MCP Agent running (stdio)...");
}

main().catch((err: unknown) => {
  logger.error("Fatal Error:", err);
  process.exit(1);
});
