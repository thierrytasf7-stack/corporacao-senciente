/**
 * API endpoints para gerenciamento de PCs conectados
 */

import express from 'express';
import { getPCRegistry } from '../scripts/infra/pc_registry.js';


const router = express.Router();
const pcRegistry = getPCRegistry();

/**
 * GET /api/pcs - Listar todos os PCs
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            specialization: req.query.specialization,
            status: req.query.status,
            onlineOnly: req.query.onlineOnly === 'true'
        };

        const pcs = await pcRegistry.listPCs(filters);

        // Mapear para o formato esperado pelo frontend (MaestroAgent)
        const mappedPcs = pcs.map(pc => ({
            agent_id: pc.hostname, // Usando hostname como ID principal
            name: pc.hostname,
            status: pc.status,
            ip_address: pc.ip,
            last_heartbeat: pc.lastSeen,
            specs: {
                cpu_usage: pc.metadata?.cpu || 0,
                memory_usage: pc.metadata?.memory || 0,
                disk_usage: 0
            },
            role: pc.specialization
        }));

        res.json(mappedPcs);
    } catch (error) {
        console.error('Erro ao listar PCs:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/pcs/stats - Estatísticas da infraestrutura
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await pcRegistry.getInfrastructureStats();

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/pcs/:hostname - Obter detalhes de um PC específico
 */
router.get('/:hostname', async (req, res) => {
    try {
        const { hostname } = req.params;
        const pc = await pcRegistry.getPC(hostname);

        if (!pc) {
            return res.status(404).json({
                success: false,
                error: 'PC não encontrado'
            });
        }

        res.json({
            success: true,
            pc: pc
        });
    } catch (error) {
        console.error('Erro ao obter PC:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/pcs/register - Registrar um novo PC
 */
router.post('/register', async (req, res) => {
    try {
        const pcData = req.body;

        // Validação básica
        if (!pcData.hostname || !pcData.specialization) {
            return res.status(400).json({
                success: false,
                error: 'Hostname e specialization são obrigatórios'
            });
        }

        // Adicionar informações do request
        pcData.ip = pcData.ip || req.ip;
        pcData.metadata = {
            ...pcData.metadata,
            registeredAt: new Date().toISOString(),
            userAgent: req.get('User-Agent')
        };

        const pc = await pcRegistry.registerPC(pcData);

        res.status(201).json({
            success: true,
            pc: pc,
            message: 'PC registrado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao registrar PC:', error);

        // Verificar se é erro de duplicata
        if (error.message.includes('duplicate') || error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'PC já registrado'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * PUT /api/pcs/:hostname/status - Atualizar status de um PC
 */
router.put('/:hostname/status', async (req, res) => {
    try {
        const { hostname } = req.params;
        const { status, ...additionalData } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status é obrigatório'
            });
        }

        const success = await pcRegistry.updatePCStatus(hostname, status, additionalData);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'PC não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Status atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * DELETE /api/pcs/:hostname - Remover PC do registro
 */
router.delete('/:hostname', async (req, res) => {
    try {
        const { hostname } = req.params;

        const success = await pcRegistry.unregisterPC(hostname);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'PC não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'PC removido com sucesso'
        });
    } catch (error) {
        console.error('Erro ao remover PC:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/pcs/:hostname/command - Executar comando remoto em um PC
 */
router.post('/:hostname/command', async (req, res) => {
    try {
        const { hostname } = req.params;
        const { command, timeout = 30000 } = req.body;

        if (!command) {
            return res.status(400).json({
                success: false,
                error: 'Comando é obrigatório'
            });
        }

        // Verificar se PC existe e está online
        const pc = await pcRegistry.getPC(hostname);
        if (!pc) {
            return res.status(404).json({
                success: false,
                error: 'PC não encontrado'
            });
        }

        if (pc.status !== 'online') {
            return res.status(503).json({
                success: false,
                error: 'PC não está online'
            });
        }

        const result = await executeRemoteCommand(pc, command, timeout);

        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('Erro ao executar comando:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/pcs/:hostname/restart - Reiniciar PC remoto
 */
router.post('/:hostname/restart', async (req, res) => {
    try {
        const { hostname } = req.params;
        const pc = await pcRegistry.getPC(hostname);

        if (!pc) return res.status(404).json({ error: 'PC não encontrado' });

        const result = await executeRemoteCommand(pc, 'restart', 30000);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/pcs/:hostname/stop - Parar PC remoto
 */
router.post('/:hostname/stop', async (req, res) => {
    try {
        const { hostname } = req.params;
        const pc = await pcRegistry.getPC(hostname);

        if (!pc) return res.status(404).json({ error: 'PC não encontrado' });

        const result = await executeRemoteCommand(pc, 'stop', 30000);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/pcs/:hostname/screenshot - Obter screenshot
 */
router.post('/:hostname/screenshot', async (req, res) => {
    try {
        const { hostname } = req.params;
        const pc = await pcRegistry.getPC(hostname);

        if (!pc) return res.status(404).json({ error: 'PC não encontrado' });

        // Simular screenshot (retornar base64 placeholder)
        // Em produção: chamar agente real
        const result = {
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // 1px red (placeholder)
            timestamp: new Date().toISOString()
        };

        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * Função auxiliar para executar comandos remotos
 * TODO: Implementar SSH real
 */
async function executeRemoteCommand(pc, command, timeout) {
    // Placeholder - implementar execução SSH real
    console.log(`Executando comando remoto em ${pc.hostname}: ${command}`);

    // Simular resultado
    return {
        command: command,
        output: `Comando "${command}" executado em ${pc.hostname} com sucesso.`,
        exitCode: 0,
        executedAt: new Date().toISOString()
    };
}

export default router;
