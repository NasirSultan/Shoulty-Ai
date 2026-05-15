const fs = require('fs');
const https = require('https');

const code = fs.readFileSync('app/page.tsx', 'utf-8');
const match = code.match(/const INDUSTRY_PHOTOS = \[\s*([\s\S]*?)\];/);
if (!match) { console.log('Not found'); process.exit(1); }

const lines = match[1].split('\n').filter(l => l.includes('url:'));
const items = lines.map(line => {
    const labelMatch = line.match(/label:\s*"([^"]+)"/);
    const urlMatch = line.match(/url:\s*"([^"]+)"/);
    if (labelMatch && urlMatch) {
        const idMatch = urlMatch[1].match(/photos\/(\d+)/);
        return { label: labelMatch[1], id: idMatch ? idMatch[1] : null, url: urlMatch[1] };
    }
    return null;
}).filter(Boolean);

async function check() {
    for (const item of items) {
        if (!item.id) continue;
        await new Promise(resolve => {
            https.get('https://www.pexels.com/photo/' + item.id + '/', (res) => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                    if (data.includes('</title>')) res.destroy(); // stop early
                });
                res.on('end', () => {
                    const titleMatch = data.match(/<title>([^<]+)<\/title>/);
                    console.log(item.label.padEnd(20), '|', item.id.padEnd(8), '|', titleMatch ? titleMatch[1].trim() : 'Title not found');
                    resolve();
                });
                res.on('error', () => {
                    console.log(item.label.padEnd(20), '|', item.id.padEnd(8), '|', 'Error');
                    resolve();
                });
            }).on('error', resolve);
        });
    }
}
check();
