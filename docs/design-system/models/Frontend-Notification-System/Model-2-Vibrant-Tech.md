# Model-2-Vibrant-Tech: Ressonância de Alerta (Notifications)

## 1. TECHNICAL SPECIFICATION (The Feedback)

### 1.1 Alert System
- **Success:** Verde Vibrante (`#00E676`).
- **Error:** Vermelho Corporativo (`#FF5252`).
- **Info:** Azul Moderno (`#2196F3`).

### 1.2 Geometry
- **Toasts:** Radius de 12px, fixados no canto superior direito.
- **Banners:** 100% width no topo, fixos.

## 2. IMPLEMENTATION GUIDE (React Toastify Custom)

```jsx
const VibrantToast = ({ type, message }) => {
  return (
    <div className="bg-neutral-900 border-l-4 border-vibrant p-4 rounded-lg shadow-2xl flex items-center gap-4">
      <CheckCircleIcon className="text-vibrant" />
      <span className="font-body text-white text-sm">{message}</span>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA mostre mais de uma notificação crítica ao mesmo tempo.
- **REGRA 2:** Toasts devem ter botão de fechar (X) em duotone sempre visível.
- **REGRA 3:** Use animações de "Spring" suaves para entrada de notificações.

## 4. COMPLIANCE CHECKLIST
- [ ] O toast possui o radius de 12px?
- [ ] O sistema de cores de feedback respeita a paleta Vibrant-Tech?

---
*Eutaxia: A notification is a vibration of the system state.*
