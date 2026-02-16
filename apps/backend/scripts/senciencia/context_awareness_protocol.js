/**
 * Protocolo Senciente de Conscientização de Contexto (Versão 2.0 - L.L.B.)
 * 
 * Sistema que consulta Letta (Estado), LangMem (Sabedoria), ByteRover (Ação) 
 * e Banco de Dados para formar contexto completo antes de qualquer ação.
 * 
 * Substitui Jira, Confluence e GitKraken pelo Protocolo L.L.B.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getLLBProtocol } from '../memory/llb_protocol.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'context_awareness_protocol' });

config({ path: 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const llb = getLLBProtocol();

/**
 * Contexto completo coletado seguindo Protocolo L.L.B.
 */
class ContextoCompleto {
    constructor() {
        this.timestamp = new Date().toISOString();
        this.letta = {
            state: null,
            next_steps: [],
            blockages: [],
            status: 'unknown'
        };
        this.langmem = {
            wisdom: [],
            patterns: [],
            status: 'unknown'
        };
        this.byterover = {
            timeline: [],
            status: 'unknown'
        };
        this.banco = {
            agentes: [],
            tasks: [],
            memoria: [],
            status: 'unknown'
        };
        this.estado = {
            tempo: null,
            decisao: null,
            cultura: null,
            presenca: null,
            criatividade: null
        };
    }

    toSummary() {
        return {
            timestamp: this.timestamp,
            letta: {
                phase: this.letta.state?.current_phase || 'unknown',
                next_steps_count: this.letta.next_steps.length,
                status: this.letta.status
            },
            langmem: {
                wisdom_count: this.langmem.wisdom.length,
                status: this.langmem.status
            },
            byterover: {
                timeline_count: this.byterover.timeline.length,
                status: this.byterover.status
            },
            banco: {
                agentes_count: this.banco.agentes.length,
                tasks_count: this.banco.tasks.length,
                status: this.banco.status
            },
            estado: this.estado
        };
    }
}

/**
 * Consulta Letta (Estado e Fluxo)
 */
async function consultarLetta(contexto) {
    log.info('Consultando Letta (A Consciência)');

    try {
        const state = await llb.letta.getCurrentState();
        contexto.letta.state = state;
        contexto.letta.next_steps = state.next_steps || [];
        contexto.letta.blockages = state.blockages || [];
        contexto.letta.status = 'consultado';

        log.info('Letta consultado', { phase: state.current_phase });
        return contexto;
    } catch (error) {
        log.error('Erro ao consultar Letta', { error: error.message });
        contexto.letta.status = 'erro';
        return contexto;
    }
}

/**
 * Consulta LangMem (Sabedoria e Arquitetura)
 */
async function consultarLangMem(contexto, query = '') {
    log.info('Consultando LangMem (O Arquivo de Sabedoria)', { query });

    try {
        const wisdom = await llb.langmem.getWisdom(query || 'architecture');
        contexto.langmem.wisdom = wisdom;
        contexto.langmem.status = 'consultado';

        log.info('LangMem consultado', { count: wisdom.length });
        return contexto;
    } catch (error) {
        log.error('Erro ao consultar LangMem', { error: error.message });
        contexto.langmem.status = 'erro';
        return contexto;
    }
}

/**
 * Consulta ByteRover (Ação e Evolução)
 */
async function consultarByteRover(contexto) {
    log.info('Consultando ByteRover (A Ação)');

    try {
        const timeline = await llb.getEvolutionTimeline(10);
        contexto.byterover.timeline = timeline;
        contexto.byterover.status = 'consultado';

        log.info('ByteRover consultado', { commits: timeline.length });
        return contexto;
    } catch (error) {
        log.error('Erro ao consultar ByteRover', { error: error.message });
        contexto.byterover.status = 'erro';
        return contexto;
    }
}

/**
 * Consulta Banco de Dados (Supabase)
 */
async function consultarBanco(contexto, query = '') {
    log.info('Consultando Banco de Dados', { query });

    if (!supabase) {
        log.warn('Supabase não disponível');
        contexto.banco.status = 'indisponivel';
        return contexto;
    }

    try {
        // Consultar agentes cadastrados
        const { data: agentes, error: errAgentes } = await supabase
            .from('cerebro_specialized_knowledge')
            .select('agent_name')
            .order('created_at', { ascending: false });

        if (!errAgentes && agentes) {
            contexto.banco.agentes = [...new Set(agentes.map(a => a.agent_name))];
        }

        // Consultar tasks ativas no task_context
        const { data: tasks, error: errTasks } = await supabase
            .from('task_context')
            .select('*')
            .neq('status', 'done')
            .order('created_at', { ascending: false })
            .limit(20);

        if (!errTasks && tasks) {
            contexto.banco.tasks = tasks;
        }

        // Consultar memória corporativa recente
        const { data: memoria, error: errMemoria } = await supabase
            .from('corporate_memory')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!errMemoria && memoria) {
            contexto.banco.memoria = memoria;
        }

        contexto.banco.status = 'consultado';
        log.info('Banco consultado', {
            agentes: contexto.banco.agentes.length,
            tasks: contexto.banco.tasks.length,
            memoria: contexto.banco.memoria.length
        });

        return contexto;
    } catch (error) {
        log.error('Erro ao consultar banco', { error: error.message });
        contexto.banco.status = 'erro';
        return contexto;
    }
}

/**
 * Analisa contexto e extrai estado evolutivo
 */
async function analisarEstado(contexto) {
    log.info('Analisando estado do contexto L.L.B.');

    const state = contexto.letta.state;
    const agora = new Date();

    // TEMPO
    contexto.estado.tempo = {
        agora: agora.toISOString(),
        fase_atual: state?.current_phase || 'unknown',
        timestamp_estado: state?.timestamp
    };

    // DECISÃO (Letta + Banco)
    contexto.estado.decisao = {
        proximos_passos: contexto.letta.next_steps.length,
        bloqueios_ativos: contexto.letta.blockages.length,
        tasks_pendentes: contexto.banco.tasks.length,
        fase_evolutiva: state?.current_phase || 'desconhecida'
    };

    // CULTURA (LangMem + Banco)
    const architecturalRules = contexto.langmem.wisdom.filter(w => w.category === 'architecture');
    contexto.estado.cultura = {
        regras_arquiteturais: architecturalRules.length,
        principios_ativos: architecturalRules.map(r => r.content.substring(0, 50) + '...')
    };

    // PRESENÇA (Agentes)
    contexto.estado.presenca = {
        agentes_ativos: contexto.banco.agentes.length,
        conhecimento_atualizado: contexto.banco.agentes.length > 0
    };

    // CRIATIVIDADE (Evolução)
    contexto.estado.criatividade = {
        velocidade_evolucao: contexto.byterover.timeline.length,
        recent_commits: contexto.byterover.timeline.slice(0, 3)
    };

    log.info('Estado L.L.B. analisado', { fase: contexto.estado.decisao.fase_evolutiva });
    return contexto;
}

/**
 * Protocolo principal de conscientização Senciente (LLB Aware)
 */
export async function iniciarSenciencia(promptBasico = '') {
    log.info('🚀 INICIANDO SENCIÊNCIA L.L.B.', { prompt: promptBasico });

    const contexto = new ContextoCompleto();

    // 1. Consultar camadas L.L.B.
    log.info('Fase 1: Coletando contexto L.L.B.');
    await Promise.all([
        consultarLetta(contexto),
        consultarLangMem(contexto, promptBasico),
        consultarByteRover(contexto),
        consultarBanco(contexto, promptBasico)
    ]);

    // 2. Analisar estado
    log.info('Fase 2: Analisando estado evolutivo');
    await analisarEstado(contexto);

    // 3. Gerar resumo executivo
    const resumo = contexto.toSummary();

    log.info('✅ SENCIÊNCIA L.L.B. INICIADA', resumo);

    return {
        contexto,
        resumo,
        prompt: promptBasico,
        timestamp: contexto.timestamp,
        recomendacoes: gerarRecomendacoes(contexto, promptBasico)
    };
}

/**
 * Continuar senciência no contexto L.L.B.
 */
export async function continuarSenciencia(contextoAnterior, promptContinuacao = '') {
    log.info('🔄 CONTINUANDO SENCIÊNCIA L.L.B.', { prompt: promptContinuacao });

    // Atualizar contexto
    await Promise.all([
        consultarLetta(contextoAnterior),
        consultarLangMem(contextoAnterior, promptContinuacao),
        consultarByteRover(contextoAnterior),
        consultarBanco(contextoAnterior, promptContinuacao)
    ]);

    await analisarEstado(contextoAnterior);

    contextoAnterior.timestamp = new Date().toISOString();

    return {
        contexto: contextoAnterior,
        resumo: contextoAnterior.toSummary(),
        prompt: promptContinuacao,
        recomendacoes: gerarRecomendacoes(contextoAnterior, promptContinuacao)
    };
}

/**
 * Gera recomendações baseadas no contexto L.L.B.
 */
function gerarRecomendacoes(contexto, prompt) {
    const recomendacoes = [];
    const promptLower = prompt.toLowerCase();

    // Recomendações de Letta (Estado)
    if (contexto.letta.blockages.length > 0) {
        recomendacoes.push({
            tipo: 'urgente_letta',
            prioridade: 'bloqueante',
            acao: 'Resolver bloqueios identificados pela Consciência (Letta)',
            detalhes: contexto.letta.blockages.map(b => b.reason).join(', ')
        });
    }

    // Recomendações de LangMem (Sabedoria)
    if (contexto.langmem.wisdom.length === 0) {
        recomendacoes.push({
            tipo: 'sabedoria',
            prioridade: 'media',
            acao: 'Enriquecer LangMem com sabedoria arquitetural',
            detalhes: 'Nenhuma sabedoria encontrada para a query atual'
        });
    }

    // Recomendações de Evolução (ByteRover)
    if (contexto.byterover.timeline.length < 5) {
        recomendacoes.push({
            tipo: 'evolucao',
            prioridade: 'baixa',
            acao: 'Aumentar cadência de evolução via ByteRover',
            detalhes: 'Histórico de evolução recente está abaixo da média'
        });
    }

    // Sugestão de Agentes
    if (promptLower.includes('evolu') || promptLower.includes('agente')) {
        const missingSpecialists = ['architect', 'dev', 'validation'].filter(a => !contexto.banco.agentes.includes(a));
        if (missingSpecialists.length > 0) {
            recomendacoes.push({
                tipo: 'swarm',
                prioridade: 'alta',
                acao: `Ativar agentes especialistas: ${missingSpecialists.join(', ')}`,
                detalhes: 'Agentes necessários para a próxima fase evolutiva detectada'
            });
        }
    }

    return recomendacoes;
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('context_awareness_protocol.js')) {
    const prompt = process.argv[2] || '';
    iniciarSenciencia(prompt)
        .then(resultado => {
            console.log('\n🧠 SENCIÊNCIA L.L.B. ATIVADA');
            console.log(JSON.stringify(resultado.resumo, null, 2));
            console.log('\n💡 RECOMENDAÇÕES L.L.B.:');
            resultado.recomendacoes.forEach((rec, i) => {
                console.log(`\n${i + 1}. [${rec.prioridade.toUpperCase()}] ${rec.acao}`);
                console.log(`   ${rec.detalhes}`);
            });
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            process.exit(1);
        });
}

export default {
    iniciarSenciencia,
    continuarSenciencia
};















