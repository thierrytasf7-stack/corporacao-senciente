# Truth Base - Quick Start

**5 minutos para começar a usar a Truth Base**

---

## 1. Ler os Axiomas (2 min)

```bash
cat Axioms/Truth_Base/axioms/CORE_AXIOMS.md
```

**Memorize:**
1. CRIADOR tem autoridade absoluta
2. SEM Docker - só nativo Windows
3. CLI First → Observability → UI
4. Custo $0 quando possível (Agent Zero)
5. Toda implementação vem de story

---

## 2. Validar uma Proposta (1 min)

```bash
# Teste rápido
npx tsx Axioms/Truth_Base/validators/cli.ts validate "usar docker para deployment"

# Resultado esperado: ❌ BLOQUEADO - Viola AXIOM_02
```

**Aprendizado:** Docker é proibido por axioma. Use PM2/PowerShell.

---

## 3. Consultar um Fato (1 min)

```bash
cat Axioms/Truth_Base/wiki/business-facts/architecture/FACT-001-native-windows.md
```

**Veja:**
- ✅ O que é permitido (PM2, PowerShell, Rust)
- ❌ O que é proibido (Docker, virtualização)
- Exemplos práticos de uso

---

## 4. Integrar em Prompt (1 min)

```typescript
import { readFile } from 'fs/promises';

const axioms = await readFile('Axioms/Truth_Base/axioms/CORE_AXIOMS.md', 'utf-8');

const systemPrompt = `
Você é [AGENTE].

# TRUTH BASE - AXIOMAS FUNDAMENTAIS
${axioms}

# TASK
[sua task...]
`;
```

**Resultado:** Agente agora opera dentro dos axiomas automaticamente.

---

## Casos de Uso Comuns

### Antes de Implementar Feature

```bash
# 1. Ler story
cat docs/stories/minha-feature.md

# 2. Verificar se proposta é válida
npx tsx Axioms/Truth_Base/validators/cli.ts validate "$(cat proposta.txt)"

# 3. Se válido, implementar
# 4. Se inválido, ajustar proposta
```

### Resolver Conflito de Decisão

```bash
# 1. Consultar hierarquia
cat Axioms/Truth_Base/DECISION_HIERARCHY.md

# 2. Aplicar regra:
#    CRIADOR > Truth Base > Agent > IA

# 3. Se Agent vs Agent, consultar expertise:
#    @devops > @architect > @dev (infraestrutura)
#    @architect > @dev > @qa (arquitetura)
```

### Adicionar Novo Fato de Negócio

```bash
# 1. Criar arquivo
cat > Axioms/Truth_Base/wiki/business-facts/policies/FACT-003-portas.md <<EOF
---
id: FACT-003
title: Política de Portas Diana
category: policy
status: ESTABLISHED
version: 1.0.0
created: $(date +%Y-%m-%d)
source: CREATOR
axiom: AXIOM_02
---

# Política de Portas Diana

## Definição
Faixa exclusiva: 21300-21399. NUNCA usar 3000, 8080.

## Exemplos
- Dashboard: 21300
- Backend: 21301
EOF

# 2. Re-exportar vetores
npx tsx Axioms/Truth_Base/exports/export-to-vectors.ts
```

---

## Atalhos

| Ação | Comando |
|------|---------|
| Ver todos axiomas | `cat Axioms/Truth_Base/axioms/CORE_AXIOMS.md` |
| Validar proposta | `npx tsx Axioms/Truth_Base/validators/cli.ts validate "texto"` |
| Listar fatos | `ls Axioms/Truth_Base/wiki/business-facts/**/*.md` |
| Exportar vetores | `npx tsx Axioms/Truth_Base/exports/export-to-vectors.ts` |
| Ver hierarquia | `cat Axioms/Truth_Base/DECISION_HIERARCHY.md` |
| Navegação completa | `cat Axioms/Truth_Base/INDEX.md` |

---

## Checklist Diário

**Antes de cada implementação:**
- [ ] Li a story em `docs/stories/`?
- [ ] Minha solução usa stack nativa Windows?
- [ ] CLI funciona standalone (sem UI)?
- [ ] Considerei usar Agent Zero ($0)?
- [ ] Validei contra axiomas?

**Se resposta "não" em qualquer item → revisar proposta.**

---

## Erros Comuns

### ❌ "Vou usar Docker porque é mais fácil"
**Solução:** AXIOM_02 proíbe Docker. Use PM2 nativo.

### ❌ "Começar pelo dashboard é melhor UX"
**Solução:** AXIOM_03 exige CLI first. Dashboard depois.

### ❌ "Implementar direto sem story"
**Solução:** AXIOM_05 exige story. Criar em `docs/stories/` primeiro.

### ❌ "Usar Opus para tudo, qualidade máxima"
**Solução:** AXIOM_04 exige consciência de custo. Agent Zero quando possível.

---

## Próximos Passos

1. **Agora:** Ler `README.md` completo
2. **Hoje:** Integrar axiomas nos prompts dos seus agentes
3. **Esta Semana:** Adicionar 3-5 fatos de negócio na Wiki
4. **Este Mês:** Implementar validação automática em CI/CD

---

**Dúvidas?** Consulte `INDEX.md` ou `DECISION_HIERARCHY.md`

**Feedback?** Adicione fato na Wiki ou ajuste validador

**Pronto!** Você já sabe usar a Truth Base. 🚀
