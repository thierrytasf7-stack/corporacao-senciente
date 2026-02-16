#!/usr/bin/env node
/**
 * Teste: Todos os Agentes
 * 
 * Testa todos os agentes criados (100+ agentes)
 */

import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_all_agents' });

// Lista completa de todos os agentes
const AGENTS = [
    // Technical
    { path: './agents/technical/architect_agent.js', name: 'ArchitectAgent' },
    { path: './agents/technical/dev_agent.js', name: 'DevAgent' },
    { path: './agents/technical/debug_agent.js', name: 'DebugAgent' },
    { path: './agents/technical/validation_agent.js', name: 'ValidationAgent' },
    { path: './agents/data_agent.js', name: 'DataAgent' },
    { path: './agents/ai_agent.js', name: 'AIAgent' },
    { path: './agents/blockchain_agent.js', name: 'BlockchainAgent' },
    { path: './agents/mobile_agent.js', name: 'MobileAgent' },
    { path: './agents/api_agent.js', name: 'APIAgent' },
    { path: './agents/database_agent.js', name: 'DatabaseAgent' },
    { path: './agents/frontend_agent.js', name: 'FrontendAgent' },
    { path: './agents/backend_agent.js', name: 'BackendAgent' },
    { path: './agents/testing_agent.js', name: 'TestingAgent' },
    { path: './agents/accessibility_agent.js', name: 'AccessibilityAgent' },
    { path: './agents/performance_agent.js', name: 'PerformanceAgent' },
    { path: './agents/integration_agent.js', name: 'IntegrationAgent' },
    { path: './agents/scalability_agent.js', name: 'ScalabilityAgent' },
    { path: './agents/version_control_agent.js', name: 'VersionControlAgent' },
    { path: './agents/dependency_management_agent.js', name: 'DependencyManagementAgent' },
    { path: './agents/code_review_agent.js', name: 'CodeReviewAgent' },
    { path: './agents/refactoring_agent.js', name: 'RefactoringAgent' },
    { path: './agents/load_testing_agent.js', name: 'LoadTestingAgent' },
    { path: './agents/network_agent.js', name: 'NetworkAgent' },
    { path: './agents/containerization_agent.js', name: 'ContainerizationAgent' },
    { path: './agents/cloud_agent.js', name: 'CloudAgent' },
    { path: './agents/legacy_modernization_agent.js', name: 'LegacyModernizationAgent' },
    { path: './agents/graphql_agent.js', name: 'GraphQLAgent' },
    { path: './agents/microservices_agent.js', name: 'MicroservicesAgent' },
    { path: './agents/event_driven_agent.js', name: 'EventDrivenAgent' },
    { path: './agents/serverless_agent.js', name: 'ServerlessAgent' },
    { path: './agents/queue_management_agent.js', name: 'QueueManagementAgent' },
    { path: './agents/cache_agent.js', name: 'CacheAgent' },
    { path: './agents/search_agent.js', name: 'SearchAgent' },
    { path: './agents/notification_agent.js', name: 'NotificationAgent' },
    { path: './agents/feature_flags_agent.js', name: 'FeatureFlagsAgent' },
    { path: './agents/service_mesh_agent.js', name: 'ServiceMeshAgent' },
    { path: './agents/edge_computing_agent.js', name: 'EdgeComputingAgent' },
    { path: './agents/real_time_agent.js', name: 'RealTimeAgent' },
    { path: './agents/streaming_agent.js', name: 'StreamingAgent' },

    // Business
    { path: './agents/business/marketing_agent.js', name: 'MarketingAgent' },
    { path: './agents/business/copywriting_agent.js', name: 'CopywritingAgent' },
    { path: './agents/business/sales_agent.js', name: 'SalesAgent' },
    { path: './agents/business/finance_agent.js', name: 'FinanceAgent' },
    { path: './agents/product_agent.js', name: 'ProductAgent' },
    { path: './agents/legal_agent.js', name: 'LegalAgent' },
    { path: './agents/hr_agent.js', name: 'HRAgent' },
    { path: './agents/customer_support_agent.js', name: 'CustomerSupportAgent' },
    { path: './agents/design_agent.js', name: 'DesignAgent' },
    { path: './agents/research_agent.js', name: 'ResearchAgent' },
    { path: './agents/content_agent.js', name: 'ContentAgent' },
    { path: './agents/seo_agent.js', name: 'SEOAgent' },
    { path: './agents/social_media_agent.js', name: 'SocialMediaAgent' },
    { path: './agents/email_agent.js', name: 'EmailAgent' },
    { path: './agents/partnerships_agent.js', name: 'PartnershipsAgent' },
    { path: './agents/community_agent.js', name: 'CommunityAgent' },
    { path: './agents/strategy_agent.js', name: 'StrategyAgent' },
    { path: './agents/innovation_agent.js', name: 'InnovationAgent' },
    { path: './agents/education_agent.js', name: 'EducationAgent' },
    { path: './agents/translation_agent.js', name: 'TranslationAgent' },
    { path: './agents/documentation_agent.js', name: 'DocumentationAgent' },
    { path: './agents/ux_research_agent.js', name: 'UXResearchAgent' },
    { path: './agents/brand_agent.js', name: 'BrandAgent' },
    { path: './agents/event_agent.js', name: 'EventAgent' },
    { path: './agents/vendor_management_agent.js', name: 'VendorManagementAgent' },
    { path: './agents/procurement_agent.js', name: 'ProcurementAgent' },
    { path: './agents/communication_agent.js', name: 'CommunicationAgent' },
    { path: './agents/business_intelligence_agent.js', name: 'BusinessIntelligenceAgent' },
    { path: './agents/training_agent.js', name: 'TrainingAgent' },
    { path: './agents/technical_writing_agent.js', name: 'TechnicalWritingAgent' },
    { path: './agents/competitive_analysis_agent.js', name: 'CompetitiveAnalysisAgent' },
    { path: './agents/customer_success_agent.js', name: 'CustomerSuccessAgent' },
    { path: './agents/revenue_optimization_agent.js', name: 'RevenueOptimizationAgent' },
    { path: './agents/user_onboarding_agent.js', name: 'UserOnboardingAgent' },

    // Operations
    { path: './agents/operations/devex_agent.js', name: 'DevExAgent' },
    { path: './agents/operations/metrics_agent.js', name: 'MetricsAgent' },
    { path: './agents/operations/security_agent.js', name: 'SecurityAgent' },
    { path: './agents/operations/quality_agent.js', name: 'QualityAgent' },
    { path: './agents/analytics_agent.js', name: 'AnalyticsAgent' },
    { path: './agents/automation_agent.js', name: 'AutomationAgent' },
    { path: './agents/infrastructure_agent.js', name: 'InfrastructureAgent' },
    { path: './agents/monitoring_agent.js', name: 'MonitoringAgent' },
    { path: './agents/compliance_agent.js', name: 'ComplianceAgent' },
    { path: './agents/optimization_agent.js', name: 'OptimizationAgent' },
    { path: './agents/backup_agent.js', name: 'BackupAgent' },
    { path: './agents/cost_optimization_agent.js', name: 'CostOptimizationAgent' },
    { path: './agents/incident_agent.js', name: 'IncidentAgent' },
    { path: './agents/change_management_agent.js', name: 'ChangeManagementAgent' },
    { path: './agents/capacity_planning_agent.js', name: 'CapacityPlanningAgent' },
    { path: './agents/knowledge_management_agent.js', name: 'KnowledgeManagementAgent' },
    { path: './agents/crisis_management_agent.js', name: 'CrisisManagementAgent' },
    { path: './agents/governance_agent.js', name: 'GovernanceAgent' },
    { path: './agents/regulatory_agent.js', name: 'RegulatoryAgent' },
    { path: './agents/audit_agent.js', name: 'AuditAgent' },
    { path: './agents/configuration_agent.js', name: 'ConfigurationAgent' },
    { path: './agents/reporting_agent.js', name: 'ReportingAgent' },
    { path: './agents/risk_agent.js', name: 'RiskAgent' },
    { path: './agents/security_audit_agent.js', name: 'SecurityAuditAgent' },
    { path: './agents/chaos_engineering_agent.js', name: 'ChaosEngineeringAgent' },
    { path: './agents/observability_agent.js', name: 'ObservabilityAgent' },
];

async function testAllAgents() {
    log.info('🧪 Testando Todos os Agentes\n');

    let success = 0;
    let failed = 0;
    const results = [];

    for (const agentInfo of AGENTS) {
        try {
            const module = await import(agentInfo.path);
            const AgentClass = module[agentInfo.name] || module.default;
            const agent = new AgentClass();

            const prompt = await agent.generatePrompt('Test task', {});

            results.push({
                name: agent.name,
                sector: agent.sector,
                status: '✅',
                promptLength: prompt.length
            });
            success++;
        } catch (err) {
            results.push({
                name: agentInfo.name,
                status: '❌',
                error: err.message
            });
            failed++;
        }
    }

    log.info('📊 RESUMO');
    log.info(`Total: ${AGENTS.length}`);
    log.info(`✅ Sucesso: ${success}`);
    log.info(`❌ Falhas: ${failed}`);
    log.info('');

    results.forEach(r => {
        if (r.status === '✅') {
            console.log(`${r.status} ${r.name} (${r.sector}) - ${r.promptLength} chars`);
        } else {
            console.log(`${r.status} ${r.name} - ${r.error}`);
        }
    });

    return failed === 0;
}

testAllAgents().then(success => process.exit(success ? 0 : 1));


