# Task: CEO-ZERO Batch Processing

## Metadata
- **task_id:** ceo-zero-batch
- **agent:** ceo-zero
- **type:** orchestration

## Description

Executa multiplas tasks em batch no Agent Zero para maximizar throughput.

## Steps

### Step 1: Collect Tasks

Receber lista de tasks do usuario ou de uma story decomposition.

### Step 2: Validate Eligibility

Cada task deve ser elegivel para Agent Zero:
- Complexidade <= 3
- Tipo nao e review/security/architect/database/deploy
- Nao requer contexto de outras tasks do batch

Tasks inelegiveis sao separadas para execucao AIOS.

### Step 3: Prepare Payloads

Para cada task elegivel, criar payload JSON:
```json
{
  "id": "batch-{n}-{timestamp}",
  "agent": "{agent_id}",
  "task_type": "{type}",
  "prompt": "{description}",
  "acceptance_criteria": [...],
  "output_format": "Return ONLY {format}.",
  "max_tokens": {limit}
}
```

### Step 4: Execute Sequentially

Agent Zero processa uma task por vez (limitacao de free tier rate limits).
Para cada task:
1. Executar via delegate.js
2. Verificar quality score
3. Se score < 7: marcar para retry ou fallback AIOS
4. Coletar resultado

### Step 5: Report

```
⚡ Batch Complete: {total} tasks
├── Agent Zero: {zero_ok} OK / {zero_fail} fallback
├── AIOS: {aios_count} (fallbacks + ineligible)
├── Avg Quality: {score}/10
├── Total Time: {time}
└── Savings: ${amount}
```
