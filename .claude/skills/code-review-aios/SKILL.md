---
name: code-review-aios
description: Review de código seguindo padrões AIOS/Diana.
  Ativa quando pedido review de PR, diff, ou código específico.
  Valida contra os coding standards do projeto.
---

# Code Review AIOS — Review segundo padrões Diana

## Checklist de Review

### 1. TypeScript/JavaScript
- [ ] Sem `any` — usar tipos concretos ou `unknown` + type guard
- [ ] Imports absolutos (`@synkra/` ou `@/`) — nunca relativos
- [ ] ES2022+ syntax (arrow functions, destructuring, optional chaining)
- [ ] Error handling com contexto (`Failed to ${op}: ${error.message}`)
- [ ] Sem `var` — usar `const` (preferido) ou `let`

### 2. Nomenclatura
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Arquivo | kebab-case | `agent-loader.ts` |
| Classe | PascalCase | `AgentLoader` |
| Função | camelCase | `loadAgent()` |
| Constante | SCREAMING_SNAKE | `MAX_RETRIES` |
| Interface | PascalCase + sufixo | `AgentLoaderProps` |
| Hook | use prefix | `useAgentLoader()` |

### 3. Arquitetura
- [ ] Respeita CLI First (não acopla lógica à UI)
- [ ] Não duplica funcionalidade de agent existente
- [ ] Segue story-driven development (tem story associada?)
- [ ] Quality gates passam (lint + typecheck + test)

### 4. Segurança (OWASP)
- [ ] Sem command injection (sanitizar inputs em exec/spawn)
- [ ] Sem path traversal (validar paths de arquivo)
- [ ] Sem secrets hardcoded
- [ ] Inputs de usuário validados

### 5. Performance
- [ ] Sem loops N+1 em queries
- [ ] Async/await correto (sem await em loop quando paralelizável)
- [ ] Imports não carregam módulos desnecessários

## Formato de Feedback
```
## Review: [arquivo/PR]

### ✅ Aprovado / ⚠️ Mudanças Pedidas / ❌ Bloqueado

**Resumo:** [1-2 frases]

**Problemas encontrados:**
1. [Severidade] Descrição — Sugestão de fix
2. ...

**Pontos positivos:**
- ...
```

## Severidade
| Nível | Significado |
|-------|-------------|
| 🔴 Critical | Bloqueia merge — segurança, bug grave |
| 🟡 Warning | Deve corrigir — padrão violado, código frágil |
| 🔵 Info | Sugestão — melhoria opcional |
