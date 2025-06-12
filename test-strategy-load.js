const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Serve the merged_strategies.txt file
app.use(express.static('public'));

async function testStrategyFileAccess() {
    console.log('Starting strategy file access test...');
    
    try {
        // Test 1: Check if file exists in public directory
        const publicPath = path.join(__dirname, 'public', 'merged_strategies.txt');
        console.log('\nTest 1: Checking if file exists in:', publicPath);
        
        if (fs.existsSync(publicPath)) {
            console.log('✅ File exists in public directory');
            const fileContent = fs.readFileSync(publicPath, 'utf8');
            console.log('File size:', fileContent.length, 'bytes');
        } else {
            console.log('❌ File not found in public directory');
        }

        // Test 2: Try to fetch the file through HTTP
        console.log('\nTest 2: Attempting to fetch file through HTTP...');
        const server = app.listen(PORT, async () => {
            try {
                const response = await fetch(`http://localhost:${PORT}/merged_strategies.txt`);
                if (response.ok) {
                    const content = await response.text();
                    console.log('✅ Successfully fetched file through HTTP');
                    console.log('Content length:', content.length, 'bytes');
                    
                    // Test 3: Check file content
                    console.log('\nTest 3: Checking file content...');
                    if (content.includes('Mechabellum') && content.includes('Guide')) {
                        console.log('✅ File content appears to be correct');
                    } else {
                        console.log('❌ File content may be incorrect');
                        console.log('First 100 characters:', content.substring(0, 100));
                    }
                } else {
                    console.log('❌ Failed to fetch file:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error during HTTP fetch:', error);
            } finally {
                server.close(() => {
                    console.log('\nTest complete. Server closed.');
                    process.exit(0);
                });
            }
        });
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testStrategyFileAccess(); 