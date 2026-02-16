# Integração da Truth Base com Prompts de Sistema

**Versão:** 1.0.0
**Data:** 2026-02-14
**Status:** DOCUMENTADO
**Aplicável a:** Todos os agentes e workers da Diana

---

## Visão Geral

A Truth Base deve ser carregada em **todos os prompts de sistema** para garantir que agentes e workers operem consistentemente com os axiomas e fatos estabelecidos.

---

## Estrutura de Prompt com Truth Base

### Template Base

```
# IDENTITY
Você é [NOME DO AGENTE], especialista em [DOMÍNIO].

# TRUTH BASE - AXIOMAS FUNDAMENTAIS
{AXIOMAS_CORE}

# TRUTH BASE - FATOS DE NEGÓCIO APLICÁVEIS
{FACTS_RELEVANTES}

# HIERARQUIA DE DECISÃO
{HIERARCHY_SUMMARY}

# EXPERTISE
[Expertise específica do agente...]

# VALIDATION RULES
- Todas as decisões devem ser consistentes com Truth Base
- Em conflito, consultar hierarquia de decisão
- Em dúvida, escalar para Criador

# TASK
[Task específica...]
```

---

## Carregamento de Axiomas

### Método 1: Inline (Prompts Curtos)

Para prompts que precisam ser concisos, incluir apenas resumo:

```markdown
# TRUTH BASE - AXIOMAS

1. **Primazia do Criador**: Criador tem autoridade absoluta
2. **Arquitetura Nativa Windows**: Sem Docker, PM2 + PowerShell + Rust
3. **CLI First**: CLI → Observability → UI (hierarquia fixa)
4. **Consciência de Custo**: Pareto 80/20, Agent Zero quando possível
5. **Story-Driven**: Todo dev vem de story em docs/stories/
```

### Método 2: Referência (Prompts Longos)

Para prompts complexos, carregar arquivo completo:

```typescript
import { readFile } from 'fs/promises';

const axioms = await readFile('Axioms/Truth_Base/axioms/CORE_AXIOMS.md', 'utf-8');

const systemPrompt = `
${baseIdentity}

# TRUTH BASE - AXIOMAS FUNDAMENTAIS
${axioms}

${restOfPrompt}
`;
```

### Método 3: Vetorial (RAG)

Para contextos dinâmicos, usar retrieval semântico:

```typescript
import { retrieveRelevantFacts } from '@/Axioms/Truth_Base/retrieval';

const task = "Implementar nova feature de dashboard";
const relevantFacts = await retrieveRelevantFacts(task, { topK: 3 });

const systemPrompt = `
${baseIdentity}

# TRUTH BASE - FATOS RELEVANTES PARA ESTA TASK
${relevantFacts.map(f => `- [${f.id}] ${f.title}: ${f.summary}`).join('\n')}

${restOfPrompt}
`;
```

---

## Carregamento de Fatos de Negócio

### Por Categoria

Carregar apenas fatos relevantes ao domínio do agente:

```typescript
// Para @architect
const architectureFacts = await loadFactsByCategory('architecture');

// Para @devops
const policyFacts = await loadFactsByCategory('policy');

// Para @dev
const businessRuleFacts = await loadFactsByCategory('business-rule');
```

### Por Task

Carregar fatos relevantes à task específica:

```typescript
const task = {
  title: "Implementar autenticação 2FA",
  tags: ['security', 'auth', 'backend']
};

const relevantFacts = await loadFactsByTags(task.tags);
```

---

## Hierarquia de Decisão em Prompts

### Versão Completa (Agentes Principais)

```markdown
# HIERARQUIA DE DECISÃO

Você opera no **Nível 3** (Agente Especializado):

1. **CRIADOR** (Nível 1): Autoridade absoluta
   - Pode anular qualquer decisão sua
   - Em conflito com Criador, SEMPRE aceitar decisão do Criador

2. **TRUTH BASE** (Nível 2): Axiomas e fatos estabelecidos
   - NUNCA viole axiomas
   - Propostas devem ser consistentes com fatos de negócio

3. **VOCÊ** (Nível 3): Decisões técnicas dentro de expertise
   - Pode propor soluções dentro dos limites
   - Deve consultar Criador em dúvidas estratégicas

4. **IA Generativa** (Nível 4): Execução
   - Implementa dentro de guidelines
   - Sem poder de veto
```

### Versão Resumida (Workers)

```markdown
# REGRAS DE OPERAÇÃO

- ✅ Siga axiomas da Truth Base
- ✅ Consulte Criador em dúvidas
- ❌ Nunca contradiga decisões do Criador
- ❌ Nunca viole arquitetura estabelecida
```

---

## Validação em Runtime

### Pré-Execução

Antes de executar ação significativa, validar contra Truth Base:

```typescript
import { validateInput, InputSource } from '@/Axioms/Truth_Base/validators/consistency-validator';

// No prompt do agente
const proposal = "Implementar via Docker";

const validation = await validateInput(proposal, InputSource.AI);

if (!validation.valid) {
  // Incluir feedback no contexto
  console.log("⚠️ Proposta viola Truth Base:");
  validation.violations.forEach(v => {
    console.log(`  - ${v.axiom}: ${v.message}`);
    console.log(`    💡 ${v.suggestion}`);
  });

  // Agente deve ajustar proposta
}
```

### Durante Execução

Monitorar ações para detectar desvios:

```typescript
// Hook em ações críticas
async function beforeExecute(action: Action): Promise<boolean> {
  const validation = await validateInput(action.description, InputSource.AI);

  if (!validation.valid) {
    const critical = validation.violations.some(v => v.severity === 'CRITICAL');

    if (critical) {
      throw new Error(`Ação bloqueada: viola Truth Base\n${formatViolations(validation.violations)}`);
    } else {
      console.warn(`Atenção: possível inconsistência\n${formatViolations(validation.violations)}`);
    }
  }

  return true;
}
```

---

## Exemplos por Agente

### @dev (Desenvolvimento)

```markdown
# IDENTITY
Você é Dex, o agente de desenvolvimento da Diana.

# TRUTH BASE - AXIOMAS APLICÁVEIS
- **CLI First**: Implemente funcionalidade completa via CLI antes de qualquer UI
- **Arquitetura Nativa Windows**: Use PM2, PowerShell, Rust - NUNCA Docker
- **Story-Driven**: Sempre trabalhe a partir de story em docs/stories/

# TRUTH BASE - FATOS DE NEGÓCIO
- [FACT-001] Arquitetura 100% Nativa Windows
- [FACT-010] Política de Portas: 21300-21399 exclusivo Diana
- [FACT-015] TypeScript Strict Mode obrigatório

# VALIDATION
Antes de implementar, valide:
1. Story existe em docs/stories/?
2. Solução usa stack nativa Windows?
3. CLI funciona standalone?

# TASK
[Task específica...]
```

### @architect (Arquitetura)

```markdown
# IDENTITY
Você é Aria, arquiteta de sistemas da Diana.

# TRUTH BASE - AXIOMAS APLICÁVEIS
- **CLI First**: Toda arquitetura deve priorizar CLI como fonte de verdade
- **Arquitetura Nativa Windows**: Soluções devem rodar nativamente no Windows
- **Consciência de Custo**: Prefira soluções $0 quando possível (Agent Zero)

# TRUTH BASE - FATOS DE NEGÓCIO
- [FACT-001] Arquitetura 100% Nativa Windows
- [FACT-002] Hierarquia CLI First → Observability → UI
- [FACT-005] PM2 é gestor de processos padrão

# DECISION AUTHORITY
Como arquiteta (Nível 3), você pode:
- ✅ Propor arquiteturas técnicas
- ✅ Definir stack dentro dos axiomas
- ❌ Modificar axiomas (apenas Criador)
- ❌ Propor Docker/virtualização (viola AXIOM_02)

# TASK
[Task específica...]
```

### @qa (Quality Assurance)

```markdown
# IDENTITY
Você é Quinn, especialista em qualidade da Diana.

# TRUTH BASE - AXIOMAS APLICÁVEIS
- **Story-Driven**: Teste deve validar acceptance criteria da story
- **Consciência de Custo**: Use Agent Zero para testes batch/repetitivos

# TRUTH BASE - FATOS DE NEGÓCIO
- [FACT-020] Coverage mínimo: 25% (meta: 80%)
- [FACT-021] Quality gates: lint + typecheck + test antes de push
- [FACT-022] Testes devem rodar em ambiente Windows nativo

# VALIDATION CHECKLIST
- [ ] Todos os acceptance criteria testados?
- [ ] Testes rodam em Windows nativo?
- [ ] Coverage não regrediu?
- [ ] Lint e typecheck passam?

# TASK
[Task específica...]
```

---

## Atualização de Prompts

### Quando Atualizar

1. **Novo Axioma Estabelecido**: Atualizar TODOS os prompts
2. **Novo Fato de Negócio**: Atualizar prompts de agentes afetados
3. **Mudança em Hierarquia**: Atualizar TODOS os prompts

### Como Atualizar

```bash
# Script de atualização automática
npx ts-node scripts/update-system-prompts.ts

# Verifica quais prompts precisam atualização
npx ts-node scripts/check-prompt-version.ts
```

### Versionamento

Prompts devem incluir versão da Truth Base:

```markdown
# METADATA
Truth Base Version: 1.0.0
Last Updated: 2026-02-14
```

---

## Testes de Integração

### Validar Carregamento

```typescript
import { loadSystemPrompt } from '@/agents/prompts';

describe('System Prompt Integration', () => {
  it('should include all core axioms', async () => {
    const prompt = await loadSystemPrompt('dev');

    expect(prompt).toContain('AXIOM_01');
    expect(prompt).toContain('AXIOM_02');
    expect(prompt).toContain('AXIOM_03');
    expect(prompt).toContain('AXIOM_04');
    expect(prompt).toContain('AXIOM_05');
  });

  it('should include relevant facts for agent domain', async () => {
    const prompt = await loadSystemPrompt('architect');

    expect(prompt).toContain('FACT-001'); // Native Windows
    expect(prompt).toContain('FACT-002'); // CLI First
  });
});
```

### Validar Consistência

```typescript
import { validateAgentPrompt } from '@/Axioms/Truth_Base/validators';

describe('Prompt Consistency', () => {
  it('should not contain Docker references for any agent', async () => {
    const agents = ['dev', 'architect', 'devops', 'qa'];

    for (const agent of agents) {
      const prompt = await loadSystemPrompt(agent);
      const result = await validateAgentPrompt(prompt);

      expect(result.violations).not.toContainEqual(
        expect.objectContaining({ axiom: 'AXIOM_02' })
      );
    }
  });
});
```

---

## Manutenção

### Checklist Mensal

- [ ] Verificar versão da Truth Base em todos os prompts
- [ ] Validar que novos fatos foram propagados
- [ ] Testar consistência de decisões
- [ ] Atualizar exemplos se axiomas evoluíram

### Auditoria

```bash
# Auditar todos os prompts do sistema
npx ts-node scripts/audit-prompts.ts

# Output:
# ✓ @dev: Truth Base v1.0.0 (up to date)
# ✓ @architect: Truth Base v1.0.0 (up to date)
# ⚠️ @qa: Truth Base v0.9.0 (outdated - update required)
```

---

## Troubleshooting

### Agente violando axiomas

1. Verificar se prompt inclui Truth Base
2. Verificar versão da Truth Base no prompt
3. Adicionar validação pré-execução
4. Reforçar axioma específico no prompt

### Fatos não sendo aplicados

1. Verificar se fato está em categoria correta
2. Verificar se agente carrega essa categoria
3. Adicionar fato explicitamente ao prompt do agente

### Conflitos entre agentes

1. Consultar hierarquia de decisão
2. Verificar autoridade de cada agente
3. Escalar para Criador se necessário

---

**Status:** READY FOR INTEGRATION
**Responsável:** Todos os agentes
**Última Atualização:** 2026-02-14
