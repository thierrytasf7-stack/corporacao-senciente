# Model-2-Vibrant-Tech: Fluxos de Dados (Métricas)

## 1. TECHNICAL SPECIFICATION (The Charts)

### 1.1 Visual Elements
- **Lines:** Cor `--color-primary` (`#00E676`), espessura 2px.
- **Dots:** Raio de 4px, fundo branco, borda verde vibrante.
- **Axes:** Gridlines em cinza 800, labels em Raleway 10px.

### 1.2 Spacing
- Mínimo de 32px de respiro entre o gráfico e as bordas do container.

## 2. IMPLEMENTATION GUIDE (Chart.js / Tailwind)

```javascript
// Configuração de Gráfico Vibrant
const config = {
  borderColor: '#00E676',
  backgroundColor: 'rgba(0, 230, 118, 0.05)',
  pointRadius: 4,
  font: { family: 'Raleway' }
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use mais de 3 linhas de dados no mesmo gráfico para evitar poluição visual.
- **REGRA 2:** Use labels flutuantes (tooltips) com radius de 8px e fundo preto opaco.
- **REGRA 3:** Todo gráfico deve carregar com uma animação progressiva (Draw) de 500ms.

## 4. COMPLIANCE CHECKLIST
- [ ] O gráfico utiliza a paleta de verdes vibrantes?
- [ ] As fontes das labels são Raleway?

---
*Eutaxia: Data flow is the narrative of success.*
