# Task: CEO-ZERO Delegate v3 (Pareto)

## Metadata
- **task_id:** ceo-zero-delegate
- **agent:** ceo-zero
- **type:** orchestration

## Principio Pareto

Opus gasta ~300 tokens por delegacao (1 Write + 1 Bash).
Agent Zero le guides e context files sozinho ($0 no free tier).
Opus NUNCA usa Read tool para ler arquivos que o Zero pode ler.

## Steps

### Step 1: Classify (mental, 0 tokens)
- Sagrado? (review/security/deploy/architect/database) → Skill tool. FIM.
- F5+? → Skill tool. FIM.
- F1-F3 nao-sagrado → Agent Zero.

### Step 2: Route (lookup table, 0 tokens)
Consultar `aios_guide_resolution` no agent definition:
- "cria squad" → agent: squad-creator, guide: .aios-core/development/agents/squad-creator.md
- "implementa X" → agent: dev, guide: .aios-core/development/agents/dev.md
- "cria story" → agent: po, guide: .aios-core/development/agents/po.md
- etc.

### Step 3: Write JSON (~200 tokens)
```json
{
  "agent": "<id>",
  "task_type": "<tipo>",
  "prompt": "<1-2 frases: O QUE + CRITERIA + OUTPUT>",
  "aios_guide_path": "<path do .md>",
  "context_files": ["<path1>", "<path2>"],
  "acceptance_criteria": ["<kw1>", "<kw2>"]
}
```

Regras do prompt:
- MAX 2 frases descritivas
- "Leia AIOS Guide e siga o processo" (Zero le sozinho)
- "Use context_files como referencia" (Zero le sozinho)
- CRITERIA em keywords curtas
- OUTPUT em 1 palavra (markdown, json, typescript, yaml)

### Step 4: Fire (~100 tokens)
```bash
node workers/agent-zero/delegate.js --file <path>
```

### Step 5: Repasse (~50 tokens)
Repassar resultado bruto. Sem analise. Sem reformatacao.

## Budget por delegacao

| Etapa | Tokens Opus | Tokens Zero |
|-------|-------------|-------------|
| Classify | 0 | 0 |
| Route | 0 | 0 |
| Write JSON | ~200 | 0 |
| Fire Bash | ~100 | ~3000-5000 ($0) |
| Repasse | ~50 | 0 |
| **TOTAL** | **~350** | **~4000 ($0)** |

Opus v2 (lia arquivos): ~5000 tokens. v3: ~350. **Economia: 93%.**
