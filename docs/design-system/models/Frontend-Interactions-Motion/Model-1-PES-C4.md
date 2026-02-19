# Model-1-PES-C4: Dinâmicas de Movimento (M3)

## 1. TECHNICAL SPECIFICATION (The Breath)

### 1.1 Easing & Timing
- **The Core Curve:** `cubic-bezier(0.23, 1, 0.32, 1)` (Out-Quint).
- **Standard Duration:** 300ms.
- **Micro-interactions:** 150ms.
- **Organic Breath (Idle):** Ciclo de 4s (In/Out) com variação de escala de 1.00 para 1.02.

### 1.2 Fractal Expansion (The P2 Origin)
- Elementos que expandem (modais, menus radiais) devem nascer do ponto de clique (`transform-origin: cursor`).
- Escala inicial: 0.8 -> 1.0.

## 2. IMPLEMENTATION GUIDE (Framer Motion / Tailwind)

```javascript
// Exemplo de Respiração Orgânica M3
const breathAnimation = {
  scale: [1, 1.02, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Exemplo de Expansão Fractal
const expandFromOrigin = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use animações de "bounce" (elásticas). O sistema é de alta especificação e inércia linear.
- **REGRA 2:** TODA animação de transição de tela DEVE durar exatamente 300ms.
- **REGRA 3:** NUNCA use `display: none` para transições; use opacidade e escala para manter a fluidez do espaço.

## 4. COMPLIANCE CHECKLIST
- [ ] Os movimentos possuem inércia perceptível (M3)?
- [ ] A curva de easing é consistente em todos os componentes?
- [ ] O Menu Radial P2 nasce do ponto de clique?

---
*Visual Arete: Motion is the heartbeat of code.*
