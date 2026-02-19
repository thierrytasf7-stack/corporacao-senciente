# Model-1-PES-C4: Ressonância de Alerta (Notifications)

## 1. TECHNICAL SPECIFICATION (The Frequency)

### 1.1 Toast Hierarchy
- **Sincronia (Success):** Fundo `--color-abyss`, borda `--color-data`. Som: Chime de 432Hz.
- **Telemetria (Info):** Fundo `--color-abyss`, borda `--color-blueprint`. Som: Drone suave.
- **Interrupção (Hazard):** Fundo `--color-abyss`, borda `--color-hazard`. Som: Ressonância metálica de baixa frequência.

### 1.2 Dynamics
- **Animation:** Fade-in com Backdrop-blur (300ms).
- **Interaction:** Toasts normais desaparecem em 5s. Toasts Hazard exigem "Alinhamento de Vetor" (arraste manual para fechar).

## 2. IMPLEMENTATION GUIDE (Lucide / Framer Motion)

```javascript
const ToastResonance = ({ type, message }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-l-2 p-4 bg-abyss/80 backdrop-blur-lg shadow-lg ${
        type === 'hazard' ? 'border-hazard' : 'border-data'
      }`}
    >
      <div className="flex items-center gap-3">
        <FrequencyIcon type={type} />
        <p className="text-xs font-data">{message}</p>
      </div>
    </motion.div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA acumule mais de 3 toasts na tela. Use uma Central de Notificações para histórico.
- **REGRA 2:** NUNCA use animações de "slide" (deslizamento) laterais. Use apenas fade e scale (Expansão Fractal).
- **REGRA 3:** O som de notificação deve ser sempre em 432Hz ou harmônicos relacionados.

## 4. COMPLIANCE CHECKLIST
- [ ] A notificação possui efeito de `backdrop-blur`?
- [ ] Alertas críticos exigem interação manual para fechar?
- [ ] A cor da borda corresponde estritamente ao tipo de alerta PES-C4?

---
*Visual Arete: A notification should be an insight, not an interruption.*
