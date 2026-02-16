# 📘 Guia de Instalação: Tecnologias de Vanguarda

**Última atualização:** Dezembro 2024

---

## 🎯 Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ Python 3.10+ instalado
- ✅ Docker (opcional, para Qdrant)

---

## 📦 Instalação das Dependências

### 1. Dependências Python

```bash
# Instalar dependências Python
pip install -r requirements.txt

# Ou instalar individualmente:
pip install crewai crewai[tools]
pip install langchain langchain-community langgraph
pip install langfuse
pip install qdrant-client
```

### 2. Dependências Node.js

As dependências JavaScript já estão no projeto. Os frameworks ReAct e ToT são implementados em JavaScript puro.

### 3. Docker (para Qdrant - opcional)

```bash
# Baixar e executar Qdrant
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Acesse Qdrant UI em: http://localhost:6333/dashboard

---

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao seu `.env` ou `env.local`:

```env
# Frameworks
REACT_MAX_ITERATIONS=10
TOT_MAX_DEPTH=3
TOT_THOUGHTS_PER_LEVEL=5

# Langfuse (Observabilidade)
LANGFUSE_HOST=http://localhost:3000  # Se self-hosted
LANGFUSE_SECRET_KEY=your-secret-key  # Gerar no Langfuse
LANGFUSE_PUBLIC_KEY=your-public-key  # Gerar no Langfuse

# Qdrant (Banco Vetorial)
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=  # Opcional para cloud

# CrewAI / LangGraph
# (Usados via Python, configurar diretamente nos scripts Python)
```

---

## 🚀 Setup Langfuse (Observabilidade)

### Opção 1: Self-Hosted (Gratuito)

```bash
# Via Docker Compose
git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker-compose up -d

# Acesse: http://localhost:3000
# Default credentials: admin@langfuse.com / langfuse
```

### Opção 2: Cloud (Pago)

1. Acesse: https://cloud.langfuse.com
2. Crie conta gratuita (5K traces/mês)
3. Copie `LANGFUSE_PUBLIC_KEY` e `LANGFUSE_SECRET_KEY`
4. Adicione ao `.env`

---

## 🗄️ Setup Qdrant (Banco Vetorial)

### Opção 1: Docker (Recomendado)

```bash
docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

### Opção 2: Python Client (Embedded)

```python
from qdrant_client import QdrantClient

client = QdrantClient(path="./qdrant_db")  # Armazena localmente
```

---

## ✅ Verificação da Instalação

Execute os testes:

```bash
# Testar frameworks JavaScript
node scripts/test_frameworks.js

# Testar integração Python (se aplicável)
python scripts/test_python_frameworks.py
```

---

## 📚 Próximos Passos

1. ✅ Dependências instaladas
2. ✅ Langfuse configurado
3. ✅ Qdrant rodando (opcional)
4. ⏭️ Integrar nos agentes existentes
5. ⏭️ Criar workflows LangGraph
6. ⏭️ Configurar observabilidade

---

## 🆘 Troubleshooting

### Python não encontrado
```bash
# Verificar instalação
python --version

# Ou usar python3
python3 --version
```

### Erro ao instalar dependências Python
```bash
# Atualizar pip
pip install --upgrade pip

# Instalar com --user se necessário
pip install --user -r requirements.txt
```

### Qdrant não inicia
```bash
# Verificar se porta 6333 está livre
netstat -an | grep 6333

# Usar outra porta
docker run -p 6335:6333 qdrant/qdrant
# E ajustar QDRANT_PORT=6335 no .env
```

---

**Precisa de ajuda?** Verifique os logs ou abra uma issue no repositório.























