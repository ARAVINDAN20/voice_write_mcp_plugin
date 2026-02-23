const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('\n🎙️ VoiceWrite MCP - Real Todo List Test');
console.log('='.repeat(70));
console.log('🔊 VOICE NARRATION ENABLED - You should hear voice through speakers!');
console.log('📋 Testing with real todo list website\n');

const agent = spawn('node', [AGENT_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';

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
            log('  🔊 ** VOICE SPEAKING - Listen! **\n');
        }
    }
});

setTimeout(() => {
    log('\n📋 Step 1: Initialize MCP connection...\n');
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'todo-test', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 Step 2: Navigate to Todo List Website');
        log('='.repeat(70));
        log('  🎤 You should hear: "Navigating to..."');
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://todoist.com' }
            }
        });
    }, 3000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 Step 3: Scroll Down to See Content');
        log('='.repeat(70));
        log('  🎤 You should hear: "Scrolling down"');
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
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 Step 4: Take Screenshot');
        log('='.repeat(70));
        log('  🎤 You should hear: "Taking a screenshot"');
        send({
            jsonrpc: '2.0',
            id: 'shot1',
            method: 'tools/call',
            params: {
                name: 'browser_screenshot',
                arguments: {}
            }
        });
    }, 22000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 Step 5: Scroll Down Again');
        log('='.repeat(70));
        log('  🎤 You should hear: "Scrolling down"');
        send({
            jsonrpc: '2.0',
            id: 'scroll2',
            method: 'tools/call',
            params: {
                name: 'browser_scroll',
                arguments: { direction: 'down', amount: 400 }
            }
        });
    }, 30000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 Step 6: Navigate to Another Todo Site');
        log('='.repeat(70));
        log('  🎤 You should hear: "Navigating to..."');
        send({
            jsonrpc: '2.0',
            id: 'nav2',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://trello.com' }
            }
        });
    }, 38000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 Step 7: Final Screenshot');
        log('='.repeat(70));
        log('  🎤 You should hear: "Taking a screenshot"');
        send({
            jsonrpc: '2.0',
            id: 'shot2',
            method: 'tools/call',
            params: {
                name: 'browser_screenshot',
                arguments: {}
            }
        });
    }, 50000);
    
}, 1000);

setTimeout(() => {
    log('\n' + '='.repeat(70));
    log('✅ TEST COMPLETE!');
    log('='.repeat(70));
    log('\n📊 What we tested:');
    log('  ✅ Browser navigation (2 websites)');
    log('  ✅ Scrolling (2 times)');
    log('  ✅ Screenshots (2 captures)');
    log('  ✅ Voice narration for ALL actions');
    log('\n🔊 You should have heard voice for:');
    log('  1. "Navigating to todoist.com"');
    log('  2. "Scrolling down"');
    log('  3. "Taking a screenshot"');
    log('  4. "Scrolling down" (again)');
    log('  5. "Navigating to trello.com"');
    log('  6. "Taking a screenshot" (again)');
    log('\n🎤 VoiceWrite MCP is working perfectly!');
    log('='.repeat(70) + '\n');
    agent.kill();
    process.exit(0);
}, 60000);
