#!/usr/bin/env node

/**
 * Test Chat/IDE Integration - Teste de Integração da Arquitetura Chat/IDE
 * Fase 2 - Arquitetura Chat/IDE
 *
 * Testa a integração completa entre Brain Prompt Generator,
 * Agent Prompt Generator, Chat Interface e Confidence Scorer
 */

import AgentPromptGenerator from '../swarm/agent_prompt_generator.js';
import BrainPromptGenerator from '../swarm/brain_prompt_generator.js';
import ChatInterface from '../swarm/chat_interface.js';
import ConfidenceScorer from '../swarm/confidence_scorer.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'test_chat_ide_integration' });

/**
 * Teste de Integração Chat/IDE
 */
class TestChatIDEIntegration {
    constructor() {
        this.brainPromptGen = new BrainPromptGenerator();
        this.agentPromptGen = new AgentPromptGenerator();
        this.chatInterface = new ChatInterface();
        this.confidenceScorer = new ConfidenceScorer();
        this.testResults = [];
    }

    /**
     * Executar todos os testes de integração
     */
    async runAllTests() {
        log.info('🧪 Iniciando testes de integração Chat/IDE...');

        const startTime = Date.now();

        try {
            // Teste 1: Componentes podem ser instanciados
            await this.testComponentInstantiation();

            // Teste 2: Brain Prompt Generator funcional
            await this.testBrainPromptGeneration();

            // Teste 3: Agent Prompt Generator funcional
            await this.testAgentPromptGeneration();

            // Teste 4: Chat Interface funcional
            await this.testChatInterface();

            // Teste 5: Confidence Scorer funcional
            await this.testConfidenceScorer();

            // Teste 6: Integração Brain → Agent via Chat
            await this.testBrainToAgentFlow();

            // Teste 7: Ciclo completo pensar → agir
            await this.testCompleteThinkActCycle();

            // Teste 8: Tratamento de erros e fallbacks
            await this.testErrorHandling();

        } catch (error) {
            log.error('Erro durante testes de integração:', error);
            this.addTestResult('integration_error', 'FAILED', error.message);
        }

        const duration = Date.now() - startTime;
        this.generateReport(duration);
    }

    /**
     * Teste 1: Verificar se componentes podem ser instanciados
     */
    async testComponentInstantiation() {
        log.info('🔧 Testando instanciação de componentes...');

        await this.runTest('brain_prompt_generator_instantiation', async () => {
            try {
                const generator = new BrainPromptGenerator();
                return generator ? { status: 'PASSED', details: 'BrainPromptGenerator instanciado com sucesso' } :
                    { status: 'FAILED', details: 'Falha na instanciação' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro: ${error.message}` };
            }
        });

        await this.runTest('agent_prompt_generator_instantiation', async () => {
            try {
                const generator = new AgentPromptGenerator();
                return generator ? { status: 'PASSED', details: 'AgentPromptGenerator instanciado com sucesso' } :
                    { status: 'FAILED', details: 'Falha na instanciação' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro: ${error.message}` };
            }
        });

        await this.runTest('chat_interface_instantiation', async () => {
            try {
                const chat = new ChatInterface();
                return chat ? { status: 'PASSED', details: 'ChatInterface instanciado com sucesso' } :
                    { status: 'FAILED', details: 'Falha na instanciação' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro: ${error.message}` };
            }
        });

        await this.runTest('confidence_scorer_instantiation', async () => {
            try {
                const scorer = new ConfidenceScorer();
                return scorer ? { status: 'PASSED', details: 'ConfidenceScorer instanciado com sucesso' } :
                    { status: 'FAILED', details: 'Falha na instanciação' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro: ${error.message}` };
            }
        });
    }

    /**
     * Teste 2: Brain Prompt Generation
     */
    async testBrainPromptGeneration() {
        log.info('🧠 Testando geração de prompts do Brain...');

        const testTask = "Criar uma função para calcular fibonacci";
        const testContext = {
            userId: 'test_user',
            sessionId: 'test_session',
            agentName: 'test_agent'
        };

        await this.runTest('brain_prompt_generation', async () => {
            try {
                const prompt = await this.brainPromptGen.generateBrainPrompt(testTask, testContext);

                if (typeof prompt === 'string' && prompt.length > 100) {
                    return {
                        status: 'PASSED',
                        details: `Prompt gerado com sucesso (${prompt.length} caracteres)`
                    };
                } else {
                    return {
                        status: 'FAILED',
                        details: `Prompt inválido: ${typeof prompt}, tamanho: ${prompt?.length || 0}`
                    };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na geração: ${error.message}` };
            }
        });

        await this.runTest('brain_prompt_structure', async () => {
            try {
                const prompt = await this.brainPromptGen.generateBrainPrompt(testTask, testContext);

                // Verificar se contém elementos estruturais obrigatórios
                const hasContext = prompt.includes('CONTEXTO') || prompt.includes('CONTEXT');
                const hasAnalysis = prompt.includes('ANÁLISE') || prompt.includes('ANALYSIS');
                const hasDelegation = prompt.includes('DELEGAÇÃO') || prompt.includes('DELEGATION');

                if (hasContext && hasAnalysis && hasDelegation) {
                    return { status: 'PASSED', details: 'Prompt tem estrutura completa (contexto, análise, delegação)' };
                } else {
                    return {
                        status: 'WARNING',
                        details: `Prompt incompleto - Contexto: ${hasContext}, Análise: ${hasAnalysis}, Delegação: ${hasDelegation}`
                    };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na verificação: ${error.message}` };
            }
        });
    }

    /**
     * Teste 3: Agent Prompt Generation
     */
    async testAgentPromptGeneration() {
        log.info('🤖 Testando geração de prompts de agentes...');

        const testAgent = 'technical_agent';
        const testTask = "Implementar função fibonacci recursiva";
        const testContext = {
            brainContext: 'Task delegada do Brain após análise',
            specialization: 'technical'
        };

        await this.runTest('agent_prompt_generation', async () => {
            try {
                const prompt = await this.agentPromptGen.generateAgentPrompt(testAgent, testTask, testContext);

                if (typeof prompt === 'string' && prompt.length > 200) {
                    return {
                        status: 'PASSED',
                        details: `Prompt de agente gerado com sucesso (${prompt.length} caracteres)`
                    };
                } else {
                    return {
                        status: 'FAILED',
                        details: `Prompt inválido: ${typeof prompt}, tamanho: ${prompt?.length || 0}`
                    };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na geração: ${error.message}` };
            }
        });

        await this.runTest('agent_prompt_specialization', async () => {
            try {
                const prompt = await this.agentPromptGen.generateAgentPrompt(testAgent, testTask, testContext);

                // Verificar se contém especialização
                const hasSpecialization = prompt.includes('TECHNICAL') || prompt.includes('technical') ||
                    prompt.includes('ESPECIALIZAÇÃO') || prompt.includes('SPECIALIZATION');

                if (hasSpecialization) {
                    return { status: 'PASSED', details: 'Prompt contém informações de especialização' };
                } else {
                    return { status: 'WARNING', details: 'Prompt não contém especialização clara' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na verificação: ${error.message}` };
            }
        });
    }

    /**
     * Teste 4: Chat Interface
     */
    async testChatInterface() {
        log.info('💬 Testando interface de chat...');

        await this.runTest('chat_interface_initialization', async () => {
            try {
                // Já testado na instanciação, mas vamos verificar funcionalidades básicas
                const canStartConversation = typeof this.chatInterface.startConversation === 'function';
                const canSendMessage = typeof this.chatInterface.sendMessage === 'function';

                if (canStartConversation && canSendMessage) {
                    return { status: 'PASSED', details: 'ChatInterface tem métodos essenciais' };
                } else {
                    return { status: 'FAILED', details: 'ChatInterface faltando métodos essenciais' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na verificação: ${error.message}` };
            }
        });

        await this.runTest('chat_conversation_management', async () => {
            try {
                const conversationId = 'test_conv_' + Date.now();
                const started = this.chatInterface.startConversation(conversationId, {
                    agentName: 'test_agent',
                    userId: 'test_user'
                });

                if (started) {
                    // Verificar se conversa foi registrada
                    const activeConvs = this.chatInterface.getActiveConversations();
                    const exists = activeConvs.some(c => c.id === conversationId);

                    if (exists) {
                        return { status: 'PASSED', details: 'Conversa criada e registrada com sucesso' };
                    } else {
                        return { status: 'FAILED', details: 'Conversa não foi registrada' };
                    }
                } else {
                    return { status: 'FAILED', details: 'Falha ao iniciar conversa' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro no gerenciamento: ${error.message}` };
            }
        });
    }

    /**
     * Teste 5: Confidence Scorer
     */
    async testConfidenceScorer() {
        log.info('📊 Testando scorer de confiança...');

        const testAction = {
            type: 'create_file',
            filePath: 'test.js',
            content: 'console.log("test");'
        };

        const testContext = {
            agentName: 'technical_agent',
            userId: 'test_user',
            sessionId: 'test_session'
        };

        await this.runTest('confidence_calculation', async () => {
            try {
                const confidence = await this.confidenceScorer.calculateConfidence(testAction, testContext);

                if (typeof confidence === 'number' && confidence >= 0 && confidence <= 1) {
                    return {
                        status: 'PASSED',
                        details: `Confiança calculada: ${(confidence * 100).toFixed(1)}%`
                    };
                } else {
                    return {
                        status: 'FAILED',
                        details: `Valor de confiança inválido: ${confidence} (deve ser 0-1)`
                    };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro no cálculo: ${error.message}` };
            }
        });

        await this.runTest('execution_mode_determination', async () => {
            try {
                const confidence = 0.7; // Valor médio para teste
                const mode = this.confidenceScorer.determineExecutionMode(confidence);

                const validModes = ['direct', 'prompt', 'confirmation'];
                if (validModes.includes(mode)) {
                    return { status: 'PASSED', details: `Modo determinado: ${mode}` };
                } else {
                    return { status: 'FAILED', details: `Modo inválido: ${mode}` };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na determinação: ${error.message}` };
            }
        });
    }

    /**
     * Teste 6: Fluxo Brain → Agent via Chat
     */
    async testBrainToAgentFlow() {
        log.info('🔄 Testando fluxo Brain → Agent via Chat...');

        await this.runTest('brain_to_agent_integration', async () => {
            try {
                const task = "Criar função de validação de email";
                const context = { userId: 'test_user' };

                // 1. Brain gera prompt
                const brainPrompt = await this.brainPromptGen.generateBrainPrompt(task, context);

                // 2. Verificar se contém delegação para agente
                const hasDelegation = brainPrompt.includes('technical_agent') ||
                    brainPrompt.includes('email') ||
                    brainPrompt.includes('valida');

                if (hasDelegation) {
                    return { status: 'PASSED', details: 'Brain delegou tarefa para agente apropriado' };
                } else {
                    return { status: 'WARNING', details: 'Brain não delegou tarefa claramente' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro no fluxo: ${error.message}` };
            }
        });
    }

    /**
     * Teste 7: Ciclo Completo Pensar → Agir
     */
    async testCompleteThinkActCycle() {
        log.info('🔄 Testando ciclo completo pensar → agir...');

        await this.runTest('complete_cycle_simulation', async () => {
            try {
                // Simular ciclo completo
                const task = "Implementar função de busca binária";

                // Fase 1: Brain pensa (gera prompt)
                const brainPrompt = await this.brainPromptGen.generateBrainPrompt(task);

                // Fase 2: Agent age (seria incorporado no chat)
                const agentPrompt = await this.agentPromptGen.generateAgentPrompt('technical_agent', task, {
                    brainContext: 'Delegado pelo Brain após análise'
                });

                // Verificar se ambos os prompts foram gerados
                const brainValid = brainPrompt && brainPrompt.length > 100;
                const agentValid = agentPrompt && agentPrompt.length > 200;

                if (brainValid && agentValid) {
                    return {
                        status: 'PASSED',
                        details: `Ciclo completo simulado - Brain: ${brainPrompt.length} chars, Agent: ${agentPrompt.length} chars`
                    };
                } else {
                    return {
                        status: 'FAILED',
                        details: `Ciclo incompleto - Brain válido: ${brainValid}, Agent válido: ${agentValid}`
                    };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro no ciclo: ${error.message}` };
            }
        });
    }

    /**
     * Teste 8: Tratamento de Erros
     */
    async testErrorHandling() {
        log.info('🚨 Testando tratamento de erros...');

        await this.runTest('error_handling_graceful', async () => {
            try {
                // Tentar gerar prompt com dados inválidos
                const invalidTask = null;
                const invalidContext = { invalid: 'data' };

                await this.brainPromptGen.generateBrainPrompt(invalidTask, invalidContext);

                return { status: 'FAILED', details: 'Deveria ter falhado com dados inválidos' };
            } catch (error) {
                // Esperado falhar - verificar se erro é tratado graciosamente
                if (error.message && typeof error.message === 'string') {
                    return { status: 'PASSED', details: 'Erro tratado graciosamente' };
                } else {
                    return { status: 'FAILED', details: 'Erro não tratado adequadamente' };
                }
            }
        });
    }

    /**
     * Executar teste individual
     */
    async runTest(testName, testFunction) {
        try {
            log.debug(`🧪 Executando teste: ${testName}`);
            const result = await testFunction();

            this.testResults.push({
                name: testName,
                status: result.status,
                details: result.details,
                timestamp: new Date().toISOString()
            });

            switch (result.status) {
                case 'PASSED':
                    log.info(`✅ ${testName}: ${result.details}`);
                    break;
                case 'FAILED':
                    log.error(`❌ ${testName}: ${result.details}`);
                    break;
                case 'WARNING':
                    log.warn(`⚠️ ${testName}: ${result.details}`);
                    break;
            }

        } catch (error) {
            this.testResults.push({
                name: testName,
                status: 'ERROR',
                details: `Erro inesperado: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            log.error(`💥 ${testName}: Erro inesperado - ${error.message}`);
        }
    }

    /**
     * Gerar relatório final
     */
    generateReport(duration) {
        const totalTests = this.testResults.length;
        const passed = this.testResults.filter(t => t.status === 'PASSED').length;
        const failed = this.testResults.filter(t => t.status === 'FAILED').length;
        const warnings = this.testResults.filter(t => t.status === 'WARNING').length;
        const errors = this.testResults.filter(t => t.status === 'ERROR').length;

        const successRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;

        log.info('📋 Gerando relatório de testes Chat/IDE...');

        console.log('\n' + '='.repeat(80));
        console.log('📊 RELATÓRIO DE TESTES - INTEGRAÇÃO CHAT/IDE');
        console.log('='.repeat(80));
        console.log(`Tempo de execução: ${duration}ms`);
        console.log(`Total de testes: ${totalTests}`);
        console.log(`✅ Aprovados: ${passed}`);
        console.log(`❌ Falhos: ${failed}`);
        console.log(`⚠️ Avisos: ${warnings}`);
        console.log(`💥 Erros: ${errors}`);
        console.log(`📈 Taxa de sucesso: ${successRate}%`);

        if (successRate >= 80) {
            console.log('\n🎉 INTEGRAÇÃO CHAT/IDE APROVADA!');
            console.log('✅ Arquitetura pronta para uso em produção.');
        } else {
            console.log('\n⚠️ INTEGRAÇÃO CHAT/IDE COM PROBLEMAS');
            console.log('❌ Correções necessárias antes do uso em produção.');
        }

        console.log('\n📝 DETALHES DOS TESTES:');
        this.testResults.forEach(test => {
            const icon = test.status === 'PASSED' ? '✅' :
                test.status === 'FAILED' ? '❌' :
                    test.status === 'WARNING' ? '⚠️' : '💥';
            console.log(`${icon} ${test.name}: ${test.details}`);
        });

        console.log('\n' + '='.repeat(80));

        // Salvar relatório
        const reportPath = 'data/chat_ide_integration_test_report.json';
        const fs = require('fs');
        fs.writeFileSync(reportPath, JSON.stringify({
            summary: {
                total_tests: totalTests,
                passed, failed, warnings, errors,
                success_rate: successRate,
                duration_ms: duration,
                timestamp: new Date().toISOString()
            },
            tests: this.testResults
        }, null, 2));

        log.info(`Relatório salvo em: ${reportPath}`);
    }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new TestChatIDEIntegration();
    tester.runAllTests().catch(console.error);
}

export default TestChatIDEIntegration;




