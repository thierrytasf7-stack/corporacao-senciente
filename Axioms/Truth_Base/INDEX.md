# Truth Base - Índice Completo

**Versão:** 1.0.0 | **Atualizado:** 2026-02-14 | **Status:** ✓ IMPLEMENTADO

---

## 📚 Navegação Rápida

| Documento | Propósito | Link |
|-----------|-----------|------|
| **Visão Geral** | Introdução e contexto | [README.md](./README.md) |
| **Axiomas** | 5 princípios fundamentais | [axioms/CORE_AXIOMS.md](./axioms/CORE_AXIOMS.md) |
| **Hierarquia** | Criador > IA | [DECISION_HIERARCHY.md](./DECISION_HIERARCHY.md) |
| **Integração** | Uso em prompts | [SYSTEM_PROMPT_INTEGRATION.md](./SYSTEM_PROMPT_INTEGRATION.md) |

---

## 🎯 Por Caso de Uso

### Validar Proposta

**Objetivo:** Verificar se proposta é consistente com axiomas

1. Ler: [validators/README.md](./validators/README.md)
2. Usar: `validators/consistency-validator.ts`
3. Exemplo:
   ```typescript
   const result = await validateInput(proposal, InputSource.AI);
   if (!result.valid) console.log(result.violations);
   ```

### Consultar Fato de Negócio

**Objetivo:** Buscar decisão ou definição estabelecida

1. Navegar: [wiki/README.md](./wiki/README.md)
2. Categorias:
   - Arquitetura: [wiki/business-facts/architecture/](./wiki/business-facts/architecture/)
   - Políticas: [wiki/business-facts/policies/](./wiki/business-facts/policies/)
   - Regras: [wiki/business-facts/business-rules/](./wiki/business-facts/business-rules/)
   - Domínio: [wiki/business-facts/domain/](./wiki/business-facts/domain/)

### Exportar para Embeddings

**Objetivo:** Gerar vetores para retrieval semântico

1. Ler: [exports/README.md](./exports/README.md)
2. Executar: `npx tsx exports/export-to-vectors.ts`
3. Resultado: `exports/truth-base-vectors.{json,jsonl,csv}`

### Integrar em Agent

**Objetivo:** Adicionar Truth Base ao prompt de sistema

1. Ler: [SYSTEM_PROMPT_INTEGRATION.md](./SYSTEM_PROMPT_INTEGRATION.md)
2. Escolher método: inline, referência, ou RAG
3. Template disponível para cada agente

---

## 📖 Estrutura de Diretórios

```
Axioms/Truth_Base/
│
├── 📄 README.md                      # Documentação principal
├── 📄 INDEX.md                       # Este arquivo
├── 📄 DECISION_HIERARCHY.md          # Hierarquia de decisão
├── 📄 SYSTEM_PROMPT_INTEGRATION.md   # Guia de integração
│
├── 📁 axioms/                        # Axiomas fundamentais
│   └── CORE_AXIOMS.md               # 5 axiomas inegociáveis
│
├── 📁 validators/                    # Validação de consistência
│   ├── consistency-validator.ts     # Validador TypeScript
│   ├── README.md                    # Documentação
│   └── logs/                        # Logs de validação
│
├── 📁 exports/                       # Exportação para vetores
│   ├── export-to-vectors.ts         # Script de exportação
│   ├── README.md                    # Documentação
│   └── [outputs]                    # JSON/JSONL/CSV gerados
│
└── 📁 wiki/                          # WikiLocal - Fatos de Negócio
    ├── README.md                    # Guia completo
    ├── business-facts/              # Fatos categorizados
    │   ├── architecture/            # Decisões arquiteturais
    │   ├── business-rules/          # Regras de negócio
    │   ├── domain/                  # Definições de domínio
    │   └── policies/                # Políticas operacionais
    ├── decisions/                   # ADRs (Architecture Decision Records)
    └── glossary/                    # Glossário de termos
```

---

## 🔍 Quick Reference

### 5 Axiomas

1. **AXIOM_01** - Primazia do Criador (autoridade absoluta)
2. **AXIOM_02** - Arquitetura Nativa Windows (sem Docker)
3. **AXIOM_03** - CLI First → Observability → UI (hierarquia)
4. **AXIOM_04** - Consciência de Custo (Pareto 80/20, Agent Zero)
5. **AXIOM_05** - Story-Driven Development (docs/stories/)

### Hierarquia de Decisão

```
1. CRIADOR (autoridade máxima)
   ↓
2. TRUTH BASE (axiomas estabelecidos)
   ↓
3. AGENTS (expertise técnica)
   ↓
4. IA GENERATIVA (execução)
```

### Fatos de Negócio Iniciais

- **FACT-001**: Arquitetura 100% Nativa Windows
- **FACT-002**: Hierarquia CLI First → Observability → UI

---

## 🚀 Primeiros Passos

### Para Desenvolvedores

1. Ler [README.md](./README.md) para contexto
2. Ler [axioms/CORE_AXIOMS.md](./axioms/CORE_AXIOMS.md) - obrigatório
3. Consultar [wiki/](./wiki/) antes de implementar features

### Para Agentes

1. Carregar axiomas no prompt: [SYSTEM_PROMPT_INTEGRATION.md](./SYSTEM_PROMPT_INTEGRATION.md)
2. Validar propostas: `validators/consistency-validator.ts`
3. Consultar hierarquia em dúvidas: [DECISION_HIERARCHY.md](./DECISION_HIERARCHY.md)

### Para Criador

1. Todos os documentos são referência
2. Modificar axiomas: editar `axioms/CORE_AXIOMS.md` e incrementar versão
3. Adicionar fatos: criar em `wiki/business-facts/{category}/`

---

## 🔄 Workflow Completo

```
┌─────────────────────┐
│  Nova Proposta      │
└──────┬──────────────┘
       │
       ├─> Ler Axiomas (axioms/CORE_AXIOMS.md)
       ├─> Consultar Fatos (wiki/business-facts/)
       ├─> Validar (validators/consistency-validator.ts)
       │
       ├─> ✅ Válido → Implementar
       │
       └─> ❌ Inválido → Ajustar ou Escalar para Criador
                          (DECISION_HIERARCHY.md)
```

---

## 📊 Estatísticas Atuais

- **Axiomas Definidos**: 5
- **Fatos de Negócio**: 2 (inicial)
- **Validadores**: 1 (consistency-validator)
- **Exportadores**: 1 (export-to-vectors)
- **Formatos de Export**: 3 (JSON, JSONL, CSV)
- **Integrações Documentadas**: Prompts, Embeddings, Runtime Validation

---

## 🛠️ Manutenção

### Adicionar Novo Axioma

1. Editar `axioms/CORE_AXIOMS.md`
2. Incrementar versão
3. Atualizar `validators/consistency-validator.ts`
4. Propagar para prompts de agentes
5. Comunicar mudança

### Adicionar Fato de Negócio

1. Criar `wiki/business-facts/{category}/FACT-XXX-{slug}.md`
2. Seguir template com frontmatter
3. Referenciar axioma base
4. Re-exportar vetores: `npx tsx exports/export-to-vectors.ts`

### Atualizar Hierarquia

1. Editar `DECISION_HIERARCHY.md`
2. Atualizar prompts afetados
3. Testar fluxos de decisão
4. Comunicar mudança

---

## 📞 Suporte

- **Dúvidas sobre Axiomas**: Consultar Criador
- **Bugs em Validators**: Criar issue em repo
- **Novos Fatos**: Propor via story em `docs/stories/`
- **Integrações**: Ver `SYSTEM_PROMPT_INTEGRATION.md`

---

**Responsável**: CREATOR
**Manutenção**: Contínua
**Versão da Truth Base**: 1.0.0
