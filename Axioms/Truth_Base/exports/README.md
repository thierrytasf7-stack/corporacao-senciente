# Exportação para Vetores

## Propósito

Exporta Truth Base (axiomas + fatos + decisões) para formatos compatíveis com sistemas de embeddings e retrieval semântico.

## Uso

### Via TypeScript

```typescript
import { TruthBaseExporter, exportTruthBase } from './export-to-vectors';

// Exportação simples
const result = await exportTruthBase();

// Exportação customizada
const exporter = new TruthBaseExporter('/custom/path');
const result = await exporter.export('/custom/output.json');
exporter.generateStats(result);
```

### Via CLI

```bash
# Executar exportação
npx ts-node Axioms/Truth_Base/exports/export-to-vectors.ts

# Com tsx (mais rápido)
npx tsx Axioms/Truth_Base/exports/export-to-vectors.ts
```

## Formatos de Saída

### 1. JSON (truth-base-vectors.json)

Formato completo com metadata:

```json
{
  "documents": [
    {
      "id": "AXIOM_01",
      "type": "axiom",
      "title": "Primazia do Criador",
      "content": "O Criador possui autoridade absoluta...",
      "metadata": {
        "source": "CORE_AXIOMS.md",
        "keywords": ["criador", "autoridade", "decisão"]
      }
    }
  ],
  "totalCount": 15,
  "exportedAt": "2026-02-14T...",
  "outputPath": "..."
}
```

### 2. JSONL (truth-base-vectors.jsonl)

Formato para processamento em batch (uma linha = um documento):

```jsonl
{"id":"AXIOM_01","type":"axiom","title":"Primazia do Criador",...}
{"id":"FACT-001","type":"fact","title":"Arquitetura Nativa Windows",...}
```

### 3. CSV (truth-base-vectors.csv)

Formato para análise em planilhas:

```csv
id,type,title,content_length,keywords
AXIOM_01,axiom,Primazia do Criador,342,"criador;autoridade;decisão"
FACT-001,fact,Arquitetura Nativa Windows,1256,"windows;nativo;pm2"
```

## Estrutura de Documento

```typescript
interface TruthDocument {
  id: string;                    // AXIOM_XX, FACT-XXX, DECISION-XXX
  type: 'axiom' | 'fact' | 'decision';
  title: string;                 // Título do documento
  content: string;               // Conteúdo completo (sem frontmatter)
  metadata: {
    source: string;              // Arquivo de origem
    category?: string;           // Categoria (para facts)
    version?: string;            // Versão do documento
    created?: string;            // Data de criação
    updated?: string;            // Data de atualização
    axiom_base?: string;         // Axioma que fundamenta (para facts)
    keywords?: string[];         // Keywords extraídas
  };
}
```

## Integração com Embeddings

### OpenAI Embeddings

```typescript
import { OpenAI } from 'openai';
import { exportTruthBase } from './export-to-vectors';

const openai = new OpenAI();
const { documents } = await exportTruthBase();

for (const doc of documents) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: `${doc.title}\n\n${doc.content}`
  });

  // Salvar embedding em vector database
  await vectorDb.insert({
    id: doc.id,
    vector: embedding.data[0].embedding,
    metadata: doc.metadata
  });
}
```

### Weaviate

```typescript
import weaviate from 'weaviate-ts-client';
import { exportTruthBase } from './export-to-vectors';

const client = weaviate.client({ scheme: 'http', host: 'localhost:8080' });
const { documents } = await exportTruthBase();

for (const doc of documents) {
  await client.data.creator()
    .withClassName('TruthBase')
    .withProperties({
      doc_id: doc.id,
      type: doc.type,
      title: doc.title,
      content: doc.content,
      metadata: JSON.stringify(doc.metadata)
    })
    .do();
}
```

### Pinecone

```typescript
import { PineconeClient } from '@pinecone-database/pinecone';
import { exportTruthBase } from './export-to-vectors';

const pinecone = new PineconeClient();
await pinecone.init({ apiKey: process.env.PINECONE_API_KEY });

const index = pinecone.Index('truth-base');
const { documents } = await exportTruthBase();

// Gerar embeddings e upsert
const vectors = await generateEmbeddings(documents); // função auxiliar
await index.upsert({ vectors });
```

## Retrieval Semântico

Após indexação, use para consultas:

```typescript
// Consulta semântica
const query = "Como funciona a hierarquia de decisão?";
const queryEmbedding = await generateEmbedding(query);

const results = await vectorDb.search({
  vector: queryEmbedding,
  topK: 3,
  filter: { type: 'axiom' } // Opcional
});

// Resultados retornam documentos relevantes
results.forEach(result => {
  console.log(`${result.id}: ${result.title}`);
  console.log(result.content);
});
```

## Atualização Automática

Para manter embeddings sincronizados:

```bash
# Cron job diário (Linux/macOS)
0 0 * * * cd /path/to/diana && npx tsx Axioms/Truth_Base/exports/export-to-vectors.ts && node scripts/update-embeddings.js

# Task Scheduler (Windows)
# Criar task que executa export-to-vectors.ts diariamente
```

## Estatísticas

O exportador gera estatísticas automáticas:

```
=== ESTATÍSTICAS ===
Total de documentos: 15

Por tipo:
  - axiom: 5
  - fact: 8
  - decision: 2

Por categoria:
  - architecture: 3
  - policy: 2
  - business-rule: 3
```

## Troubleshooting

### Documentos não aparecem

Verifique que arquivos têm frontmatter correto:

```yaml
---
id: FACT-XXX
title: Título do Fato
category: architecture
---
```

### Keywords vazias

Documentos muito curtos (<50 palavras) podem ter poucas keywords. Expanda conteúdo.

### Erro ao salvar

Verifique permissões de escrita no diretório `exports/`.

---

**Última Atualização:** 2026-02-14
**Compatibilidade:** Node.js 18+, TypeScript 5+
