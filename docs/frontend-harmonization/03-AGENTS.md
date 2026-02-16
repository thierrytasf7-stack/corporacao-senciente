# 🏛️ Harmonização Frontend: AGENTS
**Rota:** `/agents` | **Componente:** `src/pages/Agents/Agents.tsx`

Este documento consolida a análise técnica e funcional para a harmonização da aba **Agentes**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
O Frontend realiza uma adaptação "na força bruta" dos dados que chegam da API:
```typescript
// Mapeamento Atual (Problemático)
calls_today: Number(a.latency || 0) // ??? Latência não é chamadas/dia
```

### Schema Correto (Proposto)
O endpoint `/api/agents` deve retornar este schema limpo, sem necessidade de map no front:
```typescript
interface AgentDTO {
  id: string;
  name: string;
  role: string;          // ex: 'Architect', 'Dev'
  status: 'active' | 'idle' | 'stopped' | 'error';
  metrics: {
    latency_ms: number;
    calls_today: number; // Dado real de contagem
    uptime_percentage: number;
  };
}
```
**Ação:** Corrigir API Python para enviar `calls_today` real e separar `latency`.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Catálogo de Agentes Vivos
**Como** Gerente de Produto,
**Quero** ver a lista de todos os agentes instanciados no sistema,
**Para** saber quais personas estão disponíveis para trabalho.

**Critérios de Aceite:**
- [ ] Listar Nome e Status (Online/Offline) de cada agente.
- [ ] Ao clicar no card, navegar para detalhes do agente (`onAgentSelect`).
- [ ] Exibir estado vazio ("Nenhum Agente Real Encontrado") amigável se a lista for vazia.

### Story 2: Métricas Rápidas por Agente
**Como** Desenvolvedor,
**Quero** ver o número de chamadas (calls) do dia no card do agente,
**Para** identificar quais agentes estão sendo mais utilizados.

---

## 3. 🎨 Product Manager (Design Atômico)

### Componentes
-   **AgentGrid:** O container dos cards.
-   **AgentCard:** O `GlassPanel` atual.
-   **EmptyState:** O componente de alerta visual quando não há dados.

**Instrução:**
-   Padronizar `StatCard` com o `MetricCard` do Dashboard. Eles são quase idênticos mas implementados 2x.
-   Criar componente `AgentAvatar` para mostrar ícone ou imagem do agente de forma consistente (hoje é hardcoded `BrainCircuit`).

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Refatoração de API:** Remover a lógica de transformação `const mappedAgents = ...` de dentro do `fetchAgentsData`. O dado deve vir pronto ou usar um Adapter Pattern em `src/adapters/agentAdapter.ts`.
2.  **Correção de Tipo:** O campo `calls_today` está recebendo `latency`. Isso é um bug lógico. Corrigir imediatamente.
3.  **Props Drilling:** Verificar quem passa `onAgentSelect`. Se estiver usando React Router, substituir por `<Link to="/agents/:id" />` para navegação nativa e acessível.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Interação:** Adicionar efeito de hover mais pronunciado (ex: brilho na borda) nos cards clicáveis.
-   **Informação Visual:** O status "active" usa um `StatusDot`. Adicionar tooltips explicando o que significa "active" vs "idle".
-   **Ícones:** Permitir que cada agente tenha um ícone personalizado (ex: Dev = Terminal, Architect = Compasso) em vez de repetir o cérebro para todos.
