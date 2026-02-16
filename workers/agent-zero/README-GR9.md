# GR9 Quick Reference

**Auto-Retry Always** - Quando falha, retry automático sem perguntar.

## Usage

```bash
# Com auto-retry embutido
node workers/agent-zero/execute-with-auto-retry.js --file task.json

# CEO-ZERO aplica automaticamente
/CEOs:CEO-ZERO auditar fullstack betting
# Retries internos automáticos, usuário só vê resultado final
```

## Estratégia

1. **Retry 1:** +5 iterations
2. **Retry 2:** Simplify prompt (1 critério)
3. **Retry 3:** Cascade model (Mistral)
4. **Retry 4:** Decompose (GR7)
5. **Retry 5+:** Report failure

## Resultado Esperado

- 1ª tentativa: ~65% sucesso
- Com retries: ~97% sucesso
- Custo: $0.00 (free tier)

Ver: `squads/ceo-zero/GR9-AUTO-RETRY.md` para detalhes completos.
