# Model-3-PUV-DS: Ressonância Executiva (Notifications)

## 1. TECHNICAL SPECIFICATION (Insight Alerts)

### 1.1 Alert Tones
- **Diagnostic Complete:** Toast Cyber Cyan com borda pulsante.
- **Critical Finding:** Toast Vermelho Crítico com ícone de Alerta.
- **File Generated:** Badge flutuante com link para download.

## 2. IMPLEMENTATION GUIDE (React)

```jsx
const PUVNotification = ({ message, type }) => {
  return (
    <div className="bg-surface border-b-2 border-cyber-cyan p-4 flex gap-4 animate-slide-up">
      <p className="font-data text-[10px] text-white uppercase">{message}</p>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** Notificações não devem obstruir o Gauge central do dashboard.
- **REGRA 2:** Use sons minimalistas (clicks de alta frequência) para alertas de "Diagnóstico Concluído".

---
*PUV-DS: Insights should be felt, not just seen.*
