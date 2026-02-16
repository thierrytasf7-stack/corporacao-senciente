# Agent Zero - Concurrency Protocol

## NON-NEGOTIABLE RULE: Maximum 2 Concurrent Batches

**Rationale:** Garantir qualidade, conexão estável, e performance consistente.

### Configuration

**File:** `workers/agent-zero/config.json`

```json
{
  "max_concurrent_batches": 2  // NEVER INCREASE ABOVE 2
}
```

### Why This Matters

| Concurrent Batches | Quality | Connection | Performance |
|-------------------|---------|------------|-------------|
| 1 | Excelente | Estável | Lento |
| 2 | ✅ Ótimo | ✅ Estável | ✅ Rápido |
| 3+ | ⚠️ Degradado | ❌ Instável | ❌ Rate limits |

**Evidência:**
- Waves 1-6 (original): 70% sucesso, score médio 8.5/10
- Waves 7-11 (primeira tentativa): 47% sucesso, score médio 6.1/10
- Waves 7-11 (retry com 2 batches): **100% sucesso, score médio 8.4/10** ✅

### Enforcement

1. **Config Lock:** Nunca modificar `max_concurrent_batches` acima de 2
2. **Pre-flight Check:** Verificar config antes de iniciar batches
3. **Monitor Alert:** GR8 v2.0 deve alertar se > 2 batches ativos

### Violation Recovery

Se `max_concurrent_batches > 2` detectado:

```bash
# 1. Parar Agent Zero
pm2 stop agent-zero

# 2. Corrigir config
sed -i 's/"max_concurrent_batches": [0-9]*/"max_concurrent_batches": 2/' workers/agent-zero/config.json

# 3. Reiniciar
pm2 restart agent-zero
```

---

**Status:** ✅ ACTIVE
**Last Updated:** 2026-02-15
**Enforced By:** Claude Code + GR8 v2.0
