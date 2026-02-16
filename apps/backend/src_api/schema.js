/**
 * API de Schema - Gerenciamento de Schemas de Dados
 * 
 * Endpoints para visualização e gerenciamento de schemas do banco de dados
 */

import { supabase } from './supabase.js';

// Domínios mapeados
const DOMAIN_MAPPING = {
  CEREBRO_CENTRAL: {
    description: 'Cérebro Central da Corporação',
    tables: [
      'cerebro_orgaos',
      'cerebro_agent_specializations',
      'cerebro_agent_orgao_assignments',
      'cerebro_agent_training',
      'cerebro_specialized_knowledge',
      'cerebro_knowledge_sources',
      'cerebro_prompt_evolution',
      'cerebro_synthetic_examples',
      'cerebro_agent_performance',
    ],
  },
  GAIA_KERNEL: {
    description: 'Kernel de Evolução de Agentes',
    tables: ['agent_dna', 'agent_evolution_log', 'agent_vaccines'],
  },
  FORGE_KERNEL: {
    description: 'Kernel de LLMs e Ferramentas',
    tables: ['llm_usage', 'mcp_status', 'workflow_runs', 'tools_registry'],
  },
  CORTEX_KERNEL: {
    description: 'Kernel de Fluxos',
    tables: ['flows', 'flow_executions', 'flow_pain_tasks'],
  },
  DAEMON_KERNEL: {
    description: 'Kernel Guardião dos Dados',
    tables: ['daemon_rules', 'daemon_events', 'daemon_optimizations', 'daemon_health', 'schema_templates'],
  },
  MEMORIA: {
    description: 'Sistema de Memória',
    tables: ['corporate_memory', 'memory_bank', 'task_context', 'episodic_memory', 'derived_insights'],
  },
  MARKETING: {
    description: 'Módulo de Marketing',
    tables: ['marketing_campaigns'],
  },
  COPYWRITING: {
    description: 'Módulo de Copywriting',
    tables: [
      'cerebro_copywriting_campaigns',
      'cerebro_copywriting_metrics',
      'cerebro_copywriting_templates',
      'cerebro_copywriting_learning',
    ],
  },
  VENDAS: {
    description: 'Módulo de Vendas',
    tables: [
      'sales_pipelines',
      'cerebro_sales_leads',
      'cerebro_sales_deals',
      'cerebro_sales_proposals',
      'cerebro_sales_funnel_analysis',
    ],
  },
  INFRAESTRUTURA: {
    description: 'Infraestrutura e PCs',
    tables: ['pc_hosts', 'pc_screenshots', 'execution_queue', 'system_metrics', 'pc_activity_log'],
  },
  AUTOMACAO: {
    description: 'Automações',
    tables: ['automations'],
  },
  AUDITORIA: {
    description: 'Auditoria e Logs',
    tables: ['audit_log', 'etl_logs', 'agent_logs'],
  },
  VALIDACAO: {
    description: 'Validação',
    tables: ['cerebro_agent_evaluations'],
  },
};

/**
 * GET /api/schema/tables - Lista todas as tabelas com seus schemas
 */
export async function getAllTables(req, res) {
  try {
    // Buscar todas as tabelas via daemon_health (mais confiável)
    const { data: healthData, error: healthError } = await supabase
      .from('daemon_health')
      .select('table_name')
      .order('check_date', { ascending: false });

    if (healthError) {
      // Fallback: usar lista de tabelas conhecidas dos domínios
      const allTables = new Set();
      Object.values(DOMAIN_MAPPING).forEach(config => {
        config.tables.forEach(table => allTables.add(table));
      });
      
      const schemas = await Promise.all(
        Array.from(allTables).map(async (tableName) => {
          return await getTableSchemaInternal(tableName);
        })
      );

      return res.json({ success: true, data: schemas.filter(Boolean) });
    }

    // Obter tabelas únicas do daemon_health
    const uniqueTables = [...new Set(healthData?.map(h => h.table_name) || [])];

    // Para cada tabela, buscar schema detalhado
    const schemas = await Promise.all(
      uniqueTables.map(async (tableName) => {
        return await getTableSchemaInternal(tableName);
      })
    );

    res.json({ success: true, data: schemas.filter(Boolean) });
  } catch (error) {
    console.error('Erro ao buscar tabelas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/schema/tables/:tableName - Obtém schema de uma tabela específica
 */
export async function getTableSchema(req, res) {
  try {
    const { tableName } = req.params;
    const schema = await getTableSchemaInternal(tableName);

    if (!schema) {
      return res.status(404).json({ success: false, error: 'Tabela não encontrada' });
    }

    res.json({ success: true, data: schema });
  } catch (error) {
    console.error('Erro ao buscar schema da tabela:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Função interna para obter schema de uma tabela
 */
async function getTableSchemaInternal(tableName) {
  try {
    // Buscar dados básicos da tabela via daemon_health
    const { data: healthData } = await supabase
      .from('daemon_health')
      .select('total_rows, health_score')
      .eq('table_name', tableName)
      .order('check_date', { ascending: false })
      .limit(1)
      .single();

    // Buscar foreign keys conhecidas (mapeamento manual baseado no que sabemos)
    const foreignKeys = [];
    
    // Mapeamento conhecido de FKs (baseado no que vimos anteriormente)
    const knownFKs = {
      'cerebro_agent_orgao_assignments': [
        { constraint_name: 'cerebro_agent_orgao_assignments_orgao_id_fkey', column_name: 'orgao_id', foreign_table_name: 'cerebro_orgaos', foreign_column_name: 'id' },
        { constraint_name: 'cerebro_agent_orgao_assignments_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_agent_training': [
        { constraint_name: 'cerebro_agent_training_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_specialized_knowledge': [
        { constraint_name: 'cerebro_specialized_knowledge_source_orgao_id_fkey', column_name: 'source_orgao_id', foreign_table_name: 'cerebro_orgaos', foreign_column_name: 'id' },
      ],
      'cerebro_knowledge_sources': [
        { constraint_name: 'cerebro_knowledge_sources_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_training_sessions': [
        { constraint_name: 'cerebro_training_sessions_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_prompt_evolution': [
        { constraint_name: 'cerebro_prompt_evolution_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_synthetic_examples': [
        { constraint_name: 'cerebro_synthetic_examples_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_agent_performance': [
        { constraint_name: 'cerebro_agent_performance_agent_name_fkey', column_name: 'agent_name', foreign_table_name: 'cerebro_agent_specializations', foreign_column_name: 'agent_name' },
      ],
      'cerebro_copywriting_metrics': [
        { constraint_name: 'cerebro_copywriting_metrics_campaign_id_fkey', column_name: 'campaign_id', foreign_table_name: 'cerebro_copywriting_campaigns', foreign_column_name: 'id' },
      ],
      'cerebro_sales_deals': [
        { constraint_name: 'cerebro_sales_deals_lead_id_fkey', column_name: 'lead_id', foreign_table_name: 'cerebro_sales_leads', foreign_column_name: 'id' },
      ],
      'cerebro_sales_proposals': [
        { constraint_name: 'cerebro_sales_proposals_deal_id_fkey', column_name: 'deal_id', foreign_table_name: 'cerebro_sales_deals', foreign_column_name: 'id' },
      ],
      'execution_queue': [
        { constraint_name: 'execution_queue_target_pc_id_fkey', column_name: 'target_pc_id', foreign_table_name: 'pc_hosts', foreign_column_name: 'id' },
      ],
      'pc_screenshots': [
        { constraint_name: 'pc_screenshots_pc_id_fkey', column_name: 'pc_id', foreign_table_name: 'pc_hosts', foreign_column_name: 'id' },
      ],
    };

    if (knownFKs[tableName]) {
      foreignKeys.push(...knownFKs[tableName]);
    }

    // Tentar buscar uma linha da tabela para inferir colunas básicas
    let columns = [];
    try {
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        columns = Object.keys(sampleData[0]).map(key => ({
          column_name: key,
          data_type: typeof sampleData[0][key] === 'number' ? 'bigint' : typeof sampleData[0][key] === 'boolean' ? 'boolean' : 'text',
          is_nullable: true,
          column_default: null,
          character_maximum_length: null,
        }));
      }
    } catch (err) {
      // Ignorar erro ao tentar buscar amostra
    }

    // Se não conseguiu colunas, usar estrutura básica conhecida
    if (columns.length === 0) {
      columns = [
        { column_name: 'id', data_type: 'bigint', is_nullable: false, column_default: null, character_maximum_length: null },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: true, column_default: null, character_maximum_length: null },
      ];
    }

    return {
      table_name: tableName,
      columns: columns,
      primary_keys: ['id'], // Assumir 'id' como PK padrão
      foreign_keys: foreignKeys,
      indexes: [], // Índices serão inferidos depois se necessário
      row_count: healthData?.total_rows || 0,
      size_bytes: (healthData?.total_rows || 0) * 100, // Estimativa
    };
  } catch (error) {
    console.error('Erro ao obter schema interno:', error);
    return null;
  }
}

/**
 * GET /api/schema/domains - Lista todos os domínios
 */
export async function getAllDomains(req, res) {
  try {
    const domains = await Promise.all(
      Object.entries(DOMAIN_MAPPING).map(async ([domain, config]) => {
        // Buscar saúde do domínio
        const { data: healthData } = await supabase
          .from('daemon_health')
          .select('health_score, total_rows')
          .in('table_name', config.tables)
          .order('check_date', { ascending: false })
          .limit(1);

        const avgHealth = healthData && healthData.length > 0
          ? healthData.reduce((sum, h) => sum + (h.health_score || 0), 0) / healthData.length
          : 100;

        const totalRows = healthData && healthData.length > 0
          ? healthData.reduce((sum, h) => sum + (h.total_rows || 0), 0)
          : 0;

        // Buscar relacionamentos
        const relationships = [];
        for (const table of config.tables) {
          const schema = await getTableSchemaInternal(table);
          if (schema && schema.foreign_keys) {
            relationships.push(...schema.foreign_keys);
          }
        }

        return {
          domain,
          description: config.description,
          tables: config.tables,
          total_rows: totalRows,
          health_score: avgHealth,
          relationships: relationships,
        };
      })
    );

    res.json({ success: true, data: domains });
  } catch (error) {
    console.error('Erro ao buscar domínios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/schema/domains/:domain - Obtém schema de um domínio específico
 */
export async function getDomainSchema(req, res) {
  try {
    const { domain } = req.params;
    const config = DOMAIN_MAPPING[domain];

    if (!config) {
      return res.status(404).json({ success: false, error: 'Domínio não encontrado' });
    }

    // Buscar saúde do domínio
    const { data: healthData } = await supabase
      .from('daemon_health')
      .select('health_score, total_rows')
      .in('table_name', config.tables)
      .order('check_date', { ascending: false })
      .limit(1);

    const avgHealth = healthData && healthData.length > 0
      ? healthData.reduce((sum, h) => sum + (h.health_score || 0), 0) / healthData.length
      : 100;

    const totalRows = healthData && healthData.length > 0
      ? healthData.reduce((sum, h) => sum + (h.total_rows || 0), 0)
      : 0;

    // Buscar relacionamentos
    const relationships = [];
    for (const table of config.tables) {
      const schema = await getTableSchemaInternal(table);
      if (schema && schema.foreign_keys) {
        relationships.push(...schema.foreign_keys);
      }
    }

    res.json({
      success: true,
      data: {
        domain,
        description: config.description,
        tables: config.tables,
        total_rows: totalRows,
        health_score: avgHealth,
        relationships: relationships,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar schema do domínio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/schema/metrics - Obtém métricas gerais do schema
 */
export async function getSchemaMetrics(req, res) {
  try {
    // Buscar todas as tabelas via information_schema
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    // Se não conseguir via REST, usar contagem de daemon_health
    let totalTables = 0;
    if (tablesError || !tablesData) {
      // Fallback: contar tabelas únicas em daemon_health
      const { data: healthData } = await supabase
        .from('daemon_health')
        .select('table_name');
      totalTables = new Set(healthData?.map(h => h.table_name) || []).size;
    } else {
      totalTables = tablesData?.length || 0;
    }

    // Buscar saúde de todas as tabelas
    const { data: healthData } = await supabase
      .from('daemon_health')
      .select('health_score, total_rows, table_name')
      .order('check_date', { ascending: false });

    const totalRows = healthData?.reduce((sum, h) => sum + (h.total_rows || 0), 0) || 0;
    const avgHealth = healthData && healthData.length > 0
      ? healthData.reduce((sum, h) => sum + (h.health_score || 0), 0) / healthData.length
      : 100;

    // Calcular tamanho total (aproximado)
    const totalSize = healthData?.reduce((sum, h) => sum + ((h.total_rows || 0) * 100), 0) || 0;

    // Contar tabelas com problemas
    const tablesWithIssues = healthData?.filter((h) => h.health_score < 80).length || 0;

    res.json({
      success: true,
      data: {
        total_tables: totalTables,
        total_rows: totalRows,
        total_size_bytes: totalSize,
        avg_health_score: avgHealth,
        tables_with_issues: tablesWithIssues,
        orphan_records_total: 0, // Será calculado pelo DAEMON
        invalid_records_total: 0, // Será calculado pelo DAEMON
        last_check: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do schema:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/schema/domains/:domain/metrics - Obtém métricas de um domínio
 */
export async function getDomainMetrics(req, res) {
  try {
    const { domain } = req.params;
    const config = DOMAIN_MAPPING[domain];

    if (!config) {
      return res.status(404).json({ success: false, error: 'Domínio não encontrado' });
    }

    // Buscar saúde do domínio
    const { data: healthData } = await supabase
      .from('daemon_health')
      .select('health_score, total_rows, invalid_records, orphan_records')
      .in('table_name', config.tables)
      .order('check_date', { ascending: false })
      .limit(config.tables.length);

    const avgHealth = healthData && healthData.length > 0
      ? healthData.reduce((sum, h) => sum + (h.health_score || 0), 0) / healthData.length
      : 100;

    const issuesCount = healthData?.filter((h) => h.health_score < 80).length || 0;
    const recommendationsCount = healthData?.filter((h) => h.recommendations).length || 0;

    res.json({
      success: true,
      data: {
        domain,
        table_count: config.tables.length,
        row_count: healthData?.reduce((sum, h) => sum + (h.total_rows || 0), 0) || 0,
        health_score: avgHealth,
        issues_count: issuesCount,
        recommendations_count: recommendationsCount,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do domínio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/schema/tables/search - Busca tabelas por nome
 */
export async function searchTables(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    // Buscar tabelas que correspondem à query
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', `%${q}%`);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    // Buscar schemas das tabelas encontradas
    const schemas = await Promise.all(
      (tables || []).map(async (table) => {
        return await getTableSchemaInternal(table.table_name);
      })
    );

    res.json({ success: true, data: schemas.filter(Boolean) });
  } catch (error) {
    console.error('Erro ao buscar tabelas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
