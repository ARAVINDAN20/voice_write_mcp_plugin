const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('🎙️ Testing Audio Playback in Browser\n');

const agent = spawn('node', [AGENT_PATH, '--debug'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';

function send(msg) {
    agent.stdin.write(JSON.stringify(msg) + '\n');
}

agent.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = '';
    
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const json = JSON.parse(line);
            
            // Log TTS calls
            if (json.id && json.id.includes('nav')) {
                if (json.result) {
                    console.log('✅ Navigation completed - TTS should have played!');
                    console.log('   Check browser window for:');
                    console.log('   - Red overlay bubble (bottom-right)');
                    console.log('   - Pulse animation when speaking');
                    console.log('   - Audio should play automatically\n');
                }
                if (json.error) {
                    console.log(`⚠️ Error: ${json.error.message}`);
                }
            }
        } catch (e) {}
    }
});

setTimeout(() => {
    console.log('Initializing...\n');
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'audio-test', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        console.log('🌐 Navigating to example.com (should trigger TTS)...\n');
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
            console.log('\n🔊 Testing TTS directly...\n');
            send({
                jsonrpc: '2.0',
                id: 'tts1',
                method: 'tools/call',
                params: {
                    name: 'browser_navigate',
                    arguments: { url: 'https://github.com' }
                }
            });
        }, 8000);
        
    }, 3000);
}, 1000);

setTimeout(() => {
    console.log('\n✅ Test complete!');
    console.log('\nIf you heard voice narration:');
    console.log('  ✅ Audio playback is WORKING!');
    console.log('\nIf you did NOT hear voice:');
    console.log('  1. Check browser volume');
    console.log('  2. Check if overlay appears (red bubble bottom-right)');
    console.log('  3. Press Alt+J to unmute if muted');
    console.log('  4. Check browser console for errors\n');
    agent.kill();
    process.exit(0);
}, 15000);
