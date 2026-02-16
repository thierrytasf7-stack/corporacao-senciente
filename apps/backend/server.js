/**
 * Servidor Backend para Dashboard
 * 
 * Servidor Express simples para servir APIs do dashboard
 */

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { checkAlignment, runBoardroom } from './src_api/actions.js';
import { getAgentById, getAgentOpinions, getAgents } from './src_api/agents.js';
import { getChatStatus, sendChatMessage } from './src_api/chat.js';
import { getDecisions } from './src_api/decisions.js';
import { controlEvolution, getEvolutionOptions, getEvolutionStatus, submitEvolutionOption } from './src_api/evolution.js';
import { distributeProfits, getFinances, getFinancialStats, getWalletInfo } from './src_api/finances.js';
import { getGoals } from './src_api/goals.js';
import { getByteRoverTimeline, getLangMemWisdom, getLettaState, getLLBStatus } from './src_api/llb.js';
import { addMemory, listMemory, searchMemory } from './src_api/memory.js';
import { getMetrics } from './src_api/metrics.js';
import pcRoutes from './src_api/pcs.js';
import { getProjectAnalysis } from './src_api/project-analysis.js';
import { getProjects } from './src_api/projects.js';
import { getRepositories, getRepositoryById } from './src_api/repositories.js';
import { getSettings, updateSettings } from './src_api/settings.js';
import { getTaskById, getTasks } from './src_api/tasks.js';
import { createStory, getStories, getStory, updateStory, deleteStory, startStoryWorkflow, continueStoryWorkflow, getWorkflowStatus } from './src_api/story-workflow.js';
import { getAllDNA, getAgentDNA, createDNA, addXP, getVaccines, getEvolutionHistory } from './src_api/gaia.js';
import { getBrainStatus, getOrchestratorState } from './src_api/orchestrator.js';
import { getCorporateMemories, getEpisodicMemories, getDerivedInsights, addCorporateMemory, addEpisodicMemory } from './src_api/memory.js';
import { getFlows, getFlowExecutions, getPainTasks, createFlow } from './src_api/cortex.js';
import { getLLMUsage, getMCPStatus, getWorkflowRuns, getToolsRegistry } from './src_api/forge.js';
import { handleCLIInstall, getCLIStatus, getCLISTatusForPC, runCLICommand, handleCLIInstallOnPC } from './src_api/cli.js';
import { getGitHubUser, getGitHubRepos, getGitHubCommits, getGitHubPullRequests } from './src_api/github.js';
import * as schemaAPI from './src_api/schema.js';
import * as daemonAPI from './src_api/daemon.js';
import * as whitelistAPI from './src_api/whitelist.js';


const app = express();

const PORT = process.env.DIANA_BACKEND_PORT || process.env.PORT || 21301;

app.use(cors());
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// Debug endpoint
// app.get('/api/debug/files', getDebugFiles);

// Evolution endpoints
app.get('/api/evolution/status', async (req, res) => {
  try {
    await getEvolutionStatus(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evolution/control', async (req, res) => {
  try {
    await controlEvolution(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/evolution/options', async (req, res) => {
  try {
    await getEvolutionOptions(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evolution/options', async (req, res) => {
  try {
    await submitEvolutionOption(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decisions endpoint
app.get('/api/decisions', async (req, res) => {
  try {
    await getDecisions(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    await getMetrics(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Main endpoint
app.get('/api/dashboard/main', async (req, res) => {
  try {
    // Agregar dados de várias fontes para um dashboard consolidado
    // Em produção, isso viria de um serviço de agregação
    res.json({
      dashboard: {
        system_health: {
          score: 95,
          status: 'online',
          issues: []
        },
        infrastructure: {
          pcs_count: 3,
          pcs_active: 3,
          total_cpu_usage: 12.5,
          total_memory_usage: 45.2
        },
        agents: {
          total: 30,
          active: 12,
          improved: 5,
          calls_today: 142,
          autonomy_percentage: 95
        },
        business: {
          revenue: {
            current: 25000,
            target_monthly: 100000,
            target_annual: 1000000,
            growth_rate: 15
          },
          users: {
            total: 1250,
            active: 450,
            paying: 150
          }
        },
        alerts: [],
        last_update: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subsidiaries endpoint
app.get('/api/subsidiaries', async (req, res) => {
  try {
    // Em um sistema real, isso buscaria de uma tabela de empresas
    res.json({
      subsidiaries: [
        {
          id: "28460dec-463e-4b1e-8cf6-c2c84cf24070",
          name: "Senciente SaaS Platform",
          business_type: "saas",
          status: "operational",
          total_revenue: 25000,
          total_profit: 10000,
          monthly_recurring_revenue: 2083,
          active_users: 150,
          customer_satisfaction: 4.5,
          health_score: 92,
          roi: 66.67,
          founded_at: "2026-01-11",
          market_position: "challenger",
          growth_rate: 0.15,
          risk_level: "low"
        }
      ],
      opportunities: [
        {
          id: "opp_ai-powered_marketing_analytics_platform_500000000.0",
          title: "AI-Powered Marketing Analytics Platform",
          description: "Plataforma SaaS que usa IA para analisar campanhas de marketing em tempo real",
          feasibility_score: 0.85,
          estimated_investment: 750000,
          estimated_first_year_revenue: 2500000,
          business_type: "saas",
          status: "analyzed"
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agents endpoints
app.get('/api/agents', async (req, res) => {
  try {
    await getAgents(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/opinions', async (req, res) => {
  try {
    await getAgentOpinions(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    await getAgentById(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Goals endpoint
app.get('/api/goals', async (req, res) => {
  try {
    await getGoals(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actions endpoints
app.post('/api/actions/boardroom', async (req, res) => {
  try {
    await runBoardroom(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/actions/check-alignment', async (req, res) => {
  try {
    await checkAlignment(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LLB Protocol endpoints
app.get('/api/llb/status', async (req, res) => {
  try {
    await getLLBStatus(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/llb/letta/state', async (req, res) => {
  try {
    await getLettaState(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/llb/langmem/wisdom', async (req, res) => {
  try {
    await getLangMemWisdom(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/llb/byterover/timeline', async (req, res) => {
  try {
    await getByteRoverTimeline(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat endpoints
app.get('/api/chat/status', async (req, res) => {
  try {
    await getChatStatus(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/message', async (req, res) => {
  try {
    await sendChatMessage(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    await getTasks(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    await getTaskById(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stories endpoints
app.post('/api/stories', createStory);
app.get('/api/stories', getStories);
app.get('/api/stories/:id', getStory);
app.put('/api/stories/:id', updateStory);
app.delete('/api/stories/:id', deleteStory);
app.post('/api/stories/:id/start', startStoryWorkflow);
app.post('/api/stories/:id/continue', continueStoryWorkflow);
app.get('/api/stories/:id/workflow-status', getWorkflowStatus);

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    await getProjects(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Repositories endpoints
app.get('/api/repositories', async (req, res) => {
  try {
    await getRepositories(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/repositories/:id', async (req, res) => {
  try {
    await getRepositoryById(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Finances endpoints
app.get('/api/finances', getFinances);
app.get('/api/finances/wallet', getWalletInfo);
app.get('/api/finances/stats', getFinancialStats);
app.post('/api/finances/distribute', distributeProfits);

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  try {
    await getSettings(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await updateSettings(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project Analysis endpoints
app.get('/api/project-analysis', async (req, res) => {
  try {
    await getProjectAnalysis(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PC Registry endpoints
app.use('/api/pcs', pcRoutes);

// Memory System (Horizon 2)
app.get('/api/memory/list', listMemory);
app.post('/api/memory/search', searchMemory);
app.post('/api/memory/ingest', addMemory);

// GAIA Kernel endpoints
app.get('/api/gaia/dna', getAllDNA);
app.get('/api/gaia/dna/:agentId', getAgentDNA);
app.post('/api/gaia/dna', createDNA);
app.post('/api/gaia/xp', addXP);
app.get('/api/gaia/vaccines', getVaccines);
app.get('/api/gaia/evolution/:agentId?', getEvolutionHistory);

// Orquestrador endpoints
app.get('/api/orchestrator/brain/status', getBrainStatus);
app.get('/api/brain/status', getBrainStatus); // Alias para compatibilidade legada
app.get('/api/orchestrator/state', getOrchestratorState);

// Memória endpoints (novos)
app.get('/api/memory/corporate', getCorporateMemories);
app.get('/api/memory/episodic', getEpisodicMemories);
app.get('/api/memory/insights', getDerivedInsights);
app.post('/api/memory/corporate', addCorporateMemory);
app.post('/api/memory/episodic', addEpisodicMemory);

// Córtex de Fluxos endpoints
app.get('/api/cortex/flows', getFlows);
app.get('/api/cortex/flows/:flowId/executions', getFlowExecutions);
app.get('/api/cortex/pain-tasks', getPainTasks);
app.post('/api/cortex/flows', createFlow);

// FORGE Kernel endpoints
app.get('/api/forge/llm/usage', getLLMUsage);
app.get('/api/forge/mcps', getMCPStatus);
app.get('/api/forge/workflows', getWorkflowRuns);
app.get('/api/forge/tools', getToolsRegistry);

// CLI Tools endpoints
app.post('/api/cli/install', handleCLIInstall);
app.get('/api/cli/status', getCLIStatus);
app.post('/api/cli/run', runCLICommand);
app.get('/api/cli/status/:pcId', getCLISTatusForPC);
app.post('/api/cli/install/:pcId', handleCLIInstallOnPC);

// GitHub Integration endpoints
app.get('/api/github/user', getGitHubUser);
app.get('/api/github/repos', getGitHubRepos);
app.get('/api/github/commits', getGitHubCommits);
app.get('/api/github/pulls', getGitHubPullRequests);
app.get('/api/github', getGitHubUser); // Alias for compatibility

// Schema endpoints
app.get('/api/schema/tables', async (req, res) => {
  try {
    await schemaAPI.getAllTables(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/schema/tables/:tableName', async (req, res) => {
  try {
    await schemaAPI.getTableSchema(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/schema/tables/search', async (req, res) => {
  try {
    await schemaAPI.searchTables(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/schema/domains', async (req, res) => {
  try {
    await schemaAPI.getAllDomains(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/schema/domains/:domain', async (req, res) => {
  try {
    await schemaAPI.getDomainSchema(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/schema/domains/:domain/metrics', async (req, res) => {
  try {
    await schemaAPI.getDomainMetrics(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/schema/metrics', async (req, res) => {
  try {
    await schemaAPI.getSchemaMetrics(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DAEMON Kernel endpoints
app.get('/api/daemon/status', async (req, res) => {
  try {
    await daemonAPI.getDAEMONStatus(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/dashboard', async (req, res) => {
  try {
    await daemonAPI.getDAEMONDashboard(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/analytics', async (req, res) => {
  try {
    await daemonAPI.getDAEMONAnalytics(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/rules', async (req, res) => {
  try {
    await daemonAPI.getRules(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/rules/:ruleId', async (req, res) => {
  try {
    await daemonAPI.getRule(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/daemon/rules', async (req, res) => {
  try {
    await daemonAPI.createRule(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.patch('/api/daemon/rules/:ruleId', async (req, res) => {
  try {
    await daemonAPI.updateRule(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete('/api/daemon/rules/:ruleId', async (req, res) => {
  try {
    await daemonAPI.deleteRule(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/events', async (req, res) => {
  try {
    await daemonAPI.getEvents(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/optimizations', async (req, res) => {
  try {
    await daemonAPI.getOptimizations(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/daemon/optimizations/:id/apply', async (req, res) => {
  try {
    await daemonAPI.applyOptimization(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/health', async (req, res) => {
  try {
    await daemonAPI.getHealth(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/daemon/health/check', async (req, res) => {
  try {
    await daemonAPI.runHealthCheck(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/templates', async (req, res) => {
  try {
    await daemonAPI.getTemplates(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/daemon/templates/:templateId', async (req, res) => {
  try {
    await daemonAPI.getTemplate(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/daemon/templates', async (req, res) => {
  try {
    await daemonAPI.createTemplate(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint - informa que é apenas API
app.get('/', (req, res) => {
  res.json({
    message: 'Corporação Senciente 7.0 - Backend API',
    version: '1.0.5',
    endpoints: {
      agents: '/api/agents',
      metrics: '/api/metrics',
      evolution: '/api/evolution/status',
      chat: '/api/chat/status',
      gaia: '/api/gaia/dna',
      orchestrator: '/api/orchestrator/state',
      memory: '/api/memory/corporate',
      cortex: '/api/cortex/flows',
      forge: '/api/forge/llm/usage',
      schema: '/api/schema/tables',
      daemon: '/api/daemon/status',
      health: '/health'
    }
  });
});

// ===== WHITELIST ROUTES =====
app.get('/api/whitelist', whitelistAPI.getWhitelist);
app.get('/api/whitelist/blocklist', whitelistAPI.getBlocklist);
app.get('/api/whitelist/pending', whitelistAPI.getPendingApproval);
app.get('/api/whitelist/audit', whitelistAPI.getAuditLog);
app.get('/api/whitelist/check', whitelistAPI.checkDomain);
app.post('/api/whitelist', whitelistAPI.addSource);
app.post('/api/whitelist/request', whitelistAPI.requestSource);
app.patch('/api/whitelist/approve/:sourceId', whitelistAPI.approveSource);
app.patch('/api/whitelist/reject/:sourceId', whitelistAPI.rejectSource);
app.post('/api/whitelist/block', whitelistAPI.blockSource);
app.post('/api/whitelist/reputation/update', whitelistAPI.updateReputation);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend API rodando em http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🛡️  Whitelist API: http://localhost:${PORT}/api/whitelist`);
});

export default app;


