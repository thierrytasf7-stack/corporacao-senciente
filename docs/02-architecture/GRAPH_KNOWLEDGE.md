# Graph Knowledge Base - Base de Conhecimento em Grafo

## Visão Geral

A Graph Knowledge Base implementa uma base de conhecimento estruturada como grafo, permitindo representar relacionamentos complexos entre entidades do sistema. Esta abordagem permite queries avançadas, descoberta de padrões e integração inteligente com sistemas de RAG (Retrieval-Augmented Generation).

## Arquitetura

### Componentes Principais

1. **GraphNode** - Nós do grafo representando entidades
   - Tipos: `agent`, `project`, `decision`, `file`, `concept`, `task`
   - Propriedades customizáveis e metadados
   - Embeddings para busca semântica
   - Sistema de tags e importância

2. **GraphEdge** - Arestas representando relacionamentos
   - Tipos: `depends_on`, `related_to`, `created_by`, `used_in`, `influences`
   - Propriedades de peso e direção
   - Metadados de confiança e frequência

3. **GraphKnowledgeBase** - Motor principal do grafo
   - Estrutura em memória com índices otimizados
   - Suporte a queries complexas
   - Integração com embeddings
   - Cache inteligente de queries

4. **Query Engine** - Sistema de queries avançadas
   - Queries de relacionamentos complexos
   - Análise de influência e centralidade
   - Detecção de clusters e padrões
   - Busca híbrida (vector + graph)

## Estrutura do Grafo

### Tipos de Nós

#### Agentes (`agent`)
```javascript
{
    id: 'agent_architect',
    type: 'agent',
    properties: {
        name: 'Architect Agent',
        role: 'system design',
        expertise: ['architecture', 'scalability'],
        status: 'active'
    },
    metadata: {
        importance: 0.9,
        confidence: 0.95,
        tags: ['agent', 'technical', 'architecture']
    }
}
```

#### Projetos (`project`)
```javascript
{
    id: 'project_web_app',
    type: 'project',
    properties: {
        name: 'Web Application',
        type: 'web',
        status: 'active',
        priority: 'high',
        deadline: '2024-12-31'
    },
    metadata: {
        tags: ['project', 'web', 'frontend']
    }
}
```

#### Decisões (`decision`)
```javascript
{
    id: 'decision_react',
    type: 'decision',
    properties: {
        title: 'Choose React Framework',
        context: 'Frontend framework decision',
        options: ['React', 'Vue', 'Angular'],
        outcome: 'React selected',
        rationale: 'Better ecosystem and community'
    },
    metadata: {
        tags: ['decision', 'frontend', 'framework']
    }
}
```

#### Arquivos (`file`)
```javascript
{
    id: 'file_app_js',
    type: 'file',
    properties: {
        name: 'app.js',
        path: '/src/app.js',
        language: 'javascript',
        lines: 250,
        complexity: 'medium'
    },
    metadata: {
        tags: ['file', 'javascript', 'frontend']
    }
}
```

#### Conceitos (`concept`)
```javascript
{
    id: 'concept_microservices',
    type: 'concept',
    properties: {
        name: 'Microservices',
        description: 'Architecture pattern for scalable systems',
        category: 'architecture',
        related_concepts: ['scalability', 'distributed_systems']
    },
    metadata: {
        tags: ['concept', 'architecture', 'scalability']
    }
}
```

#### Tarefas (`task`)
```javascript
{
    id: 'task_auth',
    type: 'task',
    properties: {
        title: 'Implement Authentication',
        status: 'completed',
        priority: 'high',
        assignee: 'agent_developer',
        estimate: 8, // horas
        actual: 6
    },
    metadata: {
        tags: ['task', 'security', 'auth']
    }
}
```

### Tipos de Arestas

#### Relacionamentos Básicos
- `works_on`: Agente trabalha em projeto
- `belongs_to`: Arquivo pertence a projeto
- `depends_on`: Tarefa depende de outra tarefa
- `uses`: Projeto usa conceito/tecnologia
- `implements`: Arquivo implementa conceito

#### Relacionamentos Avançados
- `influences`: Decisão influencia outra decisão
- `specializes_in`: Agente especializado em conceito
- `created_by`: Recurso criado por agente
- `blocks`: Tarefa bloqueia outra tarefa
- `related_to`: Relacionamento genérico

### Propriedades das Arestas
```javascript
{
    id: 'edge_123',
    fromId: 'agent_architect',
    toId: 'project_web_app',
    type: 'works_on',
    properties: {
        role: 'lead_architect',
        commitment: 0.8, // 80% do tempo
        startDate: '2024-01-01',
        weight: 1.0
    },
    direction: 'directed',
    metadata: {
        confidence: 0.9,
        source: 'manual_input'
    }
}
```

## Queries Avançadas

### Busca Básica de Nós

```javascript
// Busca por tipo
const agents = await graphKB.searchNodes({
    type: 'agent',
    limit: 10
});

// Busca por tags
const technicalNodes = await graphKB.searchNodes({
    tags: ['technical', 'architecture'],
    limit: 20
});

// Busca por texto
const conceptNodes = await graphKB.searchNodes({
    text: 'microservices architecture',
    limit: 5
});

// Busca por propriedades
const activeProjects = await graphKB.searchNodes({
    type: 'project',
    properties: { status: 'active' },
    limit: 10
});
```

### Queries de Grafo Complexas

#### Encontrar Nós Relacionados
```javascript
const relatedToArchitect = await graphKB.executeGraphQuery({
    type: 'find_related',
    nodeId: 'agent_architect',
    relationshipTypes: ['works_on', 'specializes_in'],
    depth: 2
});

// Resultado inclui:
// - Projetos onde o architect trabalha
// - Conceitos nos quais é especialista
// - Outros agentes que trabalham nos mesmos projetos
// - Decisões tomadas pelo architect
```

#### Analisar Influência
```javascript
const influenceAnalysis = await graphKB.executeGraphQuery({
    type: 'analyze_influence',
    nodeId: 'agent_architect',
    direction: 'outbound'
});

// Resultado inclui:
// - Score de influência (PageRank)
// - Conexões diretas e indiretas
// - Nós mais influenciados
// - Caminho de influência através do grafo
```

#### Detectar Clusters
```javascript
const clusters = await graphKB.executeGraphQuery({
    type: 'detect_clusters',
    minClusterSize: 3
});

// Resultado inclui:
// - Grupos de nós densamente conectados
// - Tipo inferido do cluster
// - Densidade de conexões
// - Nós centrais do cluster
```

#### Encontrar Dependências
```javascript
const dependencies = await graphKB.executeGraphQuery({
    type: 'find_dependencies',
    nodeId: 'task_payment',
    dependencyTypes: ['depends_on', 'blocks']
});

// Resultado inclui:
// - Dependências diretas e indiretas
// - Possíveis dependências circulares
// - Grafo de dependências completo
```

#### Caminho Mais Curto
```javascript
const shortestPath = await graphKB.executeGraphQuery({
    type: 'shortest_path',
    fromId: 'agent_developer',
    toId: 'concept_microservices'
});

// Resultado inclui:
// - Caminho mínimo entre nós
// - Distância (número de hops)
// - Nós intermediários
// - Pontos de conexão
```

## Integração com RAG

### Busca Híbrida (Vector + Graph)

```javascript
const hybridResults = await graphKB.hybridSearch(
    "microservices architecture for web applications",
    {
        embedding: queryEmbedding,  // Embedding da query
        topK: 10,                   // Top 10 resultados
        graphWeight: 0.3,          // 30% peso para relacionamentos
        vectorWeight: 0.7          // 70% peso para similaridade vetorial
    }
);

// Cada resultado inclui:
{
    node: graphNode,              // Nó encontrado
    score: 0.85,                  // Score combinado
    enrichedContext: {            // Contexto dos relacionamentos
        node: graphNode,
        relationships: [...],     // Relacionamentos diretos
        relatedEntities: [...],   // Entidades relacionadas
        influence: 0.75          // Score de influência
    }
}
```

### Contexto Enriquecido

```javascript
// Para cada resultado da busca híbrida
const enrichedContext = {
    node: originalNode,
    relationships: [
        {
            type: 'works_on',
            direction: 'outbound',
            relatedNode: projectNode,
            weight: 0.8,
            properties: { role: 'architect' }
        },
        {
            type: 'specializes_in',
            direction: 'outbound',
            relatedNode: conceptNode,
            weight: 1.0,
            properties: { expertise_level: 'expert' }
        }
    ],
    relatedEntities: [
        {
            node: relatedAgentNode,
            relationship: 'collaborates_with',
            distance: 2
        }
    ],
    influence: 0.82,  // Score de PageRank
    cluster: 'technical_team'
};
```

## Índices e Performance

### Índices Otimizados

#### Índice por Tipo
```javascript
// Map<type, Set<nodeIds>>
nodeIndex: new Map([
    ['agent', new Set(['agent_architect', 'agent_developer'])],
    ['project', new Set(['project_web_app', 'project_api'])]
]);
```

#### Índice por Tags
```javascript
// Map<tag, Set<nodeIds>>
tagIndex: new Map([
    ['technical', new Set(['agent_architect', 'agent_developer'])],
    ['architecture', new Set(['agent_architect', 'concept_microservices'])]
]);
```

#### Índice Textual
```javascript
// Map<word, Set<nodeIds>>
textIndex: new Map([
    ['architecture', new Set(['agent_architect', 'concept_microservices'])],
    ['microservices', new Set(['concept_microservices', 'decision_react'])]
]);
```

#### Índice Vetorial
```javascript
// Array<{nodeId, embedding}> para busca KNN
vectorIndex: [
    { nodeId: 'concept_microservices', embedding: [0.1, 0.2, ...] },
    { nodeId: 'agent_architect', embedding: [0.3, 0.4, ...] }
];
```

### Cache de Queries

```javascript
// Cache com TTL para queries complexas
queryCache: new Map([
    ['query_hash', {
        timestamp: Date.now(),
        result: cachedResult
    }]
]);
```

## Algoritmos de Análise

### PageRank para Influência

```javascript
// Cálculo de influência baseado em conexões
const influenceScores = calculatePageRank();

function calculatePageRank(dampingFactor = 0.85, iterations = 20) {
    // Inicializar scores igualmente
    const scores = new Map();
    nodes.forEach(node => scores.set(node.id, 1.0 / nodeCount));

    // Iterar até convergência
    for (let i = 0; i < iterations; i++) {
        const newScores = new Map();

        nodes.forEach(node => {
            let score = (1 - dampingFactor) / nodeCount;

            // Adicionar contribuições dos nós inbound
            inboundNeighbors[node.id].forEach(neighborId => {
                const neighborScore = scores.get(neighborId);
                const outboundCount = outboundNeighbors[neighborId].length;
                score += dampingFactor * neighborScore / outboundCount;
            });

            newScores.set(node.id, score);
        });

        Object.assign(scores, newScores);
    }

    return scores;
}
```

### Detecção de Clusters

```javascript
// Busca em profundidade para encontrar clusters
function detectClusters(minClusterSize = 3) {
    const clusters = [];
    const visited = new Set();

    for (const nodeId of nodeIds) {
        if (visited.has(nodeId)) continue;

        const cluster = dfsCluster(nodeId, visited);

        if (cluster.length >= minClusterSize) {
            clusters.push({
                id: `cluster_${clusters.length + 1}`,
                nodes: cluster,
                size: cluster.length,
                type: inferClusterType(cluster),
                density: calculateClusterDensity(cluster)
            });
        }
    }

    return clusters.sort((a, b) => b.size - a.size);
}
```

### Busca de Caminhos

```javascript
// Algoritmo de Dijkstra para caminho mais curto
function findShortestPath(fromId, toId) {
    const distances = new Map();
    const previous = new Map();
    const queue = new Set([fromId]);

    // Inicializar distâncias
    nodeIds.forEach(id => {
        distances.set(id, id === fromId ? 0 : Infinity);
    });

    while (queue.size > 0) {
        // Nó com menor distância
        const current = [...queue].reduce((min, id) =>
            distances.get(id) < distances.get(min) ? id : min
        );

        if (distances.get(current) === Infinity) break;

        queue.delete(current);

        // Se encontrou destino, reconstruir caminho
        if (current === toId) {
            return reconstructPath(previous, toId);
        }

        // Atualizar vizinhos
        getNeighbors(current).forEach(neighbor => {
            const edge = findEdge(current, neighbor);
            const weight = edge?.properties?.weight || 1;
            const alt = distances.get(current) + weight;

            if (alt < distances.get(neighbor)) {
                distances.set(neighbor, alt);
                previous.set(neighbor, current);
                queue.add(neighbor);
            }
        });
    }

    return null; // Nenhum caminho encontrado
}
```

## Persistência e Escalabilidade

### Adaptador para Neo4j

```javascript
// Quando escalar para Neo4j
class Neo4jGraphAdapter {
    constructor(uri, user, password) {
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    }

    async addNode(node) {
        const session = this.driver.session();
        try {
            await session.run(`
                CREATE (n:${node.type} {
                    id: $id,
                    properties: $properties,
                    metadata: $metadata,
                    embedding: $embedding
                })
                SET n += $properties
                SET n.metadata = $metadata
                ${node.embedding ? 'SET n.embedding = $embedding' : ''}
            `, {
                id: node.id,
                properties: node.properties,
                metadata: node.metadata,
                embedding: node.embedding
            });
        } finally {
            await session.close();
        }
    }

    async findShortestPath(fromId, toId) {
        const session = this.driver.session();
        try {
            const result = await session.run(`
                MATCH (start {id: $fromId}), (end {id: $toId}),
                      path = shortestPath((start)-[*]-(end))
                RETURN path
            `, { fromId, toId });

            return result.records[0]?.get('path');
        } finally {
            await session.close();
        }
    }
}
```

### Estratégias de Escalabilidade

#### Sharding por Tipo
```javascript
// Dividir nós por tipo para melhor performance
const typeShards = {
    agents: 'shard_agents',
    projects: 'shard_projects',
    files: 'shard_files',
    concepts: 'shard_concepts'
};
```

#### Cache Hierárquico
```javascript
// Cache em múltiplas camadas
const cacheLayers = {
    l1: new Map(), // Memória rápida (resultados recentes)
    l2: redis,     // Redis distribuído (resultados populares)
    l3: neo4j      // Neo4j (persistente)
};
```

#### Indexação Vetorial
```javascript
// Para busca semântica em escala
const vectorSearch = {
    provider: 'pinecone', // ou weaviate, qdrant
    dimension: 384,       // dimensão dos embeddings
    metric: 'cosine',
    indexName: 'graph_nodes'
};
```

## Casos de Uso

### 1. Descoberta de Expertise

```javascript
// Encontrar especialista em microservices
const experts = await graphKB.searchNodes({
    text: 'microservices architecture',
    tags: ['expert', 'technical']
});

// Resultado: agentes especializados conectados ao conceito
```

### 2. Análise de Dependências

```javascript
// Verificar impacto de mudança em conceito
const impact = await graphKB.executeGraphQuery({
    type: 'find_related',
    nodeId: 'concept_microservices',
    relationshipTypes: ['implements', 'uses'],
    depth: 3
});

// Resultado: todos os projetos e arquivos afetados
```

### 3. Recomendação de Colaboração

```javascript
// Encontrar agentes para projeto similar
const similarAgents = await graphKB.executeGraphQuery({
    type: 'find_related',
    nodeId: 'project_web_app',
    relationshipTypes: ['works_on'],
    depth: 2
});

// Resultado: agentes com experiência relevante
```

### 4. Análise de Decisões Arquiteturais

```javascript
// Traçar influência de decisão arquitetural
const decisionImpact = await graphKB.executeGraphQuery({
    type: 'analyze_influence',
    nodeId: 'decision_react'
});

// Resultado: todas as decisões e projetos influenciados
```

## Configuração

### Configuração Básica

```javascript
const graphKB = getGraphKnowledgeBase({
    persistenceEnabled: false,    // true para Neo4j
    embeddingEnabled: true,
    maxNodes: 10000,
    maxEdges: 50000,
    cacheTimeout: 300000         // 5 minutos
});
```

### Configuração Avançada

```javascript
const advancedConfig = {
    // Neo4j (quando habilitar persistência)
    neo4j: {
        uri: 'bolt://localhost:7687',
        user: 'neo4j',
        password: 'password'
    },

    // Embeddings
    embeddingConfig: {
        provider: 'openai',       // 'openai' | 'local' | 'xenova'
        model: 'text-embedding-3-small',
        dimension: 1536
    },

    // Índices customizados
    customIndexes: {
        byDate: 'createdAt',
        byStatus: 'status',
        byPriority: 'priority'
    },

    // Algoritmos
    algorithms: {
        pagerank: {
            dampingFactor: 0.85,
            iterations: 20
        },
        clustering: {
            algorithm: 'louvain',  // 'louvain' | 'girvan-newman'
            resolution: 1.0
        }
    }
};
```

## Monitoramento

### Métricas do Grafo

```javascript
const stats = graphKB.getStats();

// Resultado
{
    nodesCount: 1250,
    edgesCount: 3400,
    typesCount: 6,
    avgConnectivity: 2.72,
    mostConnectedNode: 'agent_architect',
    lastUpdated: '2024-01-15T10:30:00.000Z'
}
```

### Health Check

```javascript
// Verificar saúde da base de conhecimento
const health = {
    nodesAccessible: graphKB.nodes.size > 0,
    edgesAccessible: graphKB.edges.size > 0,
    indexesBuilt: graphKB.nodeIndex.size > 0,
    queriesWorking: await testBasicQuery(),
    memoryUsage: process.memoryUsage().heapUsed,
    cacheHitRate: calculateCacheHitRate()
};
```

## Próximos Passos

### Melhorias Planejadas

1. **Integração com Neo4j**
   - Persistência nativa
   - Queries Cypher otimizadas
   - Índices automáticos

2. **Embeddings em Tempo Real**
   - Atualização incremental
   - Fine-tuning específico do domínio
   - Multi-modal (texto + código + diagramas)

3. **Machine Learning no Grafo**
   - Predição de relacionamentos
   - Classificação automática de nós
   - Detecção de anomalias

4. **Visualização Interativa**
   - Interface web para navegação
   - Filtros dinâmicos
   - Exploração de caminhos

5. **APIs Avançadas**
   - GraphQL para queries flexíveis
   - Webhooks para mudanças
   - Real-time subscriptions

Esta implementação fornece uma base sólida de conhecimento que cresce organicamente com o uso do sistema, permitindo descoberta inteligente de relacionamentos e tomada de decisões mais informada.