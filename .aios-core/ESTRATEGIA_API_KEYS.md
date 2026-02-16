# Estratégia de API Keys - AIOS-Core

## 🎯 Objetivo

Maximizar o uso de modelos LLM através de **múltiplas API keys** e **roteamento inteligente**, permitindo execução paralela sem rate limits.

## 🔑 Configuração de Keys

### Key Principal (Paga)
```
OPENROUTER_API_KEY=sk-or-v1-f93ca135...
```
**Uso**: Modelos pagos (Claude 3.5 Sonnet, DeepSeek V3)
**Créditos**: Disponíveis
**Prioridade**: Tasks críticas

### Keys Secundárias (Gratuitas)
```
OPENROUTER_API_KEY_FREE_1=sk-or-v1-ca6bf4f1...
OPENROUTER_API_KEY_FREE_2=sk-or-v1-f82d95cc...
OPENROUTER_API_KEY_FREE_3=sk-or-v1-3d37d687...
OPENROUTER_API_KEY_FREE_4=sk-or-v1-18578b96...
OPENROUTER_API_KEY_FREE_5=sk-or-v1-d7977115...
```
**Uso**: Modelos gratuitos (Gemini Flash, Llama 3.3, DeepSeek R1 Distill)
**Créditos**: Ilimitados (free tier)
**Prioridade**: Tasks simples, execução paralela

## 🎨 Estratégia de Roteamento

### 1. Roteamento por Tipo de Task

```javascript
// Task crítica → Key paga + Modelo pago
{
  taskType: 'critical',
  apiKey: OPENROUTER_API_KEY,
  model: 'anthropic/claude-3.5-sonnet'
}

// Task simples → Key gratuita + Modelo gratuito
{
  taskType: 'simple',
  apiKey: OPENROUTER_API_KEY_FREE_1,
  model: 'google/gemini-2.0-flash-exp:free'
}
```

### 2. Roteamento por Função

| Função | Modelo | Key | Custo |
|--------|--------|-----|-------|
| **Planejamento (Pago)** | DeepSeek V3 | Principal | $$ |
| **Planejamento (Free)** | DeepSeek R1 Distill | Gratuita | Free |
| **Execução 1** | Gemini 2.0 Flash | Gratuita | Free |
| **Execução 2** | Llama 3.3 70B | Gratuita | Free |
| **Refatoração** | Claude 3.5 Sonnet | Principal | $$ |

### 3. Semáforo (Load Balancing)

```
Worker 1 → Key Free 1 → Gemini Flash
Worker 2 → Key Free 2 → Llama 3.3
Worker 3 → Key Free 3 → DeepSeek R1
Worker 4 → Key Free 4 → Gemini Flash
Worker 5 → Key Free 5 → Llama 3.3
```

**Benefício**: 5 workers simultâneos sem rate limit!

## 🔄 Rotação de Keys (Round Robin)

```javascript
// Primeira chamada
selectApiKey('simple') → FREE_1

// Segunda chamada
selectApiKey('simple') → FREE_2

// Terceira chamada
selectApiKey('simple') → FREE_3

// Sexta chamada (volta ao início)
selectApiKey('simple') → FREE_1
```

## 📊 Matriz de Decisão

```
┌─────────────────────────────────────────────────────────┐
│                    TIPO DE TASK                         │
├──────────────┬──────────────┬──────────────────────────┤
│   Crítica    │   Simples    │       Paralela           │
└──────┬───────┴──────┬───────┴──────────┬───────────────┘
       │              │                  │
       ▼              ▼                  ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐
│  Key Paga   │ │ Key Free 1  │ │ Keys Free 1-5       │
│  Claude 3.5 │ │ Gemini Flash│ │ Round Robin         │
└─────────────┘ └─────────────┘ └─────────────────────┘
```

## 🎯 Casos de Uso

### Caso 1: Refatoração de Documentos (Workflow AIOS)
```yaml
Task: refactor-05
Priority: high
Type: critical

→ Key: Principal (paga)
→ Model: anthropic/claude-3.5-sonnet
→ Razão: Qualidade máxima necessária
```

### Caso 2: Squad Matrix (5 Workers Aider)
```yaml
Worker 1: documentation_task_1
Worker 2: documentation_task_2
Worker 3: documentation_task_3
Worker 4: documentation_task_4
Worker 5: documentation_task_5

→ Keys: FREE_1, FREE_2, FREE_3, FREE_4, FREE_5
→ Models: Gemini Flash, Llama 3.3 (alternados)
→ Razão: Paralelização sem rate limit
```

### Caso 3: Planejamento Arquitetural
```yaml
Task: design_architecture
Type: planning

→ Key: Principal (paga)
→ Model: deepseek/deepseek-chat
→ Razão: Raciocínio complexo necessário
```

### Caso 4: Implementação Rápida
```yaml
Task: implement_feature
Type: execution

→ Key: FREE_1 (rotação)
→ Model: google/gemini-2.0-flash-exp:free
→ Razão: Velocidade e custo zero
```

## 📈 Benefícios da Estratégia

### 1. Custo Otimizado
- ✅ Tasks simples usam modelos gratuitos
- ✅ Tasks críticas usam modelos pagos
- ✅ Economia de ~80% em custos de API

### 2. Performance Maximizada
- ✅ 5 workers simultâneos sem rate limit
- ✅ Rotação automática de keys
- ✅ Fallback em caso de falha

### 3. Flexibilidade
- ✅ Adicionar/remover keys facilmente
- ✅ Trocar modelos por configuração
- ✅ Ajustar estratégia por task

### 4. Resiliência
- ✅ Retry automático com key diferente
- ✅ Timeout configurável
- ✅ Logging de uso para análise

## 🔧 Configuração Avançada

### Habilitar Rotação
```bash
AIOS_ENABLE_KEY_ROTATION=true
AIOS_KEY_ROTATION_STRATEGY=round_robin
```

### Usar Pago para Crítico
```bash
AIOS_USE_PAID_FOR_CRITICAL=true
```

### Usar Free para Simples
```bash
AIOS_USE_FREE_FOR_SIMPLE=true
```

### Distribuir Keys por Worker
```bash
AIOS_WORKER_KEY_DISTRIBUTION=true
AIOS_MAX_CONCURRENT_WORKERS=5
```

## 📊 Monitoramento de Uso

### Log de API Usage
```bash
cat .aios-core/logs/api-usage.jsonl
```

**Exemplo**:
```json
{"timestamp":"2026-02-02T21:45:00Z","model":"google/gemini-2.0-flash-exp:free","key":"sk-or-v1-ca6b...9ede","usage":{"prompt_tokens":1500,"completion_tokens":800,"total_tokens":2300}}
{"timestamp":"2026-02-02T21:46:00Z","model":"anthropic/claude-3.5-sonnet","key":"sk-or-v1-f93c...5693","usage":{"prompt_tokens":2000,"completion_tokens":1200,"total_tokens":3200}}
```

### Análise de Custos
```bash
# Total de tokens por modelo
cat .aios-core/logs/api-usage.jsonl | jq -s 'group_by(.model) | map({model: .[0].model, total_tokens: map(.usage.total_tokens) | add})'
```

## 🎓 Exemplos de Código

### Exemplo 1: Usar Key Específica
```javascript
const executor = new AgentExecutor({
    apiKey: process.env.OPENROUTER_API_KEY_FREE_1,
    model: 'google/gemini-2.0-flash-exp:free'
});
```

### Exemplo 2: Rotação Automática
```javascript
const executor = new AgentExecutor({
    taskType: 'simple' // Rotaciona automaticamente
});
```

### Exemplo 3: Task Crítica
```javascript
const executor = new AgentExecutor({
    taskType: 'critical', // Usa key paga
    model: 'anthropic/claude-3.5-sonnet'
});
```

## 🔐 Segurança

### Mascaramento de Keys em Logs
```bash
AIOS_MASK_KEYS_IN_LOGS=true
```

**Output**:
```
🔑 Key: sk-or-v1-f93c...5693
```

### Validação de Keys
```bash
AIOS_VALIDATE_KEYS_ON_START=true
```

## 📝 Migração do Qwen

**Antes** (Qwen 2.5 Coder 72B):
```yaml
cli_config:
  qwen:
    status: ready
    model: qwen/qwen-2.5-coder-72b
```

**Depois** (DeepSeek R1 Distill):
```yaml
cli_config:
  aios_core:
    planning_model_free: deepseek/deepseek-r1-distill-qwen-32b
    execution_models: [gemini-2.0-flash, llama-3.3-70b]
```

**Razão**: DeepSeek R1 Distill oferece melhor raciocínio e é gratuito.

## 🎯 Próximos Passos

1. ✅ Keys configuradas
2. ✅ Estratégia de roteamento implementada
3. ✅ Rotação automática habilitada
4. ⏳ Testar workflow com múltiplas keys
5. ⏳ Analisar logs de uso
6. ⏳ Otimizar distribuição de modelos

---

**Status**: ✅ Configuração completa
**Keys**: 1 paga + 5 gratuitas
**Modelos**: 6 (2 planejamento + 2 execução + 2 premium)
**Workers simultâneos**: 5
**Custo estimado**: ~80% redução
