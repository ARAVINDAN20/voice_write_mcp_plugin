const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log(`[VoiceWrite] Starting Task: Google Search...`);

const agent = spawn('node', [AGENT_PATH, '--headless', '--debug'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, DEBUG: 'true', TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';

agent.stdout.on('data', (data) => {
  const output = data.toString();
  buffer += output;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const json = JSON.parse(line);
      if (json.id === 1 && json.result) {
          console.log('[1] Initialized. Starting Navigation...');
          send({
            jsonrpc: '2.0', id: 2, method: 'tools/call',
            params: { name: 'browser_navigate', arguments: { url: 'https://www.google.com' } }
          });
      }
      if (json.id === 2 && json.result) {
          console.log('[2] Google Loaded. Typing search query...');
          send({
            jsonrpc: '2.0', id: 3, method: 'tools/call',
            params: { name: 'browser_type', arguments: { selector: 'textarea[name="q"]', text: 'Model Context Protocol' } }
          });
      }
      if (json.id === 3 && json.result) {
          console.log('[3] Query typed. Pressing Enter...');
          // On Google, clicking search often requires handling different selectors, 
          // let's just press Enter via 'browser_type' if we had a keyboard tool, 
          // or just click the common button.
          send({
            jsonrpc: '2.0', id: 4, method: 'tools/call',
            params: { name: 'browser_click', arguments: { selector: 'input[name="btnK"]', narration: 'Searching for Model Context Protocol.' } }
          });
      }
      if (json.id === 4 && json.result) {
          console.log('[4] Search results visible. Task Complete!');
          process.exit(0);
      }
    } catch (e) {}
  }
});

function send(msg) { agent.stdin.write(JSON.stringify(msg) + '\n'); }

send({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'task-runner', version: '1.0' } }
});
