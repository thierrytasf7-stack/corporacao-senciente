# Agent Prompt Generator - Incorporação Inteligente de Agentes

## Visão Geral

O **Agent Prompt Generator** é responsável por criar prompts estruturados que incorporam agentes especializados no chat/IDE. Ele transforma agentes Node.js em prompts contextuais que podem ser executados pelo LLM, mantendo toda a especialização e conhecimento do agente original.

## Arquitetura

```
┌─────────────────┐    ┌─────────────────────────┐    ┌─────────────────┐
│   Brain/Tasks   │───▶│  Agent Prompt Generator │───▶│   Chat/IDE      │
│                 │    │                         │    │   (LLM)         │
│ - Task Request  │    │ - Context Enrichment    │    │                 │
│ - Agent Choice  │    │ - Prompt Structuring    │    │ - Task Execution│
│ - Context       │    │ - Memory Integration    │    │ - Response       │
└─────────────────┘    └─────────────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   L.L.B.        │
                       │   Protocol      │
                       │ - LangMem       │
                       │ - Letta         │
                       │ - ByteRover     │
                       └─────────────────┘
```

## Funcionalidades Principais

### 1. Geração de Prompts Contextuais
```javascript
const prompt = await agentPromptGenerator.generateAgentPrompt(
  "TechnicalAgent",
  "Implementar API REST com autenticação JWT",
  {
    priority: "high",
    complexity: "medium",
    brainContext: { /* contexto do Brain */ }
  }
);
```

### 2. Enriquecimento com Contexto L.L.B.
- **LangMem**: Sabedoria arquitetural e melhores práticas
- **Letta**: Estado atual e decisões recentes
- **ByteRover**: Timeline evolutiva e padrões históricos

### 3. Integração com Sistema de Cache
- Cache de prompts similares
- Reutilização de prompts eficazes
- Redução de latência

## Estrutura do Prompt Gerado

### Template Base
```markdown
# [AGENTE ESPECIALIZADO] - [TAREFA]

## CONTEXTO ESPECIALIZADO
- **Especialização**: [área do agente]
- **Experiência**: [contexto histórico]
- **Ferramentas**: [capacidades específicas]

## CONTEXTO L.L.B.
### Sabedoria (LangMem)
- [Conhecimento relevante]
- [Melhores práticas]
- [Lições aprendidas]

### Estado Atual (Letta)
- [Situação atual]
- [Decisões recentes]
- [Próximos passos]

### Timeline (ByteRover)
- [Evolução histórica]
- [Padrões identificados]
- [Tendências]

## TAREFAS ESPECÍFICAS
1. [Tarefa primária]
2. [Subtarefas]
3. [Considerações especiais]

## OUTPUT ESPERADO
- [Formato de resposta]
- [Critérios de sucesso]
- [Métricas de validação]
```

## Agentes Suportados

### TechnicalAgent
**Especialização**: Desenvolvimento, arquitetura, DevOps
**Contexto**:
- Linguagens: JavaScript, Python, Go
- Frameworks: Node.js, React, Docker
- Práticas: TDD, CI/CD, arquitetura limpa

### BusinessAgent
**Especialização**: Marketing, vendas, estratégia
**Contexto**:
- Canais: Google Ads, Social Media, Email
- Métricas: ROI, CAC, LTV
- Estratégias: Growth hacking, SEO, Content marketing

### OperationsAgent
**Especialização**: Monitoramento, segurança, infraestrutura
**Contexto**:
- Ferramentas: Prometheus, ELK, Fail2Ban
- Métricas: Uptime, performance, segurança
- Processos: Incident response, backup, compliance

## Processo de Geração

### 1. Análise da Tarefa
- **Complexidade**: Baixa/Média/Alta
- **Urgência**: Baixa/Normal/Alta/Crítica
- **Tipo**: Técnica/Negócio/Operacional

### 2. Busca de Contexto
```javascript
// Busca em LangMem
const wisdom = await llbProtocol.searchWisdom(taskKeywords, agentType);

// Busca em Letta
const state = await llbProtocol.getCurrentState();

// Busca em ByteRover
const timeline = await llbProtocol.getRelevantTimeline(task, agentType);
```

### 3. Construção do Prompt
- **Cabeçalho**: Identificação clara do agente e tarefa
- **Contexto**: Informações relevantes do L.L.B.
- **Instruções**: Passos específicos e expectativas
- **Formatação**: Estrutura consistente para o LLM

### 4. Otimização
- **Cache**: Verificação de prompts similares
- **Compressão**: Remoção de redundâncias
- **Priorização**: Ênfase em informações mais relevantes

## Integração com Brain

### Comunicação Brain → Agent
```javascript
// Brain solicita prompt do agente
const agentPrompt = await agentPromptGenerator.generateAgentPrompt(
  selectedAgent,
  task,
  {
    brainContext: brainAnalysis,
    routingDecision: routerResult,
    priority: task.priority
  }
);

// Prompt é incorporado no chat/IDE
await chatInterface.executeWithPrompt(agentPrompt);
```

### Feedback Loop
```javascript
// Após execução, feedback é coletado
const result = await chatInterface.getExecutionResult();
await agentPromptGenerator.updateCache(prompt, result);

// Aprendizado para futuras gerações
await llbProtocol.recordDecision({
  agent: selectedAgent,
  task: task,
  prompt: agentPrompt,
  result: result,
  success: result.success
});
```

## Sistema de Cache Inteligente

### Estratégias de Cache
1. **Exato**: Mesmo agente + mesma tarefa + mesmo contexto
2. **Similar**: Similaridade semântica > 80%
3. **Parcial**: Reutilização de seções do prompt

### Invalidação
- **TTL**: 24 horas para prompts, 1 hora para contexto
- **Invalidation**: Quando agentes são atualizados
- **Size Limit**: Máximo 1000 entradas por agente

### Métricas de Cache
- **Hit Rate**: > 60% ideal
- **Latency Reduction**: ~70% mais rápido
- **Freshness**: < 5% de cache stale

## Personalização por Agente

### Configuração Base
```javascript
const agentConfigs = {
  TechnicalAgent: {
    expertise: ['javascript', 'python', 'architecture'],
    tools: ['eslint', 'jest', 'docker'],
    contextDepth: 'high',
    outputFormat: 'code_with_explanation'
  },
  BusinessAgent: {
    expertise: ['marketing', 'sales', 'strategy'],
    tools: ['google-ads', 'analytics', 'crm'],
    contextDepth: 'medium',
    outputFormat: 'business_plan'
  }
};
```

### Adaptação Dinâmica
- **Complexidade da tarefa**: Ajusta profundidade do contexto
- **Histórico de performance**: Aprende com execuções anteriores
- **Preferências do usuário**: Adapta ao estilo de resposta

## Tratamento de Erros

### Fallbacks
1. **Prompt Básico**: Se contexto L.L.B. falhar
2. **Template Genérico**: Se configuração específica falhar
3. **Log de Erro**: Registro para análise posterior

### Recuperação
- **Reintento**: Com contexto reduzido
- **Degradação**: Funcionalidade básica mantida
- **Alerta**: Notificação para equipe de operações

## Performance e Escalabilidade

### Otimizações
- **Paralelização**: Múltiplas buscas simultâneas
- **Lazy Loading**: Contexto carregado sob demanda
- **Streaming**: Geração incremental do prompt

### Limites
- **Tamanho máximo**: 8000 tokens por prompt
- **Timeout**: 30 segundos para geração
- **Concurrent**: Máximo 10 gerações simultâneas

## Monitoramento

### Métricas Principais
- **Taxa de sucesso**: Prompts que geram respostas válidas
- **Tempo de geração**: Latência média
- **Utilização de cache**: Hit rate e tamanho
- **Qualidade**: Avaliação manual de prompts gerados

### Logs Estruturados
```json
{
  "timestamp": "2025-01-19T10:30:00Z",
  "agent": "TechnicalAgent",
  "task": "implement_api",
  "generation_time_ms": 1250,
  "cache_hit": false,
  "llb_queries": 3,
  "prompt_length": 4500,
  "success": true
}
```

## Casos de Uso

### 1. Desenvolvimento de Feature
```javascript
const prompt = await agentPromptGenerator.generateAgentPrompt(
  "TechnicalAgent",
  "Criar endpoint REST para usuários",
  { complexity: "medium", framework: "express" }
);
// Resultado: Prompt completo com melhores práticas, estrutura de código, testes
```

### 2. Estratégia de Marketing
```javascript
const prompt = await agentPromptGenerator.generateAgentPrompt(
  "BusinessAgent",
  "Campanha de lançamento do produto X",
  { budget: 5000, audience: "tech-savvy" }
);
// Resultado: Prompt com análise de mercado, canais, métricas, timeline
```

### 3. Resolução de Incident
```javascript
const prompt = await agentPromptGenerator.generateAgentPrompt(
  "OperationsAgent",
  "Investigar erro 500 no servidor web",
  { urgency: "high", system: "production" }
);
// Resultado: Prompt com checklist de diagnóstico, ferramentas, procedimentos
```

## Testes e Validação

### Testes Unitários
```bash
npm test agent_prompt_generator.test.js
```

### Cenários de Teste
- Geração para diferentes tipos de agente
- Integração com L.L.B. Protocol
- Sistema de cache e performance
- Tratamento de erros e fallbacks

### Validação de Qualidade
- **Relevância**: Contexto adequado para a tarefa
- **Completude**: Todas as informações necessárias
- **Clareza**: Instruções compreensíveis
- **Efetividade**: Taxa de sucesso na execução

## Futuras Melhorias

### Machine Learning
- Aprendizado de padrões de prompt eficazes
- Personalização baseada em histórico do usuário
- Otimização automática de estrutura de prompt

### Advanced Context
- Integração com bases de conhecimento externas
- Análise de sentimento e intenção
- Suporte a múltiplos idiomas

### Real-time Adaptation
- Ajuste dinâmico baseado em feedback
- Aprendizado contínuo de performance
- Personalização por projeto/equipe

---## ConclusãoO Agent Prompt Generator é a ponte entre o sistema swarm de agentes Node.js e a interface conversacional do chat/IDE. Ele garante que toda a especialização, conhecimento e capacidade dos agentes seja efetivamente comunicada ao LLM, mantendo a qualidade e precisão das execuções.**Mantenedor**: Corporação Senciente - Swarm Architecture Team
**Versão**: 1.0
**Última atualização**: 2025-01-19
