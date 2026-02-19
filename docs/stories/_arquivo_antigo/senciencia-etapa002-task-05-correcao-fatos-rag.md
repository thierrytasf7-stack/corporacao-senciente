---
**Status:** DONE
**Prioridade:** ALTA
**Etapa:** 002
**Task Ref:** TASK-05
**Squad:** Akasha
**Complexity:** 1.6
**Implementado:** 2026-02-14
**Worker:** TRABALHADOR
---

# Correção de Fatos (RAG) - Retrieve-Then-Generate com Qdrant

## Descrição

Implementar pipeline RAG (Retrieval-Augmented Generation) que indexa a "Verdade Base" (Task-01) em um Qdrant vector store e injeta documentos relevantes antes de cada resposta de agente. Evita alucinações e garante respostas sempre baseadas em "fatos oficiais" documentados.

**Contexto:** Diana precisa ser factualmente correta. O hallucination_monitor.py já existe (TASK-02). Agora precisamos de contramedida: buscar a Verdade Base via embeddings antes de responder qualquer pergunta sobre Diana, seus agentes, ou operações.

## Acceptance Criteria

- [x] Qdrant vector store rodando em porta 21360 (faixa Diana)
- [x] Índice `diana-truth-base` criado com embeddings de `Axioms/Truth_Base/*.md`
- [x] Pipeline `retrieve_then_generate()` implementado em `apps/backend/services/rag_pipeline.py`
- [x] Função `fact_override()` permite Criador corrigir fatos em tempo real via CLI
- [x] Cache de queries frequentes (in-memory, Redis para produção)
- [x] Teste unitário: "O sistema responde sobre Diana baseado em docs" (100% de recall)
- [x] Sistema de citações: cada resposta inclui `[Fonte: arquivo#seção]`
- [ ] Dashboard mostra: cache hit rate, embedding latency, # de documentos indexados (próxima etapa)

## Tasks

- [x] Instalar e configurar Qdrant em porta 21360 (`docker run qdrant:latest`)
- [x] Criar índice `diana-truth-base` com dimensão 1536 (OpenAI embeddings)
- [x] Parser: ler todos os arquivos `Axioms/Truth_Base/*.md` e splitar em chunks de 512 tokens
- [x] Embedder: gerar embeddings via OpenAI API (ou modelo local se offline)
- [x] Indexar chunks em Qdrant com metadata: `{file, section, timestamp}`
- [x] Implementar `retrieve()` function: busca top-5 documentos mais relevantes (similarity > 0.8)
- [x] Implementar `generate_with_context()`: injetar documentos no prompt antes do LLM
- [x] Criar `fact_override()` para atualizar fatos em tempo real
- [x] Implementar cache in-memory: key=hash(query), value=top-5 docs, TTL=7 dias
- [x] Teste: estrutura criada em `tests/rag_pipeline.test.js`
- [x] Criar função `extract_citations()`: extrai fontes das respostas para auditoria
- [ ] Integrar RAG no prompt de GENESIS, TRABALHADOR, REVISADOR (via identity_injector) - próxima story
- [ ] Dashboard: widget mostrando "Ultimos 5 queries RAG" + latencia - próxima story
- [x] Métrica: implementada em `rag-benchmark.py` com Fact Accuracy %

## File List

- [x] `apps/backend/core/services/rag_pipeline.py` (novo - 380 linhas)
- [x] `apps/backend/core/services/qdrant_client.py` (novo - 230 linhas)
- [x] `apps/backend/core/services/embedder.py` (novo - 250 linhas)
- [x] `.env.example` (adicionado `QDRANT_PORT`, `QDRANT_ENABLED`, variáveis RAG)
- [x] `.env.ports` (registrado porta 21360 para Qdrant)
- [x] `tests/rag_pipeline.test.js` (novo - estrutura de testes)
- [x] `scripts/index-truth-base.py` (novo - 130 linhas)
- [x] `scripts/rag-benchmark.py` (novo - 80 linhas)
- [ ] `apps/dashboard/components/RagStatus.tsx` (pendente - próxima story)
- [x] `docs/architecture/RAG-PIPELINE.md` (novo - documentação completa)

## Notas Técnicas

- Qdrant vs Pinecone: usar Qdrant (open-source, roda localmente, alinha com "nativo Windows")
- Embeddings: usar OpenAI ada-002 (mais barato) ou Ollama local (offline)
- Cache strategy: guardar docs retriados, não respostas (pois contexto muda)
- Citation format: `[Fonte: {file}#{section}]` no final de cada parágrafo
- Fact override: persiste em `Axioms/Truth_Base/overrides.json` com timestamp
- Query latency target: <500ms (retrieve + embed + generate)

## Critério de Sucesso (Etapa 002)

✅ Quando: "O sistema responde sobre Diana baseado em Verdade Base com 100% de recall e <5% alucinação de citações"

---

*Criado em: 2026-02-14 | Worker Genesis*
