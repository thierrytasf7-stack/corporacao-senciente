const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Servir o arquivo de teste
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'test.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Erro interno do servidor');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Página não encontrada');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
    console.log(`📁 Servindo arquivo: ${path.join(__dirname, 'test.html')}`);
    console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
});

server.on('error', (err) => {
    console.error('❌ Erro no servidor:', err);
});
