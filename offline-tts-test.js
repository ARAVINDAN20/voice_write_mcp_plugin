const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('🎙️ Testing TTS Audio Injection (Offline)\n');

const agent = spawn('node', [AGENT_PATH, '--headless'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';

function send(msg) {
    agent.stdin.write(JSON.stringify(msg) + '\n');
}

agent.stdout.on('data', (data) => {
    const line = data.toString().trim();
    console.log('  ' + line);
});

setTimeout(() => {
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } }
    });
    
    setTimeout(() => {
        // Test with data URL (works offline)
        console.log('\n📍 Testing with data URL (offline)...\n');
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'data:text/html,<h1>VoiceWrite Test</h1><p>TTS should speak now</p>' }
            }
        });
        
        setTimeout(() => {
            console.log('\n📍 Testing screenshot...\n');
            send({
                jsonrpc: '2.0',
                id: 'shot1',
                method: 'tools/call',
                params: { name: 'browser_screenshot', arguments: {} }
            });
        }, 5000);
        
    }, 2000);
}, 1000);

setTimeout(() => {
    console.log('\n✅ Test complete - check logs above for TTS activity\n');
    agent.kill();
    process.exit(0);
}, 12000);
