# Model-3-PUV-DS: Ponteiro de Precisão (PUV Gauge)

## 1. TECHNICAL SPECIFICATION (The Core Component)

### 1.1 PUV Gauge SVG
- **Forma:** Semi-círculo ou Círculo completo com stroke dinâmico.
- **Stroke Width:** 12px.
- **Center:** Nota central (ex: 17) em JetBrains Mono 32px.
- **Legenda:** Texto dinâmico abaixo da nota (Critical/Improving/Dominant) com a cor correspondente do Heatmap.

### 1.2 Trinity Card (Actions)
- **Layout:** 3 colunas iguais.
- **Ícones:** Checklist minimalista em Cyber Cyan.
- **Título:** "AÇÃO {N}" em Space Mono.

## 2. IMPLEMENTATION GUIDE (React / SVG)

```jsx
const PUVGauge = ({ score }) => {
  const getColor = (s) => s <= 7 ? '#FF3B30' : s <= 14 ? '#FFCC00' : '#34C759';
  return (
    <div className="flex flex-col items-center">
      <svg className="w-48 h-48 rotate-[-90deg]">
        <circle cx="96" cy="96" r="80" stroke="#161616" fill="none" strokeWidth="12" />
        <circle 
          cx="96" cy="96" r="80" stroke={getColor(score)} fill="none" 
          strokeWidth="12" strokeDasharray="502" strokeDashoffset={502 - (502 * score / 20)}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute mt-16 text-center">
        <span className="font-heading text-4xl text-white">{score}</span>
        <p className="text-[10px] uppercase text-cyber-cyan">/ 20 Points</p>
      </div>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** O Gauge DEVE ter uma animação de "preenchimento" ao carregar.
- **REGRA 2:** NUNCA use gradientes suaves entre as cores do Heatmap. A mudança de cor deve ser um degrau lógico baseado no score.
- **REGRA 3:** O componente deve ser totalmente responsivo para caber em um PDF de WhatsApp (máx 320px de largura interna).

## 4. COMPLIANCE CHECKLIST
- [ ] O Gauge reflete corretamente a cor do score (ex: 7 = Vermelho)?
- [ ] O Trinity Card exibe exatamente 3 ações conforme o pipeline do Alex?

---
*PUV-DS: The score is the verdict.*
