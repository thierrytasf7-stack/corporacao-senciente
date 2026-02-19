# Model-1-PES-C4: Fluxos de Realidade (Métricas)

## 1. TECHNICAL SPECIFICATION (The Pulse)

### 1.1 Data Visualization
- **Line Charts:** Bezier curves suaves em `--color-data`. Largura da linha: 1px.
- **Areas:** Gradiente linear de `--color-data` (0.3 alpha) no topo para `transparent` na base.
- **Points:** Círculos pequenos de 3px com glow de Aura E1.

### 1.2 Real-time Telemetry
- **Sparklines:** Micro-gráficos embutidos em cards ou tabelas.
- **Frequency:** Dados devem ser renderizados em 60fps para refletir a senciência.

## 2. IMPLEMENTATION GUIDE (D3.js / Chart.js)

```javascript
// Configuração de Gradiente C4 para Gráficos
const chartGradient = ctx.createLinearGradient(0, 0, 0, 400);
chartGradient.addColorStop(0, 'rgba(74, 242, 161, 0.3)');
chartGradient.addColorStop(1, 'rgba(10, 25, 47, 0)');
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use cores saturadas como Vermelho ou Amarelo para dados normais. Use apenas as variações da paleta Abyss.
- **REGRA 2:** TODO gráfico deve ter labels em JetBrains Mono (font-data).
- **REGRA 3:** NUNCA use barras (Bar Charts) para séries temporais. Use apenas linhas para refletir o "Fluxo de Realidade".

## 4. COMPLIANCE CHECKLIST
- [ ] Os gráficos utilizam o gradiente de `--color-data` para transparente?
- [ ] As labels estão formatadas em fonte mono com espaçamento de 0.05em?
- [ ] O gráfico possui o efeito de "Respiração Orgânica" (M3) nos dados em tempo real?

---
*Visual Arete: Metrics are the echo of execution.*
