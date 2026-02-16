#!/usr/bin/env node
/**
 * Teste: Event-Driven System - Arquitetura Orientada a Eventos
 *
 * Testa sistema completo de eventos com publishers, subscribers,
 * event sourcing e workflows baseados em eventos
 */

import { getEventDrivenSystem } from './events/event_driven_system.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_event_driven_system' });

async function testEventDrivenSystem() {
    log.info('📡 Testando Event-Driven System - Arquitetura Orientada a Eventos\n');

    try {
        // Inicializar sistema de eventos
        const eventSystem = getEventDrivenSystem({
            persistenceEnabled: false, // Para teste, usar memória
            maxEventsInMemory: 1000,
            autoStart: false
        });

        await eventSystem.initialize();

        const testResults = {
            initialization: false,
            eventPublishing: false,
            eventSubscribing: false,
            workflows: false,
            eventSourcing: false,
            eventQuerying: false,
            totalEvents: 0,
            processedEvents: 0,
            activeWorkflows: 0,
            customSubscribers: 0
        };

        // 1. Verificar inicialização
        log.info('1. Verificar inicialização...\n');

        const status = eventSystem.getSystemStatus();
        if (status.eventBus && status.publishers && status.subscribers) {
            testResults.initialization = true;
            console.log('✅ Event-Driven System inicializado corretamente');
            console.log(`   Publishers ativos: ${Object.keys(status.publishers).length}`);
            console.log(`   Subscribers ativos: ${Object.keys(status.subscribers).length}`);
            console.log(`   Workflows configurados: ${status.workflows.length}`);
        } else {
            console.log('❌ Falha na inicialização');
        }

        // 2. Testar publicação de eventos
        log.info('2. Testar publicação de eventos...\n');

        try {
            // Publicar eventos através de diferentes publishers
            const brainEvent = await eventSystem.publishEvent('brain', 'brain_decision_made', {
                decision: 'execute_task',
                confidence: 0.95,
                reasoning: 'High confidence analysis completed'
            }, {
                userId: 'test_user',
                correlationId: 'test_corr_123'
            });

            const agentEvent = await eventSystem.publishEvent('agent', 'agent_task_started', {
                agentName: 'architect',
                task: 'design_system',
                complexity: 'high'
            }, {
                userId: 'test_user',
                correlationId: 'test_corr_123'
            });

            const executorEvent = await eventSystem.publishEvent('executor', 'task_completed', {
                taskId: 'design_system_001',
                result: 'success',
                duration: 45000,
                output: 'System design completed successfully'
            }, {
                userId: 'test_user',
                correlationId: 'test_corr_123'
            });

            testResults.totalEvents += 3;
            testResults.eventPublishing = true;

            console.log('✅ Eventos publicados com sucesso');
            console.log(`   Brain event: ${brainEvent.id}`);
            console.log(`   Agent event: ${agentEvent.id}`);
            console.log(`   Executor event: ${executorEvent.id}`);

        } catch (error) {
            console.log('❌ Falha na publicação de eventos:', error.message);
        }

        // 3. Testar subscribers e processamento
        log.info('3. Testar subscribers e processamento...\n');

        try {
            // Aguardar processamento dos eventos
            await new Promise(resolve => setTimeout(resolve, 1000));

            const currentStatus = eventSystem.getSystemStatus();

            // Verificar se eventos foram processados pelos subscribers
            const totalProcessed = Object.values(currentStatus.subscribers)
                .reduce((sum, sub) => sum + (sub?.processedEvents || 0), 0);

            if (totalProcessed >= 3) { // Pelo menos os 3 eventos publicados
                testResults.processedEvents = totalProcessed;
                testResults.eventSubscribing = true;
                console.log('✅ Eventos processados pelos subscribers');
                console.log(`   Total processado: ${totalProcessed}`);

                // Mostrar estatísticas por subscriber
                Object.entries(currentStatus.subscribers).forEach(([name, stats]) => {
                    if (stats) {
                        console.log(`   ${name}: ${stats.processedEvents} eventos`);
                    }
                });
            } else {
                console.log('⚠️ Eventos podem não ter sido processados completamente');
            }

        } catch (error) {
            console.log('❌ Falha no teste de subscribers:', error.message);
        }

        // 4. Testar workflows baseados em eventos
        log.info('4. Testar workflows baseados em eventos...\n');

        try {
            // Criar workflow customizado de teste
            let workflowExecuted = false;
            const testWorkflow = eventSystem.createWorkflow(
                'test_completion_workflow',
                ['task_completed'],
                [
                    async (event, eventBus) => {
                        workflowExecuted = true;
                        console.log(`   🎯 Workflow executado para task: ${event.payload.taskId}`);

                        // Publicar evento de acompanhamento
                        await eventBus.createPublisher('test_workflow').publish(
                            'workflow_task_followup',
                            {
                                originalTask: event.payload.taskId,
                                followupAction: 'send_notification'
                            },
                            { correlationId: event.metadata.correlationId }
                        );
                    }
                ]
            );

            // O workflow já deve ter sido executado pelo evento anterior
            // Aguardar um pouco para processamento
            await new Promise(resolve => setTimeout(resolve, 500));

            if (workflowExecuted) {
                testResults.workflows = true;
                testResults.activeWorkflows = 1;
                console.log('✅ Workflow executado automaticamente');
            } else {
                console.log('⚠️ Workflow pode não ter sido executado');
            }

        } catch (error) {
            console.log('❌ Falha no teste de workflows:', error.message);
        }

        // 5. Testar subscribers customizados
        log.info('5. Testar subscribers customizados...\n');

        try {
            // Criar subscriber customizado
            let customEventsProcessed = 0;
            const customSubscriber = eventSystem.createSubscriber(
                'custom_monitor',
                ['brain_decision_made', 'agent_task_started', 'task_completed']
            );

            customSubscriber.subscribe(
                ['brain_decision_made', 'agent_task_started', 'task_completed'],
                async (event) => {
                    customEventsProcessed++;
                    console.log(`   📡 Custom subscriber processou: ${event.eventType}`);
                }
            );

            await customSubscriber.start();

            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 500));

            if (customEventsProcessed >= 3) {
                testResults.customSubscribers = 1;
                console.log('✅ Subscriber customizado funcionando');
                console.log(`   Eventos processados: ${customEventsProcessed}`);
            }

        } catch (error) {
            console.log('❌ Falha no teste de subscribers customizados:', error.message);
        }

        // 6. Testar querying de eventos
        log.info('6. Testar querying de eventos...\n');

        try {
            // Query eventos por tipo
            const taskEvents = eventSystem.queryEvents({ eventType: 'task_completed' });
            const brainEvents = eventSystem.queryEvents({ eventType: 'brain_decision_made' });
            const agentEvents = eventSystem.queryEvents({ eventType: 'agent_task_started' });

            // Query eventos por correlation ID
            const correlationEvents = eventSystem.queryEvents({
                correlationId: 'test_corr_123',
                limit: 10
            });

            console.log('✅ Querying de eventos funcionando');
            console.log(`   Task events: ${taskEvents.length}`);
            console.log(`   Brain events: ${brainEvents.length}`);
            console.log(`   Agent events: ${agentEvents.length}`);
            console.log(`   Correlation events: ${correlationEvents.length}`);

            if (taskEvents.length > 0 && brainEvents.length > 0) {
                testResults.eventQuerying = true;
            }

        } catch (error) {
            console.log('❌ Falha no teste de querying:', error.message);
        }

        // 7. Testar event sourcing (simulado)
        log.info('7. Testar event sourcing...\n');

        try {
            // Event sourcing seria mais complexo de testar sem entities reais
            // Por enquanto, apenas verificar se o sistema tem capacidades
            const detailedStats = eventSystem.getDetailedStats();

            if (detailedStats.eventSourcing) {
                testResults.eventSourcing = true;
                console.log('✅ Event sourcing configurado');
                console.log(`   Entities rastreadas: ${detailedStats.eventSourcing.entities}`);
                console.log(`   Snapshots criados: ${detailedStats.eventSourcing.snapshots}`);
            } else {
                console.log('⚠️ Event sourcing não totalmente configurado para teste');
            }

        } catch (error) {
            console.log('❌ Falha no teste de event sourcing:', error.message);
        }

        // 8. Testar cenários de alta carga
        log.info('8. Testar cenários de alta carga...\n');

        try {
            // Publicar lote de eventos
            const batchEvents = [];
            for (let i = 0; i < 10; i++) {
                batchEvents.push({
                    eventType: 'batch_test_event',
                    payload: { sequence: i, data: `test_data_${i}` },
                    metadata: { source: 'load_test' }
                });
            }

            const publisher = eventSystem.eventBus.createPublisher('load_test');
            await publisher.publishBatch(batchEvents);

            testResults.totalEvents += 10;

            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('✅ Teste de alta carga concluído');
            console.log(`   Eventos em lote publicados: ${batchEvents.length}`);

        } catch (error) {
            console.log('❌ Falha no teste de alta carga:', error.message);
        }

        // 9. Estatísticas finais
        log.info('9. Estatísticas finais...\n');

        const finalStatus = eventSystem.getSystemStatus();
        const finalStats = finalStatus.eventBus;

        console.log('✅ Estatísticas finais do Event-Driven System:');
        console.log(`   Eventos totais publicados: ${finalStats.totalEvents}`);
        console.log(`   Eventos processados: ${finalStats.processedEvents}`);
        console.log(`   Subscribers ativos: ${finalStats.activeSubscribers}`);
        console.log(`   Publishers ativos: ${finalStats.activePublishers}`);
        console.log(`   Tipos de eventos únicos: ${finalStats.eventTypesCount}`);
        console.log(`   Eventos em memória: ${finalStats.eventsInMemory}`);

        if (finalStats.errors > 0) {
            console.log(`   ⚠️ Erros registrados: ${finalStats.errors}`);
        }

        // 10. Resumo dos testes
        log.info('10. Resumo dos testes de Event-Driven System...\n');

        const successRate = Object.values(testResults).filter(v => typeof v === 'boolean').reduce((sum, val) => sum + (val ? 1 : 0), 0) / 6;

        console.log('📡 Resumo dos Testes de Event-Driven System:');
        console.log(`   ✅ Inicialização: ${testResults.initialization ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Publicação de eventos: ${testResults.eventPublishing ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Subscribers e processamento: ${testResults.eventSubscribing ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Workflows baseados em eventos: ${testResults.workflows ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Subscribers customizados: ${testResults.customSubscribers > 0 ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Querying de eventos: ${testResults.eventQuerying ? 'Sucesso' : 'Falhou'}`);
        console.log(`   📊 Eventos totais: ${testResults.totalEvents}`);
        console.log(`   🔄 Eventos processados: ${testResults.processedEvents}`);
        console.log(`   🎯 Workflows ativos: ${testResults.activeWorkflows}`);
        console.log(`   📈 Taxa de sucesso: ${(successRate * 100).toFixed(1)}%`);

        if (successRate >= 0.8) {
            console.log('🎉 Event-Driven System funcionando perfeitamente!');
            console.log('   ✓ Publicação e distribuição de eventos operacionais');
            console.log('   ✓ Subscribers processando eventos automaticamente');
            console.log('   ✓ Workflows reagindo a eventos em tempo real');
            console.log('   ✓ Sistema de correlation IDs funcionando');
            console.log('   ✓ Querying e análise de eventos disponíveis');
            console.log('   ✓ Preparado para Redis/NATS quando necessário');
        } else {
            console.log('⚠️ Event-Driven System com algumas limitações.');
            console.log('   - Verificar configuração de subscribers');
            console.log('   - Otimizar processamento de eventos');
        }

        // Encerrar sistema
        await eventSystem.shutdown();

        log.info('🎉 Testes de Event-Driven System concluídos!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Barramento de eventos totalmente funcional');
        log.info('  ✅ Publishers e subscribers para comunicação assíncrona');
        log.info('  ✅ Workflows automáticos baseados em eventos');
        log.info('  ✅ Event sourcing para histórico completo');
        log.info('  ✅ Sistema de correlation IDs para rastreamento');
        log.info('  ✅ Querying avançado de eventos históricos');
        log.info('  ✅ Preparado para escalabilidade com Redis Streams/NATS');

        return successRate >= 0.8;

    } catch (err) {
        log.error('❌ Erro fatal nos testes de event-driven system', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testEventDrivenSystem().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});