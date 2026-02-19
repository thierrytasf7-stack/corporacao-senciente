# Model-2-Vibrant-Tech: Dashboards de Alta Densidade (Dashboards)

## 1. TECHNICAL SPECIFICATION (The Minimalist Grid)

### 1.1 Layout Structure
- **12-Column Desktop Grid** com 24px de gap.
- **Containers:** Radius de 16px, background `--color-surface`.
- **Headers:** Montserrat Bold 1.25 scale.

### 1.2 Data Elements
- **Line Charts:** Verde Vibrante (`#00E676`) com espessura de 2px.
- **Bar Charts:** Colunas com cantos superiores arredondados (4px).

## 2. IMPLEMENTATION GUIDE (React Card Component)

```jsx
const DashboardCard = ({ title, children }) => {
  return (
    <div className="bg-neutral-800 rounded-vibrant p-6 border border-neutral-700/50 shadow-soft">
      <h3 className="font-header text-xl text-vibrant mb-4 uppercase tracking-tight">{title}</h3>
      <div className="w-full h-48">
        {children}
      </div>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use gradientes de arco-íris. Use tons de verde e cinza para manter o minimalismo.
- **REGRA 2:** A densidade de dados deve ser alta, mas o espaço em branco (padding 24px) é sagrado.
- **REGRA 3:** Todo gráfico deve ter uma versão acessível via tabela oculta para screen readers.

## 4. COMPLIANCE CHECKLIST
- [ ] O card possui o radius de 16px estabelecido?
- [ ] O título usa a fonte Montserrat em caixa alta?
- [ ] O espaçamento interno é múltiplo de 8px?

---
*Eutaxia: Order in data is power in decision.*
