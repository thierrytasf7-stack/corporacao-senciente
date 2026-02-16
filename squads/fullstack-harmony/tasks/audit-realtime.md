---
task: Real-time Communication Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - realtime_channels: Canais de real-time mapeados
  - issues: Dessintonias em real-time
Checklist:
  - "[ ] Identificar tecnologia (WebSocket, SSE, polling)"
  - "[ ] Mapear events emitidos pelo backend"
  - "[ ] Mapear events escutados pelo frontend"
  - "[ ] Cruzar: frontend escuta evento que backend nunca emite?"
  - "[ ] Cruzar: backend emite evento que nenhum frontend escuta?"
  - "[ ] Verificar WebSocket URL alignment"
  - "[ ] Verificar reconnection logic no frontend"
  - "[ ] Verificar auth em WebSocket connections"
  - "[ ] Verificar heartbeat/ping-pong"
  - "[ ] Verificar graceful degradation sem real-time"
---

# *audit-realtime

Auditoria de comunicacao real-time entre backend e frontend.

## WebSocket

### Backend Patterns
```javascript
// Socket.io
io.on('connection', (socket) => {
  socket.on('subscribe', (channel) => { ... });
  socket.emit('update', data);
  socket.emit('notification', payload);
});

// ws (raw)
wss.on('connection', (ws) => {
  ws.on('message', (msg) => { ... });
  ws.send(JSON.stringify({ type: 'update', data }));
});
```

### Frontend Patterns
```javascript
// Socket.io client
const socket = io('ws://localhost:21302');
socket.on('update', (data) => { updateUI(data); });
socket.on('notification', (data) => { showNotification(data); });

// Native WebSocket
const ws = new WebSocket('ws://localhost:21302/stream');
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'update') updateUI(data);
};
```

### Cruzamento
```
BACKEND EMITS           FRONTEND LISTENS
'update'          <-->  socket.on('update')        ✅ Match
'notification'    <-->  socket.on('notification')  ✅ Match
'metrics'         <-->  (ninguem escuta)           ⚠️ Dead event
(nao emite)       <-->  socket.on('heartbeat')     ❌ Never fires
```

## SSE (Server-Sent Events)

### Backend
```javascript
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.write(`event: update\ndata: ${JSON.stringify(data)}\n\n`);
});
```

### Frontend
```javascript
const source = new EventSource('/api/stream');
source.addEventListener('update', (e) => {
  const data = JSON.parse(e.data);
  updateUI(data);
});
```

## Polling

### Frontend
```javascript
setInterval(async () => {
  const data = await fetch('/api/status');
  updateUI(data);
}, 5000);
```

### Verificar
- Intervalo e adequado? (muito frequente = overhead, muito lento = stale)
- Polling para quando tab inativa? (visibility API)
- Polling tem error handling?

## Verificacoes Criticas

| Check | Descricao |
|-------|-----------|
| URL Match | WebSocket URL do frontend aponta para backend correto |
| Auth | Token enviado na conexao WebSocket |
| Reconnect | Frontend reconecta automaticamente em disconnect |
| Heartbeat | Ping/pong para detectar conexoes mortas |
| Event Names | Nomes de eventos identicos em ambos lados |
| Payload Format | Formato dos dados emitidos = formato esperado |
| Error Handling | Frontend trata erros de conexao |
| Cleanup | Frontend desconecta ao sair da pagina |

## Formato de Finding

```markdown
### [RT-001] Frontend escuta evento 'heartbeat' que backend nunca emite
- **Severidade:** MEDIUM
- **Frontend:** src/hooks/useWebSocket.ts:34
  ```typescript
  socket.on('heartbeat', () => setConnected(true));
  ```
- **Backend:** Nenhum emit de 'heartbeat' encontrado
- **Impacto:** Indicador de conexao nunca fica "online"
- **Fix:** Backend emitir heartbeat periodico ou frontend usar outro mecanismo
```
