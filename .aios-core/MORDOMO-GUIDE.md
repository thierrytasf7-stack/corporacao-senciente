# 🎩 Mordomo - O Butler do AIOS

**Seu orchestrador inteligente que usa AIDERS ($0) antes de CLAUDE ($$)**

---

## ⚡ Quick Start

```bash
# 1. Ative Mordomo
/AIOS:agents:mordomo

# 2. Descreva o que precisa (NADA de decomposição manual!)
"Implemente sistema de autenticação JWT com testes"

# 3. Mordomo vai:
#    → Criar story via @po-aider ($0)
#    → Decompor em tasks via @sm-aider ($0)
#    → Implementar em paralelo via @aider-dev ($0)
#    → Validar via @qa-aider ($0)
#    → Deploy via @deploy-aider ($0)

# TOTAL COST: $0 ✅
```

---

## 🎯 Filosofia: ZERO CLAUDE TOKENS UNTIL NECESSARY

### Execução Ideal

```
User Request
    ↓
@po-aider: Create Story ($0)
    ↓
@sm-aider: Decompose Tasks ($0)
    ↓
@aider-dev: Implement ($0)
    ↓
@qa-aider: Validate ($0)
    ↓
@deploy-aider: Deploy ($0)
    ↓
TOTAL: $0 🎉
```

### Se Claude for Necessário

```
User Request
    ↓
@po-aider: Create Story ($0)
    ↓
@sm-aider: Decompose Tasks ($0)
    ↓
Analyze: Precisa de design arquitetural?
    ├─ NÃO → @aider-dev ($0) continua
    └─ SIM → @architect ($$) design
    ↓
Implementação...
```

---

## 📋 Sempre Faça Isso PRIMEIRO

### ❌ NÃO FAÇA ISTO:

```bash
# ERRADO: Manual decomposition consome tokens Claude!
@mordomo "Task A: fazer isso"
@mordomo "Task B: fazer aquilo"
@mordomo "Task C: fazer outra coisa"
```

### ✅ FAÇA ISTO:

```bash
# CERTO: Delega story + decomposition aos Aiders ($0)
@mordomo *delegate @po-aider "Create story for authentication system"
@mordomo *delegate @sm-aider "Decompose auth story into atomic tasks"

# Depois usa os tasks criados
@mordomo *orchestrate
```

---

## 7️⃣ Aider Agents (Todos $0 = FREE!)

| Agent | Função | Paralelo? | Comando |
|-------|--------|-----------|---------|
| @po-aider | Criar stories + AC | YES | `*delegate @po-aider "..."`|
| @sm-aider | Decompor em tasks + DAG | YES | `*delegate @sm-aider "..."`|
| @aider-dev | Implementar código | YES | `*orchestrate` |
| @qa-aider | Lint, typecheck, testes | YES | `*orchestrate` |
| @deploy-aider | Git push, PR, merge | NO | `*orchestrate` |
| @aider-optimizer | Análise custo | NO | `*route` |
| @status-monitor | Rastrear economia | NO | `*cost-report` |

---

## 🔄 Workflow Recomendado

### Passo 1: Story Creation ($0)

```bash
@mordomo *delegate @po-aider "Crie story detalhada para:
- Implementar autenticação JWT
- Com refresh tokens
- Com validação email
- Critérios de aceitação claros"

→ Cria: docs/stories/auth-jwt.md
→ Cost: $0
```

### Passo 2: Task Decomposition ($0)

```bash
@mordomo *delegate @sm-aider "Decomponha auth-jwt story em:
- Tasks atômicas
- DAG de dependências
- Plano de execução paralela"

→ Atualiza: docs/stories/auth-jwt.md (seção tasks)
→ Cost: $0
```

### Passo 3: Orchestrate Implementation ($0)

```bash
@mordomo *orchestrate "Implemente story auth-jwt com testes"

→ Lê tasks da story
→ Roda 3-4 @aider-dev em paralelo
→ Executa @qa-aider para validar
→ Executa @deploy-aider para push
→ Cost: $0 (100% Aider!)
```

### Passo 4: Check Report

```bash
@mordomo *cost-report

→ Mostra:
  ✅ 7 tasks via Aider ($0)
  ✅ 0 tasks via Claude ($0)
  ✅ Economia: ~$50-75
  ✅ Time saved: ~40%
```

---

## 💡 Caso de Uso: Full Feature

```
Solicitação: "Build complete user profile feature"

Mordomo Flow:

1️⃣ @po-aider cria story com:
   - User can view profile
   - User can edit profile
   - Profile has avatar upload
   - Profile has activity history
   - Acceptance criteria
   → Cost: $0

2️⃣ @sm-aider decompõe em:
   - profile.service.ts (independent)
   - profile.test.ts (independent)
   - avatar.upload.ts (independent)
   - activity.logger.ts (independent)
   - routes.ts (depends on all above)
   → Cost: $0

3️⃣ Parallel Execution:
   Terminal 1: profile.service.ts
   Terminal 2: profile.test.ts
   Terminal 3: avatar.upload.ts
   Terminal 4: activity.logger.ts
   [All running simultaneously]
   → Cost: $0 (all @aider-dev)

4️⃣ Sequential (Dependencies):
   Terminal 1: routes.ts
   → Cost: $0

5️⃣ Validation:
   @qa-aider runs lint + tests
   → Cost: $0

6️⃣ Deployment:
   @deploy-aider pushes to remote
   → Cost: $0

📊 RESULT:
   - All 7 tasks completed
   - Zero Claude tokens
   - Cost: $0
   - Time: ~12 minutes (parallel)
   - Quality: ✅ All tests passing
```

---

## ⚠️ CRITICAL RULES

| Regra | Porquê |
|-------|--------|
| **SEMPRE use @po-aider primeiro** | Evita decomposição manual |
| **SEMPRE use @sm-aider segundo** | Cria DAG otimizado para paralelo |
| **NUNCA decomponha manualmente** | Consome tokens Claude desnecessariamente |
| **SEMPRE revise o DAG** | Identifica paralelismo |
| **SEMPRE use @aider-dev** | Antes de @dev (Claude) |
| **SEMPRE valide com @qa-aider** | Garante qualidade $0 |

---

## 📈 Economia Esperada

### Por Story

```
Métrica              | Aider-First | All Claude | Economia
─────────────────────┼─────────────┼────────────┼──────────
Tasks/Story          | 5-7         | 5-7        | —
Cost/Story           | $0          | $30-50     | 100%
Time/Story           | 10-15 min   | 20-30 min  | 40-50%
Quality              | 8/10        | 10/10      | -20% (acceptable)
```

### Por Mês

```
Se fizer 20 stories por mês:

All Claude:
  20 × $40 = $800/month = $9,600/year

Aider-First:
  20 × $0 = $0/month = $0/year
  (+ ~2-3 Claude tasks) = ~$100/month = $1,200/year

SAVINGS: $8,400/year (87.5% reduction!)
```

---

## 🚀 Pro Tips

### Tip 1: Sempre comece com @po-aider
Invista 2 minutos criando uma story bem estruturada via @po-aider.
Economiza 20 minutos depois e evita confusão.

### Tip 2: Revise o DAG do @sm-aider
O DAG mostra paralelismo disponível.
Se vê que 5 tasks são independentes, pode rodar 4 em paralelo.

### Tip 3: Group parallel tasks by batch size
- Batch 1: 4 tasks paralelos
- Batch 2: 1 task sequencial (depende de batch 1)
Mais rápido que fazer tudo em série.

### Tip 4: Keep stories atomic
Cada story = 1 feature completa.
@sm-aider decomponha em tasks atômicas (~1 hora cada).
Mais fácil de parallelizar.

### Tip 5: Validate early with @qa-aider
Não espere fim. Rode @qa-aider após cada batch.
Pega issues cedo.

---

## 📞 Commands Reference

```bash
# Story & Task Creation (FIRST!)
*delegate @po-aider "Create story for..."
*delegate @sm-aider "Decompose story..."

# Main Orchestration
*orchestrate {description}        # Full flow (story→tasks→impl→test→deploy)
*parallel {t1} | {t2} | {t3}     # Execute tasks in parallel

# Routing & Analysis
*route {description}              # Recommend agent
*available-agents                 # List all Aiders + Claude

# Monitoring
*cost-report                      # Show savings (should be $0!)
*status                           # Current progress
*worker-status                    # Parallel workers

# Utilities
*help                             # All commands
*exit                             # Exit Mordomo
```

---

## 🎓 Learning Path

1. **Start Simple**: Create story + decompose + orchestrate
2. **Understand DAG**: Learn how @sm-aider optimizes parallelism
3. **Maximize Parallel**: Identify 4+ independent tasks
4. **Go Full-Auto**: Let Mordomo do everything

---

## ❓ FAQ

**Q: Sempre preciso de story?**
A: SIM! @po-aider cria em 1 minuto. Vale a pena. Evita confusão depois.

**Q: E se a task for muito simples?**
A: Ainda use @po-aider. Garante que está bem definida.

**Q: Quando usar Claude (@dev)?**
A: Apenas se @aider-dev disser que é COMPLEX (raramente).

**Q: Posso rodar 8 tarefas em paralelo?**
A: Não. Máximo 4 terminais. Mais que isso causa problemas.

**Q: Qual é a qualidade do Aider?**
A: 8/10. Bom para 95% das tasks. Teste sempre.

**Q: Posso pular @sm-aider?**
A: Tecnicamente sim. Mas perde otimização paralela.

---

## 📖 Documentação Completa

- **Mordomo Agent**: `.aios-core/development/agents/mordomo.md`
- **Parallel Execution**: `.aios-core/development/tasks/parallel-execution.md`
- **Gap Detection**: `.aios-core/development/tasks/gap-detection.md`
- **Cost Tracking**: `.aios-core/development/tasks/cost-tracking.md`

---

**Comece agora:**
```bash
/AIOS:agents:mordomo
```

**Seu primeiro comando:**
```bash
@mordomo *delegate @po-aider "Create story for [seu projeto]"
```

**Economize 100% em AI costs. 🎩✨**
