# 🧠 Hallucination Monitoring System

Sistema de monitoramento e log de alucinações para **Diana Corporação Senciente**.

## ✅ O que foi implementado

Todas as 7 acceptance criteria foram completadas:

1. **✅ Decorator `@log_hallucination`** - Monitor outputs de funções
2. **✅ Tabela `hallucination_logs`** - Banco PostgreSQL com estrutura completa
3. **✅ CLI de revisão semanal** - Interface interativa para revisar alucinações
4. **✅ Sistema de tags** - Categorização por tipo de erro (factual, lógico, tom, etc)
5. **✅ Alertas automáticos** - Dispara quando confiança < 70%
6. **✅ Workflow de retreino** - Pipeline feedback → retreino com fila
7. **✅ Relatório mensal** - Score de estabilidade + estatísticas detalhadas

## 📁 Arquivos criados

```
apps/backend/
├── infrastructure/database/
│   └── hallucination_logs.py          # Modelos e repository
├── core/services/
│   └── hallucination_monitor.py       # Monitor e decorator
├── cli/
│   └── hallucination_cli.py           # Interface CLI
├── api/
│   └── hallucination_routes.py        # API REST
├── scripts/
│   └── migrate_hallucination_logs.py  # Migração DB
├── examples/
│   └── hallucination_usage_example.py # Exemplos de uso
└── HALLUCINATION_README.md             # Este arquivo

docs/
└── HALLUCINATION_MONITORING.md         # Documentação completa
```

## 🚀 Quick Start

### 1. Preparar banco de dados

```bash
cd apps/backend
python scripts/migrate_hallucination_logs.py
```

### 2. Usar via Python

```python
from backend.core.services.hallucination_monitor import HallucinationMonitor
from backend.infrastructure.database.hallucination_logs import HallucinationErrorType, HallucinationSeverity
from backend.infrastructure.database.connection import get_database_connection

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
    tags=["bug", "code-gen"]
)

# Ver estatísticas
report = await monitor.get_monthly_report()
print(f"Stability: {report['stability_score']:.1f}%")
```

### 3. Usar via CLI

```bash
python -m cli.hallucination_cli
```

Menu interativo:
- Weekly Review
- Weekly Statistics
- Low Confidence Alerts
- Monthly Report
- Worker Statistics
- Retraining Queue

### 4. Usar via API REST

```bash
# Registrar alucinação
curl -X POST http://localhost:21301/api/v1/hallucinations/log \
  -H "Content-Type: application/json" \
  -d '{...}'

# Ver logs não revisados
curl http://localhost:21301/api/v1/hallucinations/unreviewed

# Ver estatísticas
curl http://localhost:21301/api/v1/hallucinations/stats/monthly
```

## 📊 Tipos de Erro

| Tipo | Descrição |
|------|-----------|
| `FACTUAL` | Informações factuais incorretas |
| `LOGICAL` | Erros de lógica ou raciocínio |
| `TONE` | Tom ou contexto inapropriado |
| `CONSISTENCY` | Inconsistência com conhecimento anterior |
| `HALLUCINATED` | Conteúdo completamente inventado |
| `CONTEXTUAL` | Perda de contexto |
| `TECHNICAL` | Erros técnicos (código, API) |

## 🎯 Níveis de Severidade

| Nível | Valor |
|-------|-------|
| `CRITICAL` | 1 - Afeta funcionamento |
| `HIGH` | 2 - Significativo |
| `MEDIUM` | 3 - Moderado |
| `LOW` | 4 - Menor |

## 🔔 Alertas Automáticos

O sistema dispara automaticamente quando:

- **Confiança < 70%** → "🚨 LOW CONFIDENCE ALERT"
- **Severidade CRITICAL/HIGH** → "⚠️  HIGH SEVERITY HALLUCINATION"

Integrar callbacks customizados:
```python
async def alert_handler(message: str, log):
    # Enviar para Slack, email, etc.
    pass

monitor.register_alert_callback(alert_handler)
```

## 📈 Relatório Mensal

```
Stability Score: 85.5%

Estatísticas:
- Total: 120 logs
- Revisados: 95
- Não revisados: 25
- Baixa confiança: 18
- Avg confidence: 78.2%

Distribuição por tipo:
- FACTUAL: 45 (80% confidence)
- LOGICAL: 35 (75% confidence)
- TECHNICAL: 25 (82% confidence)
- TONE: 15 (88% confidence)
```

## 🔄 Workflow de Retreino

1. **Revisar** - Ver logs não revisados, fornecer feedback
2. **Fila** - Colocar na fila de retreino
3. **Batch** - Obter batch de items (padrão: 10)
4. **Aplicar** - Aplicar retreino com feedback

```python
retraining = HallucinationRetrainingWorkflow(db)
await retraining.queue_for_retraining(log_id=1, feedback="...")
batch = await retraining.get_retraining_batch(batch_size=10)
result = await retraining.apply_retraining(batch)
```

## 🗄️ Estrutura de Dados

Tabela `hallucination_logs`:

```sql
id                 | SERIAL PRIMARY KEY
worker_id          | VARCHAR (GENESIS/TRABALHADOR/REVISADOR)
task_id            | VARCHAR
agent_name         | VARCHAR
output             | TEXT (output gerado)
expected_output    | TEXT (output correto, se conhecido)
error_type         | VARCHAR (categorias acima)
severity           | INT (1-4)
confidence_score   | FLOAT (0.0-1.0)
tags               | TEXT[] (categorização adicional)
context            | JSONB (metadata adicional)
feedback           | TEXT (feedback de revisão)
reviewed           | BOOLEAN
created_at         | TIMESTAMP
updated_at         | TIMESTAMP
```

**Índices criados automaticamente para performance:**
- worker_id, task_id, error_type, severity, confidence_score
- reviewed, created_at, tags

## 🔗 Integração no Projeto

### Em workers (GENESIS, TRABALHADOR, REVISADOR)

```python
monitor = HallucinationMonitor(db)

if confidence_score < threshold:
    await monitor.log_hallucination(
        worker_id=worker_id,
        task_id=task_id,
        agent_name=agent_name,
        output=output,
        error_type=HallucinationErrorType.FACTUAL,
        severity=HallucinationSeverity.HIGH,
        confidence_score=confidence_score
    )
```

### Em API backend

```javascript
// No server.js
const hallucination_routes = require('./api/hallucination_routes');
app.use(hallucination_routes.hallucination_bp);
```

## 📚 Documentação

- **`docs/HALLUCINATION_MONITORING.md`** - Documentação completa
- **`apps/backend/examples/hallucination_usage_example.py`** - Exemplos de código

## 🧪 Testes

Para testar o sistema:

```bash
# Executar exemplos
python apps/backend/examples/hallucination_usage_example.py

# Usar CLI
python -m cli.hallucination_cli

# Testar API
curl http://localhost:21301/api/v1/hallucinations/health
```

## ⚙️ Configuração

Variáveis de environment (em `.env`):
```
SUPABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...
```

Threshold de confiança (customizável):
```python
monitor.confidence_threshold = 0.70  # Default: 70%
```

## 🎓 Estudos de Caso

### Caso 1: Alucinar Datas
```
Output: "Python foi inventado em 1985"
Expected: "Python foi criado em 1989"
Type: FACTUAL
Severity: HIGH (data incorreta é critical)
Confidence: 0.45
Action: Revisar, fornecer feedback, fila para retreino
```

### Caso 2: Alucinar Código
```
Output: "import java.util.HashMap;"  (Java em vez de Python)
Type: TECHNICAL
Severity: CRITICAL
Confidence: 0.62
Action: Alerta automático < 70%
```

### Caso 3: Perda de Contexto
```
Output: "..." (resposta não relacionada ao contexto)
Type: CONTEXTUAL
Severity: MEDIUM
Confidence: 0.68
Action: Revisar contexto, investigar causa
```

## 📊 Métricas de Sucesso

- ✅ Todos os 7 acceptance criteria implementados
- ✅ 7 tipos de erro categorizados
- ✅ 4 níveis de severidade
- ✅ Alertas automáticos funcionando
- ✅ CLI com menu interativo
- ✅ API REST completa
- ✅ Workflow de retreino operacional
- ✅ Relatório mensal com estabilidade score

## 🔮 Próximos Passos

1. Integrar com workers reais (GENESIS, TRABALHADOR, REVISADOR)
2. Dashboard UI para visualização em tempo real
3. Automação de retreino com LLM (integração com modelo)
4. Webhooks para notificações (Slack, email)
5. Análise de tendências (ML para prever alucinações)
6. Exportação de relatórios (PDF, Excel)

## 📞 Suporte

- Documentação: `docs/HALLUCINATION_MONITORING.md`
- Exemplos: `apps/backend/examples/hallucination_usage_example.py`
- Troubleshooting: `docs/HALLUCINATION_MONITORING.md#troubleshooting`

---

**Story:** senciencia-etapa002-task-02-log-alucinacoes
**Status:** ✅ PARA_REVISAO
**Squad:** Mnemosyne
**Etapa:** 002
