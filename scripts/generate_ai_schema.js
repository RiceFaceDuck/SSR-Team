/**
 * Script for AI: Converts Schema Key Markdown tables into a condensed JSON format.
 * This allows the AI to quickly read schema configurations without parsing Markdown,
 * saving processing time and tokens.
 */

const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '../Schema Key');
const outputFile = path.join(schemaDir, 'schema.json');

// Helper to extract tables from markdown
function parseMarkdownTable(mdContent) {
    const lines = mdContent.split('\n');
    const tableData = [];
    let isTable = false;

    lines.forEach(line => {
        if (line.trim().startsWith('|') && !line.includes('---')) {
            const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
            if (cells.length > 0) {
                if (!isTable) isTable = true;
                tableData.push(cells);
            }
        }
    });
    
    // First row is headers, subsequent rows are data
    if (tableData.length < 2) return [];
    
    const headers = tableData[0];
    const data = tableData.slice(1);
    
    return data.map(row => {
        let obj = {};
        headers.forEach((header, i) => {
            if (row[i]) {
                // Remove markdown links like [text](link) and keep text
                let text = row[i].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
                obj[header] = text;
            }
        });
        return obj;
    });
}

async function generateSchemaJson() {
    try {
        const files = fs.readdirSync(schemaDir).filter(file => file.endsWith('.md'));
        const combinedSchema = {
            _generatedAt: new Date().toISOString(),
            _noteForAI: "Use this JSON for quick schema lookups instead of parsing markdown.",
            schemas: {}
        };

        for (const file of files) {
            const filePath = path.join(schemaDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsedTable = parseMarkdownTable(content);
            if (parsedTable.length > 0) {
                combinedSchema.schemas[file] = parsedTable;
            }
        }

        fs.writeFileSync(outputFile, JSON.stringify(combinedSchema, null, 2));
        console.log(`✅ AI Schema successfully generated at: ${outputFile}`);
    } catch (error) {
        console.error('❌ Failed to generate AI Schema:', error);
    }
}

generateSchemaJson();
