const fs = require('fs');
const code = fs.readFileSync('app/page.tsx', 'utf-8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('const INDUSTRY_PHOTOS = ['));
if (startIndex !== -1) {
  let count = 0;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].includes('];')) break;
    const match = lines[i].match(/label:\s*"([^"]+)".*url:\s*"([^"]+)"/);
    if (match) {
        console.log(match[1].padEnd(20), match[2]);
        count++;
    }
  }
  console.log('Found', count, 'items');
} else {
  console.log('Array not found');
}