# Model-3-PUV-DS: Grade de Rubrica (Data Management)

## 1. TECHNICAL SPECIFICATION (The 10 Criteria)

### 1.1 Rubric Grid
- **Estrutura:** Lista vertical clean ou Tabela de 2 colunas.
- **Linhas:** Altura de 48px. Borda inferior `0.5px solid rgba(255,255,255,0.05)`.
- **Coluna 1:** Nome do Critério (ex: Diferenciação) em Inter Medium 14px.
- **Coluna 2:** Nota (0-2) em Space Mono com a cor do Heatmap.

### 1.2 Criteria List
1. Clareza | 2. Diferenciação | 3. Público-Alvo | 4. Benefícios | 5. Prova Social | 6. CTA | 7. Marca | 8. Presença Digital | 9. UX | 10. Conversão.

## 2. IMPLEMENTATION GUIDE (React)

```jsx
const RubricGrid = ({ criteria }) => {
  return (
    <div className="w-full bg-surface rounded p-4 border border-white/5">
      {criteria.map((item) => (
        <div key={item.name} className="flex justify-between py-2 border-b border-white/5 last:border-0">
          <span className="font-body text-sm text-neutral-400">{item.name}</span>
          <span className="font-data text-cyber-cyan">{item.score}/2</span>
        </div>
      ))}
    </div>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use bordas pesadas ou cores de fundo vibrantes nas linhas da tabela.
- **REGRA 2:** O critério com nota 0 deve ter um indicador visual sutil em Vermelho Crítico.
- **REGRA 3:** A fonte Space Mono é obrigatória para as notas numéricas.

## 4. COMPLIANCE CHECKLIST
- [ ] Todos os 10 critérios do pipeline do Alex estão presentes?
- [ ] A tabela é legível em dispositivos mobile (WhatsApp viewer)?

---
*PUV-DS: Detail is the evidence of analysis.*
