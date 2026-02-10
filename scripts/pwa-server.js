const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4200;
const DIST_FOLDER = path.join(process.cwd(), 'dist/PharmacyStock.Client/browser');

// Load the local development certificate's public key
// This allows Node.js to trust the self-signed certificate from ASP.NET Core
const sslCertPath = path.join(process.cwd(), 'ssl/server.pem');
let sslCert = null;

try {
    sslCert = fs.readFileSync(sslCertPath);
    console.log('✅ Loaded development SSL certificate from:', sslCertPath);
} catch (error) {
    console.warn('⚠️  Could not load SSL certificate. API proxy might fail with self-signed cert errors.');
    console.warn('   Run: dotnet dev-certs https -ep "./ssl/server.pem" --format Pem');
}

// Proxy API requests to the backend
const apiProxy = createProxyMiddleware({
    target: 'https://localhost:7000',
    changeOrigin: true,
    secure: true, // We want to verify SSL...
    agent: sslCert ? new (require('https').Agent)({ ca: sslCert }) : undefined, // ...but using our specific dev cert CA
    ws: true, // Enable WebSocket proxying for SignalR
    logLevel: 'debug',
    pathFilter: ['/api', '/hubs'] // Only proxy requests starting with /api or /hubs
});

// Mount the proxy middleware globally (pathFilter handles the routing)
app.use(apiProxy);

// Serve static files from the dist folder
app.use(express.static(DIST_FOLDER));

// Fallback to index.html for Angular routing (SPA behavior)
app.use((req, res, next) => {
    // Only serve index.html for GET requests that accept HTML
    if (req.method === 'GET' && req.accepts('html')) {
        res.sendFile(path.join(DIST_FOLDER, 'index.html'));
    } else {
        next();
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 PWA Server running at http://localhost:${PORT}
backend Proxy target: https://localhost:7000
  `);
});
