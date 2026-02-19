# Model-3-PUV-DS: Fluxos de Calor (Métricas)

## 1. TECHNICAL SPECIFICATION (The Performance Pulse)

### 1.1 Heatmaps & Trends
- **PUV Trend:** Gráfico de linha em Cyber Cyan comparando o score atual com o benchmark de mercado.
- **Heatmap:** Grade de 10 células (Critérios) coloridas conforme a nota (0-2).

## 2. IMPLEMENTATION GUIDE (CSS Grid)

```html
<div class="grid grid-cols-5 gap-2">
  <div class="h-4 bg-puv-red rounded-sm" title="Clareza"></div>
  <div class="h-4 bg-puv-emerald rounded-sm" title="Diferenciação"></div>
  <!-- ... -->
</div>
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use cores fora da escala PUV (Red/Amber/Emerald) para métricas de rubrica.
- **REGRA 2:** Gráficos de tendência devem ser minimalistas (Sparklines).

---
*PUV-DS: Metrics validate the strategy.*
