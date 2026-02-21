const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('\n🎙️ VoiceWrite MCP - Audio Playback Test');
console.log('='.repeat(60));
console.log('\nThis test will:');
console.log('1. Open a browser window');
console.log('2. Navigate to example.com');
console.log('3. Speak "Navigating to example.com"');
console.log('4. Show red overlay bubble (bottom-right)');
console.log('5. Pulse animation while speaking\n');

const agent = spawn('node', [AGENT_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';
let step = 0;

function send(msg) {
    agent.stdin.write(JSON.stringify(msg) + '\n');
}

agent.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line.includes('[LOG]') || line.includes('[INFO]')) {
        console.log('  ' + line);
        
        // Detect TTS narration
        if (line.includes('Narrating:')) {
            console.log('\n  🔊 TTS CALLED - Voice should be speaking!\n');
            step++;
        }
    }
});

setTimeout(() => {
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'final-test', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        console.log('\n📍 Step 1: Navigate to example.com');
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://example.com' }
            }
        });
        
        setTimeout(() => {
            console.log('\n📍 Step 2: Navigate to github.com');
            send({
                jsonrpc: '2.0',
                id: 'nav2',
                method: 'tools/call',
                params: {
                    name: 'browser_navigate',
                    arguments: { url: 'https://github.com' }
                }
            });
        }, 8000);
        
    }, 2000);
}, 1000);

setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CHECKLIST - What you should have seen/heard:');
    console.log('='.repeat(60));
    console.log('□ Browser window opened');
    console.log('□ Red bubble appeared (bottom-right corner)');
    console.log('□ Voice said "Navigating to example.com"');
    console.log('□ Bubble pulsed red while speaking');
    console.log('□ Voice said "Navigating to github.com"');
    console.log('='.repeat(60));
    console.log('\n✅ If YES to all: Audio is WORKING!');
    console.log('❌ If NO: Check the debug output above\n');
    agent.kill();
    process.exit(0);
}, 18000);
