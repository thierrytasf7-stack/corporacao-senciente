# Router - Sistema de Roteamento Inteligente

## Visão Geral

O **Router** é o componente central de decisão da arquitetura swarm chat/IDE da Corporação Senciente. Ele é responsável por analisar tarefas e determinar qual(is) agente(s) deve(m) executá-las, considerando fatores como especialização, carga atual, histórico de performance e contexto da tarefa.

## Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Brain      │───▶│     Router     │───▶│     Agents      │
│                 │    │                 │    │                 │
│ - Task Analysis │    │ - Agent Scoring │    │ - Specialized   │
│ - Context       │    │ - Load Balance  │    │ - Execution     │
│ - Coordination  │    │ - Permissions   │    └─────────────────┘
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Decision      │
                       │   Cache         │
                       └─────────────────┘
```

## Funcionalidades Principais

### 1. Seleção de Agente Único
```javascript
const result = await router.findBestAgent("Implementar API REST", {
  priority: "high",
  sector: "technical"
});

// Resultado:
// {
//   primaryAgent: "TechnicalAgent",
//   primaryScore: 0.95,
//   reasoning: "Task técnica especializada em desenvolvimento",
//   orchestration: {
//     primary: "TechnicalAgent",
//     secondary: [],
//     coordination: "direct"
//   }
// }
```

### 2. Seleção de Múltiplos Agentes
```javascript
const agents = await router.findMultipleAgents("Campanha de marketing completa", {
  budget: 5000,
  deadline: "2025-02-01"
});

// Resultado: Array de agentes com scores
```

### 3. Controle de Permissões
```javascript
const canCall = await router.canAgentCallAgent("MarketingAgent", "TechnicalAgent");
// Resultado: true/false baseado em regras de negócio
```

## Algoritmo de Seleção

### Fatores de Decisão

1. **Especialização** (40%)
   - Match exato com tipo de tarefa
   - Capacidades específicas do agente
   - Histórico de sucesso em tarefas similares

2. **Carga Atual** (30%)
   - CPU/Memória do PC do agente
   - Número de tarefas em execução
   - Capacidade restante

3. **Confiabilidade** (20%)
   - Taxa de sucesso histórica
   - Tempo médio de resposta
   - Penalidades por falhas recentes

4. **Contexto** (10%)
   - Prioridade da tarefa
   - Deadline/timing
   - Dependências entre agentes

### Cálculo de Score

```javascript
// Score composto para cada agente candidato
const totalScore = (
  specializationScore * 0.4 +
  loadScore * 0.3 +
  reliabilityScore * 0.2 +
  contextScore * 0.1
);
```

## Estratégias de Roteamento

### 1. Round Robin
- Distribuição cíclica simples
- Ideal para tarefas homogêneas
- Menos overhead de decisão

### 2. Least Loaded (Padrão)
- Prioriza agentes com menor carga
- Balanceamento automático
- Melhor para alta disponibilidade

### 3. Specialization Priority
- Prioriza expertise específica
- Melhor qualidade para tarefas especializadas
- Pode causar desbalanceamento

### 4. Resource-Based
- Considera todos os fatores
- Decisão mais inteligente
- Maior overhead computacional

### 5. Adaptive (Recomendado)
- Estratégia dinâmica baseada no contexto
- Combina múltiplas heurísticas
- Auto-ajuste baseado em performance

## Sistema de Cache

### Cache de Decisões
- **TTL**: 5 minutos
- **Tamanho máximo**: 100 entradas
- **Chave**: Hash da tarefa + contexto
- **Benefício**: Reduz latência em tarefas similares

### Invalidação
- Automaticamente após TTL
- Manual via `clearCache()`
- Quando agentes ficam indisponíveis

## Controle de Permissões

### Regras de Chamada Entre Agentes

```javascript
// Matriz de permissões
const permissions = {
  "MarketingAgent": ["TechnicalAgent", "SalesAgent"],
  "TechnicalAgent": ["OperationsAgent"],
  "SalesAgent": ["MarketingAgent"],
  "OperationsAgent": ["all"] // Pode chamar qualquer um
};
```

### Validações
- **Hierarquia**: Agentes sênior podem chamar juniores
- **Especialização**: Apenas agentes relacionados
- **Carga**: Evita sobrecarga de agentes populares
- **Segurança**: Previne chamadas maliciosas

## Monitoramento e Métricas

### Métricas Coletadas
- **Taxa de sucesso**: Por agente e tipo de tarefa
- **Tempo de resposta**: Média e percentis
- **Utilização**: Por agente e período
- **Falhas**: Por tipo e frequência

### Dashboards
- Performance por agente
- Distribuição de carga
- Tendências de decisão
- Alertas de desbalanceamento

## API de Uso

### Métodos Principais

```javascript
// Seleção básica
await router.findBestAgent(task, context)

// Seleção múltipla
await router.findMultipleAgents(task, options)

// Verificação de permissões
await router.canAgentCallAgent(caller, target)

// Cache management
router.clearCache()
router.getCacheStats()
```

### Configuração

```javascript
const router = new Router({
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  maxCacheSize: 100,
  defaultStrategy: 'adaptive'
});
```

## Integração com Infraestrutura

### PC Registry
- Consulta status de PCs ativos
- Verifica especialização por PC
- Monitora carga de recursos

### Protocolo L.L.B.
- Contexto de decisões similares (Letta)
- Sabedoria arquitetural (LangMem)
- Timeline evolutiva (ByteRover)

### Load Balancer
- Coordenação com balanceamento de carga
- Sincronização de decisões
- Failover automático

## Casos de Uso

### 1. Desenvolvimento de Feature
```javascript
// Tarefa técnica complexa
const result = await router.findBestAgent(
  "Implementar autenticação JWT com refresh tokens",
  { priority: "high", complexity: "high" }
);
// Resultado: TechnicalAgent com score alto
```

### 2. Campanha de Marketing
```javascript
// Tarefa de negócio com múltiplas especializações
const agents = await router.findMultipleAgents(
  "Lançar produto com campanha completa",
  { budget: 10000, timeline: "2 weeks" }
);
// Resultado: [MarketingAgent, SalesAgent, TechnicalAgent]
```

### 3. Monitoramento de Sistema
```javascript
// Tarefa operacional crítica
const result = await router.findBestAgent(
  "Investigar alerta de segurança crítica",
  { urgency: "critical", type: "security" }
);
// Resultado: OperationsAgent prioritário
```

## Performance e Escalabilidade

### Otimizações
- **Cache inteligente**: Reduz decisões repetidas
- **Processamento paralelo**: Múltiplas decisões simultâneas
- **Lazy loading**: Carrega agentes sob demanda
- **Connection pooling**: Reutiliza conexões

### Limites e Recomendações
- **Máximo de agentes**: 50 por swarm
- **Latência alvo**: < 500ms por decisão
- **Throughput**: 100 decisões/segundo
- **Cache hit rate**: > 70%

## Troubleshooting

### Problemas Comuns

#### Cache Stale
```javascript
// Sintomas: Decisões incorretas persistentes
// Solução: Limpar cache manualmente
router.clearCache();
```

#### Agente Não Encontrado
```javascript
// Sintomas: findBestAgent retorna null
// Causas: Todos agentes offline, permissões insuficientes
// Solução: Verificar status de PCs no registry
```

#### Performance Degradation
```javascript
// Sintomas: Latência alta nas decisões
// Causas: Cache muito grande, muitos agentes
// Solução: Ajustar parâmetros de cache
```

## Testes e Validação

### Testes Unitários
```bash
npm test router.test.js
```

### Cenários de Teste
- Seleção com diferentes tipos de tarefa
- Balanceamento sob carga alta
- Failover quando agentes caem
- Cache behavior e invalidação

### Métricas de Qualidade
- **Accuracy**: > 85% de decisões corretas
- **Consistency**: Mesmas tarefas = mesmas decisões
- **Performance**: < 500ms latência média
- **Reliability**: > 99.9% uptime

## Futuras Melhorias

### Machine Learning
- Aprendizado de padrões de decisão
- Predição de performance por agente
- Otimização automática de pesos

### Advanced Routing
- Roteamento baseado em geografia
- Consideração de custos (energia, recursos)
- Balanceamento multi-dimensional

### Observabilidade
- Tracing distribuído de decisões
- Métricas em tempo real
- Dashboards avançados

---

## Conclusão

O Router é o coração inteligente do sistema swarm, garantindo que cada tarefa seja direcionada ao agente mais adequado no momento certo. Sua arquitetura flexível e algoritmos sofisticados permitem balanceamento otimizado entre performance, qualidade e confiabilidade.

**Mantenedor**: Corporação Senciente - Swarm Architecture Team
**Versão**: 1.0
**Última atualização**: 2025-01-19









