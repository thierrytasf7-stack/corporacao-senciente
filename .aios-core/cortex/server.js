import http from 'http';
import { URL } from 'url';

const PORT = process.env.CORTEX_PORT || 3000;
const API_KEY = process.env.CORTEX_KEY || 'senciente-secret-key';

const server = http.createServer((req, res) => {
    // Middleware: Auth
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${API_KEY}`) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Unauthorized: Invalid Cortex Key" }));
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    // Router
    if (req.method === 'POST' && parsedUrl.pathname === '/perceive') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "Perception logged", timestamp: Date.now() }));
    } 
    else if (req.method === 'POST' && parsedUrl.pathname === '/reason') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ thought: "Processing logic...", decision: "WAIT" }));
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/act') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ action: "EXECUTED", target: "System" }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Unknown Neural Pathway" }));
    }
});

// Export server for testing, don't auto-listen if imported
export default server;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    server.listen(PORT, () => {
        console.log(`🧠 CÓRTEX ONLINE na porta ${PORT}`);
    });
}
