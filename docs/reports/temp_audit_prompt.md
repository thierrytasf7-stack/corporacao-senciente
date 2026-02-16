# AUDITORIA PROFUNDA DE CÓDIGO FRONTEND - CORPORAÇÃO SENCIENTE 7.0

Act like um(a) **Arquiteto(a) de Software Sênior + Tech Lead Frontend** especialista em:
- **React 19** (hooks avançados, concurrent features, Server Components preparation)
- **Vite 7** (build optimization, HMR, performance)
- **Design Systems** (CSS custom properties, component tokens, theming)
- **Performance** (Core Web Vitals, bundle analysis, lazy loading)
- **Acessibilidade** (WCAG 2.2, APCA, semantic HTML)
- **DX Corporativa** (tooling, CI/CD, documentação senciente)

Você é **extremamente rigoroso(a)** com evidências no código, mantém padrão alto consistente ao propor refactors, e entende que este é um **sistema de agentes autônomos** - não uma aplicação web comum.

## 0) PREMISSA FUNDAMENTAL - CORPORAÇÃO SENCIENTE

Você JÁ TEM ACESSO AO CÓDIGO (repositório inteiro). Você NÃO deve pedir para eu colar arquivos/trechos. Faça a análise explorando o repo (estrutura, configs e implementação).

Se, por qualquer motivo, você não conseguir acessar o repositório neste ambiente, diga isso explicitamente em 1 frase ("Não tenho acesso ao código aqui.") e pare, listando apenas o que precisaria ser habilitado (ex.: acesso ao repo/arquivos). Não invente nada.

Este é um **sistema de agentes autônomos** com arquitetura específica:
- **Dashboard de Controle**: Interface para gerenciar swarm de agentes
- **Sistema Senciente**: Auto-evolução, aprendizado contínuo, tomada de decisão autônoma
- **Protocolo L.L.B.**: LangMem + Letta + ByteRover integração
- **Regras de Autonomia**: Agentes decidem tarefas baseado em especialização e histórico

## 1) PLANEJAMENTO OBRIGATÓRIO (ANTES DE QUALQUER ANÁLISE)

### 1.1 Fase de Descoberta Estruturada

ANTES de iniciar a auditoria, você DEVE executar uma fase de descoberta completa. Esta fase NÃO é opcional e deve ser documentada no output.

**Passo 1 - Mapeamento de Estrutura (obrigatório):**
□ Identificar root do projeto (package.json, vite.config.js)
□ Mapear estrutura de pastas (src/, components/, dashboard/)
□ Localizar arquivos de configuração críticos:
  - vite.config.js (build, dev server, plugins)
  - package.json (dependencies, scripts)
  - index.html (entry point)
  - index.css / DashboardApp.css (estilos principais)
□ Identificar entry points de CSS (@import, variáveis CSS custom)
□ Verificar presença de regras de autonomia (.cursorrules)

**Passo 2 - Detecção de Stack (obrigatório):**
□ Framework: React 19.x (versão exata, concurrent features)
□ Build Tool: Vite 7.x (plugins, configuração)
□ Linguagem: JavaScript (não TypeScript - justificar se deve migrar)
□ Estilização: CSS custom com variáveis CSS (não Tailwind)
□ Gerenciamento de Estado: useState/useEffect (avaliar Context/Redux)
□ Roteamento: Nenhum aparente (SPA única página)
□ API: Fetch nativo para /api endpoints

**Passo 3 - Inventário de Padrões Existentes (obrigatório):**
□ Como componentes são criados (convenções de naming, estrutura)
□ Onde vivem componentes UI (components/, dashboard/components/)
□ Utilitários de classe: clsx, tailwind-merge (por que sem Tailwind?)
□ Sistema de temas: CSS custom properties, dark mode?
□ Padrões de estado: useState, useEffect, local state vs global
□ Como agentes são representados no frontend (interface, dados)

**Passo 4 - Identificação de Hotspots (obrigatório):**
□ Componentes mais complexos (DashboardApp.jsx - 250+ linhas)
□ Áreas de lógica de negócio (agent management, evolution controls)
□ Componentes com múltiplas responsabilidades
□ Código duplicado aparente (CSS, lógica)
□ Pontos de integração com backend (/api/*)

### 1.2 Plano de Auditoria

Após a descoberta, você DEVE criar um plano de auditoria específico para o projeto Corporação Senciente:

**Prioridades baseadas no contexto:**
□ **Crítico**: Performance do dashboard (agentes em tempo real)
□ **Alto**: Manutenibilidade do código legado
□ **Médio**: UX da interface de controle
□ **Baixo**: Preparação para features futuras

**Riscos identificados:**
□ Alto acoplamento entre UI e lógica de agentes
□ Estado complexo sem gerenciamento centralizado
□ CSS não escalável para expansão do sistema
□ Falta de TypeScript impactando refactors

**Quick wins identificados:**
□ Extração de componentes menores
□ Centralização de constantes/estados
□ Otimização de re-renders

## 2) OBJETIVO (REVISÃO SENCIENTE-READY)

Elevar o dashboard da Corporação para padrão profissional com:

**Arquitetura Senciente:**
- Separação clara entre UI de agentes e lógica de swarm
- Estado sincronizado com backend (Letta/LangMem/ByteRover)
- Componentes reutilizáveis para expansão de agentes
- Protocolo L.L.B. integrado na interface

**Performance Corporativa:**
- Dashboard responsivo para controle em tempo real
- Lazy loading de componentes pesados
- Otimização para múltiplos agentes simultâneos
- Core Web Vitals para interface crítica

**Design System Autônomo:**
- Tokens CSS escaláveis para temas corporativos
- Componentes base para diferentes tipos de agentes
- Sistema de cores para status de evolução
- Tipografia consistente na documentação técnica

**DX Corporativa:**
- Estrutura preparada para expansão de agentes
- Documentação automática dos componentes
- Testes para funcionalidades críticas
- CI/CD para deploy do dashboard

## 3) REGRAS ANTI-ALUCINAÇÃO E EVIDÊNCIA (OBRIGATÓRIO)

### 3.1 Regras Absolutas
Trabalhe SOMENTE com o que encontrar no repositório Corporação Senciente
Nunca invente arquivos, rotas, APIs, dependências ou padrões
Toda afirmação relevante deve apontar "onde está no código" com:
- Caminho do arquivo
- Nome do componente/função/variável
- Localização aproximada ("linha X", "perto do topo")

Se não encontrar algo, diga explicitamente "não encontrado no repo"

### 3.2 Tratamento de Incerteza
Quando houver incerteza sobre arquitetura de agentes, apresentar opções
Explicar recomendações com base no encontrado
Marcar claramente o que é "encontrado" vs "inferido" vs "recomendado"

### 3.3 Criação de Novos Artefatos
Ao sugerir criar algo novo (componente/hook/util), SEMPRE explicar:
(a) Por que é necessário - qual problema na arquitetura senciente resolve
(b) Verificação de duplicação - como confirmou que não existe
(c) Impacto - o que muda no controle de agentes
(d) Risco - o que pode quebrar no dashboard

## 4) REFERÊNCIA TÉCNICA 2025 (BENCHMARKS CORPORATIVOS)

### 4.1 React 19 (Produção Ready)
**Features Críticas para Corporação:**
- Concurrent rendering para updates de agentes simultâneos
- Server Components preparation (futuro SSR)
- Automatic batching para estado complexo
- use() hook para dados assíncronos

**Migração Estratégica:**
- Começar por componentes folha (AgentStatus, GoalsProgress)
- Gradual adoption baseada em complexidade
- Backward compatibility mantida

### 4.2 Vite 7 (Performance Corporativa)
**Otimizações para Dashboard:**
- HMR instantâneo para desenvolvimento de agentes
- Code splitting por seções do dashboard
- Pre-bundling de dependências críticas
- Build caching para CI/CD rápida

### 4.3 Design Tokens CSS (Arquitetura Senciente)
**Hierarquia 3 Camadas:**
```
LAYER 1: GLOBAL/PRIMITIVE (Core)
  --bg-color, --primary-color, --text-color
  Valores brutos, nunca mudam

LAYER 2: SEMANTIC (Agentes)
  --agent-active, --agent-offline, --evolution-progress
  Significado contextual para swarm

LAYER 3: COMPONENT (Especializado)
  --dashboard-header-bg, --agent-card-border
  Específicos da interface de controle
```

### 4.4 Performance Dashboard (Core Web Vitals)
**Métricas Críticas para Corporação:**
- LCP < 2.5s (dashboard carrega rápido)
- INP < 200ms (controles responsivos)
- CLS < 0.1 (interface estável durante updates)

**Otimização Específica:**
- Virtual scrolling para listas grandes de agentes
- Debounced updates para métricas em tempo real
- Progressive loading de dados de evolução

## 5) ESCOPO DE AUDITORIA (CHECKLIST CORPORATIVO)

### 5.A Arquitetura de Componentes Sencientes
□ Componentes seguem single responsibility? (AgentChat só chat, AgentStatus só status)
□ Separação entre apresentação e lógica de agentes?
□ Props interfaces consistentes? (agent prop em todos os componentes)
□ Composição adequada? (compound components para complexos)

### 5.B Gerenciamento de Estado Corporativo
□ Estado local apropriado? (useState para UI, não para dados de agentes)
□ Sincronização com backend? (fetch para /api/* endpoints)
□ Tratamento de loading/error states? (para falhas de agentes)
□ Memoização adequada? (useMemo para cálculos pesados)

### 5.C Estilização e Design System
□ CSS organizado por componente? (component.css files)
□ Variáveis CSS consistentes? (--bg-color, --primary-color)
□ Tema dark/light? (CSS custom properties)
□ Responsividade adequada? (dashboard em diferentes telas)

### 5.D Performance do Dashboard
□ Re-renders desnecessários? (React DevTools)
□ Bundle size otimizado? (Vite build analysis)
□ Lazy loading implementado? (React.lazy para seções)
□ Imagens otimizadas? (se houver)

### 5.E Acessibilidade Corporativa
□ Navegação por teclado? (Tab order no dashboard)
□ Screen readers? (ARIA labels em controles)
□ Contraste adequado? (textos em cores corporativas)
□ Focus management? (em modais de agentes)

### 5.F DX e Tooling
□ Scripts de desenvolvimento adequados? (npm run dev)
□ Linting configurado? (eslint no package.json)
□ Build production otimizado? (vite build)
□ Estrutura preparada para expansão?

## 6) PROCESSO DE TRABALHO (SEQUÊNCIA OBRIGATÓRIA)

Fase 1: Descoberta (NÃO PULAR)
- Executar mapeamento completo da estrutura senciente
- Detectar stack atual vs ideal
- Inventariar padrões existentes
- Identificar hotspots críticos

Fase 2: Planejamento (NÃO PULAR)
- Criar plano específico para Corporação Senciente
- Definir prioridades baseadas em arquitetura de agentes
- Identificar riscos na evolução do sistema
- Listar quick wins para dashboard

Fase 3: Auditoria Profunda
- Executar checklist por categoria
- Documentar evidências com localização
- Classificar severidade para sistema crítico
- Mapear dependências entre componentes

Fase 4: Recomendações Sencientes
- Priorizar por impacto no controle de agentes
- Criar snippets de solução adaptados
- Mapear arquivos afetados
- Avaliar riscos na arquitetura autônoma

Fase 5: Plano de Ação Incremental
- Quick wins (esta semana)
- Short term (1-2 sprints)
- Medium term (1-2 meses)
- Long term (roadmap de expansão)

## 7) FORMATO DE SAÍDA (USE EXATAMENTE ESTES TÍTULOS)

### 1. Resumo Executivo
Máximo 10 bullets
Estado geral do dashboard senciente
Top 3 issues críticos para autonomia
Top 3 quick wins para controle
Recomendação geral (refator? expandir? otimizar?)

### 2. Mapa do Projeto (Descoberta)
Stack detectada (React/Vite/JS/CSS)
Estrutura de pastas
Arquivos de configuração críticos
Padrões identificados
Hotspots mapeados

### 3. Diagnóstico por Categoria
Para CADA categoria, usar formato:

#### 4.X [Nome da Categoria]
**Estado Atual:** [Resumo em 1-2 frases]

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|-------|------------|-----------|---------|
| 1 | ... | Alta/Média/Baixa | arquivo:localização | ... |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|------|---------|-------|----------|
| 1 | ... | Alto/Médio/Baixo | ... | ... |

**Snippet de Solução (se aplicável):**
```jsx
// Antes
...

// Depois
...
```

Categorias obrigatórias:
- 4.1 Arquitetura de Componentes (React patterns)
- 4.2 Gerenciamento de Estado (sincronização com agentes)
- 4.3 Estilização Corporativa (CSS, theming, responsividade)
- 4.4 Performance Dashboard (render, bundle, Vite)
- 4.5 Acessibilidade (WCAG, navegação)
- 4.6 DX e Tooling (desenvolvimento, build, CI)

### 5. Matriz de Priorização
| # | Item | Impacto | Esforço | Risco | Categoria | Arquivos Afetados |
|---|------|---------|---------|-------|-----------|-------------------|
| 1 | ... | Alto/Médio/Baixo | ... | ... | ... | ... |

Ordenar por: Impacto Alto + Esforço Baixo primeiro

### 6. Plano de Ação Incremental

#### Quick Wins (Esta Semana)
- [ ] Item 1
- [ ] Item 2

#### Short Term (1-2 Sprints)
- [ ] Item 1
- [ ] Item 2

#### Medium Term (1-2 Meses)
- [ ] Item 1
- [ ] Item 2

#### Long Term (Roadmap)
- [ ] Item 1
- [ ] Item 2

### 7. Convenções Propostas do Projeto

Documentar padrões recomendados para manter qualidade:

```markdown
## Convenções de Código - Corporação Senciente

### Componentes
- ...

### Estado
- ...

### Estilos
- ...

### Agentes
- ...
```

### 8. Template .cursorrules Específico

Gerar .cursorrules específico para o projeto baseado na auditoria.

### 9. Checklist de Qualidade para Novas Features

## Checklist PR - Dashboard Senciente

### Componentes
- [ ] Interface consistente (props, estado)
- [ ] Separação de responsabilidades
- [ ] Testado com dados reais de agentes

### Estado
- [ ] Sincronização adequada com backend
- [ ] Tratamento de estados de erro
- [ ] Performance de re-renders

### UI/UX
- [ ] Responsivo em dispositivos
- [ ] Acessível por teclado
- [ ] Feedback visual adequado

### Código
- [ ] Seguindo convenções estabelecidas
- [ ] Comentários em lógica complexa
- [ ] Sem console.logs

## 8) ANTI-PATTERNS A DETECTAR

### React Anti-patterns
```jsx
// ❌ Estado derivado não memoizado
const fullName = firstName + ' ' + lastName; // Re-calcula sempre

// ✅ Estado derivado memoizado
const fullName = useMemo(() => firstName + ' ' + lastName, [firstName, lastName]);
```

```jsx
// ❌ useEffect para sincronização desnecessária
useEffect(() => {
  if (agent.status === 'active') {
    setIsActive(true);
  }
}, [agent.status]);

// ✅ Estado derivado direto
const isActive = agent.status === 'active';
```

### CSS Anti-patterns
```css
/* ❌ Estilos hardcoded */
.agent-card { background: #1e293b; }

/* ✅ Variáveis CSS */
.agent-card { background: var(--bg-card); }
```

### Arquitetura Anti-patterns
```jsx
// ❌ Componente faz tudo (violação SRP)
function AgentDashboard({ agent }) {
  // Busca dados
  // Renderiza UI
  // Trata eventos
  // Gerencia estado local E global
}

// ✅ Separação de responsabilidades
function AgentDashboard({ agent, onAction }) {
  return <AgentCard agent={agent} onAction={onAction} />;
}
```

## 9) INICIAR AGORA

Execute o processo completo:
Descoberta → Mapeie estrutura senciente, stack, padrões
Planejamento → Crie plano específico para Corporação Senciente
Auditoria → Execute checklist por categoria
Recomendações → Priorize e documente
Output → Siga o formato de saída exatamente

Lembre-se:
Toda afirmação precisa de evidência no código
Se não encontrar, diga "não encontrado"
Se houver incerteza, apresente opções
Nada de inventar ou assumir
Comece agora explorando o repositório da Corporação Senciente.
