#!/usr/bin/env node

/**
 * AI CLI Helper (`node scripts/ai.js <command> [args]`)
 * 
 * Available Commands:
 * 1. `schema <keyword>` : Searches and prints specific schemas (saves tokens vs reading all schemas).
 * 2. `index` : Generates the AI codebase index (.agents/ai-index.json).
 * 3. `find <keyword>` : Searches the AI codebase index.
 */

const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const arg = process.argv[3];

const rootDir = path.join(__dirname, '..');
const schemaFile = path.join(rootDir, 'Schema Key', 'schema.json');
const indexFile = path.join(rootDir, '.agents', 'ai-index.json');

function showHelp() {
    console.log(`
🤖 AI Helper CLI
Usage: node ai.js <command> [args]

Commands:
  schema <keyword>    Find specific schema tables (e.g. 'node ai.js schema Player')
  index               Rebuild the codebase function/component index for AI
  find <keyword>      Find where a function or component is defined
    `);
}

function searchSchema(keyword) {
    if (!fs.existsSync(schemaFile)) {
        console.log("❌ schema.json not found. Run generate_ai_schema.js first.");
        return;
    }
    const data = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
    let found = false;
    
    for (const [filename, tables] of Object.entries(data.schemas)) {
        // Simple search in JSON string
        const tableStr = JSON.stringify(tables);
        if (tableStr.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`\n🎯 Found match in [${filename}]:`);
            // Print only the matching rows
            const matchingRows = tables.filter(row => JSON.stringify(row).toLowerCase().includes(keyword.toLowerCase()));
            console.table(matchingRows);
            found = true;
        }
    }
    if (!found) console.log(`❌ No schema found matching: ${keyword}`);
}

function buildIndex() {
    console.log("🔍 Scanning codebase for AI Index...");
    const targets = ['frontend/src', 'admin/src', 'functions/src'];
    const indexData = {};

    function walkDir(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walkDir(fullPath);
            } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const exports = [];
                
                // Extremely basic Regex to find exports (Functions, Consts, Defaults)
                const exportRegex = /export\s+(?:const|function|let|class)\s+([a-zA-Z0-9_]+)/g;
                const defaultExportRegex = /export\s+default\s+(?:function\s+)?([a-zA-Z0-9_]+)?/g;
                
                let match;
                while ((match = exportRegex.exec(content)) !== null) {
                    exports.push(match[1]);
                }
                while ((match = defaultExportRegex.exec(content)) !== null) {
                    if (match[1]) exports.push(`default: ${match[1]}`);
                }

                if (exports.length > 0) {
                    // Store relative path
                    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                    indexData[relPath] = exports;
                }
            }
        }
    }

    targets.forEach(target => walkDir(path.join(rootDir, target)));
    
    // Ensure .agents dir exists
    if (!fs.existsSync(path.join(rootDir, '.agents'))) fs.mkdirSync(path.join(rootDir, '.agents'));
    
    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
    console.log(`✅ AI Index generated at: ${indexFile} (${Object.keys(indexData).length} files indexed)`);
}

function searchIndex(keyword) {
    if (!fs.existsSync(indexFile)) {
        console.log("❌ ai-index.json not found. Run 'node ai.js index' first.");
        return;
    }
    const data = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    let found = false;
    
    for (const [filePath, exports] of Object.entries(data)) {
        const matches = exports.filter(e => e.toLowerCase().includes(keyword.toLowerCase()));
        if (matches.length > 0 || filePath.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`\n📄 ${filePath}`);
            console.log(`   Exports: ${matches.length > 0 ? matches.join(', ') : exports.join(', ')}`);
            found = true;
        }
    }
    if (!found) console.log(`❌ No functions/components found matching: ${keyword}`);
}

if (!command) return showHelp();

switch(command) {
    case 'schema':
        if (!arg) return console.log("⚠️ Please provide a keyword. Example: node ai.js schema Player");
        searchSchema(arg);
        break;
    case 'index':
        buildIndex();
        break;
    case 'find':
        if (!arg) return console.log("⚠️ Please provide a keyword. Example: node ai.js find usePitch");
        searchIndex(arg);
        break;
    default:
        showHelp();
}
