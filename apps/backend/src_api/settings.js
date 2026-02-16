/**
 * API de Configurações
 * 
 * GET /api/settings - Retorna configurações do sistema
 * POST /api/settings - Atualiza configurações
 */



/**
 * GET /api/settings - Retorna configurações
 */
export async function getSettings(req, res) {
  try {
    // Por enquanto, retornar configurações padrão
    // Em produção, buscar de tabela settings no Supabase

    const settings = {
      brainAutomations: {
        autonomyLevel: 45,
        humanApprovalRequired: true,
        approvalThreshold: 5000,
        riskHeuristic: 'Equilibrado',
        cycles: [
          {
            label: 'Sincronização CRM',
            interval: '5min',
            status: 'online',
            color: 'accent-purple',
            icon: 'sync'
          },
          {
            label: 'Backup Automático',
            interval: '1h',
            status: 'online',
            color: 'accent-blue',
            icon: 'backup'
          },
          {
            label: 'Análise de Métricas',
            interval: '15min',
            status: 'paused',
            color: 'accent-green',
            icon: 'analytics'
          }
        ]
      },
      remotePCs: [
        {
          name: 'Senciente-Core-Alpha',
          address: '10.0.0.51',
          cpu: 45,
          ram: 60,
          status: 'Connected'
        },
        {
          name: 'Senciente-Core-Beta',
          address: '10.0.0.52',
          cpu: 32,
          ram: 48,
          status: 'Connected'
        }
      ],
      integrations: [
        {
          name: 'OpenAI GPT-4',
          icon: 'smart_toy',
          color: 'accent-green',
          active: true,
          info: null
        },
        {
          name: 'GitHub',
          icon: 'code',
          color: 'accent-blue',
          active: true,
          info: null
        },
        {
          name: 'Jira',
          icon: 'bug_report',
          color: 'accent-yellow',
          active: false,
          info: 'Configuração pendente'
        }
      ],
      capabilities: [
        {
          title: 'Processamento de Linguagem Natural (NLP)',
          description: 'Permite análise de contratos, documentos e comunicação natural com agentes.',
          active: true
        },
        {
          title: 'Análise de Código Automática',
          description: 'Revisão e análise automática de código usando modelos de IA.',
          active: true
        },
        {
          title: 'Execução Autônoma de Tasks',
          description: 'Permite que agentes executem tasks sem aprovação humana para ações de baixo risco.',
          active: false
        }
      ]
    };

    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/settings - Atualiza configurações
 */
export async function updateSettings(req, res) {
  try {
    const settings = req.body;

    // Por enquanto, apenas retornar sucesso
    // Em produção, salvaria em tabela settings no Supabase

    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      settings
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: error.message });
  }
}

