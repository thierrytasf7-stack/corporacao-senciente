# ⚠️ Nota sobre DashScope API Key

## Problema Identificado

A API key fornecida para DashScope está **incorreta** ou **inválida**:

```
DASHSCOPE_API_KEY=sk-b0feb7ee2b9a435387cae518777d60da
```

**Erro retornado:**
```
401 Unauthorized: Incorrect API key provided
```

## Solução Implementada

O `qwen_service.py` foi configurado com **fallback automático**:

1. **Tenta DashScope primeiro** (se API key válida)
2. **Fallback para OpenRouter** (se DashScope falhar)

**OpenRouter está funcionando** com a API key fornecida.

## Como Corrigir (Opcional)

Se quiser usar DashScope diretamente:

1. Acesse [DashScope Console](https://dashscope.console.aliyun.com/)
2. Gere uma nova API key
3. Atualize no `.env`:
   ```env
   DASHSCOPE_API_KEY=sk-NOVA_KEY_AQUI
   ```

## Status Atual

✅ **Qwen funcionando via OpenRouter**  
⚠️ DashScope configurado mas com API key inválida (fallback ativo)

**Modelo usado:** `qwen/qwen-2.5-coder-32b-instruct` via OpenRouter
