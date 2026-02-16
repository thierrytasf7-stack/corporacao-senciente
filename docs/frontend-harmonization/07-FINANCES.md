# 🏛️ Harmonização Frontend: FINANCES
**Rota:** `/finances` | **Componente:** `src/pages/Finances/Finances.tsx`

Este documento consolida a análise técnica e funcional para a harmonização da aba **Finanças**.

---

## 1. 🧱 Data Engineering (Schema & Dados)
**Estado Atual:**
Frontend realiza cálculos críticos de negócio (`burnRate + llmCosts`, `roi`) o que é inseguro e propenso a inconsistências.
Dados vêm de duas fontes: `useForge` (LLM) e `api.metrics`.

### Schema Proposto (Consolidado)
Endpoint `/api/finance/overview` deve retornar tudo pré-calculado.
```typescript
interface FinanceOverviewDTO {
  balance: {
    amount: string;     // "25000.50" (Decimal string)
    currency: 'USD' | 'BRL';
    trend: 'up' | 'down' | 'stable';
  };
  costs: {
    burn_rate_fixed: string;
    llm_consumption_month: string;
    llm_consumption_today: string;
    total_monthly_projected: string; // Soma feita no backend
  };
  metrics: {
    roi_percentage: number;
    runway_months: number;
  };
}
```
**Ação:** Migrar cálculo de ROI para o Backend Python. Garantir que custos de LLM sejam persistidos no banco e não apenas na memória do hook `useForge`.

---

## 2. 📝 Product Owner (Histórias de Usuário)

### Story 1: Transparência de Custos de Senciência
**Como** Financiador,
**Quero** saber exatamente quanto estamos gastando com APIs de IA (OpenAI/Claude),
**Para** otimizar prompts e modelos se o custo estiver alto.

**Critérios de Aceite:**
- [ ] Exibir custo do dia com 4 casas decimais.
- [ ] Exibir acumulado do mês.
- [ ] Separar "Custo Fixo" (Servidores) de "Custo Variável" (Tokens).

### Story 2: Runaway e Saúde Financeira
**Como** CEO,
**Quero** ver meu ROI e Saldo atualizado,
**Para** saber se a empresa é sustentável.

---

## 3. 🎨 Product Manager (Design Atômico)

### Componentes
-   **FinancialCard:** Similar ao MetricCard, mas com suporte a formatação de moeda e cor condicional (Vermelho para prejuízo/gasto, Verde para lucro).
-   **CostBreakdown:** Seção específica para detalhar custos de infra vs IA.

**Instrução:**
-   Padronizar `StatCardComponent` com o resto do sistema.
-   Adicionar gráficos de barras para "Custos por Dia" (futuro).

---

## 4. 🛠️ Developer (Instruções Técnicas)

1.  **Refatoração:** Remover lógica de soma `burnRate + llmCosts`. Se um dos valores for `null` ou `undefined`, o JS pode retornar `NaN` ou resultado errado. Fazer essa soma de forma segura ou receber pronta.
2.  **Formatação:** Usar `Intl.NumberFormat` para garantir formatação correta de moeda ($ ou R$) baseada na locale do usuário, em vez de template string `$${value}`.
3.  **Hooks:** O hook `useForge` parece trazer muitas coisas (`metrics`, `llmCosts`). Verificar se ele não está disparando re-renders excessivos.

---

## 5. 🖌️ UX Design (Refinamento)

-   **Cores Semânticas:** O "Burn Rate" está em Roxo (`text-purple-400`). Financeiramente, custos altos costumam ser associados a cores de alerta (Laranja/Vermelho) ou Neutras. Roxo pode confundir com "Senciência". Sugiro manter Roxo para custos de IA e usar Cinza/Laranja para custos fixos.
-   **Loading:** O texto "SCANNING FINANCIAL REALITY..." é ótimo e temático. Manter.
