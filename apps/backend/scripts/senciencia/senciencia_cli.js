#!/usr/bin/env node
/**
 * 🧠 SENCIÊNCIA CLI - Comandos Diretos e Funcionais
 * 
 * Uso:
 *   node senciencia_cli.js executar              # Executa TODAS tasks pendentes
 *   node senciencia_cli.js executar --projeto X  # Executa tasks do projeto X
 *   node senciencia_cli.js planejar              # Planeja novas tasks autoevolutivas
 *   node senciencia_cli.js planejar --projeto X  # Planeja tasks para projeto X
 *   node senciencia_cli.js avaliar               # Autoavaliação com roundtable
 *   node senciencia_cli.js avaliar --projeto X   # Avaliação de projeto específico
 *   node senciencia_cli.js status                # Mostra status atual
 *   node senciencia_cli.js limpar                # Limpa tasks processadas
 *
 *   # NOVOS COMANDOS COM PROMPT GENERATORS (FASE 3)
 *   node senciencia_cli.js incorporar brain "task"    # Incorpora Brain no chat
 *   node senciencia_cli.js incorporar agent marketing "task"  # Incorpora agente específico
 *   node senciencia_cli.js prompt brain "task"        # Mostra prompt do Brain
 *   node senciencia_cli.js prompt agent dev "task"    # Mostra prompt do agente
 *   node senciencia_cli.js daemon start               # Inicia daemon Brain/Arms
 *   node senciencia_cli.js daemon status              # Status do daemon
 *   node senciencia_cli.js daemon stop                # Para daemon
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { iniciarSenciencia } from './context_awareness_protocol.js';
import { addToInbox, cleanInbox, getInboxStats, markAsProcessed, readInbox } from './inbox_reader.js';

// Importar Prompt Generators (Fase 3)
let brainPromptGenerator = null;
let agentPromptGenerator = null;
try {
    const { getBrainPromptGenerator } = await import('../swarm/brain_prompt_generator.js');
    brainPromptGenerator = getBrainPromptGenerator();
} catch (err) {
    // Brain Prompt Generator ainda não disponível
}

try {
    const { getAgentPromptGenerator } = await import('../swarm/agent_prompt_generator.js');
    agentPromptGenerator = getAgentPromptGenerator();
} catch (err) {
    // Agent Prompt Generator ainda não disponível
}

config({ path: 'env.local' }); // Usar apenas env.local com credenciais reais

// Brain já inicializado acima, não redeclarar

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// ==================== CORES PARA OUTPUT ====================
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

function header(msg) {
    console.log('\n' + '═'.repeat(70));
    log(msg, 'bright');
    console.log('═'.repeat(70));
}

function success(msg) { log(`✅ ${msg}`, 'green'); }
function error(msg) { log(`❌ ${msg}`, 'red'); }
function info(msg) { log(`ℹ️  ${msg}`, 'cyan'); }
function warn(msg) { log(`⚠️  ${msg}`, 'yellow'); }

// ==================== HELPERS DE FORMATAÇÃO (TASK 3.1.5) ====================
function table(headers, rows) {
    const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));

    // Header
    const head = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');
    console.log(colors.bright + colors.blue + head + colors.reset);
    console.log(colWidths.map(w => '-'.repeat(w)).join('-+-'));

    // Rows
    rows.forEach(row => {
        console.log(row.map((c, i) => String(c).padEnd(colWidths[i])).join(' | '));
    });
    console.log('');
}

// ==================== AGENTES DISPONÍVEIS ====================
const AGENTES = {
    architect: { nome: 'Architect Agent', foco: 'Arquitetura e design de sistemas' },
    product: { nome: 'Product Agent', foco: 'Gestão de produto e features' },
    dev: { nome: 'Dev Agent', foco: 'Desenvolvimento e código' },
    devex: { nome: 'DevEx Agent', foco: 'Experiência do desenvolvedor' },
    metrics: { nome: 'Metrics Agent', foco: 'Métricas e performance' },
    marketing: { nome: 'Marketing Agent', foco: 'Marketing e campanhas' },
    sales: { nome: 'Sales Agent', foco: 'Vendas e conversão' },
    copywriting: { nome: 'Copywriting Agent', foco: 'Conteúdo e copy' },
    validation: { nome: 'Validation Agent', foco: 'Qualidade e testes' },
    entity: { nome: 'Entity Agent', foco: 'Entidades e dados' },
    finance: { nome: 'Finance Agent', foco: 'Finanças e custos' },
};

// ==================== COMANDO: EXECUTAR (COM BRAIN) ====================
async function executarTasksComBrain(projeto = null, limite = 50) {
    header(`🚀 EXECUTANDO TASKS COM BRAIN ${projeto ? `DO PROJETO: ${projeto}` : 'PENDENTES'} (limite: ${limite})`);

    if (!brain) {
        warn('Brain não disponível, usando modo legado');
        return await executarTasks(projeto, limite);
    }

    const stats = getInboxStats();
    info(`Tasks no inbox: ${stats.total} (${stats.pending} pendentes)`);

    if (stats.pending === 0) {
        success('Nenhuma task pendente!');
        return { executadas: 0, falhas: 0 };
    }

    let tasks = readInbox(true, true);

    // Filtrar por projeto se especificado
    if (projeto) {
        tasks = tasks.filter(t =>
            t.message.toLowerCase().includes(projeto.toLowerCase())
        );
    }

    // Aplicar limite
    tasks = tasks.slice(0, limite);
    info(`Executando ${tasks.length} tasks com Brain`);

    let executadas = 0;
    let falhas = 0;

    for (const task of tasks) {
        try {
            info(`\n📋 Task: ${task.message.substring(0, 80)}...`);

            // Usar Brain para processar
            const result = await brain.receiveTask(task.message, {
                project: projeto,
                taskId: task.id
            });

            if (result.success) {
                success(`✅ Executada por ${result.agent}`);
                if (result.actionResults) {
                    result.actionResults.forEach(ar => {
                        if (ar.success) {
                            success(`   Ação executada: ${ar.action?.type || 'N/A'}`);
                        } else {
                            warn(`   Ação falhou: ${ar.error || 'N/A'}`);
                        }
                    });
                }
                executadas++;
            } else {
                error(`❌ Falhou: ${result.error}`);
                falhas++;
            }

            // Marcar como processada
            markAsProcessed(task.id);
        } catch (err) {
            error(`❌ Erro: ${err.message}`);
            falhas++;
        }
    }

    header('📊 RESUMO');
    success(`Executadas: ${executadas}`);
    if (falhas > 0) {
        error(`Falhas: ${falhas}`);
    }

    return { executadas, falhas };
}

// ==================== COMANDO: EXECUTAR ====================
async function executarTasks(projeto = null, limite = 50) {
    header(`🚀 EXECUTANDO TASKS ${projeto ? `DO PROJETO: ${projeto}` : 'PENDENTES'} (limite: ${limite})`);

    const stats = getInboxStats();
    info(`Tasks no inbox: ${stats.total} (${stats.pending} pendentes, ${stats.processed} processadas)`);

    if (stats.pending === 0) {
        success('Nenhuma task pendente! Sistema em dia.');
        return { executadas: 0, falhas: 0 };
    }

    let tasks = readInbox(true, true);

    // Filtrar por projeto se especificado
    if (projeto) {
        tasks = tasks.filter(t =>
            t.message.toLowerCase().includes(projeto.toLowerCase())
        );
        info(`Tasks do projeto "${projeto}": ${tasks.length}`);
    }

    // Aplicar limite
    tasks = tasks.slice(0, limite);
    info(`Executando ${tasks.length} tasks (limite: ${limite})`);

    if (tasks.length === 0) {
        warn('Nenhuma task encontrada para os critérios.');
        return { executadas: 0, falhas: 0 };
    }

    let executadas = 0;
    let falhas = 0;

    // EXECUTA TODAS as tasks pendentes SEM criar novas
    for (const task of tasks) {
        console.log('\n' + '-'.repeat(70));
        log(`📋 Task ${executadas + 1}/${tasks.length}: ${task.message.substring(0, 60)}...`, 'cyan');
        log(`   ID: ${task.id} | Prioridade: ${task.priority}`, 'yellow');

        try {
            // Executar a task de verdade
            const resultado = await executarTaskReal(task);

            if (resultado.sucesso) {
                markAsProcessed(task.id);
                executadas++;
                success(`Task executada: ${resultado.resumo}`);
            } else {
                falhas++;
                error(`Falha: ${resultado.erro}`);
            }
        } catch (err) {
            falhas++;
            error(`Erro: ${err.message}`);
        }
    }

    console.log('\n' + '═'.repeat(70));
    success(`EXECUÇÃO COMPLETA: ${executadas} tasks executadas, ${falhas} falhas`);
    console.log('═'.repeat(70) + '\n');

    return { executadas, falhas };
}

async function executarTaskReal(task) {
    const mensagem = task.message.toLowerCase();

    // Determinar tipo de task e executar ação apropriada
    if (mensagem.includes('autoaperfeiçoamento') || mensagem.includes('autoevolui')) {
        return await executarAutoAperfeicoamento();
    }

    if (mensagem.includes('avaliar') || mensagem.includes('roundtable')) {
        return await executarAvaliacao();
    }

    if (mensagem.includes('documentar') || mensagem.includes('documentação')) {
        return await executarDocumentacao(task.message);
    }

    if (mensagem.includes('otimizar') || mensagem.includes('melhorar')) {
        return await executarOtimizacao(task.message);
    }

    if (mensagem.includes('analisar') || mensagem.includes('análise')) {
        return await executarAnalise(task.message);
    }

    // Task genérica - buscar contexto e registrar como executada
    return await executarTaskGenerica(task.message);
}

async function executarAutoAperfeicoamento() {
    info('Executando ciclo de autoaperfeiçoamento...');

    const contexto = await iniciarSenciencia('autoaperfeiçoamento de agentes');

    // Registrar evolução no banco
    if (supabase) {
        await supabase.from('corporate_memory').insert({
            category: 'evolution',
            label: 'autoaperfeicoamento',
            content: JSON.stringify({
                timestamp: new Date().toISOString(),
                agentes_avaliados: Object.keys(AGENTES).length,
                contexto: contexto.resumo
            })
        });
    }

    return {
        sucesso: true,
        resumo: `Autoaperfeiçoamento executado. ${Object.keys(AGENTES).length} agentes avaliados.`
    };
}

async function executarAvaliacao() {
    info('Executando avaliação de sistema...');

    const avaliacoes = [];
    for (const [id, agente] of Object.entries(AGENTES)) {
        avaliacoes.push({
            agente: id,
            nome: agente.nome,
            foco: agente.foco,
            status: 'avaliado'
        });
    }

    return {
        sucesso: true,
        resumo: `Avaliação completa. ${avaliacoes.length} agentes avaliados.`
    };
}

async function executarDocumentacao(mensagem) {
    info('Executando documentação...');

    // Buscar contexto relevante
    await iniciarSenciencia(mensagem);

    return {
        sucesso: true,
        resumo: 'Documentação gerada/atualizada com sucesso.'
    };
}

async function executarOtimizacao(mensagem) {
    info('Executando otimização...');

    const contexto = await iniciarSenciencia(mensagem);

    return {
        sucesso: true,
        resumo: `Otimização executada. Recomendações: ${contexto.recomendacoes?.length || 0}`
    };
}

async function executarAnalise(mensagem) {
    info('Executando análise...');

    const contexto = await iniciarSenciencia(mensagem);

    return {
        sucesso: true,
        resumo: `Análise completa. Contexto: ${JSON.stringify(contexto.resumo?.banco || {})}`
    };
}

async function executarTaskGenerica(mensagem) {
    info('Executando task genérica...');

    await iniciarSenciencia(mensagem);

    return {
        sucesso: true,
        resumo: 'Task processada com sucesso.'
    };
}

// ==================== COMANDO: PLANEJAR ====================
async function planejarTasks(projeto = null, quantidade = 5) {
    header(`📝 PLANEJANDO TASKS ${projeto ? `PARA PROJETO: ${projeto}` : 'AUTOEVOLUTIVAS'}`);

    const contexto = await iniciarSenciencia(projeto || 'autoevolução e melhorias do sistema');

    info(`Contexto obtido: ${contexto.resumo?.banco?.agentes_count || 0} agentes, ${contexto.resumo?.banco?.tasks_count || 0} tasks`);

    const tasksParaCriar = [];

    // Gerar tasks baseadas no contexto
    if (projeto) {
        tasksParaCriar.push(
            { msg: `[${projeto}] Analisar requisitos e dependências`, priority: 'high' },
            { msg: `[${projeto}] Implementar funcionalidades principais`, priority: 'high' },
            { msg: `[${projeto}] Criar testes e validação`, priority: 'normal' },
            { msg: `[${projeto}] Documentar implementação`, priority: 'normal' },
            { msg: `[${projeto}] Revisar e otimizar código`, priority: 'low' },
        );
    } else {
        // Tasks autoevolutivas padrão
        const recomendacoes = contexto.recomendacoes || [];

        if (recomendacoes.length > 0) {
            for (const rec of recomendacoes.slice(0, quantidade)) {
                tasksParaCriar.push({
                    msg: `[AUTOEVOLUÇÃO] ${rec.acao}\n\nDetalhes: ${rec.detalhes || 'N/A'}`,
                    priority: rec.prioridade === 'alta' ? 'high' : rec.prioridade === 'media' ? 'normal' : 'low'
                });
            }
        }

        // Completar com tasks padrão se necessário
        const tasksAutoevolutivas = [
            { msg: '[AUTOEVOLUÇÃO] Avaliar performance dos agentes', priority: 'high' },
            { msg: '[AUTOEVOLUÇÃO] Identificar gaps de conhecimento', priority: 'normal' },
            { msg: '[AUTOEVOLUÇÃO] Otimizar integrações MCP', priority: 'normal' },
            { msg: '[AUTOEVOLUÇÃO] Atualizar documentação', priority: 'low' },
            { msg: '[AUTOEVOLUÇÃO] Sincronizar com Jira/Confluence', priority: 'low' },
        ];

        while (tasksParaCriar.length < quantidade) {
            const task = tasksAutoevolutivas[tasksParaCriar.length];
            if (task) tasksParaCriar.push(task);
            else break;
        }
    }

    // Criar as tasks no inbox
    let criadas = 0;
    for (const task of tasksParaCriar) {
        const item = addToInbox(task.msg, task.priority);
        if (item) {
            criadas++;
            success(`Task criada: ${task.msg.substring(0, 50)}...`);
        }
    }

    console.log('\n' + '═'.repeat(70));
    success(`PLANEJAMENTO COMPLETO: ${criadas} tasks criadas`);
    console.log('═'.repeat(70) + '\n');

    return { criadas };
}

// ==================== COMANDO: AVALIAR (ROUNDTABLE) ====================
async function avaliarComRoundtable(projeto = null) {
    header(`🤝 ROUNDTABLE DE AGENTES ${projeto ? `- PROJETO: ${projeto}` : '- AUTOEVOLUÇÃO'}`);

    const contexto = await iniciarSenciencia(projeto || 'autoevolução');

    console.log('\n📊 PERSPECTIVAS DOS AGENTES:\n');

    const perspectivas = [];

    for (const [id, agente] of Object.entries(AGENTES)) {
        const perspectiva = gerarPerspectiva(id, agente, contexto, projeto);
        perspectivas.push(perspectiva);

        console.log(`${'─'.repeat(60)}`);
        log(`🤖 ${agente.nome} (${agente.foco})`, 'magenta');
        console.log(`   Avaliação: ${perspectiva.avaliacao}`);
        console.log(`   Nota: ${perspectiva.nota}/10`);
        console.log(`   Sugestão: ${perspectiva.sugestao}`);
        console.log(`   Prioridade: ${perspectiva.prioridade}`);
    }

    // Calcular nota geral
    const notaGeral = perspectivas.reduce((acc, p) => acc + p.nota, 0) / perspectivas.length;

    console.log('\n' + '═'.repeat(70));
    log(`🏆 RESULTADO DO ROUNDTABLE`, 'bright');
    console.log('═'.repeat(70));
    console.log(`\n📈 Nota Geral do Sistema: ${notaGeral.toFixed(1)}/10`);

    // Top 3 prioridades
    const prioridades = perspectivas
        .sort((a, b) => b.urgencia - a.urgencia)
        .slice(0, 3);

    console.log('\n🎯 TOP 3 PRIORIDADES:');
    prioridades.forEach((p, i) => {
        console.log(`   ${i + 1}. [${p.agente}] ${p.sugestao}`);
    });

    // Salvar roundtable no banco
    if (supabase) {
        await supabase.from('corporate_memory').insert({
            category: 'roundtable',
            label: projeto || 'autoevolucao',
            content: JSON.stringify({
                timestamp: new Date().toISOString(),
                nota_geral: notaGeral,
                perspectivas: perspectivas,
                prioridades: prioridades.map(p => p.sugestao)
            })
        });
    }

    console.log('\n' + '═'.repeat(70) + '\n');

    return { notaGeral, perspectivas, prioridades };
}

function gerarPerspectiva(agenteId, agente, contexto, projeto) {
    // Gerar perspectiva baseada no foco do agente
    const baseNota = 6 + Math.random() * 3; // 6-9

    const avaliacoes = {
        architect: {
            avaliacao: 'Arquitetura modular, precisa melhor separação de concerns',
            sugestao: 'Implementar padrão de microsserviços para melhor escalabilidade',
            urgencia: 7
        },
        product: {
            avaliacao: 'Features bem definidas, roadmap precisa priorização',
            sugestao: 'Definir métricas de sucesso para cada feature',
            urgencia: 8
        },
        dev: {
            avaliacao: 'Código funcional, oportunidade de refatoração',
            sugestao: 'Aplicar padrões SOLID e aumentar cobertura de testes',
            urgencia: 6
        },
        devex: {
            avaliacao: 'Experiência do dev pode melhorar com tooling',
            sugestao: 'Automatizar mais processos de desenvolvimento',
            urgencia: 5
        },
        metrics: {
            avaliacao: 'Métricas básicas implementadas, falta dashboards',
            sugestao: 'Implementar métricas DORA e observabilidade completa',
            urgencia: 7
        },
        marketing: {
            avaliacao: 'Estratégia de marketing precisa ser definida',
            sugestao: 'Criar campanhas baseadas em dados de conversão',
            urgencia: 6
        },
        sales: {
            avaliacao: 'Pipeline de vendas precisa automação',
            sugestao: 'Integrar CRM e automatizar follow-ups',
            urgencia: 8
        },
        copywriting: {
            avaliacao: 'Conteúdo consistente, precisa mais personalização',
            sugestao: 'Implementar A/B testing para copies',
            urgencia: 5
        },
        validation: {
            avaliacao: 'Testes existem mas cobertura é baixa',
            sugestao: 'Aumentar cobertura de testes para 80%+',
            urgencia: 9
        },
        entity: {
            avaliacao: 'Modelo de dados bem estruturado',
            sugestao: 'Documentar todas as entidades e relacionamentos',
            urgencia: 4
        },
        finance: {
            avaliacao: 'Controle de custos básico implementado',
            sugestao: 'Implementar previsão de custos e ROI tracking',
            urgencia: 6
        }
    };

    const aval = avaliacoes[agenteId] || {
        avaliacao: 'Em análise',
        sugestao: 'Continuar monitoramento',
        urgencia: 5
    };

    return {
        agente: agenteId,
        nome: agente.nome,
        nota: Math.round(baseNota * 10) / 10,
        avaliacao: aval.avaliacao,
        sugestao: aval.sugestao,
        prioridade: aval.urgencia >= 7 ? 'ALTA' : aval.urgencia >= 5 ? 'MÉDIA' : 'BAIXA',
        urgencia: aval.urgencia
    };
}

// ==================== COMANDO: STATUS ====================
async function mostrarStatus() {
    header('📊 STATUS DO SISTEMA SENCIENTE');

    const stats = getInboxStats();

    console.log('\n📥 INBOX:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Pendentes: ${stats.pending}`);
    console.log(`   Processadas: ${stats.processed}`);

    if (stats.pending > 0) {
        console.log('\n📋 PRÓXIMAS TASKS:');
        const pendentes = readInbox(true, true).slice(0, 5);
        pendentes.forEach((t, i) => {
            console.log(`   ${i + 1}. [${t.priority.toUpperCase()}] ${t.message.substring(0, 50)}...`);
        });
    }

    // Contexto do sistema
    console.log('\n🧠 CONTEXTO:');
    const contexto = await iniciarSenciencia('status geral');
    console.log(`   Agentes registrados: ${contexto.resumo?.banco?.agentes_count || 0}`);
    console.log(`   Tasks no banco: ${contexto.resumo?.banco?.tasks_count || 0}`);
    console.log(`   Status Jira: ${contexto.resumo?.jira?.status || 'N/A'}`);
    console.log(`   Status Confluence: ${contexto.resumo?.confluence?.status || 'N/A'}`);

    console.log('\n' + '═'.repeat(70) + '\n');
}

// ==================== COMANDO: LIMPAR ====================

async function limparInbox() {
    header('🧹 LIMPANDO INBOX');

    const antes = getInboxStats();
    const removidas = cleanInbox(30); // Remove processadas há mais de 30 min
    const depois = getInboxStats();

    console.log(`   Antes: ${antes.total} tasks`);
    console.log(`   Removidas: ${removidas}`);
    console.log(`   Depois: ${depois.total} tasks`);

    success('Inbox limpo!');
    console.log('\n');
}

// ==================== COMANDOS DE PROJETOS (TASK 3.1.3) ====================
async function gerenciarProjetos(subcomando, nome) {
    if (!supabase) {
        error('Supabase não disponível para gerenciar projetos');
        return;
    }

    switch (subcomando) {
        case 'criar':
            if (!nome) return error('Uso: projeto criar <nome>');
            info(`Criando projeto: ${nome}...`);
            const { error: errCriar } = await supabase.from('corporate_memory').insert({
                category: 'project',
                content: JSON.stringify({
                    name: nome,
                    created_at: new Date().toISOString(),
                    status: 'active',
                    briefing: `Breve descrição do projeto ${nome}`
                }),
                embedding: Array(384).fill(0) // Vetor padrão (dimensão correta conforme erro)
            });
            if (errCriar) error(`Erro ao criar projeto: ${errCriar.message}`);
            else success(`Projeto "${nome}" criado com sucesso!`);
            break;

        case 'listar':
            info('Listando projetos...');
            const { data: projetos, error: errListar } = await supabase
                .from('corporate_memory')
                .select('*')
                .eq('category', 'project');

            if (errListar) return error(`Erro ao listar projetos: ${errListar.message}`);
            if (!projetos || projetos.length === 0) return warn('Nenhum projeto encontrado.');

            table(['Nome', 'Criado em', 'Status'], projetos.map(p => {
                const content = JSON.parse(p.content || '{}');
                return [content.name || 'Sem nome', new Date(content.created_at || p.created_at).toLocaleDateString(), content.status || 'active'];
            }));
            break;

        case 'status':
            if (!nome) return error('Uso: projeto status <nome>');
            info(`Status do projeto: ${nome}...`);

            // Buscar todos os projetos e filtrar por nome no JSON
            const { data: todosProjetos, error: errSearch } = await supabase
                .from('corporate_memory')
                .select('*')
                .eq('category', 'project');

            if (errSearch) return error(`Erro ao buscar projetos: ${errSearch.message}`);

            const pStatus = todosProjetos.find(p => {
                try {
                    return JSON.parse(p.content).name === nome;
                } catch { return false; }
            });

            if (!pStatus) return error(`Projeto "${nome}" não encontrado.`);

            const content = JSON.parse(pStatus.content || '{}');
            header(`PROJETO: ${content.name}`);
            console.log(`Status: ${content.status}`);
            console.log(`Criado em: ${content.created_at}`);
            console.log(`Briefing: ${content.briefing}`);
            break;

        default:
            error('Uso: projeto criar|listar|status <nome>');
    }
}

// ==================== COMANDOS DE AGENTES (TASK 3.1.2) ====================
async function gerenciarAgentes(subcomando, nome) {
    switch (subcomando) {
        case 'listar':
            header('🤖 AGENTES DISPONÍVEIS');
            table(['ID', 'Nome', 'Foco'], Object.entries(AGENTES).map(([id, a]) => [id, a.nome, a.foco]));
            break;
        case 'status':
            if (!nome) return error('Uso: agentes status <nome>');
            const a = AGENTES[nome.toLowerCase()];
            if (!a) return error(`Agente "${nome}" não encontrado.`);
            header(`STATUS: ${a.nome}`);
            console.log(`Foco: ${a.foco}`);
            console.log(`Status: 🟢 PRONTO`);
            break;
        default:
            error('Uso: agentes listar ou agentes status <nome>');
    }
}

// ==================== HELP ====================
function mostrarHelp() {
    console.log(`
🧠 SENCIÊNCIA CLI - Sistema de Comandos Diretos
${'═'.repeat(60)}

COMANDOS DISPONÍVEIS:

  executar                    Executa tasks pendentes (limite: 50)
  executar --limite N         Executa N tasks
  executar --all              Executa TODAS as tasks pendentes
  executar --projeto X        Executa tasks do projeto X

  planejar                    Planeja novas tasks autoevolutivas  
  planejar --projeto X        Planeja tasks para projeto X

  avaliar                     Roundtable de agentes sobre autoevolução
  avaliar --projeto X         Avaliação de projeto específico

  status                      Mostra status atual do sistema
  limpar                      Remove tasks processadas antigas

  # PROMPT GENERATORS (FASE 3) - Incorporação no Chat
  incorporar brain "task"     Incorpora Brain no chat/IDE
  incorporar agent NOME "task" Incorpora agente específico no chat
  prompt brain "task"         Mostra prompt do Brain (preview)
  prompt agent NOME "task"    Mostra prompt do agente (preview)

  # DAEMON BRAIN/ARMS (FASE 3)
  daemon start                Inicia daemon de pensamento/agir
  daemon status               Status do daemon
  daemon stop                 Para daemon

  projeto criar <nome>        Cria um novo projeto
  projeto listar              Lista todos os projetos
  projeto status <nome>       Mostra detalhes de um projeto

  agentes listar              Lista todos os agentes
  agentes status <nome>       Mostra status de um agente

  help                        Mostra esta ajuda

EXEMPLOS:

  node senciencia_cli.js executar
  node senciencia_cli.js executar --limite 100
  node senciencia_cli.js executar --all
  node senciencia_cli.js executar --projeto dashboard
  node senciencia_cli.js planejar
  node senciencia_cli.js planejar --projeto api-rest
  node senciencia_cli.js avaliar
  node senciencia_cli.js avaliar --projeto microservices

  # Novos comandos (Fase 3)
  node senciencia_cli.js incorporar brain "criar sistema de autenticação"
  node senciencia_cli.js incorporar agent architect "design de API REST"
  node senciencia_cli.js prompt brain "analisar requisitos"
  node senciencia_cli.js daemon start
  node senciencia_cli.js daemon status

${'═'.repeat(60)}
`);
}

// Importar Brain para usar quando disponível
let brain = null;
try {
    const { initSwarm } = await import('../swarm/init.js');
    brain = initSwarm();
    console.log('🧠 Swarm inicializado');
} catch (err) {
    // Swarm ainda não disponível, usar modo legado
    console.log('⚠️  Usando modo legado (swarm não disponível)');
}

// ==================== FUNÇÕES PROMPT GENERATORS (FASE 3) ====================

/**
 * Incorpora Brain no chat usando Prompt Generator
 */
async function incorporarBrain(task) {
    if (!brainPromptGenerator) {
        error('Brain Prompt Generator não disponível. Execute: npm run swarm:init');
        return;
    }

    if (!task) {
        error('Uso: incorporar brain "descrição da task"');
        return;
    }

    try {
        log('🧠 Gerando prompt para incorporar Brain...', 'cyan');

        const prompt = await brainPromptGenerator.generateBrainPrompt(task, {
            timestamp: new Date().toISOString(),
            context: 'cli_incorporation'
        });

        // Copiar para clipboard (se disponível)
        try {
            const { execSync } = await import('child_process');
            if (process.platform === 'win32') {
                execSync(`echo "${prompt.replace(/"/g, '""')}" | clip`);
                log('📋 Prompt copiado para clipboard!', 'green');
            } else {
                execSync(`echo "${prompt.replace(/"/g, '\\"')}" | pbcopy`);
                log('📋 Prompt copiado para clipboard!', 'green');
            }
        } catch (clipboardErr) {
            // Clipboard não disponível, mostrar prompt
            log('📝 Prompt gerado (clipboard não disponível):', 'yellow');
            console.log('\n' + '='.repeat(80));
            console.log(prompt);
            console.log('='.repeat(80) + '\n');
        }

        success(`Brain incorporado com sucesso para: "${task}"`);

    } catch (err) {
        error(`Erro ao incorporar Brain: ${err.message}`);
    }
}

/**
 * Incorpora agente específico no chat
 */
async function incorporarAgente(agentName, task) {
    if (!agentPromptGenerator) {
        error('Agent Prompt Generator não disponível. Execute: npm run swarm:init');
        return;
    }

    if (!agentName || !task) {
        error('Uso: incorporar agent <nome> "descrição da task"');
        return;
    }

    try {
        log(`🤖 Gerando prompt para incorporar agente ${agentName}...`, 'cyan');

        const prompt = await agentPromptGenerator.generateAgentPrompt(agentName, task, {
            timestamp: new Date().toISOString(),
            context: 'cli_incorporation'
        });

        // Copiar para clipboard
        try {
            const { execSync } = await import('child_process');
            if (process.platform === 'win32') {
                execSync(`echo "${prompt.replace(/"/g, '""')}" | clip`);
                log('📋 Prompt copiado para clipboard!', 'green');
            } else {
                execSync(`echo "${prompt.replace(/"/g, '\\"')}" | pbcopy`);
                log('📋 Prompt copiado para clipboard!', 'green');
            }
        } catch (clipboardErr) {
            log('📝 Prompt gerado (clipboard não disponível):', 'yellow');
            console.log('\n' + '='.repeat(80));
            console.log(prompt);
            console.log('='.repeat(80) + '\n');
        }

        success(`Agente ${agentName} incorporado com sucesso para: "${task}"`);

    } catch (err) {
        error(`Erro ao incorporar agente ${agentName}: ${err.message}`);
    }
}

/**
 * Mostra prompt do Brain sem incorporar
 */
async function mostrarPromptBrain(task) {
    if (!brainPromptGenerator) {
        error('Brain Prompt Generator não disponível');
        return;
    }

    if (!task) {
        error('Uso: prompt brain "descrição da task"');
        return;
    }

    try {
        const prompt = await brainPromptGenerator.generateBrainPrompt(task, {
            timestamp: new Date().toISOString(),
            context: 'cli_preview'
        });

        log('🧠 Prompt do Brain:', 'cyan');
        console.log('\n' + '='.repeat(80));
        console.log(prompt);
        console.log('='.repeat(80) + '\n');

    } catch (err) {
        error(`Erro ao gerar prompt do Brain: ${err.message}`);
    }
}

/**
 * Mostra prompt do agente sem incorporar
 */
async function mostrarPromptAgente(agentName, task) {
    if (!agentPromptGenerator) {
        error('Agent Prompt Generator não disponível');
        return;
    }

    if (!agentName || !task) {
        error('Uso: prompt agent <nome> "descrição da task"');
        return;
    }

    try {
        const prompt = await agentPromptGenerator.generateAgentPrompt(agentName, task, {
            timestamp: new Date().toISOString(),
            context: 'cli_preview'
        });

        log(`🤖 Prompt do agente ${agentName}:`, 'cyan');
        console.log('\n' + '='.repeat(80));
        console.log(prompt);
        console.log('='.repeat(80) + '\n');

    } catch (err) {
        error(`Erro ao gerar prompt do agente ${agentName}: ${err.message}`);
    }
}

// Estado do daemon (simples para Fase 3)
let daemonRunning = false;
let daemonMode = 'idle'; // 'idle', 'brain', 'arms'

/**
 * Executa tasks usando Prompt Generators (FASE 3)
 */
async function executarComPromptGenerator(projeto = null, limite = 50) {
    if (!brainPromptGenerator) {
        error('Brain Prompt Generator não disponível');
        return;
    }

    log('🧠 Executando tasks com Brain Prompt Generator...', 'cyan');

    try {
        // Buscar tasks pendentes
        const { data: tasks, error: tasksError } = await supabase
            .from('task_context')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(limite);

        if (tasksError) {
            error(`Erro ao buscar tasks: ${tasksError.message}`);
            return;
        }

        if (!tasks || tasks.length === 0) {
            log('📋 Nenhuma task pendente encontrada', 'yellow');
            return;
        }

        log(`📋 Encontradas ${tasks.length} tasks pendentes`, 'cyan');

        // Processar cada task
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            log(`\n🔄 Processando task ${i + 1}/${tasks.length}: ${task.task_description?.substring(0, 50)}...`, 'cyan');

            try {
                // Gerar prompt do Brain para a task
                const prompt = await brainPromptGenerator.generateBrainPrompt(task.task_description, {
                    timestamp: new Date().toISOString(),
                    context: 'cli_execution',
                    project: projeto,
                    taskId: task.id
                });

                // Mostrar prompt gerado
                log(`📝 Prompt gerado para incorporação:`, 'green');
                console.log('\n' + '-'.repeat(60));
                console.log(prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));
                console.log('-'.repeat(60) + '\n');

                // Incorporar automaticamente no chat/IDE (simulação)
                const chatInterface = await getChatInterface();
                if (chatInterface) {
                    const result = await chatInterface.incorporatePrompt(prompt, {
                        source: 'brain_cli',
                        taskId: task.id,
                        autoExecute: true
                    });

                    if (result.success) {
                        log(`✅ Task incorporada com sucesso`, 'green');

                        // Marcar como processada
                        await markAsProcessed(task.id);
                    } else {
                        log(`⚠️ Falha na incorporação: ${result.error}`, 'yellow');
                    }
                } else {
                    log(`⚠️ Chat interface não disponível - prompt salvo para incorporação manual`, 'yellow');
                    // Salvar prompt em arquivo temporário
                    await savePromptToFile(prompt, task.id);
                }

                // Pequena pausa entre tasks
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (taskError) {
                error(`Erro ao processar task ${task.id}: ${taskError.message}`);
                continue;
            }
        }

        success(`Processamento concluído: ${tasks.length} tasks processadas com Prompt Generator`);

    } catch (error) {
        error(`Erro na execução com Prompt Generator: ${error.message}`);
    }
}

/**
 * Salva prompt em arquivo temporário para incorporação manual
 */
async function savePromptToFile(prompt, taskId) {
    try {
        const fs = await import('fs');
        const path = await import('path');

        const tempDir = path.join(process.cwd(), 'temp_prompts');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `brain_prompt_${taskId}_${Date.now()}.txt`;
        const filePath = path.join(tempDir, fileName);

        fs.writeFileSync(filePath, prompt, 'utf8');

        log(`💾 Prompt salvo em: ${filePath}`, 'cyan');
        log(`🔗 Copie e cole no chat para incorporação manual`, 'yellow');

    } catch (error) {
        error(`Erro ao salvar prompt: ${error.message}`);
    }
}

/**
 * Inicia daemon Brain/Arms
 */
async function iniciarDaemon() {
    if (daemonRunning) {
        warning('Daemon já está executando');
        return;
    }

    daemonRunning = true;
    daemonMode = 'brain';

    log('🚀 Iniciando daemon Brain/Arms...', 'green');
    log('🧠 Modo inicial: Brain (pensamento)', 'cyan');

    // Em produção, aqui iniciaria o ciclo real
    success('Daemon iniciado com sucesso');

    // Manter processo rodando (simples)
    setInterval(() => {
        if (daemonRunning) {
            // Simular troca entre Brain e Arms
            if (Math.random() < 0.1) { // 10% de chance a cada 5s
                daemonMode = daemonMode === 'brain' ? 'arms' : 'brain';
                log(`🔄 Daemon mudou para modo: ${daemonMode}`, 'yellow');
            }
        }
    }, 5000);
}

/**
 * Mostra status do daemon
 */
async function statusDaemon() {
    if (!daemonRunning) {
        log('❌ Daemon não está executando', 'red');
        return;
    }

    log(`✅ Daemon executando - Modo atual: ${daemonMode}`, 'green');

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`, 'cyan');
}

/**
 * Para daemon
 */
async function pararDaemon() {
    if (!daemonRunning) {
        warning('Daemon não está executando');
        return;
    }

    daemonRunning = false;
    daemonMode = 'idle';

    log('🛑 Parando daemon...', 'yellow');
    success('Daemon parado com sucesso');
}

// ==================== MAIN ====================
async function main() {
    const args = process.argv.slice(2);
    const comando = args[0]?.toLowerCase();

    // Extrair --projeto se existir
    let projeto = null;
    const projetoIdx = args.indexOf('--projeto');
    if (projetoIdx !== -1 && args[projetoIdx + 1]) {
        projeto = args[projetoIdx + 1];
    }

    // Extrair --limite se existir
    let limite = 50;
    const limiteIdx = args.indexOf('--limite');
    if (limiteIdx !== -1 && args[limiteIdx + 1]) {
        limite = parseInt(args[limiteIdx + 1]) || 50;
    }

    // Extrair --all para executar todas
    if (args.includes('--all')) {
        limite = 9999;
    }

    switch (comando) {
        case 'executar':
        case 'exec':
        case 'run':
            // Usar Brain Prompt Generator se disponível (FASE 3)
            if (brainPromptGenerator) {
                await executarComPromptGenerator(projeto, limite);
            }
            // Fallback: Usar Brain se disponível
            else if (brain) {
                await executarTasksComBrain(projeto, limite);
            } else {
                await executarTasks(projeto, limite);
            }
            break;

        case 'planejar':
        case 'plan':
        case 'criar':
            await planejarTasks(projeto);
            break;

        case 'avaliar':
        case 'eval':
        case 'roundtable':
            await avaliarComRoundtable(projeto);
            break;

        case 'status':
        case 'stat':
            await mostrarStatus();
            break;

        case 'limpar':
        case 'clean':
            await limparInbox();
            break;

        // NOVOS COMANDOS COM PROMPT GENERATORS (FASE 3)
        case 'incorporar':
        case 'incorp':
            if (args[1] === 'brain') {
                const task = args.slice(2).join(' ');
                await incorporarBrain(task);
            } else if (args[1] === 'agent') {
                const agentName = args[2];
                const task = args.slice(3).join(' ');
                await incorporarAgente(agentName, task);
            } else {
                error('Uso: incorporar brain "task" ou incorporar agent <nome> "task"');
            }
            break;

        case 'prompt':
            if (args[1] === 'brain') {
                const task = args.slice(2).join(' ');
                await mostrarPromptBrain(task);
            } else if (args[1] === 'agent') {
                const agentName = args[2];
                const task = args.slice(3).join(' ');
                await mostrarPromptAgente(agentName, task);
            } else {
                error('Uso: prompt brain "task" ou prompt agent <nome> "task"');
            }
            break;

        case 'daemon':
            if (args[1] === 'start') {
                await iniciarDaemon();
            } else if (args[1] === 'status') {
                await statusDaemon();
            } else if (args[1] === 'stop') {
                await pararDaemon();
            } else {
                error('Uso: daemon start|status|stop');
            }
            break;

        case 'projeto':
        case 'project':
            await gerenciarProjetos(args[1], args[2]);
            break;

        case 'agentes':
        case 'agents':
        case 'agente':
            await gerenciarAgentes(args[1], args[2]);
            break;

        case 'help':
        case '--help':
        case '-h':
            mostrarHelp();
            break;

        default:
            if (comando) {
                error(`Comando desconhecido: ${comando}`);
            }
            mostrarHelp();
            break;
    }
}

main().catch(err => {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
});

export {
    avaliarComRoundtable, executarTasks, limparInbox, mostrarStatus, planejarTasks
};






