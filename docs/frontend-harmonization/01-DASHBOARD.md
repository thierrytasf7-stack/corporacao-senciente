# 🏛️ Harmonização Frontend: DASHBOARD
**Rota:** `/dashboard` | **Componente:** `src/pages/Dashboard/Dashboard.tsx`

Este documento consolida a análise técnica, funcional e de experiência para a harmonização da aba **Dashboard**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:** Híbrido. Tenta buscar de `api.getMainDashboardData()`, mas possui um fallback robusto com dados mockados no catch.

### Schema Atual (Identificado)
```typescript
interface DashboardData {
  system_health: {
    score: number;       // Ex: 98
    status: string;      // 'online' | 'error' | 'warning' | 'busy'
    issues: string[];    // Lista de erros críticos
  };
  infrastructure: {
    pcs_count: number;
    pcs_active: number;
    total_cpu_usage: number; // Porcentagem (0-100)
    total_memory_usage: number; // Porcentagem (0-100)
  };
  agents: {
    total: number;
    active: number;
    improved: number;
    calls_today: number;
    autonomy_percentage: number;
  };
  business: {
    revenue: {
      current: number;      // Valor monetário (Cuidado com float!)
      target_monthly: number;
      growth_rate: number;  // Porcentagem
    };
    users: { total: number; active: number; paying: number; };
  };
  last_update: string; // ISO Date
}
```

### ⚠️ Pontos de Atenção (Backend Alignment)
1.  **Revenue Type:** O Backend DEVE retornar valores monetários como strings ou inteiros (centavos) para evitar erros de ponto flutuante no JavaScript.
2.  **Status Enums:** Garantir que o enum de status (`online`, `error`...) seja compartilhado estritamente entre Front e Back.
3.  **Realtime:** O `setInterval` de 60s é aceitável para MVP, mas planejar migração para WebSocket se o requisito "Acompanhamento em Tempo Real" for estrito.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Visão Geral da Saúde Corporativa
**Como** Administrador do Sistema (Eu),
**Quero** ver os indicadores vitais (CPU, Agentes Ativos, Receita) em uma única tela assim que logo,
**Para** saber imediatamente se preciso intervir em alguma área crítica.

**Critérios de Aceite:**
- [ ] Exibir Status Global (Online/Offline) com indicador visual (Cor).
- [ ] Exibir "Areté Score" (Eficiência) com destaque.
- [ ] Mostrar erro visual claro se a API estiver desconectada (Fallback mode).
- [ ] Atualizar dados automaticamente a cada 60 segundos.

### Story 2: Monitoramento Financeiro Rápido
**Como** CFO/Gestor,
**Quero** visualizar a receita atual versus a meta mensal,
**Para** avaliar o desempenho financeiro do período sem abrir planilhas complexas.

---

## 3. 🎨 Product Manager (Design Atômico)

### Organismos Identificados
-   `MetricCardGrid`: O grid superior com 4 cartões principais.
-   `HealthPanel`: O painel central esquerdo com barras de progresso.
-   `QuickActions`: O painel lateral direito com botões de ação rápida.

### Componentes para Reuso (Design System)
-   **Atoms:** `StatusDot`, `TechLabel`, `ActionButton`.
-   **Molecules:** `MetricCard` (Icon + Label + Value + Sublabel), `HealthIndicator` (Label + ProgressBar).

**Instrução:** Extrair `MetricCard` e `HealthIndicator` que estão definidos dentro do arquivo `Dashboard.tsx` para arquivos isolados em `src/components/molecules` para uso em outras abas.

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Refatoração:** Mover `interface DashboardData` para `src/types/dashboard.ts` para ser compartilhada.
2.  **API:** Verificar implementação de `api.getMainDashboardData()`. Se não existir endpoint real, criar endpoint `/api/dashboard/main` no backend Python que retorne a estrutura JSON esperada.
3.  **Tratamento de Erro:** O fallback atual é excelente. Manter a lógica de `catch` que preenche com dados "seguros" ou de cache local para evitar tela branca.
4.  **Performance:** Adicionar `useMemo` nos cálculos derivados se houver (ex: porcentagens de crescimento).

---

## 5. 🖌️ UX Design (Refinamento)

-   **Hierarquia:** O "Areté Score" é o KPI mais exclusivo do nosso sistema. Ele deve ter uma cor distinta (ex: Dourado/Laranja) ou tamanho maior que os outros cards.
-   **Feedback de Erro:** A mensagem de "Backend desconectado" em laranja é boa, mas adicione um botão "Tentar Reconectar" manual ao lado dela.
