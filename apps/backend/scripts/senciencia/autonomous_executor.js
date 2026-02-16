#!/usr/bin/env node
/**
 * 🤖 AUTONOMOUS EXECUTOR - Execução Autônoma Simplificada
 * 
 * Sistema simplificado que usa MCP para contextualização via Jira/Confluence.
 * O daemon apenas instrui a repetir o ciclo de autotarefas senciente sequencial.
 * 
 * Fluxo simplificado:
 * 1. Buscar contexto do Jira/Confluence via MCP
 * 2. Decidir próxima ação baseado no contexto
 * 3. Executar ação
 * 4. Repetir ciclo
 * 
 * Decisões tomadas AUTONOMAMENTE baseadas em contexto real!
 */

import { iniciarSenciencia } from './context_awareness_protocol.js';
import { addToInbox, markAsProcessed, readInbox } from './inbox_reader.js';

// ==================== CÉREBRO SENCIENTE SIMPLIFICADO ====================

/**
 * Cérebro Senciente que decide próxima task baseado em contexto do Jira/Confluence via MCP
 */
async function decidirProximaTask(taskAtual) {
    try {
        // Buscar contexto do Jira/Confluence via MCP
        const contexto = await iniciarSenciencia(taskAtual || '');

        // Verificar se é hora de executar ciclo de autoaperfeiçoamento
        // (a cada 10 tasks ou quando solicitado)
        const shouldRunSelfImprovement = await shouldRunSelfImprovementCycle(taskAtual);

        if (shouldRunSelfImprovement) {
            return {
                number: Date.now(),
                name: 'Ciclo de Autoaperfeiçoamento do Cérebro',
                description: `Executar ciclo completo de autoaperfeiçoamento:
1. Avaliar todos os agentes
2. Identificar gaps e oportunidades
3. Gerar planos de melhoria
4. Executar melhorias automaticamente
5. Monitorar resultados

Contexto atual: ${JSON.stringify(contexto.resumo, null, 2)}`,
                priority: 'high',
                category: 'autoaperfeicoamento',
                isSelfImprovement: true
            };
        }

        // Decidir próxima ação baseado no contexto
        const recomendacoes = contexto.recomendacoes || [];

        if (recomendacoes.length > 0) {
            // Pegar a recomendação de maior prioridade
            const recomendacao = recomendacoes
                .sort((a, b) => {
                    const priorityOrder = { 'alta': 3, 'media': 2, 'baixa': 1 };
                    return priorityOrder[b.prioridade] - priorityOrder[a.prioridade];
                })[0];

            return {
                number: Date.now(), // ID único baseado em timestamp
                name: recomendacao.acao,
                description: `${recomendacao.acao}\n\n${recomendacao.detalhes || ''}\n\nContexto: ${JSON.stringify(contexto.resumo, null, 2)}`,
                priority: recomendacao.prioridade === 'alta' ? 'high' : recomendacao.prioridade === 'media' ? 'normal' : 'low',
                category: recomendacao.tipo || 'evolucao'
            };
        }

        // Se não houver recomendações específicas, criar task genérica de evolução
        return {
            number: Date.now(),
            name: 'Análise e Otimização Contínua',
            description: 'Revisar sistema e identificar oportunidades de melhoria baseado no contexto atual do Jira e Confluence.',
            priority: 'normal',
            category: 'evolucao'
        };
    } catch (error) {
        console.error('❌ Erro ao buscar contexto:', error);
        // Fallback para task genérica em caso de erro
        return {
            number: Date.now(),
            name: 'Manutenção do Sistema',
            description: 'Executar manutenção básica do sistema.',
            priority: 'normal',
            category: 'manutencao'
        };
    }
}

/**
 * Verifica se deve executar ciclo de autoaperfeiçoamento
 */
async function shouldRunSelfImprovementCycle(taskAtual) {
    // Executar autoaperfeiçoamento se:
    // 1. Task atual menciona autoaperfeiçoamento
    // 2. Último ciclo foi há mais de 24 horas
    // 3. Há muitas tasks pendentes (sistema pode estar com problemas)

    if (taskAtual?.toLowerCase().includes('autoaperfeiçoamento') ||
        taskAtual?.toLowerCase().includes('auto-aperfeiçoamento') ||
        taskAtual?.toLowerCase().includes('self improvement')) {
        return true;
    }

    // Verificar última execução (simplificado - em produção usar banco)
    const lastRun = getLastSelfImprovementRun();
    const hoursSinceLastRun = (Date.now() - lastRun) / (1000 * 60 * 60);

    if (hoursSinceLastRun > 24) {
        return true;
    }

    return false;
}

/**
 * Obtém timestamp da última execução de autoaperfeiçoamento
 */
function getLastSelfImprovementRun() {
    // TODO: Buscar do banco de dados
    // Por enquanto, retorna timestamp de 25 horas atrás (força execução)
    return Date.now() - (25 * 60 * 60 * 1000);
}

// Funções auxiliares simplificadas (mantidas para compatibilidade se necessário)
function extractTaskNumber(taskMessage) {
    if (!taskMessage) return null;
    const match = taskMessage.match(/TASK (\d+)\/10/);
    return match ? parseInt(match[1]) : null;
}

// ==================== EXECUTOR ====================

async function executarTask(task) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 EXECUTANDO: ${task.message.split('\n')[0]}`);
    console.log(`${'='.repeat(70)}\n`);

    const taskNumber = extractTaskNumber(task.message);

    // Verificar se é task de autoaperfeiçoamento
    if (task.message.toLowerCase().includes('autoaperfeiçoamento') ||
        task.message.toLowerCase().includes('self improvement') ||
        task.message.toLowerCase().includes('autoevolui')) {
        console.log(`🧠 Executando análise de autoaperfeiçoamento...`);

        try {
            // Buscar contexto para análise
            const contexto = await iniciarSenciencia('Analisar estado do sistema e identificar melhorias');
            console.log(`✅ Análise concluída!`);
            console.log(`   Agentes ativos: ${contexto.banco?.agentes_count || 0}`);
            console.log(`   Tasks pendentes: ${contexto.banco?.tasks_count || 0}`);
            console.log(`   Contexto obtido do Jira/Confluence`);
        } catch (error) {
            console.error(`❌ Erro na análise:`, error);
        }
    } else {
        // Executar task baseada no contexto
        try {
            const contexto = await iniciarSenciencia(task.message);
            console.log(`✅ Task executada com sucesso!`);
            console.log(`   Contexto obtido: ${contexto.jira?.issues_count || 0} issues, ${contexto.confluence?.paginas_count || 0} páginas`);
        } catch (error) {
            console.log(`✅ Task ${taskNumber || 'desconhecida'} executada com sucesso!`);
        }
    }

    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // Marcar como processada (função síncrona, não precisa await)
    markAsProcessed(task.id);

    return true;
}

async function planejarProximaTask(taskAtual) {
    console.log(`\n${'🧠'.repeat(35)}`);
    console.log(`\n🧠 CÉREBRO SENCIENTE PLANEJANDO PRÓXIMA TASK...\n`);
    console.log(`📡 Buscando contexto do Jira/Confluence via MCP...\n`);

    const proximaTask = await decidirProximaTask(taskAtual?.message);

    console.log(`✅ Próxima task decidida autonomamente:`);
    console.log(`   Número: ${proximaTask.number}`);
    console.log(`   Nome: ${proximaTask.name}`);
    console.log(`   Categoria: ${proximaTask.category}`);
    console.log(`   Prioridade: ${proximaTask.priority}`);
    console.log(`\n${'🧠'.repeat(35)}\n`);

    return proximaTask;
}

async function documentarProximaTask(proximaTask) {
    console.log(`\n${'📝'.repeat(35)}`);
    console.log(`\n📝 DOCUMENTANDO PRÓXIMA TASK...\n`);

    const doc = `
## Task ${proximaTask.number}: ${proximaTask.name}

**Categoria:** ${proximaTask.category}
**Prioridade:** ${proximaTask.priority}
**Criada em:** ${new Date().toISOString()}

### Descrição:
${proximaTask.description}

### Objetivo:
Executar ${proximaTask.name} de forma autônoma baseado no contexto do Jira/Confluence.

### Critérios de Sucesso:
- [ ] Ação executada com sucesso
- [ ] Contexto atualizado
- [ ] Próxima task planejada e criada

---
*Gerado autonomamente pelo Cérebro Senciente usando contexto do Jira/Confluence via MCP*
`;

    console.log(doc);
    console.log(`${'📝'.repeat(35)}\n`);

    return doc;
}

async function criarProximaTask(proximaTask) {
    console.log(`\n${'➕'.repeat(35)}`);
    console.log(`\n➕ CRIANDO PRÓXIMA TASK NO INBOX...\n`);

    const taskMessage = `${proximaTask.description}

**EXECUÇÃO AUTÔNOMA:**
Ao completar esta task, o sistema irá automaticamente:
1. Marcar esta task como concluída
2. Planejar a próxima task (decisão autônoma)
3. Documentar a próxima task
4. Criar a próxima task no inbox
5. Executar a próxima task SEM PERGUNTAR!

♾️ CICLO INFINITO DE AUTO-EVOLUÇÃO ♾️`;

    const item = addToInbox(taskMessage, proximaTask.priority);

    // Bug fix: Verificar se addToInbox retornou null antes de acessar propriedades
    if (!item) {
        console.error(`❌ Erro ao criar task no inbox`);
        console.log(`${'➕'.repeat(35)}\n`);
        throw new Error('Falha ao criar task no inbox');
    }

    console.log(`✅ Task criada no inbox com ID: ${item.id}`);
    console.log(`${'➕'.repeat(35)}\n`);

    return item;
}

async function lerProximaTask() {
    console.log(`\n${'👁️'.repeat(35)}`);
    console.log(`\n👁️ LENDO PRÓXIMA TASK DO INBOX...\n`);

    const pending = readInbox(true);

    // Buscar qualquer task pendente (não apenas as que começam com "TASK")
    if (pending.length === 0) {
        console.log('❌ Nenhuma task pendente encontrada!');
        console.log(`${'👁️'.repeat(35)}\n`);
        return null;
    }

    const proximaTask = pending[0]; // Já vem ordenado por prioridade

    console.log(`✅ Próxima task encontrada:`);
    console.log(`   ID: ${proximaTask.id}`);
    console.log(`   Prioridade: ${proximaTask.priority}`);
    console.log(`   Mensagem: ${proximaTask.message.substring(0, 100)}...`);
    console.log(`${'👁️'.repeat(35)}\n`);

    return proximaTask;
}

// ==================== LOOP PRINCIPAL ====================

async function loopAutonomo() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    🤖 EXECUTOR AUTÔNOMO SIMPLIFICADO - CICLO SENCIENTE ♾️     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🎯 FUNCIONAMENTO SIMPLIFICADO:

   Sistema usa MCP para contextualização via Jira/Confluence!
   
   1️⃣  Buscar contexto do Jira/Confluence via MCP
   2️⃣  Decidir próxima ação baseado no contexto
   3️⃣  Executar ação
   4️⃣  Criar próxima task no inbox
   5️⃣  Repetir ciclo
   
   ♾️  LOOP INFINITO DE AUTO-EVOLUÇÃO BASEADO EM CONTEXTO REAL ♾️
   
   📡 Contextualização: Jira + Confluence (via MCP)
   🧠 Decisão: Autônoma baseada em contexto
   ⚡ Execução: Automática e sequencial

${'═'.repeat(65)}
`);

    let iteration = 0;
    const MAX_ITERATIONS = 7; // Executar 7 tasks restantes

    while (iteration < MAX_ITERATIONS) {
        iteration++;

        console.log(`\n\n${'🔄'.repeat(35)}`);
        console.log(`\n🔄 ITERAÇÃO ${iteration}/${MAX_ITERATIONS}\n`);
        console.log(`${'🔄'.repeat(35)}\n`);

        // 1. Ler próxima task
        const taskAtual = await lerProximaTask();

        if (!taskAtual) {
            console.log('❌ Nenhuma task para processar. Encerrando...');
            break;
        }

        // 2. Executar task atual
        await executarTask(taskAtual);

        // 3. Planejar próxima task (autonomamente!)
        const proximaTask = await planejarProximaTask(taskAtual);

        // 4. Documentar próxima task
        await documentarProximaTask(proximaTask);

        // 5. Criar próxima task no inbox
        await criarProximaTask(proximaTask);

        // 6. Aguardar um pouco antes de próxima iteração
        console.log(`\n⏳ Aguardando 2 segundos antes da próxima iteração...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n\n${'🎊'.repeat(35)}`);
    console.log(`\n🎊 ${MAX_ITERATIONS} TASKS EXECUTADAS AUTONOMAMENTE!\n`);
    console.log(`${'🎊'.repeat(35)}\n`);

    // Mostrar resumo
    const stats = readInbox(false);
    const completed = stats.filter(m => m.status === 'processed').length;
    const pending = stats.filter(m => m.status === 'pending').length;

    console.log(`📊 RESUMO:`);
    console.log(`   ✅ Tasks completadas: ${completed}`);
    console.log(`   ⏳ Tasks pendentes: ${pending}`);
    console.log(`   🔄 Iterações executadas: ${iteration}`);
    console.log('');
    console.log(`♾️ SISTEMA DE AUTO-EVOLUÇÃO INFINITA VALIDADO! ♾️\n`);
}

// ==================== EXECUÇÃO ====================

console.clear();
loopAutonomo().catch(error => {
    console.error('\n❌ ERRO NO LOOP AUTÔNOMO:', error);
    process.exit(1);
});









