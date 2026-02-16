#!/usr/bin/env node
/**
 * Graph Knowledge Base - Base de Conhecimento em Grafo
 *
 * Sistema de conhecimento baseado em grafos para representar relacionamentos
 * complexos entre entidades, com integração ao RAG e visualização
 */

import { getDistributedTracer } from '../observability/distributed_tracer.js';
import { getEmbeddingsService } from '../utils/embeddings_service.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'graph_knowledge_base' });

/**
 * Nó do Grafo de Conhecimento
 */
class GraphNode {
    constructor(id, type, properties = {}) {
        this.id = id;
        this.type = type; // 'agent', 'project', 'decision', 'file', 'concept', 'task'
        this.properties = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            ...properties
        };
        this.embedding = null; // Para busca semântica
        this.metadata = {
            importance: 1.0,        // 0-1, relevância do nó
            confidence: 0.5,        // 0-1, confiança na informação
            accessCount: 0,         // Quantas vezes foi acessado
            lastAccessed: null,
            tags: [],               // Tags para categorização
            source: 'system'        // Origem da informação
        };
    }

    /**
     * Atualizar propriedades do nó
     */
    updateProperties(newProperties) {
        this.properties = {
            ...this.properties,
            ...newProperties,
            updatedAt: new Date().toISOString(),
            version: this.properties.version + 1
        };
    }

    /**
     * Registrar acesso ao nó
     */
    recordAccess() {
        this.metadata.accessCount++;
        this.metadata.lastAccessed = new Date().toISOString();
    }

    /**
     * Calcular score de relevância
     */
    calculateRelevanceScore(queryEmbedding = null) {
        let score = this.metadata.importance * this.metadata.confidence;

        // Fator de recência (últimos 30 dias valem mais)
        if (this.metadata.lastAccessed) {
            const daysSinceAccess = (Date.now() - new Date(this.metadata.lastAccessed)) / (1000 * 60 * 60 * 24);
            const recencyFactor = Math.max(0.1, Math.exp(-daysSinceAccess / 30));
            score *= recencyFactor;
        }

        // Similaridade semântica se disponível
        if (queryEmbedding && this.embedding) {
            const similarity = this.cosineSimilarity(queryEmbedding, this.embedding);
            score *= (0.3 + 0.7 * similarity); // 30% base + 70% similaridade
        }

        return score;
    }

    /**
     * Calcular similaridade cosseno
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Adicionar tags ao nó
     */
    addTags(tags) {
        const newTags = Array.isArray(tags) ? tags : [tags];
        this.metadata.tags = [...new Set([...this.metadata.tags, ...newTags])];
    }

    /**
     * Verificar se nó tem tags específicas
     */
    hasTags(tags) {
        const checkTags = Array.isArray(tags) ? tags : [tags];
        return checkTags.every(tag => this.metadata.tags.includes(tag));
    }
}

/**
 * Aresta do Grafo de Conhecimento
 */
class GraphEdge {
    constructor(fromId, toId, type, properties = {}) {
        this.id = `${fromId}_${type}_${toId}_${Date.now()}`;
        this.fromId = fromId;
        this.toId = toId;
        this.type = type; // 'depends_on', 'related_to', 'created_by', 'used_in', 'influences', etc.
        this.properties = {
            createdAt: new Date().toISOString(),
            weight: 1.0,            // Força da relação (0-1)
            direction: 'directed',  // 'directed' | 'undirected' | 'bidirectional'
            ...properties
        };
        this.metadata = {
            accessCount: 0,
            lastAccessed: null,
            confidence: 0.8,        // Confiança na relação
            source: 'system'
        };
    }

    /**
     * Inverter direção da aresta
     */
    reverse() {
        return new GraphEdge(this.toId, this.fromId, this.type, {
            ...this.properties,
            direction: this.properties.direction === 'directed' ? 'directed' : 'bidirectional'
        });
    }

    /**
     * Verificar se aresta conecta dois nós específicos
     */
    connects(nodeId1, nodeId2) {
        return (this.fromId === nodeId1 && this.toId === nodeId2) ||
            (this.fromId === nodeId2 && this.toId === nodeId1 && this.properties.direction === 'undirected');
    }
}

/**
 * Graph Knowledge Base - Base de Conhecimento em Grafo
 */
export class GraphKnowledgeBase {
    constructor(options = {}) {
        this.embeddingsService = getEmbeddingsService();
        this.distributedTracer = getDistributedTracer();

        // Configurações
        this.persistenceEnabled = options.persistenceEnabled !== false;
        this.embeddingEnabled = options.embeddingEnabled !== false;
        this.maxNodes = options.maxNodes || 10000;
        this.maxEdges = options.maxEdges || 50000;

        // Estrutura do grafo
        this.nodes = new Map();      // id -> GraphNode
        this.edges = new Map();      // id -> GraphEdge
        this.nodeIndex = new Map();  // type -> Set<nodeIds>
        this.edgeIndex = new Map();  // type -> Set<edgeIds>

        // Índices de busca
        this.textIndex = new Map();  // palavra -> Set<nodeIds>
        this.tagIndex = new Map();   // tag -> Set<nodeIds>
        this.vectorIndex = [];       // [{nodeId, embedding}] para busca KNN

        // Estatísticas
        this.stats = {
            nodesCount: 0,
            edgesCount: 0,
            typesCount: 0,
            lastUpdated: null,
            avgConnectivity: 0,
            mostConnectedNode: null
        };

        // Cache de queries
        this.queryCache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutos

        log.info('GraphKnowledgeBase initialized', {
            persistenceEnabled: this.persistenceEnabled,
            embeddingEnabled: this.embeddingEnabled,
            maxNodes: this.maxNodes
        });
    }

    /**
     * Inicializar base de conhecimento
     */
    async initialize() {
        log.info('Initializing Graph Knowledge Base...');

        // Carregar dados persistidos se disponível
        if (this.persistenceEnabled) {
            await this.loadPersistedData();
        }

        // Construir índices
        await this.buildIndexes();

        // Calcular estatísticas iniciais
        this.updateStats();

        log.info('Graph Knowledge Base initialized successfully', this.stats);
    }

    /**
     * Adicionar nó ao grafo
     */
    async addNode(id, type, properties = {}, options = {}) {
        if (this.nodes.has(id)) {
            throw new Error(`Node ${id} already exists`);
        }

        if (this.nodes.size >= this.maxNodes) {
            throw new Error(`Maximum nodes limit reached: ${this.maxNodes}`);
        }

        const node = new GraphNode(id, type, properties);

        // Adicionar tags se fornecidas
        if (options.tags) {
            node.addTags(options.tags);
        }

        // Gerar embedding se habilitado
        if (this.embeddingEnabled && options.generateEmbedding !== false) {
            try {
                const textContent = this.extractTextContent(node);
                if (textContent) {
                    node.embedding = await this.embeddingsService.generateEmbedding(textContent);
                }
            } catch (error) {
                log.warn('Failed to generate embedding for node', { nodeId: id, error: error.message });
            }
        }

        // Adicionar ao grafo
        this.nodes.set(id, node);

        // Atualizar índices
        this.updateNodeIndexes(node);

        // Atualizar estatísticas
        this.updateStats();

        // Persistir se habilitado
        if (this.persistenceEnabled) {
            await this.persistNode(node);
        }

        log.debug('Node added to graph', { nodeId: id, type, propertiesCount: Object.keys(properties).length });

        return node;
    }

    /**
     * Adicionar aresta ao grafo
     */
    async addEdge(fromId, toId, type, properties = {}) {
        // Verificar se nós existem
        if (!this.nodes.has(fromId)) {
            throw new Error(`Source node ${fromId} does not exist`);
        }
        if (!this.nodes.has(toId)) {
            throw new Error(`Target node ${toId} does not exist`);
        }

        if (this.edges.size >= this.maxEdges) {
            throw new Error(`Maximum edges limit reached: ${this.maxEdges}`);
        }

        const edge = new GraphEdge(fromId, toId, type, properties);

        // Verificar se aresta já existe (evitar duplicatas)
        const existingEdge = this.findEdge(fromId, toId, type);
        if (existingEdge) {
            // Atualizar aresta existente
            existingEdge.properties = { ...existingEdge.properties, ...properties };
            existingEdge.properties.updatedAt = new Date().toISOString();
            return existingEdge;
        }

        // Adicionar ao grafo
        this.edges.set(edge.id, edge);

        // Atualizar índices
        this.updateEdgeIndexes(edge);

        // Atualizar estatísticas
        this.updateStats();

        // Persistir se habilitado
        if (this.persistenceEnabled) {
            await this.persistEdge(edge);
        }

        log.debug('Edge added to graph', { fromId, toId, type, edgeId: edge.id });

        return edge;
    }

    /**
     * Buscar nós por critérios
     */
    async searchNodes(criteria = {}) {
        let candidateNodes = new Set(this.nodes.keys());

        // Filtrar por tipo
        if (criteria.type) {
            const typeNodes = this.nodeIndex.get(criteria.type) || new Set();
            candidateNodes = new Set([...candidateNodes].filter(id => typeNodes.has(id)));
        }

        // Filtrar por tags
        if (criteria.tags && criteria.tags.length > 0) {
            candidateNodes = new Set([...candidateNodes].filter(id => {
                const node = this.nodes.get(id);
                return node && node.hasTags(criteria.tags);
            }));
        }

        // Filtrar por texto (busca simples)
        if (criteria.text) {
            const textNodes = this.searchByText(criteria.text);
            candidateNodes = new Set([...candidateNodes].filter(id => textNodes.has(id)));
        }

        // Busca semântica se embedding fornecido
        let semanticResults = [];
        if (criteria.embedding && this.embeddingEnabled) {
            semanticResults = await this.searchByEmbedding(criteria.embedding, criteria.topK || 10);
            candidateNodes = new Set([...candidateNodes].filter(id =>
                semanticResults.some(result => result.nodeId === id)
            ));
        }

        // Filtrar por propriedades
        if (criteria.properties) {
            candidateNodes = new Set([...candidateNodes].filter(id => {
                const node = this.nodes.get(id);
                if (!node) return false;

                return Object.entries(criteria.properties).every(([key, value]) => {
                    return node.properties[key] === value;
                });
            }));
        }

        // Converter para array de nós com scores
        const results = [...candidateNodes].map(id => {
            const node = this.nodes.get(id);
            const semanticScore = semanticResults.find(r => r.nodeId === id)?.score || 0;

            return {
                node,
                relevanceScore: node.calculateRelevanceScore(criteria.embedding),
                semanticScore
            };
        });

        // Ordenar por score de relevância
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Registrar acesso aos nós retornados
        results.slice(0, criteria.limit || 50).forEach(result => {
            result.node.recordAccess();
        });

        return results.slice(0, criteria.limit || 50);
    }

    /**
     * Buscar caminhos entre nós
     */
    async findPaths(fromId, toId, options = {}) {
        const maxDepth = options.maxDepth || 3;
        const maxPaths = options.maxPaths || 10;

        if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
            return [];
        }

        const paths = [];
        const visited = new Set();
        const queue = [[fromId]]; // Filas de caminhos

        while (queue.length > 0 && paths.length < maxPaths) {
            const currentPath = queue.shift();
            const currentNodeId = currentPath[currentPath.length - 1];

            if (currentPath.length > maxDepth + 1) continue;
            if (visited.has(currentNodeId)) continue;

            visited.add(currentNodeId);

            // Encontrou destino
            if (currentNodeId === toId) {
                paths.push([...currentPath]);
                continue;
            }

            // Explorar vizinhos
            const neighbors = this.getNeighbors(currentNodeId);
            for (const neighborId of neighbors) {
                if (!currentPath.includes(neighborId)) {
                    queue.push([...currentPath, neighborId]);
                }
            }
        }

        return paths.map(path => ({
            path,
            length: path.length - 1,
            nodes: path.map(id => this.nodes.get(id))
        }));
    }

    /**
     * Executar query de grafo complexa
     */
    async executeGraphQuery(query) {
        // Cache de queries
        const cacheKey = JSON.stringify(query);
        if (this.queryCache.has(cacheKey)) {
            const cached = this.queryCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }
        }

        const result = await this._executeGraphQuery(query);

        // Cache do resultado
        this.queryCache.set(cacheKey, {
            timestamp: Date.now(),
            result
        });

        return result;
    }

    /**
     * Executar query específica
     */
    async _executeGraphQuery(query) {
        const { type, ...params } = query;

        switch (type) {
            case 'find_related':
                return this.findRelatedNodes(params.nodeId, params.relationshipTypes, params.depth);

            case 'analyze_influence':
                return this.analyzeInfluence(params.nodeId, params.direction);

            case 'detect_clusters':
                return this.detectClusters(params.minClusterSize);

            case 'find_dependencies':
                return this.findDependencies(params.nodeId, params.dependencyTypes);

            case 'shortest_path':
                return this.findShortestPath(params.fromId, params.toId);

            default:
                throw new Error(`Unknown query type: ${type}`);
        }
    }

    /**
     * Encontrar nós relacionados
     */
    findRelatedNodes(nodeId, relationshipTypes = null, depth = 2) {
        const visited = new Set();
        const related = new Map();
        const queue = [{ id: nodeId, depth: 0, path: [nodeId] }];

        while (queue.length > 0) {
            const { id, depth: currentDepth, path } = queue.shift();

            if (currentDepth >= depth || visited.has(id)) continue;
            visited.add(id);

            const neighbors = this.getNeighborsWithEdges(id, relationshipTypes);

            for (const { neighborId, edge } of neighbors) {
                if (!path.includes(neighborId)) {
                    if (!related.has(neighborId)) {
                        related.set(neighborId, {
                            node: this.nodes.get(neighborId),
                            relationships: [],
                            distance: currentDepth + 1
                        });
                    }

                    related.get(neighborId).relationships.push({
                        edge,
                        path: [...path, neighborId]
                    });

                    if (currentDepth + 1 < depth) {
                        queue.push({
                            id: neighborId,
                            depth: currentDepth + 1,
                            path: [...path, neighborId]
                        });
                    }
                }
            }
        }

        return Array.from(related.values());
    }

    /**
     * Analisar influência de um nó
     */
    analyzeInfluence(nodeId, direction = 'outbound') {
        const influence = {
            node: this.nodes.get(nodeId),
            directConnections: 0,
            indirectConnections: 0,
            influenceScore: 0,
            influencePath: []
        };

        if (!influence.node) return influence;

        // Conexões diretas
        const directNeighbors = this.getNeighbors(nodeId);
        influence.directConnections = directNeighbors.length;

        // Análise de influência usando PageRank simplificado
        const influenceScores = this.calculatePageRank();
        influence.influenceScore = influenceScores.get(nodeId) || 0;

        // Caminho de influência (nós mais influenciados)
        const sortedByInfluence = Array.from(influenceScores.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        influence.influencePath = sortedByInfluence.map(([id, score]) => ({
            node: this.nodes.get(id),
            score
        }));

        return influence;
    }

    /**
     * Detectar clusters no grafo
     */
    detectClusters(minClusterSize = 3) {
        const clusters = [];
        const visited = new Set();

        for (const [nodeId, node] of this.nodes) {
            if (visited.has(nodeId)) continue;

            // Busca em profundidade para encontrar cluster
            const cluster = this.dfsCluster(nodeId, visited);

            if (cluster.length >= minClusterSize) {
                clusters.push({
                    id: `cluster_${clusters.length + 1}`,
                    nodes: cluster.map(id => this.nodes.get(id)),
                    size: cluster.length,
                    type: this.inferClusterType(cluster),
                    density: this.calculateClusterDensity(cluster)
                });
            }
        }

        return clusters.sort((a, b) => b.size - a.size);
    }

    /**
     * Encontrar dependências de um nó
     */
    findDependencies(nodeId, dependencyTypes = ['depends_on', 'requires', 'uses']) {
        const dependencies = {
            direct: [],
            indirect: [],
            circular: []
        };

        // Dependências diretas
        const directEdges = this.getEdgesFrom(nodeId).filter(edge =>
            dependencyTypes.includes(edge.type)
        );

        dependencies.direct = directEdges.map(edge => ({
            node: this.nodes.get(edge.toId),
            edge,
            type: 'direct'
        }));

        // Dependências indiretas (através de caminhos)
        const visited = new Set([nodeId]);
        const indirectDeps = new Set();

        for (const directDep of dependencies.direct) {
            const paths = this.findPaths(directDep.node.id, nodeId, { maxDepth: 5 });
            if (paths.length > 0) {
                dependencies.circular.push({
                    circularPath: paths[0],
                    message: 'Dependência circular detectada'
                });
            }

            // Encontrar outras dependências indiretas
            const related = this.findRelatedNodes(directDep.node.id, dependencyTypes, 2);
            related.forEach(rel => {
                if (!visited.has(rel.node.id) && rel.distance > 1) {
                    indirectDeps.add(rel.node.id);
                }
            });
        }

        dependencies.indirect = Array.from(indirectDeps).map(id => ({
            node: this.nodes.get(id),
            type: 'indirect'
        }));

        return dependencies;
    }

    /**
     * Encontrar caminho mais curto entre dois nós
     */
    findShortestPath(fromId, toId) {
        if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
            return null;
        }

        const distances = new Map();
        const previous = new Map();
        const queue = new Set([fromId]);

        // Inicializar distâncias
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, nodeId === fromId ? 0 : Infinity);
        }

        while (queue.size > 0) {
            // Encontrar nó com menor distância
            let minDistance = Infinity;
            let currentNode = null;

            for (const nodeId of queue) {
                const distance = distances.get(nodeId);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentNode = nodeId;
                }
            }

            if (!currentNode || distances.get(currentNode) === Infinity) break;

            queue.delete(currentNode);

            // Se encontrou destino, reconstruir caminho
            if (currentNode === toId) {
                const path = [];
                let node = toId;

                while (node) {
                    path.unshift(node);
                    node = previous.get(node);
                }

                return {
                    path,
                    distance: distances.get(toId),
                    nodes: path.map(id => this.nodes.get(id))
                };
            }

            // Atualizar distâncias dos vizinhos
            const neighbors = this.getNeighbors(currentNode);
            for (const neighborId of neighbors) {
                const edge = this.findEdge(currentNode, neighborId);
                const weight = edge ? edge.properties.weight : 1;
                const alt = distances.get(currentNode) + weight;

                if (alt < distances.get(neighborId)) {
                    distances.set(neighborId, alt);
                    previous.set(neighborId, currentNode);
                    queue.add(neighborId);
                }
            }
        }

        return null; // Nenhum caminho encontrado
    }

    /**
     * Integrar com RAG - busca híbrida (vector + graph)
     */
    async hybridSearch(query, options = {}) {
        const { embedding, text, topK = 10, graphWeight = 0.3, vectorWeight = 0.7 } = options;

        const results = [];

        // 1. Busca por similaridade vetorial
        let vectorResults = [];
        if (embedding && this.embeddingEnabled) {
            vectorResults = await this.searchByEmbedding(embedding, topK * 2);
        }

        // 2. Busca por texto
        let textResults = [];
        if (text) {
            textResults = this.searchByText(text, topK * 2);
        }

        // 3. Busca por relacionamentos no grafo
        const graphResults = await this.searchNodes({
            text: text,
            embedding: embedding,
            limit: topK * 2
        });

        // 4. Combinar resultados com pesos
        const combinedScores = new Map();

        // Adicionar scores de vector
        vectorResults.forEach(result => {
            const nodeId = result.nodeId;
            const currentScore = combinedScores.get(nodeId) || 0;
            combinedScores.set(nodeId, currentScore + result.score * vectorWeight);
        });

        // Adicionar scores de texto
        textResults.forEach(nodeId => {
            const currentScore = combinedScores.get(nodeId) || 0;
            combinedScores.set(nodeId, currentScore + 0.8 * vectorWeight); // Score fixo para matches de texto
        });

        // Adicionar scores de grafo
        graphResults.forEach(result => {
            const nodeId = result.node.id;
            const currentScore = combinedScores.get(nodeId) || 0;
            combinedScores.set(nodeId, currentScore + result.relevanceScore * graphWeight);
        });

        // 5. Ordenar e retornar top K
        const finalResults = Array.from(combinedScores.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, topK)
            .map(([nodeId, score]) => ({
                node: this.nodes.get(nodeId),
                score,
                enrichedContext: this.generateEnrichedContext(nodeId)
            }));

        return finalResults;
    }

    /**
     * Gerar contexto enriquecido com relacionamentos
     */
    generateEnrichedContext(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return null;

        const context = {
            node,
            relationships: [],
            relatedEntities: [],
            influence: 0,
            cluster: null
        };

        // Relacionamentos diretos
        const edges = [...this.getEdgesFrom(nodeId), ...this.getEdgesTo(nodeId)];
        context.relationships = edges.map(edge => ({
            type: edge.type,
            direction: edge.fromId === nodeId ? 'outbound' : 'inbound',
            relatedNode: edge.fromId === nodeId ?
                this.nodes.get(edge.toId) :
                this.nodes.get(edge.fromId),
            weight: edge.properties.weight,
            properties: edge.properties
        }));

        // Entidades relacionadas (top 5)
        const related = this.findRelatedNodes(nodeId, null, 2)
            .slice(0, 5);
        context.relatedEntities = related.map(r => ({
            node: r.node,
            relationship: r.relationships[0]?.edge?.type || 'related',
            distance: r.distance
        }));

        // Score de influência
        const influenceScores = this.calculatePageRank();
        context.influence = influenceScores.get(nodeId) || 0;

        return context;
    }

    /**
     * Métodos auxiliares
     */

    extractTextContent(node) {
        // Extrair conteúdo textual do nó para embedding
        const textFields = ['name', 'description', 'content', 'title', 'summary'];
        const texts = [];

        for (const field of textFields) {
            if (node.properties[field]) {
                texts.push(String(node.properties[field]));
            }
        }

        return texts.join(' ').substring(0, 1000); // Limitar tamanho
    }

    updateNodeIndexes(node) {
        // Índice por tipo
        if (!this.nodeIndex.has(node.type)) {
            this.nodeIndex.set(node.type, new Set());
        }
        this.nodeIndex.get(node.type).add(node.id);

        // Índice por tags
        node.metadata.tags.forEach(tag => {
            if (!this.tagIndex.has(tag)) {
                this.tagIndex.set(tag, new Set());
            }
            this.tagIndex.get(tag).add(node.id);
        });

        // Índice textual
        this.updateTextIndex(node);
    }

    updateEdgeIndexes(edge) {
        // Índice por tipo
        if (!this.edgeIndex.has(edge.type)) {
            this.edgeIndex.set(edge.type, new Set());
        }
        this.edgeIndex.get(edge.type).add(edge.id);
    }

    updateTextIndex(node) {
        const text = this.extractTextContent(node);
        if (!text) return;

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);

        words.forEach(word => {
            if (!this.textIndex.has(word)) {
                this.textIndex.set(word, new Set());
            }
            this.textIndex.get(word).add(node.id);
        });
    }

    searchByText(query, limit = 50) {
        const queryWords = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);

        const nodeScores = new Map();

        queryWords.forEach(word => {
            const nodes = this.textIndex.get(word);
            if (nodes) {
                nodes.forEach(nodeId => {
                    nodeScores.set(nodeId, (nodeScores.get(nodeId) || 0) + 1);
                });
            }
        });

        return new Set(
            Array.from(nodeScores.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([nodeId]) => nodeId)
        );
    }

    async searchByEmbedding(queryEmbedding, topK = 10) {
        if (!this.embeddingEnabled || this.vectorIndex.length === 0) {
            return [];
        }

        const similarities = this.vectorIndex.map(({ nodeId, embedding }) => ({
            nodeId,
            score: this.cosineSimilarity(queryEmbedding, embedding)
        }));

        return similarities
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    getNeighbors(nodeId) {
        const neighbors = new Set();

        // Vizinhos de saída
        this.edges.forEach(edge => {
            if (edge.fromId === nodeId) {
                neighbors.add(edge.toId);
            }
        });

        // Vizinhos de entrada (se aresta for bidirecional)
        this.edges.forEach(edge => {
            if (edge.toId === nodeId && edge.properties.direction !== 'directed') {
                neighbors.add(edge.fromId);
            }
        });

        return Array.from(neighbors);
    }

    getNeighborsWithEdges(nodeId, relationshipTypes = null) {
        const neighbors = [];

        this.edges.forEach(edge => {
            if (!relationshipTypes || relationshipTypes.includes(edge.type)) {
                if (edge.fromId === nodeId) {
                    neighbors.push({ neighborId: edge.toId, edge });
                } else if (edge.toId === nodeId && edge.properties.direction !== 'directed') {
                    neighbors.push({ neighborId: edge.fromId, edge });
                }
            }
        });

        return neighbors;
    }

    getEdgesFrom(nodeId) {
        return Array.from(this.edges.values()).filter(edge => edge.fromId === nodeId);
    }

    getEdgesTo(nodeId) {
        return Array.from(this.edges.values()).filter(edge => edge.toId === nodeId);
    }

    findEdge(fromId, toId, type = null) {
        for (const edge of this.edges.values()) {
            if (edge.fromId === fromId && edge.toId === toId) {
                if (!type || edge.type === type) {
                    return edge;
                }
            }
        }
        return null;
    }

    dfsCluster(startNodeId, visited) {
        const cluster = [];
        const stack = [startNodeId];

        while (stack.length > 0) {
            const nodeId = stack.pop();

            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                cluster.push(nodeId);

                // Adicionar vizinhos não visitados
                const neighbors = this.getNeighbors(nodeId);
                neighbors.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        stack.push(neighborId);
                    }
                });
            }
        }

        return cluster;
    }

    inferClusterType(cluster) {
        const nodeTypes = cluster.map(id => this.nodes.get(id)?.type);
        const typeCounts = {};

        nodeTypes.forEach(type => {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const dominantType = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0];

        return dominantType || 'mixed';
    }

    calculateClusterDensity(cluster) {
        const nodes = cluster.length;
        let edges = 0;

        for (let i = 0; i < cluster.length; i++) {
            for (let j = i + 1; j < cluster.length; j++) {
                if (this.findEdge(cluster[i], cluster[j])) {
                    edges++;
                }
            }
        }

        // Densidade = 2*edges / (nodes*(nodes-1))
        return nodes <= 1 ? 0 : (2 * edges) / (nodes * (nodes - 1));
    }

    calculatePageRank(dampingFactor = 0.85, iterations = 20) {
        const scores = new Map();

        // Inicializar scores
        const nodeIds = Array.from(this.nodes.keys());
        nodeIds.forEach(id => scores.set(id, 1.0 / nodeIds.length));

        for (let i = 0; i < iterations; i++) {
            const newScores = new Map();

            nodeIds.forEach(nodeId => {
                let score = (1 - dampingFactor) / nodeIds.length;

                // Soma dos scores dos nós que apontam para este
                const inboundEdges = this.getEdgesTo(nodeId);
                inboundEdges.forEach(edge => {
                    const sourceId = edge.fromId;
                    const sourceScore = scores.get(sourceId) || 0;
                    const outboundCount = this.getEdgesFrom(sourceId).length;
                    if (outboundCount > 0) {
                        score += dampingFactor * sourceScore / outboundCount;
                    }
                });

                newScores.set(nodeId, score);
            });

            // Atualizar scores
            nodeIds.forEach(id => scores.set(id, newScores.get(id)));
        }

        return scores;
    }

    updateStats() {
        this.stats.nodesCount = this.nodes.size;
        this.stats.edgesCount = this.edges.size;
        this.stats.typesCount = this.nodeIndex.size;
        this.stats.lastUpdated = new Date().toISOString();

        // Calcular conectividade média
        let totalConnections = 0;
        this.nodes.forEach((_, nodeId) => {
            totalConnections += this.getNeighbors(nodeId).length;
        });
        this.stats.avgConnectivity = this.nodes.size > 0 ? totalConnections / this.nodes.size : 0;

        // Nó mais conectado
        let maxConnections = 0;
        let mostConnected = null;
        this.nodes.forEach((_, nodeId) => {
            const connections = this.getNeighbors(nodeId).length;
            if (connections > maxConnections) {
                maxConnections = connections;
                mostConnected = nodeId;
            }
        });
        this.stats.mostConnectedNode = mostConnected;
    }

    cleanupQueryCache() {
        const now = Date.now();
        for (const [key, cached] of this.queryCache.entries()) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.queryCache.delete(key);
            }
        }
    }

    async loadPersistedData() {
        // Em produção, carregaria do Neo4j ou banco persistente
        // Por enquanto, mantém dados em memória
    }

    async persistNode(node) {
        // Em produção, persistiria no Neo4j
    }

    async persistEdge(edge) {
        // Em produção, persistiria no Neo4j
    }

    async buildIndexes() {
        // Reconstruir índices (chamado na inicialização)
        this.nodeIndex.clear();
        this.edgeIndex.clear();
        this.textIndex.clear();
        this.tagIndex.clear();

        // Reconstruir índices de nós
        this.nodes.forEach(node => this.updateNodeIndexes(node));

        // Reconstruir índices de arestas
        this.edges.forEach(edge => this.updateEdgeIndexes(edge));

        // Reconstruir índice vetorial
        if (this.embeddingEnabled) {
            this.vectorIndex = [];
            for (const [nodeId, node] of this.nodes) {
                if (node.embedding) {
                    this.vectorIndex.push({ nodeId, embedding: node.embedding });
                }
            }
        }
    }

    /**
     * Obter estatísticas do grafo
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Obter estrutura completa do grafo (para visualização)
     */
    getGraphStructure(options = {}) {
        const { includeEmbeddings = false, maxNodes = 1000 } = options;

        const nodes = Array.from(this.nodes.values())
            .slice(0, maxNodes)
            .map(node => ({
                id: node.id,
                type: node.type,
                properties: node.properties,
                metadata: {
                    ...node.metadata,
                    embedding: includeEmbeddings ? node.embedding : null
                }
            }));

        const edges = Array.from(this.edges.values())
            .filter(edge => this.nodes.has(edge.fromId) && this.nodes.has(edge.toId))
            .map(edge => ({
                id: edge.id,
                fromId: edge.fromId,
                toId: edge.toId,
                type: edge.type,
                properties: edge.properties,
                metadata: edge.metadata
            }));

        return { nodes, edges, stats: this.stats };
    }

    /**
     * Encerrar base de conhecimento
     */
    async shutdown() {
        log.info('Shutting down Graph Knowledge Base');

        // Persistir dados finais se habilitado
        if (this.persistenceEnabled) {
            // Em produção, salvaria dados no Neo4j
        }

        log.info('Graph Knowledge Base shutdown completed');
    }
}

// Singleton
let graphKnowledgeBaseInstance = null;

export function getGraphKnowledgeBase(options = {}) {
    if (!graphKnowledgeBaseInstance) {
        graphKnowledgeBaseInstance = new GraphKnowledgeBase(options);
    }
    return graphKnowledgeBaseInstance;
}

export default GraphKnowledgeBase;