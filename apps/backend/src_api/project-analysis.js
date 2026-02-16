/**
 * API de Análise de Projetos
 * 
 * GET /api/project-analysis - Análise estratégica de projetos
 */

import { supabase } from './supabase.js';


/**
 * GET /api/project-analysis - Análise estratégica
 */
export async function getProjectAnalysis(req, res) {
  try {
    // Buscar projetos e tasks
    const { data: tasks } = await supabase
      .from('task_context')
      .select('*')
      .order('updated_at', { ascending: false });

    // Agrupar por projeto
    const projectsMap = new Map();

    (tasks || []).forEach(task => {
      let projectName = 'Unassigned';
      if (task.related_files && task.related_files.length > 0) {
        const firstFile = task.related_files[0];
        if (firstFile.includes('/')) {
          projectName = firstFile.split('/')[0];
        }
      }

      if (!projectsMap.has(projectName)) {
        projectsMap.set(projectName, []);
      }
      projectsMap.get(projectName).push(task);
    });

    // Converter para análise de projetos
    const projects = Array.from(projectsMap.entries()).slice(0, 1).map(([name, projectTasks]) => {
      const total = projectTasks.length;
      const done = projectTasks.filter(t => t.status === 'done').length;
      const coding = projectTasks.filter(t => t.status === 'coding').length;
      const planning = projectTasks.filter(t => t.status === 'planning').length;

      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const healthScore = progress >= 80 ? 98 : progress >= 50 ? 75 : 45;

      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: `Projeto ${name}: Expansão Neural`,
        status: 'Em Andamento',
        priority: progress < 50 ? 'Crítica' : 'Alta',
        healthScore,
        nextMilestone: `${Math.floor(Math.random() * 24) + 1}h ${Math.floor(Math.random() * 60)}m`,
        strategicAnalysis: `Avaliação Positiva. A expansão da infraestrutura neural superou as expectativas iniciais. Progresso consistente e métricas dentro do esperado.`,
        currentPhase: {
          number: 3,
          total: 5,
          name: 'Otimização de Latência e Redundância',
          description: 'Implementando protocolos de roteamento dinâmico.',
          status: 'EM PROGRESSO',
          eta: '4h'
        },
        nextPhases: [
          {
            name: 'Testes de Carga Massiva',
            description: 'Simulação de 50 milhões de conexões simultâneas.',
            status: 'PLANEJADO'
          },
          {
            name: 'Deploy em Produção',
            description: 'Migração gradual para ambiente de produção.',
            status: 'PLANEJADO'
          }
        ],
        globalProgress: {
          percentage: progress,
          startDate: '01/10',
          deadline: '15/11'
        },
        tacticalObjectives: [
          {
            label: 'Migração do Cluster Norte',
            status: 'done'
          },
          {
            label: 'Redução de latência < 15ms',
            status: 'active',
            progress: 85
          },
          {
            label: 'Implementação de redundância',
            status: 'pending'
          }
        ],
        guidelines: [
          {
            agent: '@Agente_Atlas',
            directive: 'Priorizar alocação de computação quântica para testes de carga.'
          },
          {
            agent: '@Agente_Architect',
            directive: 'Revisar arquitetura de redundância antes do deploy.'
          }
        ]
      };
    });

    const detailCards = [
      {
        title: 'Iniciativa Sentinela',
        id: '#PRJ-SNT-102',
        status: 'Manutenção',
        color: 'blue',
        message: 'Padrões de segurança estáveis. Nenhuma ação imediata necessária.',
        progress: 45,
        directive: 'Agendar patch v7.1 para 03:00 UTC.'
      },
      {
        title: 'Projeto Beta',
        id: '#PRJ-BETA-203',
        status: 'Desenvolvimento',
        color: 'green',
        message: 'Fase inicial concluída. Pronto para próxima iteração.',
        progress: 30,
        directive: 'Iniciar fase de testes na próxima semana.'
      }
    ];

    res.json({ projects, detailCards });
  } catch (error) {
    console.error('Erro ao buscar análise de projetos:', error);
    res.status(500).json({ error: error.message });
  }
}

