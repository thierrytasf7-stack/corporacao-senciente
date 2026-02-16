# 🔧 CORREÇÃO DE NOMES DE MODELOS - OPENROUTER

## ❌ PROBLEMA IDENTIFICADO

Os nomes dos modelos no sistema estão com prefixo `openrouter/` que não é válido na API do OpenRouter.

**Erro:**
```
LLM API error: 400 - {"error":{"message":"openrouter/tngtech/deepseek-r1t2-chimera:free is not a valid model ID","code":400}}
```

## ✅ MODELOS VALIDADOS NO OPENROUTER

Executado script `check_openrouter_models.cjs` que consultou a API do OpenRouter:

### Modelos Encontrados (FREE):
1. ✅ `arcee-ai/trinity-large-preview:free` (correto)
2. ✅ `tngtech/deepseek-r1t2-chimera:free` (correto)
3. ❌ `qwen/qwen-3-coder-480b` (NÃO EXISTE)
   - Alternativa: `qwen/qwen3-coder:free`
4. ✅ `deepseek/deepseek-r1-0528:free` (correto)
5. ❌ `google/gemini-2.0-flash-exp:free` (NÃO EXISTE)
6. ✅ `meta-llama/llama-3.3-70b-instruct:free` (correto)

### Modelos Gratuitos Populares Disponíveis:
- `qwen/qwen3-next-80b-a3b-instruct:free`
- `qwen/qwen3-coder:free`
- `tngtech/deepseek-r1t2-chimera:free`
- `deepseek/deepseek-r1-0528:free`
- `qwen/qwen3-4b:free`
- `tngtech/deepseek-r1t-chimera:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `meta-llama/llama-3.2-3b-instruct:free`
- `qwen/qwen-2.5-vl-7b-instruct:free`
- `nousresearch/hermes-3-llama-3.1-405b:free`
- `meta-llama/llama-3.1-405b-instruct:free`

## 🔧 CORREÇÕES NECESSÁRIAS

### Arquivo: `.aios-core/bin/aios-interactive.js`

**ANTES (INCORRETO):**
```javascript
id: 'openrouter/arcee-ai/trinity-large-preview:free'
id: 'openrouter/tngtech/deepseek-r1t2-chimera:free'
id: 'openrouter/qwen/qwen3-coder:free'
id: 'openrouter/deepseek/deepseek-r1'
id: 'openrouter/google/gemini-2.0-flash-exp:free'
id: 'openrouter/google/gemini-2.0-flash-thinking-exp:free'
id: 'openrouter/meta-llama/llama-3.3-70b-instruct'
id: 'openrouter/qwen/qwen-2.5-coder-32b-instruct'
id: 'openrouter/mistralai/mistral-nemo'
id: 'openrouter/qwen/qwen-2.5-coder-72b-instruct'
```

**DEPOIS (CORRETO):**
```javascript
id: 'arcee-ai/trinity-large-preview:free'
id: 'tngtech/deepseek-r1t2-chimera:free'
id: 'qwen/qwen3-coder:free'
id: 'deepseek/deepseek-r1-0528:free'
id: 'qwen/qwen3-next-80b-a3b-instruct:free'  // Substituir Gemini (não existe)
id: 'qwen/qwen3-4b:free'  // Substituir Gemini Thinking (não existe)
id: 'meta-llama/llama-3.3-70b-instruct:free'
id: 'qwen/qwen-2.5-coder-32b-instruct:free'
id: 'mistralai/mistral-nemo:free'
id: 'qwen/qwen-2.5-coder-72b-instruct'
```

## 📊 RESUMO DAS MUDANÇAS

1. **Remover prefixo `openrouter/`** de TODOS os modelos
2. **Substituir modelos inexistentes:**
   - `qwen/qwen3-coder:free` → OK (existe)
   - `google/gemini-2.0-flash-exp:free` → `qwen/qwen3-next-80b-a3b-instruct:free`
   - `google/gemini-2.0-flash-thinking-exp:free` → `qwen/qwen3-4b:free`
3. **Adicionar `:free` onde faltava:**
   - `deepseek/deepseek-r1` → `deepseek/deepseek-r1-0528:free`
   - `meta-llama/llama-3.3-70b-instruct` → `meta-llama/llama-3.3-70b-instruct:free`
   - `qwen/qwen-2.5-coder-32b-instruct` → `qwen/qwen-2.5-coder-32b-instruct:free`
   - `mistralai/mistral-nemo` → `mistralai/mistral-nemo:free`

## 🎯 MODELOS PRIORITÁRIOS FINAIS (3)

1. **Arcee AI: Trinity Large Preview (127B)** - `arcee-ai/trinity-large-preview:free`
2. **DeepSeek R1T2 Chimera** - `tngtech/deepseek-r1t2-chimera:free`
3. **Qwen3 Coder** - `qwen/qwen3-coder:free`

## 🚀 PRÓXIMOS PASSOS

1. ✅ Corrigir `.aios-core/bin/aios-interactive.js`
2. ⏳ Testar execução de task novamente
3. ⏳ Validar que todos os modelos funcionam
4. ⏳ Atualizar documentação

---

**Data:** 2026-02-03T19:30:00Z  
**Status:** ⏳ EM CORREÇÃO  
**Arquivo:** `.aios-core/bin/aios-interactive.js`
