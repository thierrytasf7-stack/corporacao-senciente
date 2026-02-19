# Model-2-Vibrant-Tech: Widgets de Status (ScoreCards)

## 1. TECHNICAL SPECIFICATION (The Widget)

### 1.1 Card Design
- **Background:** `--color-surface` (Cinza 800).
- **Radius:** 12px.
- **Icon:** Duotone Verde Vibrante à esquerda.
- **Typography:** Value em Montserrat 24px, Label em Raleway 12px.

### 1.2 Interactive Shadow
- **Shadow:** Elevation 1 (Sutil) no repouso, Elevation 2 no hover.

## 2. IMPLEMENTATION GUIDE (React Card)

```jsx
const ScoreCard = ({ label, value, trend }) => {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 hover:border-vibrant transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-vibrant/10 flex items-center justify-center">
          <Icon className="text-vibrant" />
        </div>
        <div>
          <p className="font-body text-xs text-neutral-400 uppercase">{label}</p>
          <p className="font-header text-2xl text-white">{value}</p>
        </div>
      </div>
      {trend && <TrendLine data={trend} />}
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use bordas pretas de 1px. Use bordas de 0.5px ou 1px em cinzas suaves.
- **REGRA 2:** Os ícones devem ser estritamente do sistema Duotone.
- **REGRA 3:** O valor principal deve ser sempre Montserrat para transmitir autoridade.

## 4. COMPLIANCE CHECKLIST
- [ ] O card possui hover que destaca a borda em verde vibrante?
- [ ] A fonte do valor é Montserrat?

---
*Eutaxia: Every card is a window to reality.*
