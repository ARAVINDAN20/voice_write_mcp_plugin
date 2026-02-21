const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log(`[VoiceWrite] Starting Task: Todo List Management...`);

const agent = spawn('node', [AGENT_PATH, '--headless', '--debug'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, DEBUG: 'true', TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';

agent.stdout.on('data', async (data) => {
  const output = data.toString();
  buffer += output;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const json = JSON.parse(line);
      
      // Step 1: Handshake Complete
      if (json.id === 1 && json.result) {
          console.log('[1] Agent Ready. Navigating to TodoMVC...');
          send({
            jsonrpc: '2.0', id: 2, method: 'tools/call',
            params: { name: 'browser_navigate', arguments: { url: 'https://todomvc.com/examples/react/dist/' } }
          });
      }

      // Step 2: Page Loaded, start creating tasks
      if (json.id === 2 && json.result) {
          console.log('[2] Page Loaded. Creating Task 1...');
          createTask(1);
      }

      // Step 3: Handle recursive task creation
      if (json.id >= 3 && json.id < 7 && json.result) {
          const nextId = json.id - 2;
          console.log(`[${json.id}] Task ${nextId} created. Creating Task ${nextId + 1}...`);
          createTask(nextId + 1);
      }

      if (json.id === 7 && json.result) {
          console.log('[7] All 5 tasks created! Task Complete.');
          process.exit(0);
      }

    } catch (e) {}
  }
});

function createTask(num) {
    send({
        jsonrpc: '2.0', id: num + 2, method: 'tools/call',
        params: { 
            name: 'browser_type', 
            arguments: { 
                selector: '.new-todo', 
                text: `Task ${num}\n`
            } 
        }
    });
}

function send(msg) { agent.stdin.write(JSON.stringify(msg) + '\n'); }

send({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'todo-runner', version: '1.0' } }
});
