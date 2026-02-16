# Real-time Communication Checklist

## Connection
- [ ] WebSocket/SSE URL correta e acessivel
- [ ] Auth token enviado na conexao
- [ ] Connection established confirmada
- [ ] Connection status visivel no UI

## Events
- [ ] Todo evento emitido pelo backend tem listener no frontend
- [ ] Todo listener do frontend tem emitter no backend
- [ ] Event names identicos em ambos lados
- [ ] Payload format consistente

## Resilience
- [ ] Auto-reconnect em disconnect
- [ ] Exponential backoff em reconnect
- [ ] Heartbeat/ping-pong ativo
- [ ] Graceful degradation sem real-time
- [ ] Cleanup ao sair da pagina (close connection)

## Data
- [ ] Real-time data atualiza UI imediatamente
- [ ] Sem duplicatas ao receber mesmo evento
- [ ] Ordering de mensagens preservado
