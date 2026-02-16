/**
 * API de Tasks
 * 
 * GET /api/tasks - Lista tasks de task_context no Supabase
 * GET /api/tasks/:id - Detalhes de uma task específica
 */

import { supabase } from './supabase.js';


/**
 * Mapeia status do Supabase para formato do frontend
 */
function mapStatus(status) {
  const statusMap = {
    'planning': 'Pending',
    'coding': 'Running',
    'review': 'Running',
    'done': 'Success'
  };
  return statusMap[status] || 'Pending';
}

/**
 * Extrai projeto de related_files ou metadata
 */
function extractProjectFromMetadata(task) {
  if (task.related_files && task.related_files.length > 0) {
    // Tentar extrair projeto do primeiro arquivo
    const firstFile = task.related_files[0];
    if (firstFile.includes('/')) {
      const parts = firstFile.split('/');
      if (parts.length > 1) {
        return parts[0];
      }
    }
  }
  return 'Unassigned';
}

/**
 * Extrai agente de related_files ou metadata
 */
function extractAgentFromMetadata(task) {
  // Por enquanto, retornar 'System' - pode ser melhorado com metadata
  return 'System';
}

/**
 * Extrai prioridade de metadata ou define padrão
 */
function extractPriorityFromMetadata(task) {
  // Por enquanto, retornar 'Medium' - pode ser melhorado com metadata
  return 'Medium';
}

/**
 * Calcula progresso baseado em status
 */
function calculateProgress(status) {
  const progressMap = {
    'planning': 0,
    'coding': 50,
    'review': 75,
    'done': 100
  };
  return progressMap[status] || 0;
}

/**
 * Formata tempo relativo
 */
function formatRelativeTime(dateString) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * GET /api/tasks - Lista tasks com filtros e paginação
 */
export async function getTasks(req, res) {
  try {
    const {
      status,
      agent,
      project,
      priority,
      limit = 20,
      offset = 0,
      orderBy = 'updated_at'
    } = req.query;

    // Construir query
    let query = supabase
      .from('task_context')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (status) {
      // Mapear status do frontend para status do Supabase
      const statusMap = {
        'Pending': 'planning',
        'Running': ['coding', 'review'],
        'Success': 'done',
        'Queued': 'planning',
        'Paused': 'planning',
        'Scheduled': 'planning',
        'Blocked': 'planning',
        'Waiting Input': 'planning'
      };

      const supabaseStatus = statusMap[status];
      if (Array.isArray(supabaseStatus)) {
        query = query.in('status', supabaseStatus);
      } else if (supabaseStatus) {
        query = query.eq('status', supabaseStatus);
      }
    }

    // Aplicar ordenação
    const orderDirection = orderBy === 'created_at' ? 'asc' : 'desc';
    query = query.order(orderBy === 'created_at' ? 'created_at' : 'updated_at', { ascending: orderDirection === 'asc' });

    // Aplicar paginação
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Mapear tasks para formato do frontend
    const tasks = (data || []).map(task => ({
      id: task.id.toString(),
      title: task.task_description,
      project: extractProjectFromMetadata(task),
      agent: extractAgentFromMetadata(task),
      status: mapStatus(task.status),
      startDate: task.created_at,
      lastUpdate: formatRelativeTime(task.updated_at),
      priority: extractPriorityFromMetadata(task),
      progress: calculateProgress(task.status)
    }));

    res.json({
      tasks,
      total: count || 0,
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Erro ao buscar tasks:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/tasks/:id - Detalhes de uma task específica
 */
export async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('task_context')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    // Buscar logs relacionados (se existir tabela de logs)
    // Por enquanto, retornar estrutura básica
    const taskDetail = {
      id: task.id.toString(),
      title: task.task_description,
      project: extractProjectFromMetadata(task),
      agent: extractAgentFromMetadata(task),
      status: mapStatus(task.status),
      priority: extractPriorityFromMetadata(task),
      progress: calculateProgress(task.status),
      startDate: task.created_at,
      lastUpdate: formatRelativeTime(task.updated_at),
      estimatedCompletion: null, // Pode ser calculado no futuro
      dynamicPrompts: [], // Pode ser preenchido com prompts de agentes
      subtasks: [], // Pode ser preenchido com subtasks relacionadas
      overallCompletion: {
        percentage: calculateProgress(task.status),
        tasksDone: task.status === 'done' ? 1 : 0,
        totalTasks: 1,
        activeAgents: 0,
        avgCpuUsage: 0
      },
      activityLogs: [] // Pode ser preenchido com logs de atividade
    };

    res.json({ task: taskDetail });
  } catch (error) {
    console.error('Erro ao buscar task:', error);
    res.status(500).json({ error: error.message });
  }
}

