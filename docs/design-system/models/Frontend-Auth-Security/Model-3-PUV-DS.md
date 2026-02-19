# Model-3-PUV-DS: Sincronização Executiva (Auth)

## 1. TECHNICAL SPECIFICATION (The Portal)

### 1.1 Secure Diagnostic Access
- **Visuals:** Tela minimalista Carbono. Campo de input único (URL ou ID do Cliente) com foco em Cyber Cyan.
- **Animation:** O login "expande" para o dashboard PUV (Expansão Fractal).

## 2. IMPLEMENTATION GUIDE (React)

```jsx
const AuthPortal = () => {
  return (
    <div className="flex items-center justify-center bg-carbon h-screen">
      <div className="w-80 p-8 bg-surface rounded-lg border border-white/5 shadow-2xl">
        <h2 className="font-heading text-white mb-6">PUV_ACCESS_CORE</h2>
        <input className="w-full bg-black border-white/10 p-2 font-data text-cyber-cyan" />
      </div>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use cores vivas no portal de acesso. Apenas Carbono e Cyber Cyan.
- **REGRA 2:** O botão de entrada deve ter o rótulo "INICIAR DIAGNÓSTICO".

## 4. COMPLIANCE CHECKLIST
- [ ] O portal transmite a seriedade de um sistema de auditoria fechado?

---
*PUV-DS: Access is the beginning of the insight.*
