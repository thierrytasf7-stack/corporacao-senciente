# Streaming Responses - Respostas em Tempo Real

## Visão Geral

O sistema de Streaming Responses permite que respostas de LLMs sejam transmitidas em tempo real, token por token, criando uma experiência interativa e responsiva para o usuário. Esta funcionalidade é essencial para melhorar a percepção de performance e fornecer feedback imediato durante operações longas.

## Arquitetura

### Componentes Principais

1. **Streaming API** (`scripts/api/streaming_api.js`)
   - Servidor Express dedicado para endpoints de streaming
   - Suporte a Server-Sent Events (SSE)
   - Gerenciamento de conexões ativas
   - Estatísticas em tempo real

2. **LLM Client com Streaming** (`scripts/utils/llm_client.js`)
   - Extensão do cliente LLM existente
   - Suporte a streaming para Grok API
   - Fallback inteligente para outros providers
   - Callback system para processamento de tokens

3. **Chat Interface** (`scripts/swarm/chat_interface.js`)
   - Integração com sistema de incorporação
   - Compatibilidade com streaming existente

## Endpoints da API

### `/api/stream/incorporate`

Endpoint para incorporar agentes no chat com progresso em tempo real.

```javascript
GET /api/stream/incorporate?prompt=<prompt>&agent=<agent>&context=<context>
```

**Eventos SSE:**
- `start`: Início do processo
- `progress`: Atualização de progresso (validação, coleta de contexto, etc.)
- `complete`: Processo concluído com sucesso
- `error`: Erro durante o processo

### `/api/stream/chat`

Endpoint para chat em tempo real com LLMs.

```javascript
GET /api/stream/chat?message=<message>&agent=<agent>&model=<model>
```

**Eventos SSE:**
- `start`: Início da geração de resposta
- `token`: Token individual sendo gerado
- `response_complete`: Resposta completa recebida
- `error`: Erro durante a geração

### `/api/stream/execute`

Endpoint para executar ações com progresso em tempo real.

```javascript
POST /api/stream/execute
Content-Type: application/json

{
  "action": {
    "type": "execute_task",
    "description": "Descrição da ação"
  },
  "context": {
    "agent": "architect",
    "priority": "high"
  }
}
```

**Eventos SSE:**
- `start`: Início da execução
- `execution_progress`: Progresso da execução (passos individuais)
- `complete`: Execução concluída
- `error`: Erro durante execução

### `/api/stream/cancel/:streamId`

Cancela um stream ativo.

```javascript
POST /api/stream/cancel/stream_1234567890_abc123
```

### `/api/stream/status`

Retorna estatísticas dos streams ativos.

```javascript
GET /api/stream/status
```

**Resposta:**
```json
{
  "active_streams": 2,
  "total_streams": 47,
  "avg_duration": 2340,
  "total_tokens": 1250,
  "errors": 0
}
```

## Implementação Técnica

### Streaming com Grok API

```javascript
// Configuração da requisição
const response = await fetch('https://api.x.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GROK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'grok-beta',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
    temperature: 0.7
  })
});

// Processamento do stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      const parsed = JSON.parse(data);
      const token = parsed.choices[0].delta.content;

      if (token) {
        onTokenCallback(token, accumulatedText);
      }
    }
  }
}
```

### Server-Sent Events (SSE)

```javascript
// Configuração do response
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Access-Control-Allow-Origin': '*'
});

// Envio de eventos
res.write(`event: token\n`);
res.write(`data: ${JSON.stringify(tokenData)}\n\n`);

// Flush para envio imediato
if (res.flush) res.flush();
```

## Funcionalidades Avançadas

### 1. Gerenciamento de Conexões

- **Limite de streams ativos**: Previne sobrecarga do servidor
- **Timeout automático**: Streams inativos são fechados automaticamente
- **Cleanup gracioso**: Recursos liberados adequadamente

### 2. Fallback Inteligente

- **De streaming para não-streaming**: Se streaming falhar, fallback para resposta completa
- **Entre providers**: Grok → Gemini → Ollama
- **Simulação de streaming**: Para providers que não suportam streaming nativo

### 3. Monitoramento em Tempo Real

```javascript
// Estatísticas coletadas
{
  active_streams: 5,
  total_streams: 1250,
  avg_stream_duration: 2340, // ms
  total_tokens_streamed: 45670,
  errors: 3
}
```

### 4. Cancelamento de Streams

```javascript
// Cancelamento por ID
const stream = activeStreams.get(streamId);
if (stream) {
  stream.response.end();
  activeStreams.delete(streamId);
}
```

## Casos de Uso

### 1. Chat Interativo

```javascript
// Cliente JavaScript
const eventSource = new EventSource('/api/stream/chat?message=Olá&agent=assistant');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.token) {
    updateUI(data.text_so_far);
  }
};
```

### 2. Execução Longa com Feedback

```javascript
// Mostrar progresso durante incorporação
eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  updateProgressBar(data.progress, data.message);
});
```

### 3. Cancelamento de Operações

```javascript
// Cancelar operação longa
fetch(`/api/stream/cancel/${streamId}`, { method: 'POST' });
```

## Testes

### Teste Básico

```bash
# Executar testes de streaming
node scripts/test_streaming_api.js
```

### Teste com LLM Real

```bash
# Testar streaming real com Grok
node scripts/test_streaming_real.js
```

## Configuração

### Variáveis de Ambiente

```env
# Grok API (primário para streaming)
GROK_API_KEY=your_grok_api_key
GROK_MODEL=grok-beta

# Streaming API
STREAMING_API_PORT=3002
STREAMING_TIMEOUT_MS=30000

# Fallback providers
GEMINI_API_KEY=your_gemini_key
OLLAMA_ENABLED=true
```

### Configuração do Servidor

```javascript
const streamingAPI = getStreamingAPI(3002);
await streamingAPI.start();
```

## Métricas de Performance

### Latência Típica

- **Primeiro token**: 500-1500ms (depende do provider)
- **Tokens subsequentes**: 50-200ms cada
- **Overhead SSE**: < 10ms por evento

### Throughput

- **Streams simultâneos**: Até 50 (depende do hardware)
- **Tokens/segundo**: 10-50 (depende do modelo e hardware)
- **Memória por stream**: ~50KB

## Limitações e Considerações

### 1. Compatibilidade de Browsers

- SSE suportado em todos os browsers modernos
- Fallback para WebSockets se necessário
- Polling como último recurso

### 2. Rate Limits

- Respeito aos limites da API do provider
- Backoff exponencial em caso de rate limit
- Cache inteligente para reduzir chamadas

### 3. Segurança

- Validação de entrada em todos os endpoints
- Timeout para prevenir abuse
- Limitação de conexões por IP

## Próximos Passos

### Melhorias Planejadas

1. **WebSocket Support**: Alternativa mais robusta para browsers antigos
2. **Compressão**: Redução de bandwidth para streams longos
3. **Buffering Inteligente**: Agrupamento de tokens pequenos
4. **Multi-modal Streaming**: Suporte a streaming de imagens/audio
5. **Streaming Bidirecional**: Conversas em tempo real

### Integrações Futuras

- **Frontend React/Vue**: Componentes para consumo de streams
- **Mobile Apps**: Suporte nativo para iOS/Android
- **Edge Computing**: Streaming em edge locations
- **CDN Integration**: Distribuição global de streams

## Troubleshooting

### Problemas Comuns

1. **Streams não iniciam**
   - Verificar configuração do CORS
   - Confirmar que porta está livre
   - Verificar logs do servidor

2. **Tokens não aparecem**
   - Verificar API key do provider
   - Confirmar suporte a streaming no modelo
   - Verificar conectividade de rede

3. **Streams travam**
   - Implementar heartbeat/ping
   - Adicionar timeout de inatividade
   - Verificar rate limits do provider

### Debug

```javascript
// Logs detalhados
const log = logger.child({ module: 'streaming_debug' });
log.debug('Stream event', { eventType, data, streamId });

// Monitoramento em tempo real
setInterval(() => {
  console.log('Active streams:', streamingAPI.getStats());
}, 5000);
```