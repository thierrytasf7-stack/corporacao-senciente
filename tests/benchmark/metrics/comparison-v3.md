# Benchmark v3: Aider (Quality Prompts) vs Claude Normal

**Data:** 2026-02-12 23:32-23:45
**Tarefa:** 3 módulos TypeScript idênticos com prompts detalhados de qualidade
**Comparação:** Aider com quality prompts vs Claude normal (direto, sem Teams)

---

## PONTO CRÍTICO: Custo Real do Mordomo (Orquestração Claude)

O Mordomo (Claude Opus) NÃO é gratuito. Para orquestrar os 3 Aiders, ele gastou:

| Atividade de Orquestração | Tokens Estimados |
|---------------------------|------------------|
| Criar 3 prompts de qualidade (Write x3) | ~4,000 output |
| Criar script PowerShell (Write x1) | ~2,000 output |
| Monitorar execução (Bash + TaskOutput) | ~500 output |
| Ler 6 arquivos de resultado (Read x6) | ~15,000 input |
| Analisar qualidade e gerar report | ~3,000 output |
| Context window (sistema + histórico) | ~25,000 input/turno × ~5 turnos |
| **TOTAL ORQUESTRAÇÃO ESTIMADO** | **~150,000+ tokens** |

### Custo Real: Aider + Orquestração
```
Aider tokens (3 tasks):              7,900 tokens  → $0.00
Claude orquestração (Mordomo):    ~150,000 tokens  → ~$2.25-4.50
────────────────────────────────────────────────────────────────
TOTAL REAL com Aider:                               ~$2.25-4.50
```

### Custo: Claude Normal (direto, sem Aider)
```
Claude escrevendo 3 arquivos:     ~25,000 tokens  → ~$0.37-0.75
(estimativa: ~8,300 tokens/arquivo de output direto)
```

### CONCLUSÃO ECONÔMICA
**O Mordomo GASTA MAIS orquestrando Aiders do que o Claude gastaria fazendo direto!**
- Com Aider: ~$2.25-4.50 (orquestração) + $0 (Aider) = ~$2.25-4.50
- Sem Aider: ~$0.37-0.75 (Claude direto)
- **Aider é 3-6x MAIS CARO no total** por causa do overhead de orquestração

---

## Resultados: Aider com Quality Prompts

### Tokens Aider v3 (quality prompts) vs v2 (basic prompts)

| Arquivo | v2 Tokens | v3 Tokens | v3 Lines | v3 Bytes |
|---------|-----------|-----------|----------|----------|
| string-utils | 1,418 | ~2,300 | 93 | 4,362 |
| array-utils | 1,942 | ~2,600 | 131 | 5,565 |
| math-utils | 1,557 | ~3,000 | 138 | 5,730 |
| **TOTAL** | **4,917** | **~7,900** | **362** | **15,657** |

### Melhoria de Qualidade: v2 → v3

| Critério | v2 (basic) | v3 (quality) | Melhoria |
|----------|-----------|-------------|----------|
| Bugs | 3 | 0 | 100% fix |
| Testes tipo | console.log | console.assert | Correto |
| Edge cases | Nenhum | Tratados | Enorme |
| Validação input | Nenhuma | RangeError | Completo |
| Nº de testes | 39 | 55 | +41% |
| JSDoc | Básico | Com @example/@throws | Bom |
| Score | 5.2/10 | 8.0/10 | +54% |

---

## Comparação Final: Aider v3 vs Claude Normal

### Métricas Quantitativas

| Métrica | Aider v3 | Claude Normal |
|---------|----------|---------------|
| Tokens consumidos (task) | ~7,900 ($0) | ~25,000 (~$0.50) |
| Tokens orquestração | ~150,000 (~$3.00) | 0 |
| **CUSTO TOTAL** | **~$3.00** | **~$0.50** |
| Tempo wall clock | 146.5s | ~15s (inline) |
| Linhas totais | 362 | 453 |
| Bytes totais | 15,657 | 18,494 |
| Funções | 15 | 15 |
| Test cases (assert) | 55 | 60 |
| Bugs | 0 | 0 |

### Análise de Qualidade (Score Card)

| Critério (peso) | Aider v3 | Claude Normal |
|-----------------|----------|---------------|
| **Corretude (30%)** | 10/10 | 10/10 |
| **JSDoc/Docs (15%)** | 7/10 | 10/10 |
| **Edge cases (20%)** | 9/10 | 10/10 |
| **Testes (15%)** | 8/10 | 9/10 |
| **TypeScript rigor (10%)** | 8/10 | 9/10 |
| **Encoding/Formato (10%)** | 6/10 | 10/10 |
| **SCORE PONDERADO** | **8.3/10** | **9.8/10** |

### Problemas Remanescentes no Aider v3

1. **Encoding UTF-8 quebrado nos logs** — caracteres acentuados corrompidos (ã→ß, ú→·, ç→þ)
   - Porém os ARQUIVOS gerados estão corretos (só o log que quebra)
2. **JSDoc em português** — inconsistente com spec que pediu inglês
3. **JSDoc DENTRO da função** (math-utils) — deveria ser ANTES da declaração
4. **Testes NÃO comentados** — spec pediu comentados, Aider ignorou
5. **Menos testes** — 55 vs 60 do Claude

### Qualidades do Aider v3

1. **Zero bugs** — todas as funções corretas
2. **Input validation** — RangeError implementado conforme spec
3. **Number.EPSILON** — floating point fix implementado
4. **Deduplicação intersect** — implementado corretamente
5. **countWords('')** — retorna 0 corretamente

---

## Veredicto Final

```
╔══════════════════════════════════════════════════════════╗
║           BENCHMARK v3 - VEREDICTO FINAL                ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  CUSTO:      Claude Normal VENCE ($0.50 vs $3.00)        ║
║  VELOCIDADE: Claude Normal VENCE (15s vs 147s)           ║
║  QUALIDADE:  Claude Normal VENCE (9.8 vs 8.3)            ║
║  BUGS:       EMPATE (0 vs 0)                             ║
║                                                          ║
║  O modelo "Aider grátis" é uma ILUSÃO quando se          ║
║  contabiliza o custo do Claude orquestrando.              ║
║                                                          ║
║  Prompts de qualidade ELEVAM dramaticamente o             ║
║  output do Aider (5.2→8.3), mas não eliminam             ║
║  problemas de encoding e formatação.                      ║
║                                                          ║
║  RECOMENDAÇÃO: Claude direto é mais barato, mais          ║
║  rápido e melhor qualidade. Aider faz sentido APENAS      ║
║  quando rodado por humano (sem Mordomo) ou em             ║
║  batch jobs não-supervisionados.                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## Cenários Onde Aider Faz Sentido

1. **Humano opera diretamente** (sem Mordomo Claude) — custo = $0 real
2. **Batch de 50+ arquivos idênticos** — amortiza overhead de orquestração
3. **Tasks puramente mecânicas** — rename, formatting, boilerplate
4. **Ambiente sem acesso ao Claude** — Aider com modelo local/free

## Cenários Onde Claude Direto é Melhor

1. **Qualquer task supervisionada** — overhead de orquestração > custo direto
2. **Tasks que exigem qualidade** — Claude consistentemente superior
3. **Velocidade importa** — Claude é 10x mais rápido
4. **Context complexo** — Claude entende melhor specs detalhadas

---

## Dados Técnicos

### Aider v3
- **Versão:** 0.86.1
- **Modelo:** arcee-ai/trinity-large-preview:free via OpenRouter
- **Execução:** 3 processos paralelos (PowerShell Start-Job)
- **Tempos:** string=79.6s, array=121.1s, math=119.9s

### Claude Normal
- **Modelo:** Claude Opus 4.6
- **Execução:** Inline (sem subagentes, sem Teams)
- **Método:** Write tool direto (3 chamadas paralelas)
