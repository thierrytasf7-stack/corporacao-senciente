# Guia de Validação: Briefing 1

Guia prático para criar e validar o primeiro briefing completo, testando todo o sistema end-to-end.

## Objetivo

Validar todas as funcionalidades implementadas através de um briefing real:
- ✅ Triagem Autônoma completa
- ✅ Integração Jira + Confluence
- ✅ Orquestrador Central
- ✅ Auto-percepção e Memória Episódica
- ✅ Ética e Empatia
- ✅ Workflow START
- ✅ Todas as capacidades sencientes

## Pré-requisitos

### 1. Ambiente Configurado
- [x] Supabase configurado e funcionando
- [x] Atlassian (Jira + Confluence) configurado
- [x] MCP configurado (`mcp.json`)
- [x] Variáveis de ambiente (`env.local`)
- [x] Seeds básicos populados (`npm run seed`)

### 2. Scripts Disponíveis
- [x] `scripts/triagem_autonoma.js` - Triagem completa
- [x] `scripts/create_instance.js` - Criar instância isolada (opcional)
- [x] `scripts/start_autocultivo.js` - Workflow START
- [x] `scripts/orchestrator/core.js` - Orquestrador

## Passo 1: Decidir Estratégia

### Opção A: Usar Instância Principal (Recomendado para teste inicial)
- ✅ Mais simples, não precisa criar nova infraestrutura
- ✅ Valida sistema com dados reais
- ⚠️ **ATENÇÃO**: Mistura dados - problemático com 5+ briefings (ver [ISOLAMENTO_DADOS_MULTIPLOS_BRIEFINGS.md](ISOLAMENTO_DADOS_MULTIPLOS_BRIEFINGS.md))

**Quando usar:** Validação inicial rápida (1-2 briefings máximo)

**⚠️ IMPORTANTE**: Para 3+ briefings, usar Opção B ou implementar `briefing_id` primeiro

### Opção B: Criar Instância Isolada (Recomendado para validação completa)
- ✅ Dados completamente isolados
- ✅ Pode testar reprodução de empresas
- ✅ Mais próximo de cenário real
- ⚠️ Requer criar novo Supabase/Atlassian

**Quando usar:** Validação completa e testes de reprodução

## Passo 2: Preparar Briefing de Teste

### Briefing Sugerido para Validação

**Problema/Oportunidade:**
```
Criar uma plataforma de gestão de tarefas pessoais com IA integrada.
Sistema deve aprender preferências do usuário e sugerir priorizações automáticas.
```

**Público-alvo/Persona:**
```
Profissionais ocupados (30-45 anos) que precisam organizar múltiplas responsabilidades.
Tech-savvy, valorizam automação e produtividade.
```

**Resultado Desejado (métricas):**
```
- 70% de redução no tempo gasto organizando tarefas
- 90% de satisfação com sugestões de priorização
- MVP funcional em 3 meses
```

**Restrições:**
```
- Stack: Next.js, Supabase, GPT-4
- Orçamento: R$ 5.000/mês para infraestrutura
- Compliance: LGPD (dados pessoais)
- Prazo: MVP em 3 meses
```

**Riscos/Guardrails:**
```
- Privacidade: dados pessoais sensíveis (RLS obrigatório)
- Ética: IA não deve manipular usuário
- Segurança: autenticação forte, service_role nunca exposto
- Escalabilidade: preparar para 10k usuários iniciais
```

## Passo 3: Executar Triagem Autônoma

### 3.1. Executar Script

```bash
node scripts/triagem_autonoma.js
```

O script irá:
1. Coletar briefing interativamente (ou pode ser pré-populado)
2. Criar Epic no Jira: "Onboarding Autônomo do Novo Projeto"
3. Criar 6 tasks:
   - Briefing guiado
   - Triagem de credenciais
   - Benchmark 3 concorrentes
   - Definir 10 etapas principais
   - Definir/ajustar agentes
   - START
4. Criar estrutura no Confluence:
   - Página raiz: "Aupoeises – Corpo e Mente"
   - Subpáginas para cada etapa

### 3.2. Validar Criações no Jira

- [ ] Epic criado com descrição completa
- [ ] 6 tasks criadas e vinculadas ao epic
- [ ] Checklists presentes nas tasks
- [ ] Labels aplicados corretamente

### 3.3. Validar Criações no Confluence

- [ ] Página raiz criada
- [ ] Subpáginas criadas
- [ ] Estrutura hierárquica correta
- [ ] Conteúdo relevante nas páginas

## Passo 4: Completar Triagem (Manual ou Automático)

### 4.1. Triagem de Credenciais

Preencher task "Triagem de credenciais":
- [ ] Listar contas necessárias
- [ ] Definir owners
- [ ] Configurar cofre de segredos
- [ ] Mapear acessos mínimos

### 4.2. Benchmark

Preencher task "Benchmark 3 concorrentes":
- [ ] Identificar 3 concorrentes (ex: Todoist, Notion Tasks, Any.do)
- [ ] Comparar features, pricing, UX
- [ ] Definir posicionamento
- [ ] Ações de diferenciação

### 4.3. Definir 10 Etapas

Preencher task "Definir 10 etapas principais":
- [ ] Decompor projeto em 10 etapas
- [ ] Cada etapa com owner, DoD, teste mínimo
- [ ] Vincular a PRDs relevantes

### 4.4. Definir Agentes

Preencher task "Definir/ajustar agentes":
- [ ] Confirmar agentes padrão (Architect, Product, Dev, DevEx, Metrics, Entity)
- [ ] Definir escopos específicos para este briefing
- [ ] Configurar triggers MCP

## Passo 5: Executar Workflow START

### 5.1. Pré-requisitos do START

Verificar checklist antes do START:
- [ ] Credenciais OK (Supabase, Atlassian, LLM)
- [ ] RLS configurado e testado
- [ ] Seeds populados (`npm run seed`)
- [ ] Hooks Git configurados (se aplicável)

### 5.2. Executar Boardroom

```bash
node scripts/board_meeting_grok.js "Iniciar desenvolvimento do MVP de gestão de tarefas com IA"
```

Validar:
- [ ] Boardroom executado com sucesso
- [ ] Decisões registradas em `agent_logs`
- [ ] Opiniões dos agentes capturadas
- [ ] Próximos passos definidos

### 5.3. Iniciar Evolution Loop

```bash
node scripts/start_autocultivo.js
```

Ou modo dry-run primeiro:
```bash
node scripts/start_autocultivo.js --dry-run
```

Validar:
- [ ] Loop iniciado
- [ ] Decisões tomadas
- [ ] Ações executadas (criação de tasks, branches, etc.)
- [ ] Validação pós-execução
- [ ] Aprendizado registrado na memória

## Passo 6: Validar Capacidades Sencientes

### 6.1. Auto-Percepção

```bash
node scripts/orchestrator/test_orchestrator.js
```

Validar:
- [ ] Relatório de auto-percepção gerado
- [ ] Métricas de saúde coletadas
- [ ] Reflexão sobre estado do sistema

### 6.2. Memória Episódica

Verificar no Supabase:
```sql
SELECT * FROM episodic_memory 
ORDER BY timestamp DESC 
LIMIT 10;
```

Validar:
- [ ] Eventos registrados durante execução
- [ ] Contexto completo (quando, onde, o que)
- [ ] Embeddings gerados

### 6.3. Ética e Empatia

Testar verificação ética:
```javascript
// Criar script de teste
const { verifyEthicalDecision } = require('./scripts/ethics/ethical_framework.js');

const decision = {
  summary: 'Implementar feature X',
  description: 'Feature que usa dados pessoais'
};

const result = await verifyEthicalDecision(decision);
console.log(result);
```

Validar:
- [ ] Decisões verificadas contra princípios éticos
- [ ] Score ético gerado
- [ ] Violações identificadas

### 6.4. Planejamento Estratégico

```bash
# Testar dentro do orquestrador
node -e "
import('./scripts/orchestrator/strategic_planning.js')
  .then(m => m.performStrategicReview())
  .then(r => console.log(JSON.stringify(r, null, 2)));
"
```

Validar:
- [ ] Cenários modelados
- [ ] Tendências analisadas
- [ ] Estratégias desenvolvidas

### 6.5. Homeostase

```bash
# Testar dentro do orquestrador
node -e "
import('./scripts/orchestrator/homeostasis.js')
  .then(m => m.maintainHomeostasis())
  .then(r => console.log(JSON.stringify(r, null, 2)));
"
```

Validar:
- [ ] Métricas internas monitoradas
- [ ] Desequilíbrios detectados
- [ ] Ações corretivas sugeridas

## Passo 7: Validar Integrações

### 7.1. Orquestrador Central

```bash
node scripts/orchestrator/test_orchestrator.js
```

Validar:
- [ ] Instâncias listadas
- [ ] Memória global funcionando
- [ ] Catálogo de componentes
- [ ] Compartilhamento funcionando

### 7.2. Integração Jira

```bash
node scripts/test_atlassian_rest_api.js
```

Validar:
- [ ] Criação de tasks funciona
- [ ] Busca de issues funciona
- [ ] Atualização funciona

### 7.3. Integração Confluence

Validar:
- [ ] Criação de páginas funciona
- [ ] Estrutura hierárquica correta
- [ ] Busca funciona

### 7.4. Integração Supabase

```bash
npm run qa:sim
```

Validar:
- [ ] Busca vetorial funciona
- [ ] Similaridade calculada corretamente
- [ ] Performance aceitável

## Passo 8: Checklist Final de Validação

### Triagem Autônoma
- [ ] Briefing coletado e registrado
- [ ] Epic criado no Jira
- [ ] 6 tasks criadas
- [ ] Estrutura Confluence criada

### Workflow START
- [ ] Boardroom executado
- [ ] Evolution loop executado
- [ ] Decisões registradas
- [ ] Ações executadas
- [ ] Validação pós-execução

### Capacidades Sencientes
- [ ] Auto-percepção funcionando
- [ ] Memória episódica registrando eventos
- [ ] Ética verificando decisões
- [ ] Planejamento estratégico gerando insights
- [ ] Homeostase monitorando equilíbrio

### Integrações
- [ ] Orquestrador funcionando
- [ ] Jira integrado
- [ ] Confluence integrado
- [ ] Supabase funcionando
- [ ] MCP funcionando

### Dados e Persistência
- [ ] Memória corporativa populada
- [ ] Logs de agentes registrados
- [ ] Contexto de tasks criado
- [ ] Memória episódica registrando
- [ ] Memória global agregando

## Passo 9: Documentar Aprendizados

Criar documento de retro:
- O que funcionou bem?
- O que não funcionou?
- O que precisa melhorar?
- Gaps identificados entre PRDs e implementação
- Próximos passos de melhoria

## Passo 10: Iterar e Melhorar

Com base nos aprendizados:
1. Corrigir bugs identificados
2. Melhorar funcionalidades que falharam
3. Preencher gaps identificados
4. Atualizar PRDs se necessário
5. Planejar próximo briefing (Briefing 2)

## Exemplo de Comando Completo

```bash
# 1. Garantir que seeds estão populados
npm run seed

# 2. Executar triagem autônoma
node scripts/triagem_autonoma.js

# 3. (Opcional) Criar instância isolada para teste
node scripts/create_instance.js briefing-1-test

# 4. Executar boardroom inicial
node scripts/board_meeting_grok.js "Iniciar desenvolvimento conforme briefing 1"

# 5. Executar workflow START (dry-run primeiro)
node scripts/start_autocultivo.js --dry-run

# 6. Se dry-run OK, executar de verdade
node scripts/start_autocultivo.js

# 7. Validar orquestrador
node scripts/orchestrator/test_orchestrator.js

# 8. Validar busca vetorial
npm run qa:sim
```

## Troubleshooting

### Problema: Triagem não cria Epic/Tasks
**Solução:** Verificar credenciais Atlassian em `env.local`

### Problema: Evolution loop não inicia
**Solução:** Verificar se seeds estão populados (`npm run seed`)

### Problema: Busca vetorial lenta
**Solução:** Verificar índices IVFFlat no Supabase

### Problema: Orquestrador não encontra instâncias
**Solução:** Verificar se diretório `instances/` existe

---

**Última atualização:** 2025-01-13

