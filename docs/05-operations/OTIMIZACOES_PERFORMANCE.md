# Otimizações de Performance Implementadas

## 🚀 Melhorias na Chamada do Ollama

### 1. **Limitação de Tokens**
- `num_predict: 800-1000` tokens por resposta
- Respostas mais curtas = processamento mais rápido
- Ideal para treinamento onde precisamos de múltiplas chamadas

### 2. **Timeout Otimizado**
- 25-30 segundos por chamada
- Evita travamentos em respostas muito longas
- Fallback automático se timeout

### 3. **Contexto Reduzido**
- `num_ctx: 2048` (ao invés de padrão 4096)
- Menos memória = mais rápido
- Suficiente para prompts de treinamento

## 📦 Processamento em Batches

### Configurações de Batch

| Tipo | Batch Size | Delay | Concurrent |
|------|------------|-------|------------|
| **Synthetic** | 3 itens | 1s | 1 (sequencial) |
| **Research** | 5 itens | 0.5s | 2 |
| **Prompts** | 1 item | 2s | 1 |
| **Vectorization** | 10 chunks | 0.5s | 1 |

### Benefícios

1. **Progresso Visível**: Você vê o progresso em tempo real
2. **Menos Erros**: Se um batch falhar, os outros continuam
3. **Sem Travamentos**: Processamento pequeno = menos chance de travar
4. **Recuperação**: Sistema continua mesmo se alguns itens falharem

## 🔄 Sistema de Tasks Progressivas

### Funcionalidades

1. **Criação de Tasks**: Cada processo cria uma task no banco
2. **Atualização de Progresso**: Progresso salvo em tempo real
3. **Retry Inteligente**: Retry automático com backoff exponencial
4. **Timeout por Item**: Cada item tem timeout individual

### Exemplo de Uso

```javascript
// Criar task
const task = await createProgressTask('qa_generation', 'copywriting', 10);

// Processar em batches com progresso
const results = await processInBatches(
    items,
    processor,
    'synthetic',
    {
        onProgress: (progress) => {
            updateTaskProgress(task.id, progress.processed, progress);
        }
    }
);

// Finalizar
await completeTask(task.id, true, results);
```

## ⚡ Otimizações Específicas

### Geração de Exemplos Sintéticos

**Antes:**
- Gerava 10 Q&A de uma vez
- 1 chamada LLM grande
- Risco de timeout/travamento

**Depois:**
- Gera 1 Q&A por vez
- Batches de 3
- Timeout de 25s por item
- Progresso visível

### Valores Padrão Reduzidos

- **Q&A**: 6 (ao invés de 10)
- **Failure Cases**: 3 (ao invés de 5)
- **Success Patterns**: 3 (ao invés de 5)

**Motivo**: Qualidade > Quantidade. Menos exemplos bem gerados é melhor que muitos ruins.

## 📊 Monitoramento

### Logs de Progresso

```
[INFO] Processando batch 1/3 (3 itens, progress: 0/9)
[INFO] Progresso Q&A: 33%
[INFO] Processando batch 2/3 (3 itens, progress: 3/9)
[INFO] Progresso Q&A: 66%
```

### Tasks no Banco

- Status: `in_progress`, `completed`, `failed`
- Progresso: `processed_items`, `progress_percentage`
- Metadata: Informações detalhadas do processo

## 🎯 Resultados Esperados

1. **Velocidade**: 3-5x mais rápido (batches pequenos)
2. **Confiabilidade**: 90%+ de sucesso (retry + timeout)
3. **Visibilidade**: Progresso em tempo real
4. **Resiliência**: Continua mesmo com falhas parciais

## 🔧 Configuração

### Ajustar Batch Size

Edite `scripts/cerebro/task_scheduler.js`:

```javascript
const BATCH_CONFIG = {
    synthetic: {
        batchSize: 3, // Aumentar para mais velocidade (mais risco)
        delayBetweenBatches: 1000, // Reduzir para mais velocidade
    },
};
```

### Ajustar Timeout

Edite chamadas LLM:

```javascript
await callLLM(prompt, systemPrompt, 0.7, {
    isTraining: true,
    maxTokens: 600, // Reduzir = mais rápido
    timeout: 20000, // Reduzir = mais rápido (mais risco)
});
```

## ✅ Checklist de Otimização

- [x] Limitação de tokens no Ollama
- [x] Timeout otimizado
- [x] Processamento em batches
- [x] Sistema de tasks progressivas
- [x] Retry inteligente
- [x] Logs de progresso
- [x] Valores padrão reduzidos
- [x] Delays entre batches

---

**Resultado**: Sistema mais rápido, confiável e visível! 🚀























