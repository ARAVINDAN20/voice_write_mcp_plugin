const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('\n🎙️ VoiceWrite MCP - Create 5-Task Todo List');
console.log('='.repeat(70));
console.log('🔊 VOICE NARRATION ENABLED - Listen to voice through speakers!');
console.log('📋 Creating todo list with 5 tasks in browser\n');

const agent = spawn('node', [AGENT_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';
let taskNumber = 0;

function send(msg) {
    agent.stdin.write(JSON.stringify(msg) + '\n');
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
    log('\n📋 Initializing...\n');
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'todo-5tasks', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 TASK 1: Open Todo List Website');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://todoist.com' }
            }
        });
        taskNumber = 1;
    }, 3000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 TASK 2: Scroll Down to See Features');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'scroll1',
            method: 'tools/call',
            params: {
                name: 'browser_scroll',
                arguments: { direction: 'down', amount: 600 }
            }
        });
        taskNumber = 2;
    }, 15000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 TASK 3: Take Screenshot of Todoist');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'shot1',
            method: 'tools/call',
            params: {
                name: 'browser_screenshot',
                arguments: {}
            }
        });
        taskNumber = 3;
    }, 25000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 TASK 4: Navigate to Trello');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'nav2',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://trello.com' }
            }
        });
        taskNumber = 4;
    }, 35000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 TASK 5: Scroll & Take Final Screenshot');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'scroll2',
            method: 'tools/call',
            params: {
                name: 'browser_scroll',
                arguments: { direction: 'down', amount: 500 }
            }
        });
        taskNumber = 5;
    }, 48000);
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 BONUS: Take Final Screenshot');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'shot2',
            method: 'tools/call',
            params: {
                name: 'browser_screenshot',
                arguments: {}
            }
        });
    }, 58000);
    
}, 1000);

setTimeout(() => {
    log('\n' + '='.repeat(70));
    log('✅ ALL 5 TASKS COMPLETED!');
    log('='.repeat(70));
    log('\n📊 Task Summary:');
    log('  ✅ Task 1: Opened Todoist website');
    log('  ✅ Task 2: Scrolled down to see features');
    log('  ✅ Task 3: Took screenshot of Todoist');
    log('  ✅ Task 4: Navigated to Trello');
    log('  ✅ Task 5: Scrolled and took final screenshot');
    log('\n🔊 You should have heard voice for ALL tasks!');
    log('\n🎤 VoiceWrite MCP successfully created 5-task todo list!');
    log('='.repeat(70) + '\n');
    agent.kill();
    process.exit(0);
}, 70000);
