const { spawn } = require('child_process');
const path = require('path');

// Configuration
const AGENT_PATH = path.resolve(__dirname, 'node-agent/dist/index.js');
const TTS_URL = process.env.TTS_SERVICE_URL || 'http://localhost:8000';

// Test definitions
const TESTS = [
    {
        name: '🧪 TEST 1: Basic Navigation (Wikipedia)',
        steps: [
            { action: 'navigate', url: 'https://www.wikipedia.org' },
            { action: 'type', selector: '#searchInput', text: 'Artificial Intelligence' },
            { action: 'click', selector: '.search-button', narration: 'Clicking search button' },
            { action: 'wait', ms: 2000 },
            { action: 'click', selector: '.first-result a', narration: 'Opening first article' },
            { action: 'scroll', direction: 'down', amount: 500 },
            { action: 'scroll', direction: 'down', amount: 500 }
        ]
    },
    {
        name: '🔍 TEST 2: GitHub Search (Playwright)',
        steps: [
            { action: 'navigate', url: 'https://github.com' },
            { action: 'type', selector: 'input[name="q"]', text: 'playwright' },
            { action: 'wait', ms: 2000 },
            { action: 'click', selector: '.repo-list-item a', narration: 'Opening Playwright repository' },
            { action: 'wait', ms: 3000 }
        ]
    },
    {
        name: '❌ TEST 3: Error Handling',
        steps: [
            { action: 'navigate', url: 'https://example.com' },
            { action: 'click', selector: '#nonexistent-element', narration: 'Trying to click nonexistent element' },
            { action: 'wait', ms: 2000 }
        ]
    },
    {
        name: '📸 TEST 4: Screenshot',
        steps: [
            { action: 'navigate', url: 'https://github.com' },
            { action: 'screenshot' },
            { action: 'wait', ms: 2000 }
        ]
    },
    {
        name: '📰 TEST 5: News Scroll (Hacker News)',
        steps: [
            { action: 'navigate', url: 'https://news.ycombinator.com' },
            { action: 'scroll', direction: 'down', amount: 600 },
            { action: 'scroll', direction: 'down', amount: 600 },
            { action: 'scroll', direction: 'down', amount: 600 },
            { action: 'scroll', direction: 'up', amount: 1200 },
            { action: 'wait', ms: 2000 }
        ]
    }
];

console.log('\n' + '='.repeat(60));
console.log('🎙️  VoiceWrite MCP - Complete Test Suite');
console.log('='.repeat(60) + '\n');

const agent = spawn('node', [AGENT_PATH, '--debug'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, TTS_SERVICE_URL: TTS_URL }
});

let buffer = '';
let currentTest = 0;
let currentStep = 0;
let testResults = [];
let currentTestId = null;

function log(msg) {
    console.log(`[TEST RUNNER] ${msg}`);
}

function send(msg) {
    const str = JSON.stringify(msg) + '\n';
    agent.stdin.write(str);
    log(`Sent: ${msg.method || 'message'}`);
}

function runNextTest() {
    if (currentTest >= TESTS.length) {
        printSummary();
        process.exit(0);
        return;
    }

    const test = TESTS[currentTest];
    currentStep = 0;
    currentTestId = `test_${currentTest + 1}`;
    
    log(`\n${'='.repeat(60)}`);
    log(`${test.name}`);
    log('='.repeat(60));
    
    runNextStep();
}

function runNextStep() {
    const test = TESTS[currentTest];
    
    if (currentStep >= test.steps.length) {
        log(`✅ ${test.name} - COMPLETED\n`);
        testResults.push({ name: test.name, status: 'PASS' });
        currentTest++;
        setTimeout(runNextTest, 2000);
        return;
    }

    const step = test.steps[currentStep];
    
    switch (step.action) {
        case 'navigate':
            log(`Step ${currentStep + 1}: Navigate to ${step.url}`);
            send({
                jsonrpc: '2.0',
                id: `${currentTestId}_step_${currentStep}`,
                method: 'tools/call',
                params: {
                    name: 'browser_navigate',
                    arguments: { url: step.url }
                }
            });
            break;
            
        case 'type':
            log(`Step ${currentStep + 1}: Type "${step.text}" into ${step.selector}`);
            send({
                jsonrpc: '2.0',
                id: `${currentTestId}_step_${currentStep}`,
                method: 'tools/call',
                params: {
                    name: 'browser_type',
                    arguments: { 
                        selector: step.selector,
                        text: step.text
                    }
                }
            });
            break;
            
        case 'click':
            log(`Step ${currentStep + 1}: Click ${step.selector}`);
            send({
                jsonrpc: '2.0',
                id: `${currentTestId}_step_${currentStep}`,
                method: 'tools/call',
                params: {
                    name: 'browser_click',
                    arguments: { 
                        selector: step.selector,
                        narration: step.narration || `Clicking ${step.selector}`
                    }
                }
            });
            break;
            
        case 'scroll':
            log(`Step ${currentStep + 1}: Scroll ${step.direction} by ${step.amount}px`);
            send({
                jsonrpc: '2.0',
                id: `${currentTestId}_step_${currentStep}`,
                method: 'tools/call',
                params: {
                    name: 'browser_scroll',
                    arguments: { 
                        direction: step.direction,
                        amount: step.amount
                    }
                }
            });
            break;
            
        case 'screenshot':
            log(`Step ${currentStep + 1}: Taking screenshot`);
            send({
                jsonrpc: '2.0',
                id: `${currentTestId}_step_${currentStep}`,
                method: 'tools/call',
                params: {
                    name: 'browser_screenshot',
                    arguments: {}
                }
            });
            break;
            
        case 'wait':
            log(`Step ${currentStep + 1}: Waiting ${step.ms}ms`);
            setTimeout(() => {
                currentStep++;
                runNextStep();
            }, step.ms);
            return;
    }
    
    currentStep++;
}

function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = testResults.filter(t => t.status === 'PASS').length;
    const failed = testResults.filter(t => t.status === 'FAIL').length;
    
    testResults.forEach((result, i) => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} Test ${i + 1}: ${result.name} - ${result.status}`);
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log('='.repeat(60) + '\n');
    
    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED! 🎉\n');
    } else {
        console.log(`⚠️  ${failed} test(s) failed\n`);
    }
}

// Parse agent responses
agent.stdout.on('data', (data) => {
    const output = data.toString();
    buffer += output;

    try {
        const lines = buffer.split('\n');
        let newBuffer = '';
        
        for (const line of lines) {
            if (!line.trim()) {
                newBuffer += line + '\n';
                continue;
            }
            
            try {
                const json = JSON.parse(line);
                
                // Log response
                if (json.id) {
                    if (json.error) {
                        log(`❌ Error in ${json.id}: ${json.error.message}`);
                        // Mark step as completed anyway for non-critical errors
                    } else if (json.result) {
                        log(`✅ Response for ${json.id}`);
                        
                        // Check if this is a tool call response
                        if (json.result.content) {
                            // Tool executed successfully
                        }
                    }
                }
                
                // Auto-advance to next step after response
                if (json.result && json.id && json.id.includes('_step_')) {
                    setTimeout(runNextStep, 1500);
                }
                
            } catch (e) {
                newBuffer += line + '\n';
            }
        }
        
        buffer = newBuffer;
    } catch (e) {
        // Incomplete JSON, wait for more
    }
});

// Handle agent errors
agent.on('error', (err) => {
    log(`❌ Agent error: ${err.message}`);
    process.exit(1);
});

agent.on('close', (code) => {
    log(`Agent exited with code ${code}`);
    if (code !== 0) {
        process.exit(code);
    }
});

// Start the test suite
log('Starting VoiceWrite Agent...');
log(`TTS Service: ${TTS_URL}`);

// Initialize MCP connection
setTimeout(() => {
    log('Initializing MCP connection...');
    send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-runner', version: '1.0' }
        }
    });
    
    // Wait for init response, then get tools
    setTimeout(() => {
        log('Requesting available tools...');
        send({
            jsonrpc: '2.0',
            id: 'list_tools',
            method: 'tools/list',
            params: {}
        });
        
        // Start first test after tools are listed
        setTimeout(() => {
            log('\n🚀 Starting test execution...\n');
            runNextTest();
        }, 2000);
        
    }, 2000);
    
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
    log('\n⚠️  Interrupted by user');
    printSummary();
    agent.kill();
    process.exit(0);
});
