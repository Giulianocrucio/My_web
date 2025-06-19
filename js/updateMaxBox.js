const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/local_data/maxbox.txt');
let maxBox = 0;

// Load existing max if file exists
if (fs.existsSync(DATA_FILE)) {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    maxBox = parseInt(content, 10) || 0;
}

const server = http.createServer((req, res) => {
    // --- CORS HEADERS ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    // --------------------

    if (req.method === 'POST' && req.url === '/update') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { count } = JSON.parse(body);
                if (typeof count === 'number' && count > maxBox) {
                    maxBox = count;
                    fs.writeFileSync(DATA_FILE, String(maxBox));
                }
                res.writeHead(200);
                res.end('OK');
            } catch (e) {
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3001, () => {
    console.log('Listening on http://localhost:3001');
});