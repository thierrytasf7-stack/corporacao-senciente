# RAG Pipeline - Retrieve-Then-Generate Architecture

**Status:** IMPLEMENTADO  
**Etapa:** 002 - Task 05  
**Data:** 2026-02-14

---

## Visão Geral

O RAG Pipeline implementa correção de fatos baseada na **Truth Base** (Axioms/) usando Qdrant vector store. Garante que agentes Diana respondam baseados APENAS em documentos oficiais, eliminando alucinações factuais.

## Componentes

### 1. Qdrant Vector Store (`qdrant_client.py`)
- **Porta:** 21360 (faixa Diana)
- **Coleção:** diana-truth-base
- **Dimensão:** 1536 (OpenAI ada-002)
- **Distância:** Cosine similarity
- **Funcionalidades:**
  - Indexação de documentos (batch)
  - Busca vetorial (top_k, score_threshold)
  - Filtros por metadata
  - Health check

### 2. Embedder Service (`embedder.py`)
- **Modelo:** text-embedding-ada-002 (OpenAI)
- **Max Tokens:** 8191
- **Funcionalidades:**
  - Text chunking (512 tokens, overlap 50)
  - Token counting (tiktoken)
  - Batch embedding
  - Document processing completo

### 3. RAG Pipeline (`rag_pipeline.py`)
- **Pipeline:** Retrieve → Generate
- **Cache:** In-memory (TTL 7 dias) - Redis para produção
- **Funcionalidades:**
  - `retrieve()` - Busca documentos relevantes
  - `generate_with_context()` - Injeta docs no prompt
  - `retrieve_then_generate()` - Pipeline completo
  - `fact_override()` - Correção em tempo real pelo Criador
  - `extract_citations()` - Extrai [Fonte: arquivo#seção]
  - `validate_citations()` - Valida citações (target: 95%+)

## Fluxo de Dados

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
       v
┌──────────────────┐
│ Embed Query      │ (OpenAI ada-002)
└──────┬───────────┘
       │
       v
┌──────────────────┐     ┌─────────────┐
│ Check Cache      │────>│ Cache Hit?  │
└──────┬───────────┘     └──────┬──────┘
       │                        │ No
       v                        v
┌──────────────────┐     ┌─────────────┐
│ Search Qdrant    │<────│ Retrieve    │
│ (top_k=5, >0.8)  │     └─────────────┘
└──────┬───────────┘
       │
       v
┌──────────────────┐
│ Generate Prompt  │ (docs + citations)
│ with Context     │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│ Return to Agent  │ (with sources)
└──────────────────┘
```

## Indexação da Truth Base

### Script: `scripts/index-truth-base.py`

```bash
python scripts/index-truth-base.py
python scripts/index-truth-base.py --reset  # Recria coleção
```

**Processo:**
1. Lê todos `.md` em `Axioms/Truth_Base/`
2. Divide em chunks (512 tokens, overlap 50)
3. Gera embeddings via OpenAI
4. Indexa no Qdrant com metadata

**Metadata indexada:**
- `file` - Path do arquivo
- `section` - Seção/chunk
- `directory` - Subdiretório na Truth Base
- `timestamp` - Data de indexação

## Benchmark

### Script: `scripts/rag-benchmark.py`

```bash
python scripts/rag-benchmark.py
```

**Métricas:**
- Latency (avg, p95, max)
- Recall (% de fontes esperadas encontradas)
- Cache hit rate
- Qdrant points indexados

**Targets:**
- Latency: <500ms (90%+ queries)
- Recall: 100% (80%+ queries)
- Cache hit rate: >60%

## Configuração

### Variáveis de Ambiente (`.env`)

```env
# Qdrant
DIANA_QDRANT_PORT=21360
DIANA_QDRANT_GRPC_PORT=21361
QDRANT_HOST=localhost
QDRANT_ENABLED=true

# Embeddings
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_MAX_TOKENS=8191

# RAG
RAG_ENABLED=true
RAG_TOP_K=5
RAG_SCORE_THRESHOLD=0.8
RAG_CACHE_TTL_DAYS=7
```

## Integração com Workers

### Injeção no Prompt (via `identity_injector`)

```python
from core.services.rag_pipeline import RAGPipeline

rag = RAGPipeline()

# Antes de gerar resposta
query = "Como funcionam os workers Diana?"
rag_result = rag.retrieve_then_generate(query)

# Injetar no prompt
prompt = f"""
{rag_result['prompt']}

FONTES CONSULTADAS:
{json.dumps(rag_result['sources'], indent=2)}

Responda baseado APENAS nas fontes acima.
"""
```

## Fact Override (Criador)

```python
rag = RAGPipeline()

# Corrigir fato em tempo real
rag.fact_override(
    topic="Workers Diana",
    new_content="Workers Diana usam Rust wrapper com Sonnet 4.5...",
    section="workers-architecture"
)
```

**Persistência:**
- Indexado no Qdrant (disponível imediatamente)
- Salvo em `Axioms/Truth_Base/overrides.json`

## Citações

**Formato:** `[Fonte: arquivo#seção]`

**Exemplo de resposta:**
```
Diana usa arquitetura 100% nativa Windows com PM2 para gerenciamento de processos 
[Fonte: Axioms/Truth_Base/wiki/business-facts/architecture/FACT-001-native-windows.md#architecture].

Os workers executam via Rust wrapper e comunicam via queue system 
[Fonte: docs/STATUS-HARMONIZACAO-FEB14.md#queue-system].
```

## Limitações Conhecidas

1. **Cache in-memory** - Não persiste entre restarts (usar Redis para produção)
2. **OpenAI dependency** - Requer API key (alternativa: Ollama local)
3. **Chunk strategy** - Simples (pode melhorar com semantic chunking)
4. **Citation validation** - Básica (pode melhorar com verificação real de arquivos)

## Próximos Passos (Produção)

- [ ] Migrar cache para Redis
- [ ] Implementar Ollama local (fallback offline)
- [ ] Semantic chunking (BM25 + dense)
- [ ] Citation validation completa
- [ ] Dashboard observability (RagStatus.tsx)
- [ ] Métricas Prometheus (latency, recall, cache_hit_rate)
- [ ] Integração com hallucination_monitor (cross-check)

## Dependências

```bash
pip install qdrant-client openai tiktoken
```

**Qdrant:**
```bash
docker run -p 21360:6333 -p 21361:6334 qdrant/qdrant:latest
```

## Arquivos Criados

- `apps/backend/core/services/qdrant_client.py`
- `apps/backend/core/services/embedder.py`
- `apps/backend/core/services/rag_pipeline.py`
- `scripts/index-truth-base.py`
- `scripts/rag-benchmark.py`
- `tests/rag_pipeline.test.js`
- `docs/architecture/RAG-PIPELINE.md` (este arquivo)

---

**Implementado por:** TRABALHADOR  
**Data:** 2026-02-14  
**Story:** senciencia-etapa002-task-05-correcao-fatos-rag.md
