const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('\n🎙️ VoiceWrite MCP - GitHub Navigation Test');
console.log('='.repeat(60));
console.log('🔊 Voice narration enabled - you should hear voice!\n');

const agent = spawn('node', [AGENT_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';
let step = 0;

function send(msg) {
    agent.stdin.write(JSON.stringify(msg) + '\n');
    console.log(`  → Sent: ${msg.method || 'message'}`);
}

function log(msg) {
    console.log(msg);
}

agent.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line.includes('[LOG]') || line.includes('[INFO]')) {
        log('  ' + line);
        
        if (line.includes('Narrating:')) {
            log('  🔊 ** VOICE SPEAKING **\n');
        }
    }
});

setTimeout(() => {
    log('\n📋 Initializing MCP connection...\n');
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'github-test', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        log('\n' + '='.repeat(60));
        log('📍 TEST 1: Navigate to GitHub');
        log('='.repeat(60));
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://github.com' }
            }
        });
        
        setTimeout(() => {
            log('\n' + '='.repeat(60));
            log('📍 TEST 2: Take Screenshot');
            log('='.repeat(60));
            send({
                jsonrpc: '2.0',
                id: 'shot1',
                method: 'tools/call',
                params: {
                    name: 'browser_screenshot',
                    arguments: {}
                }
            });
        }, 10000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(60));
            log('📍 TEST 3: Scroll Down');
            log('='.repeat(60));
            send({
                jsonrpc: '2.0',
                id: 'scroll1',
                method: 'tools/call',
                params: {
                    name: 'browser_scroll',
                    arguments: { direction: 'down', amount: 500 }
                }
            });
        }, 15000);
        
    }, 3000);
}, 1000);

setTimeout(() => {
    log('\n' + '='.repeat(60));
    log('✅ TEST COMPLETE');
    log('='.repeat(60));
    log('\nYou should have heard:');
    log('  1. "Navigating to github.com"');
    log('  2. "Taking a screenshot"');
    log('  3. "Scrolling down"');
    log('\n🔊 Check if voice matched the actions!\n');
    agent.kill();
    process.exit(0);
}, 25000);
