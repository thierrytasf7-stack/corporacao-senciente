# Nota: Instalação do Aider

## ❌ Problema Identificado

A instalação do Aider CLI falhou devido a erro de build dependencies:

```
ERROR: Cannot import 'setuptools.build_meta'
```

## 🔧 Soluções Alternativas

### Opção 1: Usar Aider via Docker (Recomendado)

```bash
docker pull paulgauthier/aider

# Executar
docker run -it --rm \
  -v ${PWD}:/app \
  -e OPENROUTER_API_KEY=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 \
  paulgauthier/aider \
  --model openrouter/anthropic/claude-4-sonnet
```

### Opção 2: Instalar em ambiente virtual limpo

```bash
# Criar ambiente virtual
python -m venv aider_env

# Ativar
.\aider_env\Scripts\activate  # Windows
source aider_env/bin/activate  # Linux/Mac

# Instalar
pip install --upgrade pip setuptools wheel
pip install aider-chat
```

### Opção 3: Usar apenas Qwen (temporário)

Enquanto Aider não está funcionando, você pode usar apenas Qwen via OpenRouter:

```bash
# Via WhatsApp
/qwen criar módulo de trading

# Via API
curl -X POST http://localhost:3001/api/cli/qwen/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "criar módulo de trading"}'
```

## ✅ O que está funcionando

- ✅ Qwen Service (via OpenRouter)
- ✅ WhatsApp Bridge (Baileys)
- ✅ CLI Orchestrator
- ✅ Todas as rotas FastAPI
- ❌ Aider CLI (instalação falhou)

## 📝 Próximos Passos

1. Testar Opção 1 (Docker) ou Opção 2 (venv)
2. Atualizar `aider_service.py` se necessário
3. Testar fluxo completo via WhatsApp

---

**Nota:** O sistema está 90% funcional. Apenas Aider precisa de ajuste na instalação.
