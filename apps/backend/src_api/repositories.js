/**
 * API de Repositórios Git
 * 
 * GET /api/repositories - Lista repositórios Git
 * GET /api/repositories/:id - Detalhes de um repositório
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { supabase } from './supabase.js';

const execAsync = promisify(exec);


/**
 * Lista repositórios Git do sistema
 */
async function listGitRepositories() {
  try {
    // Tentar listar repositórios usando git
    // Por enquanto, retornar lista vazia ou repositórios conhecidos
    // Em produção, isso seria integrado com sistema de gerenciamento de repositórios

    const repositories = [
      {
        id: '1',
        name: 'senciente-core-api',
        lang: 'TypeScript',
        updated: '2m ago',
        url: 'git@github.com:senciente/core-api.git',
        branch: 'main',
        lastCommit: 'a1b2c3d',
        lastCommitMsg: 'feat: implemented memory recall',
        description: 'Core backend services',
        status: 'passing',
        requiresAction: false,
        actionType: null,
        actionUrgency: null
      }
    ];

    return repositories;
  } catch (error) {
    console.warn('Erro ao listar repositórios Git:', error.message);
    return [];
  }
}

/**
 * GET /api/repositories - Lista repositórios
 */
export async function getRepositories(req, res) {
  try {
    const repositories = await listGitRepositories();

    // Identificar repositórios aguardando ação manual
    // Por enquanto, nenhum requer ação
    const repositoriesWithActions = repositories.map(repo => ({
      ...repo,
      requiresAction: repo.requiresAction || false
    }));

    res.json({ repositories: repositoriesWithActions });
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/repositories/:id - Detalhes de um repositório
 */
export async function getRepositoryById(req, res) {
  try {
    const { id } = req.params;

    const repositories = await listGitRepositories();
    const repository = repositories.find(r => r.id === id);

    if (!repository) {
      return res.status(404).json({ error: 'Repositório não encontrado' });
    }

    // Buscar tasks relacionadas ao repositório
    const { data: tasks } = await supabase
      .from('task_context')
      .select('*')
      .contains('related_files', [repository.name])
      .limit(10);

    const repositoryDetail = {
      ...repository,
      objectives: [
        {
          label: 'Implement OAuth 2.0 Security Layer',
          sub: 'Secure agent-to-agent communication channels',
          progress: 75
        }
      ],
      credentials: [
        {
          name: 'OpenAI API Key',
          masked: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'
        }
      ],
      summary: {
        created: 'Oct 12, 2023',
        contributors: [],
        tags: ['Node.js', 'PostgreSQL', 'Redis', 'Docker']
      },
      nextSteps: [
        {
          label: 'Review PR #402',
          sub: 'Auth middleware changes',
          completed: false
        }
      ],
      relatedTasks: tasks || []
    };

    res.json({ repository: repositoryDetail });
  } catch (error) {
    console.error('Erro ao buscar repositório:', error);
    res.status(500).json({ error: error.message });
  }
}

