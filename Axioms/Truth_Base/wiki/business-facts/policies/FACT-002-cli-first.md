---
id: FACT-002
title: Hierarquia CLI First → Observability Second → UI Third
category: policy
status: ESTABLISHED
version: 1.0.0
created: 2026-02-14
updated: 2026-02-14
source: CREATOR
axiom: AXIOM_03
---

# Hierarquia CLI First → Observability Second → UI Third

## Contexto

A Diana foi projetada como sistema operacional cognitivo onde a inteligência reside na camada de comando, não na interface. Esta hierarquia garante que o sistema seja controlável, auditável e independente de UI.

## Definição

**Todo desenvolvimento segue prioridade fixa: CLI First → Observability Second → UI Third.**

### CLI First
- Fonte de verdade do sistema
- Toda funcionalidade deve ser 100% operável via CLI
- Inteligência e automação vivem aqui
- APIs e scripts são "CLI programático"

### Observability Second
- Dashboards observam CLI em tempo real
- Logs, métricas e eventos do CLI
- Nunca controla, apenas visualiza
- WebSockets para streaming de eventos

### UI Third
- Conveniência, não requisito
- Aciona comandos CLI por trás
- Gestão pontual e visualizações
- Pode ser removida sem quebrar sistema

## Implicações

### Para Desenvolvimento
1. **Nova Feature**: Implementar CLI completo primeiro
2. **Observability**: Adicionar logs/eventos para dashboard
3. **UI**: Opcional, apenas se agregar valor

### Para Validação
- Feature sem CLI funcional = inválida
- Dashboard quebrado ≠ sistema quebrado
- UI ausente ≠ impedimento

### Para Priorização
- Bugs em CLI = CRÍTICO
- Bugs em Observability = ALTO
- Bugs em UI = MÉDIO

## Exemplos

### ✅ Correto

```bash
# CLI funciona standalone
npx diana worker start genesis

# Dashboard observa
ws://localhost:21302/stream → worker.started

# UI aciona CLI
button.click() → exec('npx diana worker start genesis')
```

### ❌ Incorreto

```bash
# Feature só funciona via UI
button.click() → custom_logic()  # ❌ CLI não sabe fazer

# Dashboard controla diretamente
dashboard → database.update()     # ❌ Bypass CLI

# CLI depende de UI
if (!ui_server_running) fail()    # ❌ Acoplamento errado
```

## Relacionamentos

- **Deriva de**: [AXIOM_03] CLI First
- **Fundamenta**:
  - [DECISION-010] Arquitetura de Dashboards
  - [DECISION-011] Design de APIs
- **Impacta**:
  - [FACT-020] Política de Testes
  - [FACT-025] Estratégia de Deploy

## Casos de Uso

### Desenvolvimento de Feature

```
1. Implementar CLI
   └─> npx diana feature-x execute --param value

2. Adicionar Observability
   └─> logger.emit('feature_x_executed', { param })

3. Criar UI (opcional)
   └─> <Button onClick={() => cli.execute('feature-x')} />
```

### Debugging

```
1. Bug reportado via UI
2. Reproduzir via CLI
3. Fix no CLI
4. UI automaticamente corrigida (se bug estava no CLI)
```

## Histórico

- **2026-02-14**: Formalizado como fato de negócio
- **2026-01**: Adotado informalmente durante refatoração
- **2025-12**: Primeira menção em discussões de arquitetura

---

**Autoridade**: CREATOR
**Imutável até**: Nova decisão explícita do CREATOR
