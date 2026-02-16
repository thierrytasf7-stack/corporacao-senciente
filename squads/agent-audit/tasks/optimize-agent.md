---
task: Optimize Agent
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - agent_path: Path do arquivo do agente
  - findings: Findings da auditoria
  - quality_score: Score atual
Saida: |
  - optimized_agent: Agente com otimizacoes aplicadas
  - delta_score: Melhoria esperada no score
  - changes: Lista de mudancas aplicadas
Checklist:
  - "[ ] Listar todas as otimizacoes possiveis"
  - "[ ] Priorizar por impacto no score"
  - "[ ] Apresentar otimizacoes ao usuario para aprovacao"
  - "[ ] Aplicar otimizacoes aprovadas (uma por vez)"
  - "[ ] Recalcular score apos cada otimizacao"
  - "[ ] Verificar zero regressoes"
  - "[ ] Gerar diff before/after"
---

# *optimize

Gerar e aplicar otimizacoes a um agente.

## Procedimento

### 1. Analise
A partir dos findings da auditoria, listar TODAS as otimizacoes possiveis.

### 2. Priorizacao
Ordenar por impacto:
1. CRITICAL fixes (desbloqueia funcionalidade)
2. HIGH impact (+3pts ou mais por otimizacao)
3. MEDIUM impact (+1-2pts)
4. LOW impact (polish)

### 3. Apresentacao
```
Otimizacoes disponíveis para @dev (Score atual: 72/100):

CRITICAL:
1. [+3pts] Criar task develop-story.md (phantom task) → 75/100

HIGH:
2. [+4pts] Reescrever identity para ser especifica → 79/100
3. [+3pts] Adicionar whenToUse com exemplo → 82/100

MEDIUM:
4. [+2pts] Adicionar vocabulary (5 termos) → 84/100
5. [+2pts] Fix naming de 2 commands → 86/100

LOW:
6. [+1pt] Adicionar signature_closing → 87/100

Aplicar quais? (1-6, all, ou numeros separados por virgula)
```

### 4. Aplicacao Atomica
Cada otimizacao e aplicada individualmente:
1. Backup estado atual
2. Aplicar mudanca
3. Verificar que nao regrediu nenhuma outra dimensao
4. Log da mudanca no changelog

### 5. Regra de Ouro: Zero Regression
**NUNCA** aplicar uma otimizacao que diminui o score de QUALQUER dimensao.
Se uma otimizacao causa regressao, revert e reportar.

### 6. Diff
Gerar diff legivel:
```diff
- identity: Expert who implements code
+ identity: Engenheiro fullstack obsessivo por clean code que implementa stories com precisao cirurgica, testando cada edge case antes de declarar vitoria

- vocabulary: []
+ vocabulary:
+   - implementar
+   - refatorar
+   - debugar
+   - testar
+   - otimizar
```
