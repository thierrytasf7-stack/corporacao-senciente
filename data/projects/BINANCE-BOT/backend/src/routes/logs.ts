import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

// Endpoint de teste
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Logs router funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Endpoint para salvar logs
router.post('/save', async (req, res) => {
    try {
        const { filename, content, timestamp } = req.body;

        if (!filename || !content) {
            return res.status(400).json({
                success: false,
                error: 'Filename e content são obrigatórios'
            });
        }

        // Criar diretório de logs se não existir
        const logsDir = path.join(__dirname, '../../logs');
        await fs.mkdir(logsDir, { recursive: true });

        // Salvar arquivo de log
        const filePath = path.join(logsDir, filename);
        await fs.writeFile(filePath, content, 'utf8');

        console.log(`📄 Log salvo: ${filePath}`);

        res.json({
            success: true,
            message: 'Log salvo com sucesso',
            file: filename,
            path: filePath
        });

    } catch (error) {
        console.error('Erro ao salvar log:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao salvar log'
        });
    }
});

// Endpoint para atualizar arquivo fixo do frontend
router.post('/update-frontend', async (req, res) => {
    try {
        const { filename, content, timestamp } = req.body;

        if (!filename || !content) {
            return res.status(400).json({
                success: false,
                error: 'Filename e content são obrigatórios'
            });
        }

        // Salvar no diretório raiz do projeto
        const projectRoot = path.join(__dirname, '../../../');
        const filePath = path.join(projectRoot, filename);
        await fs.writeFile(filePath, content, 'utf8');

        console.log(`📄 Log do frontend atualizado: ${filePath}`);

        res.json({
            success: true,
            message: 'Log do frontend atualizado com sucesso',
            filePath
        });
    } catch (error) {
        console.error('Erro ao atualizar log do frontend:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao atualizar log do frontend'
        });
    }
});

// Endpoint para listar logs
router.get('/list', async (req, res) => {
    try {
        const logsDir = path.join(__dirname, '../../logs');

        // Verificar se o diretório existe
        try {
            await fs.access(logsDir);
        } catch {
            return res.json({ logs: [] });
        }

        const files = await fs.readdir(logsDir);
        const logFiles = files.filter(file => file.startsWith('LOG-CONSOLE-') && file.endsWith('.json'));

        const logs = await Promise.all(
            logFiles.map(async (file) => {
                const filePath = path.join(logsDir, file);
                const stats = await fs.stat(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );

        // Ordenar por data de modificação (mais recente primeiro)
        logs.sort((a, b) => b.modified.getTime() - a.modified.getTime());

        res.json({ logs });

    } catch (error) {
        console.error('Erro ao listar logs:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao listar logs'
        });
    }
});

// Endpoint para salvar logs do console
router.post('/console', async (req, res) => {
    try {
        const { logs, timestamp } = req.body;

        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({
                success: false,
                error: 'Logs array é obrigatório'
            });
        }

        // Criar diretório de logs se não existir
        const logsDir = path.join(__dirname, '../../logs');
        await fs.mkdir(logsDir, { recursive: true });

        // Gerar nome do arquivo com timestamp
        const filename = `LOG-CONSOLE-${Date.now()}.json`;
        const filePath = path.join(logsDir, filename);

        // Salvar logs
        const logData = {
            timestamp: timestamp || new Date().toISOString(),
            logs: logs
        };

        await fs.writeFile(filePath, JSON.stringify(logData, null, 2), 'utf8');

        console.log(`📄 Logs do console salvos: ${filePath}`);

        res.json({
            success: true,
            message: 'Logs do console salvos com sucesso',
            filename: filename
        });

    } catch (error) {
        console.error('Erro ao salvar logs do console:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao salvar logs do console'
        });
    }
});

// Endpoint para obter um log específico
router.get('/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename.startsWith('LOG-CONSOLE-') || !filename.endsWith('.json')) {
            return res.status(400).json({
                success: false,
                error: 'Nome de arquivo inválido'
            });
        }

        const logsDir = path.join(__dirname, '../../logs');
        const filePath = path.join(logsDir, filename);

        const content = await fs.readFile(filePath, 'utf8');
        const logData = JSON.parse(content);

        res.json({
            success: true,
            data: logData
        });

    } catch (error) {
        console.error('Erro ao ler log:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao ler log'
        });
    }
});

export default router;
