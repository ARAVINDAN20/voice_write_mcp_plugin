const { spawn } = require('child_process');
const path = require('path');

// Configuration
const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log(`[Test] Launching VoiceWrite Agent from: ${AGENT_PATH}`);

const agent = spawn('node', [AGENT_PATH, '--headless', '--debug'], {
  stdio: ['pipe', 'pipe', 'inherit'], // stdin, stdout, stderr
  env: { ...process.env, DEBUG: 'true', TTS_SERVICE_URL: 'http://localhost:8000' } // Ensure TTS URL is set
});

let buffer = '';

agent.stdout.on('data', (data) => {
  const output = data.toString();
  buffer += output;
  
  // Simple JSON-RPC response parser
  try {
    const lines = buffer.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        console.log('[Agent Response]:', JSON.stringify(json, null, 2));
        
        // Handle Initialization Response
        if (json.result && json.result.capabilities) {
            console.log('[Test] Agent Initialized. Listing Tools...');
            send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
        }
        
        // Handle Tool List Response
        if (json.result && json.result.tools) {
            console.log('[Test] Tools received:', json.result.tools.map(t => t.name));
            console.log('[Test] Executing "browser_navigate"...');
            send({
                jsonrpc: '2.0', 
                id: 3, 
                method: 'tools/call', 
                params: { 
                    name: 'browser_navigate', 
                    arguments: { url: 'https://example.com' } 
                }
            });
        }

        // Handle Tool Call Response
        if (json.id === 3 && json.result) {
            console.log('[Test] Navigation Complete!');
            console.log('[Test] Snapshot Length:', json.result.content[1].text.length);
            process.exit(0);
        }

      } catch (e) {
          // Incomplete JSON, wait for more data
      }
    }
  } catch (e) {
    console.error('[Test] Parse Error:', e);
  }
});

function send(msg) {
  const str = JSON.stringify(msg) + '\n';
  agent.stdin.write(str);
}

// Start Protocol Handshake
console.log('[Test] Sending Initialize...');
send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0' }
  }
});
