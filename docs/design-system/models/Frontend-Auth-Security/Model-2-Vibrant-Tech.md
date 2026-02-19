# Model-2-Vibrant-Tech: Sincronização de Identidade (Auth)

## 1. TECHNICAL SPECIFICATION (Modern Auth)

### 1.1 The Login Experience
- **Form Design:** Inputs com radius de 12px, foco pronunciado em Verde Vibrante com shadow glow.
- **Hero Area:** Uso de gradientes de verde vibrante a transparente sobre fundo preto.

### 1.2 Password & MFA
- **Feedback:** Validação inline imediata com micro-animações (scale up/down).
- **MFA:** Inputs de código (4-6 dígitos) individuais com foco automático.

## 2. IMPLEMENTATION GUIDE (React / Tailwind)

```jsx
const VibrantInput = ({ label, ...props }) => {
  return (
    <div className="mb-4">
      <label className="font-header text-vibrant text-xs uppercase mb-2 block">{label}</label>
      <input 
        className="w-full bg-neutral-800 border-neutral-700 rounded-xl p-3 focus:ring-2 focus:ring-vibrant focus:border-vibrant outline-none transition-all"
        {...props}
      />
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use labels dentro de inputs (placeholder only) para login crítico; a label externa é obrigatória para acessibilidade.
- **REGRA 2:** O botão principal deve ter `bg-vibrant` e `text-black` (Contraste AAA).
- **REGRA 3:** MFA deve ter timeout visual claro em Montserrat.

## 4. COMPLIANCE CHECKLIST
- [ ] O botão de login tem contraste de acessibilidade suficiente?
- [ ] O foco nos inputs é pronunciado e vibrante?

---
*Eutaxia: Entry is the first handshake of trust.*
