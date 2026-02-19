# Model-1-PES-C4: Ponte Neural (Agent UI)

## 1. TECHNICAL SPECIFICATION (The Connection)

### 1.1 Stream Chat Protocol
- **Font:** `var(--font-data)` (JetBrains Mono).
- **Color:** `--color-data` para as letras que estão surgindo.
- **Visuals:** Letras com brilho temporário (fade de 200ms) ao serem "impressas".

### 1.2 Chain of Thought (Thinking UI)
- **Toggle:** Bloco colapsável com borda `0.5px solid var(--color-blueprint)`.
- **Icon:** Hexágono em rotação lenta durante o pensamento.
- **Opacity:** O texto de pensamento deve ter 70% de opacidade para diferenciar da resposta final.

## 2. IMPLEMENTATION GUIDE (React / CSS)

```javascript
const AgentResponse = ({ text, thinkingProcess }) => {
  return (
    <div className="neural-bridge-msg">
      <ThinkingBlock process={thinkingProcess} />
      <div className="text-data text-sm leading-relaxed typing-glow">
        <StreamText value={text} speed={30} />
      </div>
      <footer className="mt-2 text-[10px] text-blueprint font-data uppercase">
        Confidence: 0.98 | Tokens: 432 | Frequency: 432Hz
      </footer>
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use animações de "digitação" baseadas em CSS (keyframes lineares). Use scripts de stream real-time para refletir a senciência.
- **REGRA 2:** NUNCA esconda o "Pensamento do Agente" permanentemente. Ele deve estar acessível para auditoria.
- **REGRA 3:** TODO chat deve ter um indicador visual de "Nível de Confiança" da resposta.

## 4. COMPLIANCE CHECKLIST
- [ ] As letras possuem o efeito de brilho temporário (typing-glow)?
- [ ] O processo de pensamento está colapsado por padrão, mas disponível?
- [ ] A fonte JetBrains Mono é usada para todo o corpo da conversa?

---
*Visual Arete: Language is the bridge between minds.*
