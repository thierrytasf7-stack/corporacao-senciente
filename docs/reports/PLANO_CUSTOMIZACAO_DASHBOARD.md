# 🎨 PLANO DE CUSTOMIZAÇÃO - DASHBOARD AIOS PARA DIANA CORPORAÇÃO SENCIENTE

## 📋 VALIDAÇÃO INICIAL - PROTOCOLOS DE SEGURANÇA

### ✅ Checklist de Validação Ética e Arquitetural

#### 1. Violação de Limites Éticos?
- ❌ **NÃO** - Customização de dashboard próprio
- ✅ Transparência: Todas mudanças documentadas
- ✅ Legalidade: Software open source (MIT License)
- ✅ Sem manipulação: Apenas adaptação ao contexto

#### 2. Necessidade de Aprovação do Corporate Will?
- ⚠️ **SIM** - Mudanças estruturais no dashboard
- 📝 **Decisão:** Aguardando aprovação humana para prosseguir
- 🎯 **Escopo:** Customização mantém UI/UX, adiciona features específicas

#### 3. Requer Logging de Auditoria?
- ✅ **SIM** - Todas mudanças serão registradas em .cli_state.json
- 📊 **Tracking:** Git commits com formato `AI: [Kiro] [Dashboard] Description`

#### 4. Impacta Privacidade ou Segurança?
- ❌ **NÃO** - Dashboard local, sem dados sensíveis expostos
- ✅ API keys mantidas em .env (não commitadas)
- ✅ Sem coleta de dados externos

### 🔍 Consulta ao DOCUMENTO_UNICO_VERDADE.md

#### Decisões Arquiteturais Relevantes
1. **Frontend = Painel Admin Executivo** ✅
2. **Holding Autônoma** ✅
3. **30 Agentes Customizados** ✅
4. **Squad Matrix Paralelo** ✅
5. **Estratégia OpenRouter Multi-Key** ✅
6. **Integração Aider Profunda** ✅

#### Agente Responsável
**Kiro** - Orquestração, Contexto e Validação
- ✅ Especializado em customização de sistemas
- ✅ Mantém integridade arquitetural
- ✅ Valida cada passo antes de executar

---

## 🎯 OBJETIVO DA CUSTOMIZAÇÃO

Transformar o **AIOS Dashboard padrão** em um **Painel Admin Executivo da Diana Corporação Senciente**, mantendo UI/UX original mas adaptando para:

1. **30 Agentes Customizados** (vs 11 padrão)
2. **Squad Matrix Paralelo** (múltiplas instâncias Aider)
3. **Estratégia OpenRouter Multi-Key** (1 paga + 5 gratuitas)
4. **Backend Customizado** (50+ endpoints)
5. **Holding Autônoma** (subsidiárias e métricas financeiras)
6. **Integração Aider Terminal** (protocolos de convivência)

---

## 📊 ANÁLISE DE DIFERENÇAS

### Dashboard AIOS Core (Padrão)
```
Agentes: 11 padrão (analyst, pm, architect, dev, qa, etc.)
Backend: Monitor server básico
Modelos: Anthropic API única
Squads: Não implementado
Métricas: Desenvolvimento de software
Foco: Agile development workflow
```

### Dashboard Diana Corporação (Customizado)
```
Agentes: 30 customizados (architect, copywriting, finance, etc.)
Backend: 50+ endpoints REST (GAIA, FORGE, DAEMON, Córtex)
Modelos: OpenRouter multi-key (1 paga + 5 gratuitas)
Squads: Squad Matrix paralelo (5 workers simultâneos)
Métricas: Receita, subsidiárias, autonomia, ROI
Foco: Holding autônoma que cria empresas
```

---

## 🔧 PLANO DE CUSTOMIZAÇÃO - 10 FASES

### FASE 1: BACKUP E PREPARAÇÃO ✅
**Objetivo:** Garantir segurança antes de modificar

**Ações:**
1. ✅ Criar backup do dashboard original
2. ✅ Documentar estado atual
3. ✅ Validar integridade do código

**Validação:**
- [ ] Backup criado em `aios-core-latest-backup/`
- [ ] Documentação de estado em `DASHBOARD_ESTADO_ORIGINAL.md`
- [ ] Testes de integridade passando

**Tempo Estimado:** 5 minutos

---

### FASE 2: CONFIGURAÇÃO DE AMBIENTE ⏳
**Objetivo:** Conectar dashboard ao backend customizado

**Ações:**
1. [ ] Criar `.env.local` com variáveis da Diana Corporação
2. [ ] Configurar URLs do backend customizado
3. [ ] Adicionar API keys OpenRouter (6 keys)
4. [ ] Configurar endpoints customizados

**Arquivo:** `aios-core-latest/apps/dashboard/.env.local`
```env
# Backend Diana Corporação
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# OpenRouter Multi-Key
OPENROUTER_API_KEY=sk-or-v1-f93ca135...
OPENROUTER_API_KEY_FREE_1=sk-or-v1-ca6bf4f1...
OPENROUTER_API_KEY_FREE_2=sk-or-v1-f82d95cc...
OPENROUTER_API_KEY_FREE_3=sk-or-v1-3d37d687...
OPENROUTER_API_KEY_FREE_4=sk-or-v1-18578b96...
OPENROUTER_API_KEY_FREE_5=sk-or-v1-d7977115...

# Configurações Diana
NEXT_PUBLIC_COMPANY_NAME=Diana Corporação Senciente
NEXT_PUBLIC_HOLDING_MODE=true
NEXT_PUBLIC_TOTAL_AGENTS=30
NEXT_PUBLIC_SQUAD_MATRIX_ENABLED=true
```

**Validação:**
- [ ] Arquivo .env.local criado
- [ ] Variáveis carregadas corretamente
- [ ] Conexão com backend testada

**Tempo Estimado:** 10 minutos

---

### FASE 3: CUSTOMIZAÇÃO DE AGENTES 🤖
**Objetivo:** Substituir 11 agentes padrão por 30 customizados

**Ações:**
1. [ ] Atualizar `src/lib/mock-data.ts` com 30 agentes
2. [ ] Criar tipos TypeScript para agentes customizados
3. [ ] Atualizar `use-agents.ts` hook
4. [ ] Modificar componente `AgentCard`

**Arquivo:** `src/lib/mock-data.ts`
```typescript
export const DIANA_AGENTS = [
  // Agentes Técnicos (11)
  { id: 'architect', name: 'Architect', status: 'active', note: 10 },
  { id: 'copywriting', name: 'Copywriting', status: 'active', note: 9 },
  { id: 'devex', name: 'DevEx', status: 'active', note: 8 },
  { id: 'entity', name: 'Entity', status: 'active', note: 7 },
  { id: 'finance', name: 'Finance', status: 'active', note: 9 },
  { id: 'metrics', name: 'Metrics', status: 'active', note: 8 },
  { id: 'product', name: 'Product', status: 'active', note: 9 },
  { id: 'quality', name: 'Quality', status: 'active', note: 8 },
  { id: 'research', name: 'Research', status: 'active', note: 7 },
  { id: 'training', name: 'Training', status: 'active', note: 6 },
  { id: 'validation', name: 'Validation', status: 'active', note: 8 },
  
  // Agentes Planejados (19)
  { id: 'strategy', name: 'Strategy', status: 'planned', note: 0 },
  { id: 'operations', name: 'Operations', status: 'planned', note: 0 },
  { id: 'security', name: 'Security', status: 'planned', note: 0 },
  { id: 'legal', name: 'Legal', status: 'planned', note: 0 },
  { id: 'hr', name: 'HR', status: 'planned', note: 0 },
  { id: 'risk', name: 'Risk', status: 'planned', note: 0 },
  { id: 'compliance', name: 'Compliance', status: 'planned', note: 0 },
  { id: 'brand', name: 'Brand', status: 'planned', note: 0 },
  { id: 'communication', name: 'Communication', status: 'planned', note: 0 },
  { id: 'customer_success', name: 'Customer Success', status: 'planned', note: 0 },
  { id: 'content_strategy', name: 'Content Strategy', status: 'planned', note: 0 },
  { id: 'innovation', name: 'Innovation', status: 'planned', note: 0 },
  { id: 'debug', name: 'Debug', status: 'planned', note: 0 },
  { id: 'development', name: 'Development', status: 'planned', note: 0 },
  { id: 'partnership', name: 'Partnership', status: 'planned', note: 0 },
  { id: 'analytics', name: 'Analytics', status: 'planned', note: 0 },
  { id: 'automation', name: 'Automation', status: 'planned', note: 0 },
  { id: 'integration', name: 'Integration', status: 'planned', note: 0 },
  { id: 'optimization', name: 'Optimization', status: 'planned', note: 0 },
];
```

**Validação:**
- [ ] 30 agentes aparecem no dashboard
- [ ] Status correto (11 active, 19 planned)
- [ ] Notas exibidas corretamente
- [ ] Filtros funcionando

**Tempo Estimado:** 30 minutos

---

### FASE 4: INTEGRAÇÃO SQUAD MATRIX 🎯
**Objetivo:** Adicionar visualização de squads paralelos

**Ações:**
1. [ ] Criar componente `SquadMatrix`
2. [ ] Adicionar página `/squads`
3. [ ] Integrar com backend squad_matrix
4. [ ] Exibir 5 workers paralelos

**Arquivo:** `src/components/squads/SquadMatrix.tsx`
```typescript
export function SquadMatrix() {
  const [workers, setWorkers] = useState([]);
  
  useEffect(() => {
    // Fetch squad matrix status
    fetch('/api/squad-matrix/status')
      .then(res => res.json())
      .then(data => setWorkers(data.workers));
  }, []);
  
  return (
    <div className="grid grid-cols-5 gap-4">
      {workers.map(worker => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}
```

**Validação:**
- [ ] Componente SquadMatrix renderiza
- [ ] 5 workers exibidos
- [ ] Status em tempo real
- [ ] Logs de execução visíveis

**Tempo Estimado:** 45 minutos

---

### FASE 5: ESTRATÉGIA OPENROUTER MULTI-KEY 🔑
**Objetivo:** Visualizar roteamento de API keys

**Ações:**
1. [ ] Criar componente `ApiKeyRouter`
2. [ ] Exibir 6 keys (1 paga + 5 gratuitas)
3. [ ] Mostrar estratégia de roteamento
4. [ ] Métricas de uso por key

**Arquivo:** `src/components/settings/ApiKeyRouter.tsx`
```typescript
export function ApiKeyRouter() {
  const keys = [
    { id: 'main', type: 'paid', model: 'Claude 3.5 Sonnet', usage: 45 },
    { id: 'free1', type: 'free', model: 'Gemini Flash', usage: 120 },
    { id: 'free2', type: 'free', model: 'Llama 3.3', usage: 98 },
    { id: 'free3', type: 'free', model: 'DeepSeek R1', usage: 87 },
    { id: 'free4', type: 'free', model: 'Gemini Flash', usage: 110 },
    { id: 'free5', type: 'free', model: 'Llama 3.3', usage: 95 },
  ];
  
  return (
    <div className="space-y-4">
      <h2>Estratégia de Roteamento</h2>
      {keys.map(key => (
        <KeyCard key={key.id} keyData={key} />
      ))}
    </div>
  );
}
```

**Validação:**
- [ ] 6 keys exibidas
- [ ] Tipo correto (paid/free)
- [ ] Uso em tempo real
- [ ] Estratégia de round-robin visível

**Tempo Estimado:** 30 minutos

---

### FASE 6: MÉTRICAS DE HOLDING AUTÔNOMA 💰
**Objetivo:** Dashboard executivo com métricas financeiras

**Ações:**
1. [ ] Criar componente `HoldingDashboard`
2. [ ] Exibir receita atual vs meta
3. [ ] Mostrar subsidiárias ativas
4. [ ] Gráfico de crescimento

**Arquivo:** `src/components/dashboard/HoldingDashboard.tsx`
```typescript
export function HoldingDashboard() {
  const metrics = {
    revenueActual: 0,
    revenueTarget2026: 500000,
    revenueTarget2030: 1000000000,
    subsidiariesActive: 0,
    subsidiariesPlanned: 5,
    pcsManaged: 3,
    autonomyLevel: 95,
  };
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard title="Receita 2026" value={metrics.revenueActual} target={metrics.revenueTarget2026} />
      <MetricCard title="Subsidiárias" value={metrics.subsidiariesActive} target={metrics.subsidiariesPlanned} />
      <MetricCard title="PCs Gerenciadas" value={metrics.pcsManaged} />
      <MetricCard title="Autonomia" value={`${metrics.autonomyLevel}%`} />
    </div>
  );
}
```

**Validação:**
- [ ] Métricas financeiras exibidas
- [ ] Progresso visual (progress bars)
- [ ] Metas 2026 e 2030 visíveis
- [ ] Atualização em tempo real

**Tempo Estimado:** 40 minutos

---

### FASE 7: INTEGRAÇÃO AIDER TERMINAL 🎼
**Objetivo:** Visualizar protocolos de convivência Aider/Qwen

**Ações:**
1. [ ] Criar componente `AiderIntegration`
2. [ ] Exibir últimos commits Aider
3. [ ] Mostrar handoffs Aider → Qwen
4. [ ] Matriz de decisão CLI

**Arquivo:** `src/components/cli/AiderIntegration.tsx`
```typescript
export function AiderIntegration() {
  const [commits, setCommits] = useState([]);
  const [handoffs, setHandoffs] = useState([]);
  
  useEffect(() => {
    // Fetch Aider commits
    fetch('/api/cli/aider/commits')
      .then(res => res.json())
      .then(data => setCommits(data));
      
    // Fetch handoffs
    fetch('/api/cli/handoffs')
      .then(res => res.json())
      .then(data => setHandoffs(data));
  }, []);
  
  return (
    <div className="space-y-6">
      <section>
        <h3>Últimos Commits Aider</h3>
        {commits.map(commit => (
          <CommitCard key={commit.hash} commit={commit} />
        ))}
      </section>
      
      <section>
        <h3>Handoffs Aider → Qwen</h3>
        {handoffs.map(handoff => (
          <HandoffCard key={handoff.id} handoff={handoff} />
        ))}
      </section>
    </div>
  );
}
```

**Validação:**
- [ ] Commits Aider exibidos
- [ ] Handoffs rastreados
- [ ] Matriz de decisão visível
- [ ] Logs em tempo real

**Tempo Estimado:** 35 minutos

---

### FASE 8: BACKEND CUSTOMIZADO (50+ ENDPOINTS) 🔌
**Objetivo:** Conectar dashboard aos endpoints customizados

**Ações:**
1. [ ] Atualizar `src/lib/api.ts` com novos endpoints
2. [ ] Criar hooks para GAIA, FORGE, DAEMON, Córtex
3. [ ] Integrar com L.L.B. Protocol
4. [ ] Adicionar suporte a MCP

**Arquivo:** `src/lib/api.ts`
```typescript
export const API_ENDPOINTS = {
  // GAIA Kernel
  gaia: {
    dna: '/api/gaia/dna',
    vaccines: '/api/gaia/vaccines',
    evolution: '/api/gaia/evolution',
  },
  
  // FORGE Kernel
  forge: {
    llmUsage: '/api/forge/llm/usage',
    mcps: '/api/forge/mcps',
    workflows: '/api/forge/workflows',
    tools: '/api/forge/tools',
  },
  
  // DAEMON Kernel
  daemon: {
    status: '/api/daemon/status',
    dashboard: '/api/daemon/dashboard',
    analytics: '/api/daemon/analytics',
    rules: '/api/daemon/rules',
  },
  
  // Córtex de Fluxos
  cortex: {
    flows: '/api/cortex/flows',
    executions: '/api/cortex/flows/:flowId/executions',
    painTasks: '/api/cortex/pain-tasks',
  },
  
  // L.L.B. Protocol
  llb: {
    status: '/api/llb/status',
    letta: '/api/llb/letta/state',
    langmem: '/api/llb/langmem/wisdom',
    byterover: '/api/llb/byterover/timeline',
  },
};
```

**Validação:**
- [ ] Todos endpoints conectados
- [ ] Hooks funcionando
- [ ] Dados carregando corretamente
- [ ] Erros tratados

**Tempo Estimado:** 60 minutos

---

### FASE 9: UI/UX REFINAMENTO 🎨
**Objetivo:** Manter design original, adicionar branding Diana

**Ações:**
1. [ ] Atualizar logo e nome da empresa
2. [ ] Adicionar cores da marca (se houver)
3. [ ] Customizar sidebar com seções Diana
4. [ ] Adicionar footer com informações

**Arquivo:** `src/app/layout.tsx`
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Diana Corporação Senciente - Painel Admin</title>
      </head>
      <body>
        <Sidebar>
          <Logo src="/diana-logo.svg" />
          <NavItem href="/" icon={Home}>Dashboard</NavItem>
          <NavItem href="/agents" icon={Users}>Agentes (30)</NavItem>
          <NavItem href="/squads" icon={Grid}>Squad Matrix</NavItem>
          <NavItem href="/holding" icon={Building}>Holding</NavItem>
          <NavItem href="/finance" icon={DollarSign}>Finanças</NavItem>
          <NavItem href="/cli" icon={Terminal}>Aider/Qwen</NavItem>
          <NavItem href="/settings" icon={Settings}>Configurações</NavItem>
        </Sidebar>
        <main>{children}</main>
        <Footer>
          <p>Diana Corporação Senciente © 2026</p>
          <p>Autonomia: 95% | Receita Meta 2026: R$ 500K</p>
        </Footer>
      </body>
    </html>
  );
}
```

**Validação:**
- [ ] Logo Diana exibido
- [ ] Sidebar customizada
- [ ] Footer com informações
- [ ] Responsividade mantida

**Tempo Estimado:** 25 minutos

---

### FASE 10: TESTES E VALIDAÇÃO FINAL ✅
**Objetivo:** Garantir que tudo funciona perfeitamente

**Ações:**
1. [ ] Testar todos os componentes
2. [ ] Validar integração com backend
3. [ ] Verificar performance
4. [ ] Documentar mudanças

**Checklist de Validação:**
- [ ] 30 agentes exibidos corretamente
- [ ] Squad Matrix funcionando
- [ ] Métricas de holding atualizando
- [ ] API keys roteando corretamente
- [ ] Integração Aider rastreando commits
- [ ] Backend customizado conectado
- [ ] UI/UX mantida
- [ ] Performance aceitável (<3s load time)
- [ ] Sem erros no console
- [ ] Documentação completa

**Tempo Estimado:** 45 minutos

---

## 📊 RESUMO DO PLANO

### Tempo Total Estimado
**5 horas e 25 minutos** (dividido em 10 fases)

### Fases Críticas
1. ⚠️ **FASE 2** - Configuração de ambiente (requer API keys)
2. ⚠️ **FASE 8** - Backend customizado (requer backend rodando)
3. ⚠️ **FASE 10** - Validação final (crítica para sucesso)

### Dependências
- ✅ Backend Diana rodando em `localhost:3001`
- ✅ API keys OpenRouter configuradas
- ✅ Node.js 18+ instalado
- ✅ Git configurado

### Riscos Identificados
1. **Conflito de portas** - Backend e dashboard na mesma porta
   - Solução: Dashboard em 3002, backend em 3001
   
2. **API keys inválidas** - Keys expiradas ou sem crédito
   - Solução: Validar keys antes de iniciar
   
3. **Backend não respondendo** - Endpoints customizados offline
   - Solução: Iniciar backend antes de testar dashboard

---

## 🎯 PRÓXIMOS PASSOS

### Aguardando Aprovação Humana
⏸️ **PAUSADO** - Aguardando decisão do Corporate Will para prosseguir

### Após Aprovação
1. ✅ Executar FASE 1 (Backup)
2. ✅ Executar FASE 2 (Configuração)
3. ✅ Executar FASE 3-9 (Customização)
4. ✅ Executar FASE 10 (Validação)
5. ✅ Atualizar .cli_state.json
6. ✅ Criar documentação final

---

## 📝 LOGGING E AUDITORIA

### Formato de Commits
```
AI: [Kiro] [Dashboard] Fase X - Descrição
```

### Arquivo de Estado
`.cli_state.json` será atualizado após cada fase com:
- Timestamp
- Fase completada
- Arquivos modificados
- Validações passadas
- Próxima fase

### Documentação Final
Após conclusão, será criado:
- `DASHBOARD_CUSTOMIZADO_DIANA.md` - Guia completo
- `VALIDACAO_DASHBOARD_DIANA.md` - Relatório de validação
- `CHANGELOG_DASHBOARD.md` - Histórico de mudanças

---

**Status Atual:** ⏸️ AGUARDANDO APROVAÇÃO HUMANA  
**Criado por:** Kiro AI Assistant  
**Data:** 02/02/2026 23:45 UTC  
**Versão:** 1.0
