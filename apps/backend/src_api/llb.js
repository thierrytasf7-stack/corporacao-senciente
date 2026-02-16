#!/usr/bin/env node
/**
 * API para Protocolo L.L.B.
 * 
 * Endpoints para status e informações do Protocolo L.L.B.
 */

import { getByteRover } from '../scripts/memory/byterover.js';
import { getLangMem } from '../scripts/memory/langmem.js';
import { getLetta } from '../scripts/memory/letta.js';
import { getLLBProtocol } from '../scripts/memory/llb_protocol.js';
import { logger } from '../scripts/utils/logger.js';


const log = logger.child({ module: 'llb_api' });

/**
 * Retorna status do Protocolo L.L.B.
 */
export async function getLLBStatus(req, res) {
    try {
        log.info('Getting LLB status');

        const langmem = getLangMem();
        const letta = getLetta();
        const byterover = getByteRover();
        const protocol = getLLBProtocol();

        // Verificar status de cada camada
        const [state, nextStep, timeline, recentWisdom] = await Promise.all([
            letta.getCurrentState(),
            letta.getNextEvolutionStep(),
            byterover.getEvolutionTimeline(5),
            langmem.getWisdom('', 'architecture').then(w => w.slice(0, 3))
        ]);

        // Status de conexão expandido com todos os dados necessários
        const status = {
            langmem: {
                connected: true,
                lastWisdom: recentWisdom.length > 0 ? {
                    content: recentWisdom[0].content.substring(0, 100),
                    category: recentWisdom[0].category,
                    timestamp: recentWisdom[0].created_at
                } : null,
                totalWisdom: recentWisdom.length,
                stability: 98.2,
                processingIndex: 142
            },
            letta: {
                connected: true,
                currentPhase: state.current_phase,
                nextStep: nextStep,
                blockages: state.blockages?.length || 0,
                pendingTasks: state.next_steps?.length || 0,
                narrativeCoherence: 94,
                autonomyLevel: 5
            },
            byterover: {
                connected: true,
                lastCommit: timeline.timeline && timeline.timeline.length > 0 ? {
                    hash: timeline.timeline[0].hash,
                    message: timeline.timeline[0].message,
                    date: timeline.timeline[0].date,
                    type: timeline.timeline[0].type
                } : null,
                recentCommits: timeline.timeline?.length || 0
            },
            personality: {
                bigFive: {
                    openness: 120,
                    conscientiousness: 98,
                    extraversion: 86,
                    agreeableness: 99,
                    neuroticism: 85
                },
                disc: {
                    dominance: 82,
                    influence: 35,
                    stability: 45,
                    compliance: 78
                }
            },
            neuralAllocation: {
                longTermMemory: { used: '24TB', total: '12PB', percentage: 25 },
                logicalProcessing: { value: '4.2 GHz', percentage: 65 },
                languageSynthesis: { status: 'Ativa', percentage: 98 }
            },
            evolutionTimeline: [
                { year: '1990', value: 40 },
                { year: '2000', value: 25 },
                { year: '2010', value: 55 },
                { year: '2020', value: 35 },
                { year: 'HOJE', value: 75 }
            ],
            protocol: {
                version: '1.0.0',
                status: 'operational'
            },
            timestamp: new Date().toISOString()
        };

        res.json(status);
    } catch (error) {
        log.error('Error getting LLB status', { error: error.message });
        res.status(500).json({
            error: error.message,
            status: {
                langmem: { connected: false },
                letta: { connected: false },
                byterover: { connected: false },
                protocol: { status: 'error' }
            }
        });
    }
}

/**
 * Retorna estado detalhado do Letta
 */
export async function getLettaState(req, res) {
    try {
        log.info('Getting Letta state');

        const letta = getLetta();
        const state = await letta.getCurrentState();
        const nextStep = await letta.getNextEvolutionStep();
        const history = await letta.getEvolutionHistory(10);

        res.json({
            state: state,
            nextStep: nextStep,
            history: history,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        log.error('Error getting Letta state', { error: error.message });
        res.status(500).json({ error: error.message });
    }
}

/**
 * Retorna sabedoria recente do LangMem
 */
export async function getLangMemWisdom(req, res) {
    try {
        log.info('Getting LangMem wisdom');

        const langmem = getLangMem();
        const category = req.query.category || null;
        const limit = parseInt(req.query.limit) || 10;
        const query = req.query.query || '';

        const wisdom = await langmem.getWisdom(query, category);

        res.json({
            wisdom: wisdom.slice(0, limit),
            total: wisdom.length,
            category: category,
            query: query,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        log.error('Error getting LangMem wisdom', { error: error.message });
        res.status(500).json({ error: error.message });
    }
}

/**
 * Retorna timeline evolutiva do ByteRover
 */
export async function getByteRoverTimeline(req, res) {
    try {
        log.info('Getting ByteRover timeline');

        const byterover = getByteRover();
        const limit = parseInt(req.query.limit) || 20;

        const timeline = await byterover.getEvolutionTimeline(limit);

        res.json({
            timeline: timeline.timeline || [],
            success: timeline.success,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        log.error('Error getting ByteRover timeline', { error: error.message });
        res.status(500).json({ error: error.message });
    }
}


