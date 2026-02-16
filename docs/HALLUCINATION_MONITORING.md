# Hallucination Monitoring System

## Visão Geral

Sistema de monitoramento e registro de alucinações para Diana Corporação Senciente. Captura, categoriza e analisa instâncias onde a IA gera saídas incorretas ou inconsistentes.

## Arquitetura

### Componentes Principais

1. **hallucination_logs.py** - Modelos de dados e repositório
   - `HallucinationLog` - Modelo para log de alucinação
   - `HallucinationRepository` - Operações de banco de dados
   - `HallucinationDatabaseMigration` - Migração SQL

2. **hallucination_monitor.py** - Serviço de monitoramento
   - `HallucinationMonitor` - Monitor em tempo real
   - `log_hallucination` - Decorator para monitorar funções
   - `HallucinationRetrainingWorkflow` - Workflow de retreino

3. **hallucination_cli.py** - Interface de linha de comando
   - Menu interativo para revisão de alucinações
   - Visualização de estatísticas
   - Gerenciamento de retraining

4. **hallucination_routes.py** - API REST
   - Endpoints para registrar/obter logs
   - Endpoints para review e feedback
   - Endpoints para estatísticas

## Configuração

### 1. Preparar Banco de Dados

```bash
cd apps/backend
python scripts/migrate_hallucination_logs.py
```

Isto criará a tabela `hallucination_logs` com os campos necessários.

Para reverter:
```bash
python scripts/migrate_hallucination_logs.py rollback
```

### 2. Tipos de Erros

| Tipo | Descrição |
|------|-----------|
| FACTUAL | Informações factuais incorretas |
| LOGICAL | Erros de lógica ou raciocínio |
| TONE | Tom ou contexto inapropriado |
| CONSISTENCY | Inconsistência com conhecimento anterior |
| HALLUCINATED | Conteúdo completamente inventado |
| CONTEXTUAL | Perda de contexto |
| TECHNICAL | Erros técnicos (código, API) |

### 3. Níveis de Severidade

| Nível | Valor | Descrição |
|-------|-------|-----------|
| CRITICAL | 1 | Erros críticos que afetam funcionamento |
| HIGH | 2 | Erros significativos |
| MEDIUM | 3 | Erros moderados |
| LOW | 4 | Erros menores |

## Uso

### Via CLI

```bash
cd apps/backend
python -m cli.hallucination_cli
```

Menu interativo com opções:
- **1. Weekly Review** - Revisar alucinações não revisadas
- **2. Weekly Statistics** - Ver estatísticas da semana
- **3. Low Confidence Alerts** - Alertas de baixa confiança
- **4. Monthly Report** - Relatório mensal
- **5. Worker Statistics** - Estatísticas por worker
- **6. Retraining Queue** - Gerenciar fila de retreino

### Via Python

```python
from backend.core.services.hallucination_monitor import HallucinationMonitor
from backend.infrastructure.database.hallucination_logs import HallucinationErrorType, HallucinationSeverity
from backend.infrastructure.database.connection import get_database_connection

# Inicializar
db = get_database_connection()
await db.connect()

monitor = HallucinationMonitor(db)

# Registrar alucinação
log = await monitor.log_hallucination(
    worker_id="TRABALHADOR",
    task_id="task-123",
    agent_name="dev-agent",
    output="generated output...",
    error_type=HallucinationErrorType.FACTUAL,
    severity=HallucinationSeverity.HIGH,
    confidence_score=0.65,
    tags=["bug", "code-gen"],
    expected_output="correct output...",
    context={"prompt": "...", "model": "claude-opus"}
)

print(f"Log registered with ID: {log.id}")

# Obter resumo semanal
summary = await monitor.get_weekly_summary()
print(summary)

# Obter relatório mensal
report = await monitor.get_monthly_report()
print(f"Stability score: {report['stability_score']}%")
```

### Via API REST

#### Registrar Alucinação

```bash
curl -X POST http://localhost:21301/api/v1/hallucinations/log \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "TRABALHADOR",
    "task_id": "task-123",
    "agent_name": "dev-agent",
    "output": "generated output...",
    "error_type": "factual",
    "severity": 2,
    "confidence_score": 0.65,
    "tags": ["bug", "code-gen"],
    "expected_output": "correct output...",
    "context": {"prompt": "...", "model": "claude-opus"}
  }'
```

#### Obter Logs Não Revisados

```bash
curl http://localhost:21301/api/v1/hallucinations/unreviewed?limit=20
```

#### Revisar Log

```bash
curl -X POST http://localhost:21301/api/v1/hallucinations/1/review \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "Este é um erro de factualidade. O model gerou informação incorreta sobre..."
  }'
```

#### Obter Estatísticas

```bash
curl http://localhost:21301/api/v1/hallucinations/stats/weekly
curl http://localhost:21301/api/v1/hallucinations/stats/monthly
curl http://localhost:21301/api/v1/hallucinations/stats/by-error-type
```

## Decorator @log_hallucination

Use o decorator para monitorar funções que podem alucinar:

```python
from backend.core.services.hallucination_monitor import log_hallucination
from backend.infrastructure.database.hallucination_logs import HallucinationErrorType, HallucinationSeverity

@log_hallucination(
    error_type=HallucinationErrorType.FACTUAL,
    severity=HallucinationSeverity.HIGH,
    worker_id="TRABALHADOR",
    task_id="task-123"
)
async def generate_code(prompt: str) -> str:
    # Função que pode gerar código alucinado
    response = await llm.complete(prompt)
    return response
```

## Alertas Automáticos

O sistema dispara alertas automaticamente quando:

1. **Confiança Baixa** (<70%)
   - Alerta: "🚨 LOW CONFIDENCE ALERT"

2. **Severidade Alta**
   - Alerta: "⚠️  HIGH SEVERITY HALLUCINATION"

Os alertas podem ser processados via callbacks customizados:

```python
async def my_alert_handler(message: str, log: HallucinationLog):
    # Enviar para Slack, email, etc.
    print(f"ALERT: {message}")
    print(f"Log details: {log.to_dict()}")

monitor.register_alert_callback(my_alert_handler)
```

## Workflow de Retreino

1. **Revisar** - Ver logs não revisados e fornecer feedback
2. **Fila** - Colocar logs na fila de retreino
3. **Batch** - Obter batch de items para retreino
4. **Aplicar** - Aplicar retreino com feedback

```python
retraining = HallucinationRetrainingWorkflow(db)

# Adicionar à fila
await retraining.queue_for_retraining(log_id=1, feedback="Este é um erro factual...")

# Obter batch
batch = await retraining.get_retraining_batch(batch_size=10)

# Aplicar
result = await retraining.apply_retraining(batch)
```

## Relatório Mensal de Estabilidade

O relatório mensal inclui:

- **Stability Score** - Percentual de confiança alta (>=70%)
- **Total Logs** - Quantidade total de alucinações
- **Reviewed** - Quantos foram revisados
- **Low Confidence** - Quantos têm confiança baixa
- **Error Breakdown** - Distribuição por tipo de erro

Interpretação:
- **>90%** - Excelente
- **80-90%** - Bom
- **70-80%** - Aceitável (melhoria necessária)
- **<70%** - Pobre (retreino imediato recomendado)

## Estrutura da Tabela

```sql
CREATE TABLE hallucination_logs (
    id SERIAL PRIMARY KEY,
    worker_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255) NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    output TEXT NOT NULL,
    expected_output TEXT,
    error_type VARCHAR(50) NOT NULL,
    severity INTEGER NOT NULL,
    confidence_score FLOAT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    context JSONB DEFAULT '{}',
    feedback TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Índices

Para melhor performance:

- `idx_hallucination_logs_worker_id` - Buscar por worker
- `idx_hallucination_logs_task_id` - Buscar por task
- `idx_hallucination_logs_error_type` - Buscar por tipo
- `idx_hallucination_logs_severity` - Buscar por severidade
- `idx_hallucination_logs_confidence` - Buscar por confiança
- `idx_hallucination_logs_reviewed` - Buscar não revisados
- `idx_hallucination_logs_created_at` - Ordenar por data
- `idx_hallucination_logs_tags` - Buscar por tags (GIN)

## Integração no Projeto

### 1. No server.js backend

```javascript
// Importar API
const { init_hallucination_api } = require('./api/hallucination_routes');

// Na inicialização
app.use(hallucination_bp);
```

### 2. Workers (GENESIS, TRABALHADOR, REVISADOR)

```python
from backend.core.services.hallucination_monitor import HallucinationMonitor
from backend.infrastructure.database.hallucination_logs import HallucinationErrorType, HallucinationSeverity

# Durante execução de task
monitor = HallucinationMonitor(db)

if confidence_score < 0.7:
    await monitor.log_hallucination(
        worker_id="TRABALHADOR",
        task_id=task_id,
        agent_name="claude-wrapper-trabalhador",
        output=generated_output,
        error_type=HallucinationErrorType.FACTUAL,
        severity=HallucinationSeverity.HIGH,
        confidence_score=confidence_score,
        context={"task": task_id, "prompt": original_prompt}
    )
```

## Troubleshooting

### Erro: "Database not connected"

```python
db = get_database_connection()
await db.connect()
```

### Erro: "Table does not exist"

```bash
python scripts/migrate_hallucination_logs.py
```

### Nenhum alerta disparando

Verificar:
1. Callbacks registrados via `register_alert_callback()`
2. Score de confiança realmente < 70%
3. Logs sendo criados corretamente

## Performance

Para grandes volumes de dados:

```python
# Usar limits para evitar carregar tudo na memória
logs = await repository.get_unreviewed(limit=100)

# Usar estatísticas agregadas em vez de contar logs
stats = await repository.get_weekly_stats()
# Em vez de: len(await repository.get_unreviewed())
```

## Próximos Passos

1. ✅ Criar estrutura de dados
2. ✅ Implementar monitor e serviço
3. ✅ Criar CLI para revisão
4. ✅ Implementar API REST
5. ⏳ Integrar com workers (GENESIS, TRABALHADOR, REVISADOR)
6. ⏳ Dashboard UI para visualização
7. ⏳ Automação de retreino com LLM
