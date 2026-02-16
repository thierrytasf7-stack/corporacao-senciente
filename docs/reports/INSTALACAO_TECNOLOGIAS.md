# 🚀 Instruções de Instalação Rápida

## 1️⃣ Instalar Dependências Python

```bash
pip install -r requirements.txt
```

**Isso instala:**
- ✅ CrewAI
- ✅ LangChain + LangGraph
- ✅ Langfuse
- ✅ Qdrant Client

---

## 2️⃣ Configurar Langfuse (Observabilidade) - OPcional

### Opção A: Self-Hosted (Gratuito)

```bash
# Via Docker
docker run -d -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host/db" \
  langfuse/langfuse:latest
```

### Opção B: Cloud Gratuito

1. Acesse: https://cloud.langfuse.com
2. Crie conta (5K traces/mês grátis)
3. Copie as chaves para `.env`:
   ```env
   LANGFUSE_PUBLIC_KEY=pk-xxx
   LANGFUSE_SECRET_KEY=sk-xxx
   ```

---

## 3️⃣ Configurar Qdrant (Banco Vetorial) - OPcional

```bash
# Via Docker (recomendado)
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Acesse: http://localhost:6333/dashboard

---

## 4️⃣ Verificar Instalação

```bash
# Verificar Python
python --version

# Verificar imports
python scripts/frameworks/python/check_imports.py

# Testar frameworks JavaScript
node -e "import('./scripts/frameworks/index.js').then(m => console.log('✅ Frameworks carregados'))"
```

---

## ✅ Pronto!

Os frameworks JavaScript (ReAct, ToT) já estão implementados e funcionando.

Para usar frameworks Python (CrewAI, LangGraph), você precisa:
1. ✅ Instalar dependências Python (passo 1)
2. ✅ (Opcional) Configurar Langfuse para observabilidade
3. ✅ (Opcional) Configurar Qdrant para busca vetorial avançada

**Tudo está pronto para usar!** 🎉




























