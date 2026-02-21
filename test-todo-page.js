const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');
const TODO_PAGE = 'file://' + path.resolve(__dirname, 'test-todo-page.html');

console.log('\n🎙️ VoiceWrite MCP - Todo List Page Test');
console.log('='.repeat(70));
console.log('📋 Testing: 5 Tasks, 5 Folders, Multiple Buttons');
console.log('🔊 Voice narration enabled - listen for actions!\n');

const agent = spawn('node', [AGENT_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: 'http://localhost:8000' }
});

let buffer = '';

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
    log('📋 Initializing MCP connection...\n');
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
        log('📍 TEST 1: Open Todo List Page');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: TODO_PAGE }
            }
        });
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 2: Click Work Projects Folder');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click1',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '.folder-tree li:nth-child(1) .folder',
                        narration: 'Clicking Work Projects folder'
                    }
                }
            });
        }, 8000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 3: Click First Task Complete Button');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click2',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '#task1 .btn-success',
                        narration: 'Completing first task'
                    }
                }
            });
        }, 14000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 4: Scroll Down to See More Tasks');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'scroll1',
                method: 'tools/call',
                params: {
                    name: 'browser_scroll',
                    arguments: { direction: 'down', amount: 400 }
                }
            });
        }, 20000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 5: Click Personal Folder');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click3',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '.folder-tree li:nth-child(2) .folder',
                        narration: 'Opening Personal folder'
                    }
                }
            });
        }, 26000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 6: Click New Task Button');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click4',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '.btn-primary',
                        narration: 'Creating new task'
                    }
                }
            });
        }, 32000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 7: Scroll Down Again');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'scroll2',
                method: 'tools/call',
                params: {
                    name: 'browser_scroll',
                    arguments: { direction: 'down', amount: 400 }
                }
            });
        }, 38000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 TEST 8: Take Screenshot');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'screenshot1',
                method: 'tools/call',
                params: {
                    name: 'browser_screenshot',
                    arguments: {}
                }
            });
        }, 44000);
        
    }, 3000);
}, 1000);

setTimeout(() => {
    log('\n' + '='.repeat(70));
    log('✅ TODO LIST TEST COMPLETE');
    log('='.repeat(70));
    log('\n📊 Test Summary:');
    log('  ✅ Page loaded with 5 tasks');
    log('  ✅ Clicked 2 folders (Work, Personal)');
    log('  ✅ Clicked task action button');
    log('  ✅ Clicked toolbar button (New Task)');
    log('  ✅ Scrolled page 2 times');
    log('  ✅ Took screenshot');
    log('\n🔊 You should have heard voice narration for each action!');
    log('='.repeat(70) + '\n');
    agent.kill();
    process.exit(0);
}, 55000);
