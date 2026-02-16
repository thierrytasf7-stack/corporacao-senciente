/**
 * WebSocket Server para Monitor em Tempo Real
 * Porta: 4001
 * Endpoint: ws://localhost:4001/stream
 */

import { WebSocketServer } from 'ws';
import http from 'http';

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Monitor Server - Diana Corporação Senciente\n');
});

// Criar servidor WebSocket
const wss = new WebSocketServer({ 
  server,
  path: '/stream'
});

// Armazenar clientes conectados
const clients = new Set();

// Evento de conexão
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[Monitor] Cliente conectado: ${clientIp}`);
  
  // Marcar como vivo
  ws.isAlive = true;
  clients.add(ws);
  
  // Enviar mensagem de boas-vindas
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Conectado ao Monitor Diana',
    timestamp: new Date().toISOString(),
    clients: clients.size
  }));

  // Responder a pings com pongs
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Evento de mensagem recebida
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Responder a ping do cliente
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      console.log(`[Monitor] Mensagem recebida:`, data);
      
      // Echo de volta para o cliente
      ws.send(JSON.stringify({
        type: 'echo',
        data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error(`[Monitor] Erro ao processar mensagem:`, error);
    }
  });

  // Evento de desconexão
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[Monitor] Cliente desconectado. Clientes ativos: ${clients.size}`);
  });

  // Evento de erro
  ws.on('error', (error) => {
    console.error(`[Monitor] Erro no WebSocket:`, error);
    clients.delete(ws);
  });
});

// Função para broadcast de eventos
function broadcast(event) {
  const message = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN = 1
      client.send(message);
    }
  });
}

// Simular eventos do sistema a cada 5 segundos
setInterval(() => {
  if (clients.size > 0) {
    broadcast({
      type: 'system_event',
      event: 'heartbeat',
      data: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        clients: clients.size
      }
    });
  }
}, 5000);

// Keepalive: Ping clientes a cada 30 segundos
setInterval(() => {
  clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('[Monitor] Cliente não respondeu ao ping, desconectando...');
      clients.delete(ws);
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Simular eventos de agentes a cada 10 segundos
setInterval(() => {
  if (clients.size > 0) {
    const agents = ['maestro', 'dev', 'qa', 'security', 'innovation'];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const statuses = ['idle', 'working', 'completed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    broadcast({
      type: 'agent_event',
      event: 'status_change',
      data: {
        agent: randomAgent,
        status: randomStatus,
        message: `Agent ${randomAgent} is now ${randomStatus}`
      }
    });
  }
}, 10000);

// Iniciar servidor
const PORT = 4001;
server.listen(PORT, () => {
  console.log(`\n🚀 WebSocket Monitor Server iniciado!`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🔌 Endpoint: ws://localhost:${PORT}/stream`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
  console.log(`\n✅ Aguardando conexões...\n`);
});

// Tratamento de erros
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso!`);
    process.exit(1);
  } else {
    console.error(`❌ Erro no servidor:`, error);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando WebSocket Monitor Server...');
  
  // Notificar clientes
  broadcast({
    type: 'server_shutdown',
    message: 'Servidor encerrando...'
  });

  // Fechar todas as conexões
  clients.forEach((client) => {
    client.close();
  });

  // Fechar servidor
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso!');
    process.exit(0);
  });
});

// Exportar funções úteis
export { broadcast };
export function getClients() {
  return clients.size;
}
