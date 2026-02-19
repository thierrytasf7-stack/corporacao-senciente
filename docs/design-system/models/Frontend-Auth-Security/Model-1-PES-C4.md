# Model-1-PES-C4: Portal de Acesso (Auth & Security)

## 1. TECHNICAL SPECIFICATION (Identity Sync)

### 1.1 Authentication Experience
- **Concept:** O login não é uma entrada de dados, é o alinhamento de uma chave criptográfica visual.
- **Visuals:** Um Cubo de Metatron central que se monta/desmonta conforme a força da senha ou o progresso do MFA.
- **Colors:** `--color-blueprint` em standby, mudando para `--color-data` em sucesso.

### 1.2 Access Feedback
- **Error State:** Pulsação rápida em `--color-hazard`.
- **MFA Interface:** Vetores divergentes (I3) que o usuário deve alinhar ou selecionar por Menu Radial (P2).

## 2. IMPLEMENTATION GUIDE (React / Framer Motion)

```javascript
// Lógica de Montagem do Cubo de Metatron (Auth)
const MetatronLoader = ({ passwordStrength }) => {
  return (
    <motion.svg animate={{ rotate: 360 * passwordStrength }}>
      {/* Path dos vetores do Cubo de Metatron */}
    </motion.svg>
  );
};
```

## 3. GUARDRAILS (A LEI)
- **REGRA 1:** NUNCA use botões de "Esqueci minha senha" com cores chamativas. Use links sutis em `--color-blueprint`.
- **REGRA 2:** TODO campo de input deve ter `border: 0.5px solid var(--color-blueprint)` e brilhar em `--color-data` no focus.
- **REGRA 3:** O placeholder de input deve ser em JetBrains Mono (font-data) e opacidade 0.3.

## 4. COMPLIANCE CHECKLIST
- [ ] O login utiliza o termo "Sincronizar Identidade" em vez de "Entrar"?
- [ ] O Cubo de Metatron visualiza o progresso da autenticação?
- [ ] A cor Hazard é usada apenas em falha de autenticação real?

---
*Visual Arete: Security is the foundation of Trust.*
