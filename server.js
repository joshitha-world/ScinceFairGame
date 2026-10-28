// Zero-dependency local development server
// Runs on http://localhost:3000 (supports Web Bluetooth & Camera getUserMedia security requirements)
const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 3000;
let HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2'
};

const DATA_DIR = path.join(__dirname, 'data');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

function ensureDataStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]), 'utf-8');
  }
}
ensureDataStorage();

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Route: POST /api/sync-scores (Syncs scores from offline devices when online)
  if (req.url === '/api/sync-scores' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy(); // reject oversized payloads
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const newEntries = payload.entries || [];
        ensureDataStorage();
        const existing = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8') || '[]');

        const existingMap = new Map();
        existing.forEach(item => { if (item.id) existingMap.set(item.id, item); });
        newEntries.forEach(item => { if (item.id) existingMap.set(item.id, item); });

        const consolidated = Array.from(existingMap.values()).sort((a, b) => b.score - a.score);
        fs.writeFileSync(SCORES_FILE, JSON.stringify(consolidated, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: consolidated.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API Route: GET /api/scores
  if (req.url === '/api/scores' && req.method === 'GET') {
    ensureDataStorage();
    const scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8') || '[]');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(scores));
    return;
  }

  // Sanitize URL path
  let parsedUrl = req.url.split('?')[0];
  if (parsedUrl === '/' || parsedUrl === '') {
    parsedUrl = '/index.html';
  }

  const safePath = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType
    };

    if (parsedUrl === '/sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    res.writeHead(200, headers);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🏫 SLOKA THE SCHOOL - Edu Fair 2026 Educational App`);
    console.log(`🌟 Designed by: Joshitha, Grade 6C`);
    console.log(`🚀 Server listening on: http://${HOST}:${portToTry}`);
    console.log(`🌐 Local access: http://localhost:${portToTry}`);
    console.log(`📷 Camera & 🖨️ Web Bluetooth supported on HTTPS & localhost!`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} in use, trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

