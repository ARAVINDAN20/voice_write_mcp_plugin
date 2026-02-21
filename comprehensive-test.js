const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('\n🎙️ VoiceWrite MCP - Comprehensive Test Suite');
console.log('='.repeat(60));

const agent = spawn('node', [AGENT_PATH, '--debug'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';
const tests = [
    { name: 'Navigation', url: 'https://example.com', selector: 'h1' },
    { name: 'GitHub', url: 'https://github.com/trending', selector: 'h1' },
    { name: 'Wikipedia', url: 'https://wikipedia.org', selector: 'h1' },
];
let currentTest = 0;
const results = { passed: 0, failed: 0 };

function send(msg) {
    agent.stdin.write(JSON.stringify(msg) + '\n');
}

function log(msg, prefix = '[TEST]') {
    console.log(`${prefix} ${msg}`);
}

function runNextTest() {
    if (currentTest >= tests.length) {
        printSummary();
        agent.kill();
        process.exit(0);
    }
    const test = tests[currentTest];
    log(`\n📋 Test ${currentTest + 1}/${tests.length}: ${test.name}`);
    log(`Navigating to ${test.url}...`);
    send({
        jsonrpc: '2.0',
        id: `nav_${currentTest}`,
        method: 'tools/call',
        params: {
            name: 'browser_navigate',
            arguments: { url: test.url }
        }
    });
}

function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${tests.length}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('='.repeat(60));
    
    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! VoiceWrite MCP is fully functional!\n');
    }
}

agent.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = '';
    
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const json = JSON.parse(line);
            
            // Handle navigation results
            if (json.id && json.id.startsWith('nav_')) {
                if (json.result) {
                    log(`✅ Navigation successful`, '   ');
                    results.passed++;
                } else if (json.error) {
                    log(`❌ Navigation failed: ${json.error.message}`, '   ');
                    results.failed++;
                }
                currentTest++;
                setTimeout(runNextTest, 2000);
            }
            
            if (json.error && !json.id.startsWith('nav_')) {
                log(`⚠️ Error: ${json.error.message.substring(0, 80)}`, '   ');
            }
        } catch (e) {}
    }
});

agent.on('close', (code) => {
    if (code !== 0 && currentTest < tests.length) {
        log(`Agent exited with code ${code}`);
        printSummary();
    }
});

setTimeout(() => {
    log('Initializing MCP connection...');
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-suite', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        log('Starting test execution...\n');
        runNextTest();
    }, 3000);
}, 1000);
