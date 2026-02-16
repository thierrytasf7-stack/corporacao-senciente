/**
 * API de DAEMON Kernel - Guardião dos Dados
 * 
 * Endpoints para gerenciamento de regras, eventos, otimizações e saúde dos dados
 */

import { supabase } from './supabase.js';

/**
 * GET /api/daemon/status - Obtém status do DAEMON
 */
export async function getDAEMONStatus(req, res) {
  try {
    // Buscar regras ativas
    const { data: rules, error: rulesError } = await supabase
      .from('daemon_rules')
      .select('id, is_active')
      .eq('is_active', true);

    // Buscar eventos de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: eventsToday, error: eventsError } = await supabase
      .from('daemon_events')
      .select('id, severity')
      .gte('created_at', today.toISOString());

    // Buscar eventos críticos
    const { data: criticalEvents, error: criticalError } = await supabase
      .from('daemon_events')
      .select('id')
      .eq('severity', 'CRITICAL')
      .gte('created_at', today.toISOString());

    // Buscar otimizações pendentes
    const { data: optimizations, error: optError } = await supabase
      .from('daemon_optimizations')
      .select('id')
      .eq('status', 'SUGGESTED');

    // Buscar tabelas monitoradas
    const { data: health, error: healthError } = await supabase
      .from('daemon_health')
      .select('table_name')
      .order('check_date', { ascending: false })
      .limit(100);

    const uniqueTables = new Set((health || []).map((h) => h.table_name));

    res.json({
      success: true,
      data: {
        is_active: true,
        total_rules: (rules || []).length,
        active_rules: (rules || []).filter((r) => r.is_active).length,
        events_today: (eventsToday || []).length,
        events_critical: (criticalEvents || []).length,
        optimizations_pending: (optimizations || []).length,
        tables_monitored: uniqueTables.size,
        last_check: new Date().toISOString(),
        uptime_percent: 99.9, // Será calculado com base em histórico
      },
    });
  } catch (error) {
    console.error('Erro ao buscar status do DAEMON:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/dashboard - Obtém dados do dashboard
 */
export async function getDAEMONDashboard(req, res) {
  try {
    // Buscar status
    const statusRes = await getDAEMONStatus(req, res);
    if (!statusRes) return;

    // Buscar regras ativas
    const { data: activeRules, error: rulesError } = await supabase
      .from('daemon_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(10);

    // Buscar eventos recentes
    const { data: recentEvents, error: eventsError } = await supabase
      .from('daemon_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Buscar otimizações pendentes
    const { data: pendingOpts, error: optError } = await supabase
      .from('daemon_optimizations')
      .select('*')
      .eq('status', 'SUGGESTED')
      .order('created_at', { ascending: false })
      .limit(10);

    // Buscar resumo de saúde
    const { data: healthData, error: healthError } = await supabase
      .from('daemon_health')
      .select('health_score, table_name')
      .order('check_date', { ascending: false })
      .limit(100);

    const healthyTables = (healthData || []).filter((h) => h.health_score >= 80).length;
    const warningTables = (healthData || []).filter((h) => h.health_score >= 50 && h.health_score < 80).length;
    const criticalTables = (healthData || []).filter((h) => h.health_score < 50).length;
    const avgHealth = healthData && healthData.length > 0
      ? healthData.reduce((sum, h) => sum + (h.health_score || 0), 0) / healthData.length
      : 100;

    // Buscar top issues
    const { data: topEvents, error: topError } = await supabase
      .from('daemon_events')
      .select('table_name, severity, event_type')
      .in('severity', ['ERROR', 'CRITICAL'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const issuesMap = new Map();
    (topEvents || []).forEach((event) => {
      const key = `${event.table_name}-${event.event_type}`;
      if (!issuesMap.has(key)) {
        issuesMap.set(key, {
          table_name: event.table_name,
          issue_type: event.event_type,
          severity: event.severity,
          count: 0,
        });
      }
      issuesMap.get(key).count++;
    });

    const topIssues = Array.from(issuesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        status: statusRes.data,
        recent_events: recentEvents || [],
        active_rules: activeRules || [],
        pending_optimizations: pendingOpts || [],
        health_summary: {
          healthy_tables: healthyTables,
          warning_tables: warningTables,
          critical_tables: criticalTables,
          avg_health_score: avgHealth,
        },
        top_issues: topIssues,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard do DAEMON:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/analytics - Obtém analytics do DAEMON
 */
export async function getDAEMONAnalytics(req, res) {
  try {
    const { data: events, error: eventsError } = await supabase
      .from('daemon_events')
      .select('event_type, severity, was_blocked, was_fixed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (eventsError) throw eventsError;

    // Agrupar por tipo
    const eventsByType = {};
    (events || []).forEach((e) => {
      eventsByType[e.event_type] = (eventsByType[e.event_type] || 0) + 1;
    });

    // Agrupar por severidade
    const eventsBySeverity = {};
    (events || []).forEach((e) => {
      eventsBySeverity[e.severity] = (eventsBySeverity[e.severity] || 0) + 1;
    });

    const blockedOps = (events || []).filter((e) => e.was_blocked).length;
    const autoFixed = (events || []).filter((e) => e.was_fixed).length;

    // Buscar otimizações aplicadas
    const { data: appliedOpts, error: optError } = await supabase
      .from('daemon_optimizations')
      .select('performance_gain_percent')
      .eq('status', 'APPLIED');

    const optimizationApplied = (appliedOpts || []).length;
    const performanceGainTotal = (appliedOpts || []).reduce(
      (sum, opt) => sum + (opt.performance_gain_percent || 0),
      0
    );

    res.json({
      success: true,
      data: {
        events_by_type: Object.entries(eventsByType).map(([type, count]) => ({
          event_type: type,
          count,
        })),
        events_by_severity: Object.entries(eventsBySeverity).map(([severity, count]) => ({
          severity,
          count,
        })),
        blocked_operations: blockedOps,
        auto_fixed_issues: autoFixed,
        optimization_applied: optimizationApplied,
        performance_gain_total: performanceGainTotal,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar analytics do DAEMON:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/rules - Lista regras
 */
export async function getRules(req, res) {
  try {
    const { active } = req.query;
    let query = supabase.from('daemon_rules').select('*').order('priority', { ascending: false });

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar regras:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/rules/:ruleId - Obtém uma regra específica
 */
export async function getRule(req, res) {
  try {
    const { ruleId } = req.params;

    const { data, error } = await supabase
      .from('daemon_rules')
      .select('*')
      .eq('rule_id', ruleId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Regra não encontrada' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar regra:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/daemon/rules - Cria nova regra
 */
export async function createRule(req, res) {
  try {
    const rule = req.body;

    const { data, error } = await supabase
      .from('daemon_rules')
      .insert([rule])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar regra:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/daemon/rules/:ruleId - Atualiza uma regra
 */
export async function updateRule(req, res) {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('daemon_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('rule_id', ruleId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar regra:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/daemon/rules/:ruleId - Deleta uma regra
 */
export async function deleteRule(req, res) {
  try {
    const { ruleId } = req.params;

    const { error } = await supabase.from('daemon_rules').delete().eq('rule_id', ruleId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar regra:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/events - Lista eventos
 */
export async function getEvents(req, res) {
  try {
    const { limit = 100, severity } = req.query;
    let query = supabase
      .from('daemon_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/optimizations - Lista otimizações
 */
export async function getOptimizations(req, res) {
  try {
    const { status } = req.query;
    let query = supabase
      .from('daemon_optimizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar otimizações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/daemon/optimizations/:id/apply - Aplica uma otimização
 */
export async function applyOptimization(req, res) {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const status = approved ? 'APPLIED' : 'REJECTED';
    const updates = {
      status,
      applied_at: approved ? new Date().toISOString() : null,
      applied_by: 'user', // Será substituído por autenticação
    };

    const { data, error } = await supabase
      .from('daemon_optimizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao aplicar otimização:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/health - Lista saúde dos dados
 */
export async function getHealth(req, res) {
  try {
    const { table } = req.query;
    let query = supabase
      .from('daemon_health')
      .select('*')
      .order('check_date', { ascending: false });

    if (table) {
      query = query.eq('table_name', table);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar saúde:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/daemon/health/check - Executa verificação de saúde
 */
export async function runHealthCheck(req, res) {
  try {
    // Esta função executaria uma verificação completa de saúde
    // Por enquanto, apenas retorna sucesso
    res.json({ success: true, message: 'Verificação de saúde iniciada' });
  } catch (error) {
    console.error('Erro ao executar verificação de saúde:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/templates - Lista templates
 */
export async function getTemplates(req, res) {
  try {
    const { active } = req.query;
    let query = supabase
      .from('schema_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/daemon/templates/:templateId - Obtém um template específico
 */
export async function getTemplate(req, res) {
  try {
    const { templateId } = req.params;

    const { data, error } = await supabase
      .from('schema_templates')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Template não encontrado' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/daemon/templates - Cria novo template
 */
export async function createTemplate(req, res) {
  try {
    const template = req.body;

    const { data, error } = await supabase
      .from('schema_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
