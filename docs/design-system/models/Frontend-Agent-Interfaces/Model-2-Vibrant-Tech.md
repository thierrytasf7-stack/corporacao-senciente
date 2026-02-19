# Model-2-Vibrant-Tech: Interface de Agentes (Agent UI)

## 1. TECHNICAL SPECIFICATION (The Assistant)

### 1.1 Conversational Bridge
- **Chat Bubbles:** Radius 12px. Agent (Green/Black), User (Gray 800/White).
- **Typing Indicator:** Três pontos pulsantes com delay de 100ms entre eles.

### 1.2 Cognitive Feedback
- **Icons:** Duotone de robótica/IA.
- **Think State:** Card com borda tracejada em verde vibrante durante o processamento.

## 2. IMPLEMENTATION GUIDE (React / Tailwind)

```jsx
const AgentBubble = ({ message }) => {
  return (
    <div className="flex gap-4 p-4 bg-neutral-800 border-l-4 border-vibrant rounded-r-xl">
      <div className="w-8 h-8 rounded bg-vibrant/20 flex items-center justify-center">
        <AIIcon className="text-vibrant" />
      </div>
      <p className="font-body text-white leading-relaxed">{message}</p>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use avatares fofos ou amigáveis demais; o tom é Inovação Técnica/Corporativo.
- **REGRA 2:** Respostas longas devem ter sistema de markdown limpo com Montserrat nos títulos.
- **REGRA 3:** O chat deve permitir scroll suave e automático para o fim da mensagem.

## 4. COMPLIANCE CHECKLIST
- [ ] O chat diferencia visualmente o Agente do Usuário usando a paleta primária?
- [ ] O espaçamento interno das bolhas de chat é múltiplo de 8px?

---
*Eutaxia: Intelligence is communicated through clarity.*
