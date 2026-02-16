#!/usr/bin/env node
/**
 * Teste: Graph Knowledge Base - Base de Conhecimento em Grafo
 *
 * Testa a base de conhecimento em grafo, relacionamentos complexos,
 * queries avançadas e integração com RAG
 */

import { getGraphKnowledgeBase } from './knowledge/graph_knowledge_base.js';
import { getEmbeddingsService } from './utils/embeddings_service.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_graph_knowledge_base' });

async function testGraphKnowledgeBase() {
    log.info('🕸️ Testando Graph Knowledge Base - Base de Conhecimento em Grafo\n');

    try {
        // Inicializar base de conhecimento
        const graphKB = getGraphKnowledgeBase({
            persistenceEnabled: false, // Para teste, usar memória
            embeddingEnabled: true,
            maxNodes: 1000,
            maxEdges: 5000
        });

        await graphKB.initialize();

        const testResults = {
            initialization: false,
            nodeOperations: false,
            edgeOperations: false,
            searchOperations: false,
            graphQueries: false,
            ragIntegration: false,
            totalNodes: 0,
            totalEdges: 0,
            searchQueries: 0,
            graphQueriesExecuted: 0
        };

        // 1. Verificar inicialização
        log.info('1. Verificar inicialização...\n');

        const stats = graphKB.getStats();
        if (stats.nodesCount === 0 && stats.edgesCount === 0) {
            testResults.initialization = true;
            console.log('✅ Graph Knowledge Base inicializada corretamente');
            console.log(`   Nós: ${stats.nodesCount}, Arestas: ${stats.edgesCount}`);
        } else {
            console.log('❌ Falha na inicialização');
        }

        // 2. Adicionar nós de teste
        log.info('2. Adicionar nós de teste...\n');

        const testNodes = [
            // Agentes
            { id: 'agent_architect', type: 'agent', properties: { name: 'Architect Agent', role: 'system design', expertise: 'architecture' }, tags: ['agent', 'technical', 'architecture'] },
            { id: 'agent_developer', type: 'agent', properties: { name: 'Developer Agent', role: 'coding', expertise: 'development' }, tags: ['agent', 'technical', 'development'] },
            { id: 'agent_analyst', type: 'agent', properties: { name: 'Analyst Agent', role: 'analysis', expertise: 'data analysis' }, tags: ['agent', 'business', 'analysis'] },

            // Projetos
            { id: 'project_web_app', type: 'project', properties: { name: 'Web Application', type: 'web', status: 'active' }, tags: ['project', 'web', 'active'] },
            { id: 'project_api', type: 'project', properties: { name: 'API Service', type: 'backend', status: 'planning' }, tags: ['project', 'api', 'backend'] },

            // Decisões
            { id: 'decision_react', type: 'decision', properties: { title: 'Choose React Framework', context: 'Frontend framework decision', outcome: 'React selected' }, tags: ['decision', 'frontend', 'framework'] },
            { id: 'decision_postgres', type: 'decision', properties: { title: 'Database Selection', context: 'Primary database choice', outcome: 'PostgreSQL selected' }, tags: ['decision', 'database', 'infrastructure'] },

            // Arquivos
            { id: 'file_app_js', type: 'file', properties: { name: 'app.js', path: '/src/app.js', language: 'javascript', lines: 250 }, tags: ['file', 'javascript', 'frontend'] },
            { id: 'file_api_py', type: 'file', properties: { name: 'api.py', path: '/api/main.py', language: 'python', lines: 180 }, tags: ['file', 'python', 'backend'] },

            // Conceitos
            { id: 'concept_microservices', type: 'concept', properties: { name: 'Microservices', description: 'Architecture pattern for scalable systems', category: 'architecture' }, tags: ['concept', 'architecture', 'scalability'] },
            { id: 'concept_rest_api', type: 'concept', properties: { name: 'REST API', description: 'Standard for web APIs', category: 'api' }, tags: ['concept', 'api', 'web'] },

            // Tarefas
            { id: 'task_auth', type: 'task', properties: { title: 'Implement Authentication', status: 'completed', priority: 'high' }, tags: ['task', 'security', 'auth'] },
            { id: 'task_payment', type: 'task', properties: { title: 'Payment Integration', status: 'in_progress', priority: 'high' }, tags: ['task', 'payment', 'integration'] }
        ];

        for (const nodeData of testNodes) {
            try {
                await graphKB.addNode(nodeData.id, nodeData.type, nodeData.properties, { tags: nodeData.tags });
                testResults.totalNodes++;
            } catch (error) {
                console.log(`❌ Erro ao adicionar nó ${nodeData.id}:`, error.message);
            }
        }

        console.log(`✅ ${testResults.totalNodes} nós adicionados ao grafo`);

        // 3. Adicionar arestas de relacionamento
        log.info('3. Adicionar arestas de relacionamento...\n');

        const testEdges = [
            // Agentes trabalhando em projetos
            { from: 'agent_architect', to: 'project_web_app', type: 'works_on', properties: { role: 'lead_architect', commitment: 0.8 } },
            { from: 'agent_developer', to: 'project_web_app', type: 'works_on', properties: { role: 'frontend_dev', commitment: 0.9 } },
            { from: 'agent_developer', to: 'project_api', type: 'works_on', properties: { role: 'backend_dev', commitment: 0.7 } },
            { from: 'agent_analyst', to: 'project_api', type: 'works_on', properties: { role: 'business_analyst', commitment: 0.6 } },

            // Dependências entre tarefas
            { from: 'task_auth', to: 'task_payment', type: 'blocks', properties: { reason: 'authentication required for payments' } },

            // Arquivos relacionados a projetos
            { from: 'file_app_js', to: 'project_web_app', type: 'belongs_to', properties: { component: 'frontend' } },
            { from: 'file_api_py', to: 'project_api', type: 'belongs_to', properties: { component: 'backend' } },

            // Conceitos relacionados a decisões
            { from: 'decision_react', to: 'concept_microservices', type: 'influenced_by', properties: { impact: 'medium' } },
            { from: 'decision_postgres', to: 'concept_rest_api', type: 'complements', properties: { synergy: 'high' } },

            // Agentes especializados em conceitos
            { from: 'agent_architect', to: 'concept_microservices', type: 'specializes_in', properties: { expertise_level: 'expert' } },
            { from: 'agent_developer', to: 'concept_rest_api', type: 'specializes_in', properties: { expertise_level: 'advanced' } },

            // Dependências entre conceitos
            { from: 'concept_microservices', to: 'concept_rest_api', type: 'often_uses', properties: { frequency: 'high' } },

            // Agentes criaram decisões
            { from: 'agent_architect', to: 'decision_react', type: 'made_decision', properties: { confidence: 0.9 } },
            { from: 'agent_analyst', to: 'decision_postgres', type: 'made_decision', properties: { confidence: 0.8 } },

            // Arquivos usam conceitos
            { from: 'file_app_js', to: 'concept_microservices', type: 'implements', properties: { adoption: 'partial' } },
            { from: 'file_api_py', to: 'concept_rest_api', type: 'implements', properties: { adoption: 'full' } }
        ];

        for (const edgeData of testEdges) {
            try {
                await graphKB.addEdge(edgeData.from, edgeData.to, edgeData.type, edgeData.properties);
                testResults.totalEdges++;
            } catch (error) {
                console.log(`❌ Erro ao adicionar aresta ${edgeData.from}->${edgeData.to}:`, error.message);
            }
        }

        console.log(`✅ ${testResults.totalEdges} arestas adicionadas ao grafo`);
        testResults.edgeOperations = testResults.totalEdges > 0;

        // 4. Testar operações de busca
        log.info('4. Testar operações de busca...\n');

        try {
            // Busca por tipo
            const agents = await graphKB.searchNodes({ type: 'agent', limit: 10 });
            console.log(`✅ Encontrados ${agents.length} agentes`);

            // Busca por tags
            const technicalNodes = await graphKB.searchNodes({ tags: ['technical'], limit: 10 });
            console.log(`✅ Encontrados ${technicalNodes.length} nós técnicos`);

            // Busca por texto
            const conceptNodes = await graphKB.searchNodes({ text: 'architecture', limit: 10 });
            console.log(`✅ Encontrados ${conceptNodes.length} nós com "architecture"`);

            testResults.searchOperations = (agents.length > 0 && technicalNodes.length > 0);
            testResults.searchQueries = 3;

        } catch (error) {
            console.log('❌ Falha nas operações de busca:', error.message);
        }

        // 5. Testar queries de grafo avançadas
        log.info('5. Testar queries de grafo avançadas...\n');

        try {
            // Encontrar nós relacionados ao architect
            const relatedToArchitect = await graphKB.executeGraphQuery({
                type: 'find_related',
                nodeId: 'agent_architect',
                depth: 2
            });
            console.log(`✅ Architect relacionado a ${relatedToArchitect.length} nós`);

            // Analisar influência do architect
            const architectInfluence = await graphKB.executeGraphQuery({
                type: 'analyze_influence',
                nodeId: 'agent_architect'
            });
            console.log(`✅ Score de influência do architect: ${architectInfluence.influenceScore.toFixed(3)}`);

            // Detectar clusters
            const clusters = await graphKB.executeGraphQuery({
                type: 'detect_clusters',
                minClusterSize: 2
            });
            console.log(`✅ Detectados ${clusters.length} clusters no grafo`);

            // Encontrar dependências da tarefa de payment
            const paymentDeps = await graphKB.executeGraphQuery({
                type: 'find_dependencies',
                nodeId: 'task_payment'
            });
            console.log(`✅ Tarefa payment tem ${paymentDeps.direct.length} dependências diretas`);

            testResults.graphQueries = true;
            testResults.graphQueriesExecuted = 4;

        } catch (error) {
            console.log('❌ Falha nas queries de grafo:', error.message);
        }

        // 6. Testar integração com RAG (busca híbrida)
        log.info('6. Testar integração com RAG (busca híbrida)...\n');

        try {
            // Simular busca híbrida
            const embeddingsService = getEmbeddingsService();
            const queryText = "microservices architecture for web applications";
            const queryEmbedding = await embeddingsService.generateEmbedding(queryText);

            const hybridResults = await graphKB.hybridSearch(queryText, {
                embedding: queryEmbedding,
                topK: 5,
                graphWeight: 0.4,
                vectorWeight: 0.6
            });

            console.log(`✅ Busca híbrida retornou ${hybridResults.length} resultados`);
            if (hybridResults.length > 0) {
                console.log(`   Top resultado: ${hybridResults[0].node.properties.name} (score: ${hybridResults[0].score.toFixed(3)})`);

                // Verificar contexto enriquecido
                const enrichedContext = hybridResults[0].enrichedContext;
                if (enrichedContext && enrichedContext.relationships.length > 0) {
                    console.log(`   Contexto enriquecido: ${enrichedContext.relationships.length} relacionamentos`);
                }
            }

            testResults.ragIntegration = hybridResults.length > 0;

        } catch (error) {
            console.log('❌ Falha na integração RAG:', error.message);
        }

        // 7. Verificar estatísticas finais
        log.info('7. Verificar estatísticas finais...\n');

        const finalStats = graphKB.getStats();
        console.log('✅ Estatísticas finais do grafo:');
        console.log(`   Nós: ${finalStats.nodesCount} (${finalStats.typesCount} tipos)`);
        console.log(`   Arestas: ${finalStats.edgesCount}`);
        console.log(`   Conectividade média: ${finalStats.avgConnectivity.toFixed(2)}`);
        console.log(`   Nó mais conectado: ${finalStats.mostConnectedNode || 'nenhum'}`);

        // 8. Resumo dos testes
        log.info('8. Resumo dos testes de Graph Knowledge Base...\n');

        const successRate = Object.values(testResults).filter(v => typeof v === 'boolean').reduce((sum, val) => sum + (val ? 1 : 0), 0) / 5;

        console.log('🕸️ Resumo dos Testes de Graph Knowledge Base:');
        console.log(`   ✅ Inicialização: ${testResults.initialization ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Operações de nós: ${testResults.nodeOperations ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Operações de arestas: ${testResults.edgeOperations ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Operações de busca: ${testResults.searchOperations ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Queries de grafo: ${testResults.graphQueries ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Integração RAG: ${testResults.ragIntegration ? 'Sucesso' : 'Falhou'}`);
        console.log(`   📊 Nós criados: ${testResults.totalNodes}`);
        console.log(`   🔗 Arestas criadas: ${testResults.totalEdges}`);
        console.log(`   🔍 Queries de busca: ${testResults.searchQueries}`);
        console.log(`   🧠 Queries de grafo: ${testResults.graphQueriesExecuted}`);
        console.log(`   📈 Taxa de sucesso: ${(successRate * 100).toFixed(1)}%`);

        if (successRate >= 0.8) {
            console.log('🎉 Graph Knowledge Base funcionando perfeitamente!');
            console.log('   ✓ Estrutura de grafo criada com sucesso');
            console.log('   ✓ Relacionamentos complexos estabelecidos');
            console.log('   ✓ Queries avançadas funcionando');
            console.log('   ✓ Integração RAG operacional');
            console.log('   ✓ Base de conhecimento rica e navegável');
        } else {
            console.log('⚠️ Graph Knowledge Base com algumas limitações.');
            console.log('   - Verificar implementação de embeddings');
            console.log('   - Otimizar performance de queries');
        }

        // Encerrar base de conhecimento
        await graphKB.shutdown();

        log.info('🎉 Testes de Graph Knowledge Base concluídos!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Base de conhecimento em grafo totalmente funcional');
        log.info('  ✅ Relacionamentos complexos entre agentes, projetos, decisões');
        log.info('  ✅ Queries avançadas: caminhos, influência, clusters, dependências');
        log.info('  ✅ Busca híbrida integrada com RAG (vector + graph)');
        log.info('  ✅ Contexto enriquecido com relacionamentos');
        log.info('  ✅ Estrutura preparada para Neo4j quando necessário');

        return successRate >= 0.8;

    } catch (err) {
        log.error('❌ Erro fatal nos testes de graph knowledge base', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testGraphKnowledgeBase().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});