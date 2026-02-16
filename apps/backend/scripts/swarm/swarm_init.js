#!/usr/bin/env node

/**
 * Swarm Init - Inicialização Completa do Sistema Swarm
 * Corporação Senciente - Fase 2
 *
 * Inicializa todos os componentes do swarm em sequência:
 * 1. Infraestrutura (PC Registry, Monitor)
 * 2. Core Swarm (Brain, Router, Agent Prompt Generator)
 * 3. Interfaces (Chat Interface, Executor)
 * 4. Protocolos (L.L.B., Memory)
 * 5. Validação final
 */

import MessageQueue from '../infra/message_queue.js';
import PCMonitor from '../infra/pc_monitor.js';
import PCRegistry from '../infra/pc_registry.js';
import { getLLBProtocol } from '../memory/llb_protocol.js';
import { logger } from '../utils/logger.js';
import { getAgentPromptGenerator } from './agent_prompt_generator.js';
import { getBrain } from './brain.js';
import ChatInterface from './chat_interface.js';
import ConfidenceScorer from './confidence_scorer.js';
import Executor from './executor.js';
import { getMemory } from './memory.js';
import { getRouter } from './router.js';

const log = logger.child({ module: 'swarm_init' });

/**
 * Swarm Initializer
 */
class SwarmInitializer {
    constructor() {
        this.components = new Map();
        this.initializationOrder = [
            'infrastructure',
            'core',
            'interfaces',
            'protocols',
            'validation'
        ];
        this.healthChecks = [];
    }

    /**
     * Inicializar swarm completo
     */
    async initializeSwarm(options = {}) {
        const startTime = Date.now();

        console.log('🚀 INICIALIZANDO SWARM COMPLETO - Corporação Senciente');
        console.log('='.repeat(70));

        try {
            // Executar inicializações em ordem
            for (const phase of this.initializationOrder) {
                console.log(`\n📍 FASE: ${phase.toUpperCase()}`);
                console.log('-'.repeat(50));

                const success = await this.initializePhase(phase, options);
                if (!success) {
                    throw new Error(`Falha na inicialização da fase: ${phase}`);
                }
            }

            // Verificação final de saúde
            console.log(`\n🏥 VERIFICAÇÃO FINAL DE SAÚDE`);
            console.log('-'.repeat(50));

            const healthStatus = await this.performHealthChecks();
            if (!healthStatus.healthy) {
                console.log('⚠️  Sistema inicializado mas com problemas de saúde');
                this.logHealthIssues(healthStatus);
            }

            // Estatísticas finais
            const duration = Date.now() - startTime;
            console.log(`\n🎉 SWARM INICIALIZADO COM SUCESSO!`);
            console.log('='.repeat(70));
            console.log(`⏱️  Tempo total: ${Math.round(duration / 1000)}s`);
            console.log(`🔧 Componentes inicializados: ${this.components.size}`);
            console.log(`❤️  Status de saúde: ${healthStatus.healthy ? 'SAUDÁVEL' : 'COM PROBLEMAS'}`);

            // Status dos componentes
            console.log(`\n📊 STATUS DOS COMPONENTES:`);
            for (const [name, component] of this.components) {
                const status = component.status || 'ativo';
                console.log(`  ${status === 'ativo' ? '✅' : '⚠️'} ${name}`);
            }

            console.log(`\n🌐 ENDPOINTS DISPONÍVEIS:`);
            console.log(`  PC Registry API: http://localhost:21301`);
            console.log(`  Monitor API: http://localhost:21301`);
            console.log(`  Communication API: http://localhost:3003`);
            console.log(`  Chat Interface: ws://localhost:3004`);

            console.log(`\n🎯 SWARM PRONTO PARA EXECUÇÃO!`);
            console.log('='.repeat(70));

            return {
                success: true,
                duration,
                components: this.components.size,
                healthy: healthStatus.healthy,
                issues: healthStatus.issues
            };

        } catch (error) {
            console.log(`\n💥 FALHA NA INICIALIZAÇÃO DO SWARM`);
            console.log('='.repeat(70));
            console.log(`❌ Erro: ${error.message}`);
            console.log(`📍 Fase atual: ${error.phase || 'desconhecida'}`);
            console.log(`⏱️  Tempo decorrido: ${Math.round((Date.now() - startTime) / 1000)}s`);
            console.log('='.repeat(70));

            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Inicializar fase específica
     */
    async initializePhase(phase, options) {
        try {
            switch (phase) {
                case 'infrastructure':
                    return await this.initializeInfrastructure(options);
                case 'core':
                    return await this.initializeCore(options);
                case 'interfaces':
                    return await this.initializeInterfaces(options);
                case 'protocols':
                    return await this.initializeProtocols(options);
                case 'validation':
                    return await this.initializeValidation(options);
                default:
                    throw new Error(`Fase desconhecida: ${phase}`);
            }
        } catch (error) {
            console.log(`❌ Erro na fase ${phase}: ${error.message}`);
            return false;
        }
    }

    /**
     * Inicializar infraestrutura
     */
    async initializeInfrastructure(options) {
        console.log('🖥️  Inicializando PC Registry...');
        const pcRegistry = new PCRegistry();
        await pcRegistry.init();
        this.components.set('pc_registry', { instance: pcRegistry, status: 'ativo' });

        console.log('📊 Inicializando PC Monitor...');
        const pcMonitor = new PCMonitor();
        await pcMonitor.init();
        this.components.set('pc_monitor', { instance: pcMonitor, status: 'ativo' });

        console.log('📨 Inicializando Message Queue...');
        const messageQueue = new MessageQueue();
        await messageQueue.init();
        this.components.set('message_queue', { instance: messageQueue, status: 'ativo' });

        return true;
    }

    /**
     * Inicializar core do swarm
     */
    async initializeCore(options) {
        console.log('🧠 Inicializando Brain...');
        const brain = getBrain();
        this.components.set('brain', { instance: brain, status: 'ativo' });

        console.log('🧭 Inicializando Router...');
        const router = getRouter();
        this.components.set('router', { instance: router, status: 'ativo' });

        console.log('🤖 Inicializando Agent Prompt Generator...');
        const agentPromptGenerator = getAgentPromptGenerator();
        this.components.set('agent_prompt_generator', { instance: agentPromptGenerator, status: 'ativo' });

        console.log('🎯 Inicializando Confidence Scorer...');
        const confidenceScorer = new ConfidenceScorer();
        this.components.set('confidence_scorer', { instance: confidenceScorer, status: 'ativo' });

        return true;
    }

    /**
     * Inicializar interfaces
     */
    async initializeInterfaces(options) {
        console.log('💬 Inicializando Chat Interface...');
        const chatInterface = new ChatInterface();
        await chatInterface.start();
        this.components.set('chat_interface', { instance: chatInterface, status: 'ativo' });

        console.log('⚡ Inicializando Executor Híbrido...');
        const executor = new Executor();
        this.components.set('executor', { instance: executor, status: 'ativo' });

        return true;
    }

    /**
     * Inicializar protocolos
     */
    async initializeProtocols(options) {
        console.log('🔗 Inicializando Protocolo L.L.B...');
        const llbProtocol = getLLBProtocol();
        this.components.set('llb_protocol', { instance: llbProtocol, status: 'ativo' });

        console.log('💾 Inicializando Memory...');
        const memory = getMemory();
        this.components.set('memory', { instance: memory, status: 'ativo' });

        return true;
    }

    /**
     * Inicializar validação
     */
    async initializeValidation(options) {
        console.log('🔍 Executando validações finais...');

        // Verificar conectividade entre componentes
        const connectivityCheck = await this.checkComponentConnectivity();
        if (!connectivityCheck) {
            console.log('⚠️  Problemas de conectividade detectados');
        }

        // Verificar configurações
        const configCheck = await this.checkConfigurations();
        if (!configCheck) {
            console.log('⚠️  Problemas de configuração detectados');
        }

        // Preparar health checks
        this.setupHealthChecks();

        return connectivityCheck && configCheck;
    }

    /**
     * Verificar conectividade entre componentes
     */
    async checkComponentConnectivity() {
        console.log('🔗 Verificando conectividade entre componentes...');

        let issues = 0;

        // Verificar se APIs estão respondendo
        try {
            const response = await fetch('http://localhost:21301/health');
            if (!response.ok) throw new Error('PC Registry não responde');
            console.log('  ✅ PC Registry API');
        } catch {
            console.log('  ❌ PC Registry API');
            issues++;
        }

        try {
            const response = await fetch('http://localhost:21301/health');
            if (!response.ok) throw new Error('PC Monitor não responde');
            console.log('  ✅ PC Monitor API');
        } catch {
            console.log('  ❌ PC Monitor API');
            issues++;
        }

        // Verificar se componentes têm dependências corretas
        const brain = this.components.get('brain');
        const router = this.components.get('router');

        if (brain && router) {
            console.log('  ✅ Brain e Router conectados');
        } else {
            console.log('  ❌ Problema na conexão Brain-Router');
            issues++;
        }

        return issues === 0;
    }

    /**
     * Verificar configurações
     */
    async checkConfigurations() {
        console.log('⚙️  Verificando configurações...');

        let issues = 0;

        // Verificar variáveis de ambiente essenciais
        const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                console.log(`  ⚠️  Variável de ambiente faltando: ${envVar}`);
                issues++;
            }
        }

        // Verificar arquivos de configuração
        const configFiles = [
            'scripts/infra/pc_specializations.json',
            'scripts/infra/process_registration.js'
        ];

        for (const file of configFiles) {
            try {
                await import(file);
                console.log(`  ✅ ${file}`);
            } catch {
                console.log(`  ❌ ${file}`);
                issues++;
            }
        }

        return issues === 0;
    }

    /**
     * Configurar health checks
     */
    setupHealthChecks() {
        this.healthChecks = [
            {
                name: 'PC Registry',
                check: async () => {
                    try {
                        const response = await fetch('http://localhost:21301/health');
                        return response.ok;
                    } catch {
                        return false;
                    }
                }
            },
            {
                name: 'PC Monitor',
                check: async () => {
                    try {
                        const response = await fetch('http://localhost:21301/health');
                        return response.ok;
                    } catch {
                        return false;
                    }
                }
            },
            {
                name: 'Chat Interface',
                check: async () => {
                    const chatInterface = this.components.get('chat_interface');
                    return chatInterface && chatInterface.activeConversations;
                }
            }
        ];
    }

    /**
     * Executar health checks
     */
    async performHealthChecks() {
        console.log('❤️  Executando health checks...');

        const results = [];
        let healthy = true;

        for (const healthCheck of this.healthChecks) {
            try {
                const result = await healthCheck.check();
                results.push({
                    name: healthCheck.name,
                    healthy: result,
                    timestamp: new Date().toISOString()
                });

                console.log(`  ${result ? '✅' : '❌'} ${healthCheck.name}`);

                if (!result) healthy = false;

            } catch (error) {
                results.push({
                    name: healthCheck.name,
                    healthy: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });

                console.log(`  ❌ ${healthCheck.name}: ${error.message}`);
                healthy = false;
            }
        }

        return {
            healthy,
            checks: results,
            issues: results.filter(r => !r.healthy)
        };
    }

    /**
     * Log de problemas de saúde
     */
    logHealthIssues(healthStatus) {
        if (healthStatus.issues.length > 0) {
            console.log('\n🚨 PROBLEMAS DETECTADOS:');
            healthStatus.issues.forEach(issue => {
                console.log(`  ❌ ${issue.name}: ${issue.error || 'Health check failed'}`);
            });

            console.log('\n💡 RECOMENDAÇÕES:');
            console.log('  1. Verifique se todos os serviços estão rodando');
            console.log('  2. Confirme configurações de rede e portas');
            console.log('  3. Verifique logs dos componentes');
            console.log('  4. Execute: node scripts/swarm/swarm_init.js --health');
        }
    }

    /**
     * Obter status do swarm
     */
    getSwarmStatus() {
        return {
            components: Object.fromEntries(
                Array.from(this.components.entries()).map(([name, data]) => [
                    name,
                    { status: data.status, type: data.instance?.constructor?.name }
                ])
            ),
            health: this.performHealthChecks(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };
    }

    /**
     * Parar swarm graciosamente
     */
    async shutdown() {
        console.log('🛑 Encerrando swarm...');

        for (const [name, component] of this.components) {
            try {
                if (component.instance && typeof component.instance.close === 'function') {
                    await component.instance.close();
                }
                console.log(`  ✅ ${name} encerrado`);
            } catch (error) {
                console.log(`  ❌ Erro ao encerrar ${name}: ${error.message}`);
            }
        }

        console.log('✅ Swarm encerrado');
    }
}

// CLI Interface
async function main() {
    const initializer = new SwarmInitializer();

    const command = process.argv[2];

    if (command === '--health') {
        // Apenas executar health checks
        const healthStatus = await initializer.performHealthChecks();
        console.log('Status de Saúde do Swarm:');
        console.log(JSON.stringify(healthStatus, null, 2));

    } else if (command === '--status') {
        // Obter status do swarm
        const status = initializer.getSwarmStatus();
        console.log('Status do Swarm:');
        console.log(JSON.stringify(status, null, 2));

    } else if (command === '--shutdown') {
        // Encerrar swarm
        await initializer.shutdown();

    } else {
        // Inicialização completa
        const result = await initializer.initializeSwarm();

        if (!result.success) {
            process.exit(1);
        }

        // Manter processo rodando para health checks
        console.log('\n🔄 Swarm rodando. Pressione Ctrl+C para encerrar.');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n⏹️  Recebido sinal de interrupção...');
            await initializer.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n⏹️  Recebido sinal de término...');
            await initializer.shutdown();
            process.exit(0);
        });
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

export default SwarmInitializer;






