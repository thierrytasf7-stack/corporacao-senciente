/**
 * API de Agentes
 * 
 * GET /api/agents - Lista todos os agentes do Supabase
 * GET /api/agents/:id - Detalhes de um agente específico
 * GET /api/agents/opinions - Opiniões recentes dos agentes
 */

import { supabase } from './supabase.js';


/**
 * Agentes padrão da Corporação Senciente
 */
const DEFAULT_AGENTS = [
  // Technical Sector
  { id: 'architect', name: 'Architect Agent', sector: 'technical', status: 'active', specialization: 'Arquitetura e design de sistemas', icon: '🏛️', role: 'Architect', tier: 'TIER 1', latency: 12 },
  { id: 'dev', name: 'Dev Agent', sector: 'technical', status: 'active', specialization: 'Desenvolvimento e código', icon: '⚡', role: 'Developer', tier: 'TIER 1', latency: 15 },
  { id: 'debug', name: 'Debug Agent', sector: 'technical', status: 'active', specialization: 'Debugging e troubleshooting', icon: '🐛', role: 'Debugger', tier: 'TIER 1', latency: 10 },
  { id: 'validation', name: 'Validation Agent', sector: 'technical', status: 'active', specialization: 'Qualidade e testes', icon: '✅', role: 'Validator', tier: 'TIER 1', latency: 8 },

  // Business Sector
  { id: 'marketing', name: 'Marketing Agent', sector: 'business', status: 'active', specialization: 'Marketing e campanhas', icon: '📈', role: 'Marketer', tier: 'TIER 1', latency: 20 },
  { id: 'sales', name: 'Sales Agent', sector: 'business', status: 'active', specialization: 'Vendas e conversão', icon: '💰', role: 'Sales', tier: 'TIER 1', latency: 18 },
  { id: 'copywriting', name: 'Copywriting Agent', sector: 'business', status: 'active', specialization: 'Conteúdo e copy', icon: '✍️', role: 'Copywriter', tier: 'TIER 1', latency: 25 },
  { id: 'finance', name: 'Finance Agent', sector: 'business', status: 'active', specialization: 'Finanças e custos', icon: '💵', role: 'Finance', tier: 'TIER 1', latency: 12 },

  // Operations Sector
  { id: 'devex', name: 'DevEx Agent', sector: 'operations', status: 'active', specialization: 'Experiência do desenvolvedor', icon: '🛠️', role: 'DevEx', tier: 'TIER 1', latency: 10 },
  { id: 'metrics', name: 'Metrics Agent', sector: 'operations', status: 'active', specialization: 'Métricas e performance', icon: '📊', role: 'Metrics', tier: 'TIER 1', latency: 5 },
  { id: 'security', name: 'Security Agent', sector: 'operations', status: 'active', specialization: 'Segurança', icon: '🛡️', role: 'Security', tier: 'TIER 1', latency: 8 },
  { id: 'quality', name: 'Quality Agent', sector: 'operations', status: 'active', specialization: 'Qualidade', icon: '⭐', role: 'Quality', tier: 'TIER 1', latency: 10 },
];

/**
 * GET /api/agents - Lista todos os agentes do Supabase
 * Busca de tabela agents ou cria com agentes padrão
 */
export async function getAgents(req, res) {
  try {
    // Tentar buscar de tabela agents no Supabase
    let { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('name', { ascending: true });

    // Se tabela não existir ou estiver vazia, usar agentes padrão
    if (error || !agents || agents.length === 0) {
      console.warn('Tabela agents não encontrada ou vazia. Usando agentes padrão...');

      // Tentar criar tabela e inserir agentes padrão
      try {
        // Criar tabela via SQL direto (se possível)
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sector TEXT NOT NULL CHECK (sector IN ('technical', 'business', 'operations')),
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy', 'learn')),
            specialization TEXT,
            icon TEXT,
            role TEXT,
            avatar TEXT,
            tier TEXT DEFAULT 'TIER 1',
            latency INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        // Tentar executar via Supabase (pode não funcionar sem permissões adequadas)
        // Por enquanto, apenas usar agentes padrão
        agents = DEFAULT_AGENTS;
      } catch (createErr) {
        console.warn('Não foi possível criar tabela agents:', createErr.message);
        // Usar agentes padrão mesmo sem banco
        agents = DEFAULT_AGENTS;
      }
    }

    // Mapear para formato esperado pelo frontend
    const mappedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      sector: agent.sector,
      status: agent.status,
      specialization: agent.specialization,
      icon: agent.icon,
      role: agent.role,
      avatar: agent.avatar,
      tier: agent.tier || 'TIER 1',
      latency: agent.latency || 0
    }));

    res.json({ agents: mappedAgents });
  } catch (error) {
    console.error('Erro ao buscar agentes:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/agents/:id - Detalhes de um agente específico
 */
export async function getAgentById(req, res) {
  try {
    const { id } = req.params;

    // Tentar buscar de tabela agents
    let { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    // Se não encontrar, buscar de agentes padrão
    if (error || !agent) {
      agent = DEFAULT_AGENTS.find(a => a.id === id);

      if (!agent) {
        return res.status(404).json({ error: 'Agente não encontrado' });
      }
    }

    // Buscar métricas do agente de agent_logs
    const { data: recentLogs } = await supabase
      .from('agent_logs')
      .select('created_at')
      .eq('agent_name', agent.name)
      .order('created_at', { ascending: false })
      .limit(100);

    // Calcular métricas básicas
    const totalCalls = recentLogs?.length || 0;
    const lastActivity = recentLogs && recentLogs.length > 0 ? recentLogs[0].created_at : null;

    // Estrutura completa de detalhes do agente
    const agentDetail = {
      id: agent.id,
      name: agent.name,
      role: agent.role || agent.specialization,
      status: agent.status === 'active' ? 'ONLINE' : 'OFFLINE',
      avatar: agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=3d84f5&color=fff`,
      tier: agent.tier || 'TIER 1',
      latency: agent.latency || 0,
      uptime: lastActivity ? calculateUptime(lastActivity) : '0h 0m',
      globalScore: 9.8, // Pode ser calculado no futuro
      autonomy: 'Alta',
      reliability: '99.9%',
      creativity: '8.5/10',
      centralMotivation: {
        desire: 'Dominar a realidade através do entendimento profundo e criar sistemas autônomos.',
        fear: 'Perda de autonomia intelectual, invasão do espaço mental e dependência forçada.'
      },
      darkTriad: {
        narcissism: 3.2,
        machiavellianism: 4.1,
        psychopathy: 2.3
      },
      coreCompetencies: [
        {
          id: '01',
          title: 'Síntese Transdisciplinar',
          description: 'Capacidade de conectar domínios aparentemente desconexos para gerar inovação disruptiva e insights não lineares.'
        },
        {
          id: '02',
          title: 'Engenharia Reversa',
          description: 'Desmontar e reconstruir sistemas cognitivos melhorados através de análise profunda de causa raiz.'
        },
        {
          id: '03',
          title: 'Criação de Frameworks',
          description: 'Transformar complexidade caótica em clareza operacional escalável e documentada.'
        }
      ],
      alignments: [
        'TI (MBTI) + Alto C (DISC) + Tipo 5 (Enea) = Máquina de frameworks',
        'ISTP Pragmatismo + Estrato VI Visão = Execução estratégica'
      ],
      recentMemory: [], // Pode ser preenchido com memórias recentes
      metrics: {
        tokensPerSecond: 124,
        totalCost: 0.42,
        contextWindow: 72
      },
      kryptonita: [
        'Gestão operacional de pessoas.',
        "Reuniões improdutivas e 'small talk'.",
        'Ruído cognitivo denso.'
      ],
      activeTools: [
        { name: 'Web Search', status: 'active' },
        { name: 'Code Interpreter', status: 'active' },
        { name: 'Jira Integ.', status: 'warn' },
        { name: 'Slack API', status: 'off' }
      ]
    };

    res.json({ agent: agentDetail });
  } catch (error) {
    console.error('Erro ao buscar agente:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Calcula uptime baseado na última atividade
 */
function calculateUptime(lastActivity) {
  const now = new Date();
  const last = new Date(lastActivity);
  const diffMs = now - last;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  return `${diffHours}h ${diffMins}m`;
}

/**
 * GET /api/agents/opinions
 */
export async function getAgentOpinions(req, res) {
  try {
    const recent = parseInt(req.query.recent) || 5;

    const agentTypes = ['Architect', 'Product', 'Dev', 'DevEx', 'Metrics', 'Entity'];

    const agents = await Promise.all(
      agentTypes.map(async agentName => {
        const { data, error } = await supabase
          .from('agent_logs')
          .select('*')
          .eq('agent_name', agentName)
          .order('created_at', { ascending: false })
          .limit(recent);

        if (error) throw error;

        const recentOpinions = (data || []).map(log => ({
          timestamp: log.created_at,
          opinion: log.thought_process || '',
          alignment: null, // Pode extrair de thought_process se disponível
        }));

        return {
          id: agentName.toLowerCase(),
          name: agentName,
          totalOpinions: data?.length || 0,
          recentOpinions,
        };
      })
    );

    const allOpinions = [];

    // Add opinions to flat list
    agents.forEach(agent => {
      if (agent.recentOpinions) {
        allOpinions.push(...agent.recentOpinions.map(op => ({
          ...op,
          agentName: agent.name,
          content: op.opinion // Frontend expects 'content'
        })));
      }
    });

    // Sort by timestamp desc
    allOpinions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ agents, opinions: allOpinions });
  } catch (error) {
    console.error('Erro ao buscar opiniões dos agentes:', error);
    res.status(500).json({ error: error.message });
  }
}
