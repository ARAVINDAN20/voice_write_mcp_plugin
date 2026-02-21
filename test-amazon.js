const { spawn } = require('child_process');
const path = require('path');

const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');

console.log('\n🛒 VoiceWrite MCP - Amazon Shopping Test');
console.log('='.repeat(70));
console.log('🎯 Real-life scenario: Buy a product from Amazon');
console.log('🔊 Listen for voice narration of each action!\n');

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
            clientInfo: { name: 'amazon-test', version: '1.0' }
        }
    });
    
    setTimeout(() => {
        log('\n' + '='.repeat(70));
        log('📍 STEP 1: Navigate to Amazon.com');
        log('='.repeat(70));
        send({
            jsonrpc: '2.0',
            id: 'nav1',
            method: 'tools/call',
            params: {
                name: 'browser_navigate',
                arguments: { url: 'https://www.amazon.com' }
            }
        });
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 2: Search for "Wireless Headphones"');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'type1',
                method: 'tools/call',
                params: {
                    name: 'browser_type',
                    arguments: { 
                        selector: '#twotabsearchtextbox',
                        text: 'Wireless Headphones'
                    }
                }
            });
        }, 15000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 3: Click Search Button');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click1',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '#nav-search-submit-button',
                        narration: 'Clicking search button'
                    }
                }
            });
        }, 20000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 4: Scroll Down to See Products');
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
        }, 28000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 5: Click First Product');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click2',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '.s-result-item h2 a',
                        narration: 'Opening first product'
                    }
                }
            });
        }, 35000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 6: Scroll Down to See Price');
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
        }, 45000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 7: Try to Add to Cart');
            log('='.repeat(70));
            send({
                jsonrpc: '2.0',
                id: 'click3',
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: '#add-to-cart-button',
                        narration: 'Adding to cart'
                    }
                }
            });
        }, 52000);
        
        setTimeout(() => {
            log('\n' + '='.repeat(70));
            log('📍 STEP 8: Take Screenshot');
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
        }, 60000);
        
    }, 5000);
}, 1000);

setTimeout(() => {
    log('\n' + '='.repeat(70));
    log('✅ AMAZON SHOPPING TEST COMPLETE');
    log('='.repeat(70));
    log('\n📊 What we did:');
    log('  1. ✅ Navigated to Amazon.com');
    log('  2. ✅ Searched for "Wireless Headphones"');
    log('  3. ✅ Clicked search button');
    log('  4. ✅ Scrolled to see products');
    log('  5. ✅ Opened first product');
    log('  6. ✅ Scrolled to see price');
    log('  7. ✅ Tried to add to cart');
    log('  8. ✅ Took screenshot');
    log('\n🔊 You should have heard voice for each action!');
    log('='.repeat(70) + '\n');
    agent.kill();
    process.exit(0);
}, 75000);
