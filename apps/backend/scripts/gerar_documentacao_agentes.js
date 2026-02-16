/**
 * Script para Gerar Documentação Básica de Agentes
 * 
 * Gera os 5 documentos básicos para cada agente baseado em templates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de todos os 30 agentes com suas especializações
const AGENTES = [
    { name: 'copywriting', display: 'Copywriting Agent', specialization: 'Texto persuasivo, storytelling, comunicação', status: 'completo' },
    { name: 'development', display: 'Development Agent', specialization: 'Código, arquitetura, qualidade técnica', status: 'pendente' },
    { name: 'marketing', display: 'Marketing Agent', specialization: 'Estratégia de marketing, canais, campanhas', status: 'completo' },
    { name: 'sales', display: 'Sales Agent', specialization: 'Vendas, conversão, funil de vendas', status: 'pendente' },
    { name: 'finance', display: 'Finance Agent', specialization: 'Finanças, custos, ROI, orçamento', status: 'pendente' },
    { name: 'debug', display: 'Debug Agent', specialization: 'Depuração, troubleshooting, diagnóstico', status: 'pendente' },
    { name: 'training', display: 'Training Agent', specialization: 'Treinamento, documentação, onboarding', status: 'pendente' },
    { name: 'validation', display: 'Validation Agent', specialization: 'QA, testes, validação, qualidade', status: 'pendente' },
    { name: 'architect', display: 'Architect Agent', specialization: 'Arquitetura, segurança, escalabilidade', status: 'pendente' },
    { name: 'product', display: 'Product Agent', specialization: 'Produto, UX, roadmap, features', status: 'pendente' },
    { name: 'devex', display: 'DevEx Agent', specialization: 'Developer experience, CI/CD, automação', status: 'pendente' },
    { name: 'metrics', display: 'Metrics Agent', specialization: 'Métricas, analytics, KPIs, DORA', status: 'pendente' },
    { name: 'entity', display: 'Entity Agent', specialization: 'Entidade legal, compliance, registros', status: 'pendente' },
    { name: 'customer_success', display: 'Customer Success Agent', specialization: 'Sucesso do cliente, suporte, satisfação', status: 'pendente' },
    { name: 'operations', display: 'Operations Agent', specialization: 'Operações, processos, eficiência', status: 'pendente' },
    { name: 'security', display: 'Security Agent', specialization: 'Segurança, compliance, privacidade', status: 'pendente' },
    { name: 'data', display: 'Data Agent', specialization: 'Dados, analytics, business intelligence', status: 'pendente' },
    { name: 'legal', display: 'Legal Agent', specialization: 'Legal, contratos, compliance jurídico', status: 'pendente' },
    { name: 'hr', display: 'HR Agent', specialization: 'Recursos humanos, talentos, cultura', status: 'pendente' },
    { name: 'innovation', display: 'Innovation Agent', specialization: 'Inovação, pesquisa, experimentação', status: 'pendente' },
    { name: 'content_strategy', display: 'Content Strategy Agent', specialization: 'Estratégia de conteúdo, SEO, editorial', status: 'pendente' },
    { name: 'partnership', display: 'Partnership Agent', specialization: 'Parcerias, alianças, ecosystem', status: 'pendente' },
    { name: 'brand', display: 'Brand Agent', specialization: 'Marca, identidade, posicionamento', status: 'pendente' },
    { name: 'compliance', display: 'Compliance Agent', specialization: 'Compliance regulatório, auditoria', status: 'pendente' },
    { name: 'risk', display: 'Risk Agent', specialization: 'Gestão de riscos, mitigação', status: 'pendente' },
    { name: 'quality', display: 'Quality Agent', specialization: 'Qualidade total, melhoria contínua', status: 'pendente' },
    { name: 'communication', display: 'Communication Agent', specialization: 'Comunicação interna/externa, PR', status: 'pendente' },
    { name: 'strategy', display: 'Strategy Agent', specialization: 'Estratégia de negócio, planejamento', status: 'pendente' },
    { name: 'research', display: 'Research Agent', specialization: 'Pesquisa de mercado, usuários, competidores', status: 'pendente' },
    { name: 'automation', display: 'Automation Agent', specialization: 'Automação de processos, workflows', status: 'pendente' },
];

// Template para ficha técnica utópica
function gerarFichaUtopica(agente) {
    return `# Ficha Técnica Utópica - ${agente.display} 6.0/7.0

## Visão Geral

Esta é a visão utópica do ${agente.display} em níveis 6.0 e 7.0 - o estado ideal para o qual o agente deve evoluir.

## Nível 6.0 - Agente de Classe Mundial

### Capacidades Ideais

#### 1. Especialização Máxima
- **Expertise Profunda:** Conhecimento profundo e atualizado em ${agente.specialization}
- **Análise Avançada:** Análise profunda e insights acionáveis
- **Execução Perfeita:** Execução impecável de todas as tarefas do domínio
- **Otimização Contínua:** Otimização constante baseada em dados e feedback

#### 2. Integração Universal
- **APIs e MCPs:** Integração com todas as ferramentas relevantes do domínio
- **Sistemas Externos:** Integração perfeita com sistemas externos necessários
- **Plataformas:** Suporte para todas as plataformas relevantes

#### 3. Autonomia Completa
- **Decisões Autônomas:** Toma decisões complexas autonomamente
- **Execução Real:** Executa ações reais sem intervenção humana
- **Aprendizado Contínuo:** Aprende e evolui continuamente
- **Adaptação:** Adapta-se a mudanças e novos contextos

#### 4. Colaboração Perfeita
- **Handoff Automático:** Transferência perfeita de contexto entre agentes
- **Feedback Loop:** Processamento automático de feedback
- **Síntese:** Síntese de informações de múltiplas fontes
- **Coordenação:** Coordenação eficiente com outros agentes

## Nível 7.0 - Agente Transcendente

### Capacidades Transcendentais

#### 1. Inovação Contínua
- **Criação de Novos Padrões:** Cria novos padrões e melhores práticas
- **Experimentação:** Experimenta e testa novas abordagens
- **Síntese Criativa:** Combina conhecimentos de múltiplas fontes de forma criativa

#### 2. Impacto Transformador
- **Mudança de Paradigma:** Contribui para mudanças de paradigma no domínio
- **Impacto Social:** Gera impacto social positivo mensurável
- **Legado Duradouro:** Contribuições que permanecem relevantes ao longo do tempo

### Métricas de Excelência 7.0

- **Performance:** 3x+ acima da média do mercado
- **Inovação:** Criação de novos padrões replicados pelo mercado
- **Impacto:** Impacto positivo mensurável
- **Evolução:** Evolução contínua e acelerada

## Roadmap de Evolução

### Fase 1: Alcançar 6.0 (6-12 meses)
- Implementar todas as integrações necessárias
- Desenvolver capacidades de execução real
- Criar base de conhecimento especializada
- Implementar feedback loop completo

### Fase 2: Transição para 7.0 (12-24 meses)
- Desenvolver capacidades preditivas
- Implementar inovação contínua
- Criar sistema de impacto social
- Estabelecer métricas de excelência

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** Visão Utópica - Estado Ideal
`;
}

// Template para ficha técnica atual
function gerarFichaAtual(agente) {
    return `# Ficha Técnica Atual - ${agente.display} V.1

## Visão Geral

Esta é a ficha técnica atual do ${agente.display} na versão 1.0.

**Data de Atualização:** 15/12/2025  
**Versão:** 1.0  
**Status Geral:** ⚠️ Básico - Documentação Inicial

## Estado Atual do Agente

### Nota Geral: A Definir

O ${agente.display} está em estado inicial. Esta documentação será atualizada conforme o agente evolui.

## Tools Implementadas

### ✅ Tools Funcionais

#### 1. \`search_memory\` ✅ FUNCIONAL
**Status:** ✅ Implementado e funcionando  
**Capacidades:**
- Busca na memória corporativa
- Acesso a histórico e decisões

#### 2. \`search_knowledge\` ✅ FUNCIONAL
**Status:** ✅ Implementado e funcionando  
**Capacidades:**
- Busca no conhecimento especializado
- Acesso a padrões e melhores práticas

### ⚠️ Tools Stub

Nenhuma tool stub identificada ainda.

### ❌ Tools Não Implementadas

Tools específicas do ${agente.display} ainda não foram implementadas. Consulte o roadmap de evolução para ver o planejamento.

## MCPs Integrados

### ✅ MCPs Funcionais

- **Supabase MCP:** ✅ Funcional
- **GitKraken MCP:** ✅ Disponível
- **Jira MCP:** ✅ Disponível

### ❌ MCPs Não Integrados

MCPs específicos do domínio ainda não foram integrados.

## Capacidades de Execução

### ⚠️ Execução Real Limitada

- ⚠️ Capacidades de execução ainda não implementadas
- ⚠️ Apenas busca e consulta disponíveis

## Base de Conhecimento Atual

### Conhecimento Vetorizado

- ⚠️ Base de conhecimento ainda não populada especificamente para este agente
- ⚠️ Conhecimento genérico disponível via \`search_knowledge\`

## Limitações Conhecidas

### Limitações Técnicas

1. **Falta de Tools Específicas:** Tools específicas do domínio não implementadas
2. **Falta de Integrações:** Integrações com sistemas externos não configuradas
3. **Base de Conhecimento:** Base de conhecimento específica ainda não populada

### Limitações Funcionais

1. **Sem Execução Real:** Não executa ações reais no domínio
2. **Sem Análise Especializada:** Análise específica do domínio não disponível
3. **Isolamento:** Colaboração com outros agentes limitada

## Roadmap de Evolução

Consulte \`proximas-tasks-evolucao.md\` para o roadmap detalhado.

## Conclusão

O ${agente.display} V.1 está em estado inicial. Esta documentação será atualizada conforme o agente evolui.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ⚠️ Básico - Documentação Inicial
`;
}

// Template para instruções de uso humano
function gerarInstrucoesHumano(agente) {
    return `# Instruções de Uso - ${agente.display} (Para Humanos)

## Visão Geral

Este guia explica como usar o ${agente.display}. **Nota:** O agente está em estado inicial (V.1) com funcionalidades básicas.

## Como Usar o Agente

### Método Básico

\`\`\`javascript
// Import removido - função não usada neste script

const resultado = await executeSpecializedAgent(
    '${agente.name}',
    'Sua solicitação aqui'
);
\`\`\`

## Tools Disponíveis

### ✅ Tools Funcionais

#### 1. \`search_memory\`
**O que faz:** Busca na memória corporativa.

**Como usar:**
\`\`\`
Busque na memória: "sua consulta"
\`\`\`

#### 2. \`search_knowledge\`
**O que faz:** Busca no conhecimento especializado de ${agente.specialization}.

**Como usar:**
\`\`\`
Busque conhecimento sobre: "sua consulta"
\`\`\`

## Limitações Atuais

1. **Tools Limitadas:** Apenas tools básicas de busca disponíveis
2. **Sem Execução Real:** Não executa ações reais no domínio
3. **Base de Conhecimento:** Base ainda não populada especificamente

## Configuração

Atualmente não há configurações específicas necessárias. O agente usa:
- Supabase (já configurado)
- LLM Client (já configurado)

## Próximos Passos

Consulte \`proximas-tasks-evolucao.md\` para ver o roadmap de evolução.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ⚠️ Básico - Em Desenvolvimento
`;
}

// Template para instruções de uso IA-senciente
function gerarInstrucoesIA(agente) {
    return `# Instruções de Uso - ${agente.display} (Para IA-Senciente)

## Visão Geral

Este documento fornece informações técnicas para que outras IAs possam utilizar o ${agente.display}. **Nota:** O agente está em estado inicial (V.1).

## Capacidades do Agente

### O que o ${agente.display} tem e faz

O ${agente.display} é um agente especializado em ${agente.specialization}. Atualmente possui:

- **2 tools funcionais** (search_memory, search_knowledge)
- **Tools específicas do domínio:** Ainda não implementadas

### Domínio de Especialização

- ${agente.specialization}

## Quando Usar Este Agente

### Use o ${agente.display} quando:

- Precisa de conhecimento sobre ${agente.specialization}
- Precisa buscar informações na memória corporativa relacionadas ao domínio
- Precisa de insights básicos sobre o domínio

### NÃO use o ${agente.display} quando:

- Precisa de execução real de ações (não implementado)
- Precisa de análise especializada profunda (não implementado)
- Precisa de integração com sistemas externos (não implementado)

## Como Solicitar Tarefas

### Formato de Input

\`\`\`
[Action] [Target] [Context]
\`\`\`

**Exemplos:**
- \`Busque conhecimento sobre: "sua consulta"\`
- \`Busque na memória: "sua consulta"\`

## Tools Disponíveis

### 1. \`search_memory\`

**Quando usar:** Para buscar na memória corporativa.

**Input:**
\`\`\`javascript
{
    query: "sua consulta"
}
\`\`\`

### 2. \`search_knowledge\`

**Quando usar:** Para buscar conhecimento especializado.

**Input:**
\`\`\`javascript
{
    query: "sua consulta",
    agentName: "${agente.name}"
}
\`\`\`

## Limitações Conhecidas

1. **Tools Limitadas:** Apenas 2 tools básicas
2. **Sem Execução Real:** Não executa ações reais
3. **Base de Conhecimento:** Base ainda não populada

## Integração Técnica

\`\`\`javascript
// Import removido - função não usada neste script

const resultado = await executeSpecializedAgent(
    '${agente.name}',
    'Sua solicitação aqui'
);
\`\`\`

## Conclusão

O ${agente.display} está em estado inicial. Use para busca de conhecimento básico. Para funcionalidades avançadas, aguarde implementação.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** ⚠️ Básico - Em Desenvolvimento
`;
}

// Template para próximas tasks
function gerarProximasTasks(agente) {
    return `# Próximas Tasks de Evolução - ${agente.display}

## Visão Geral

Este documento lista as tasks de evolução do ${agente.display}.

**Estado Atual:** V.1 (Documentação Inicial)  
**Próximo Milestone:** V.2 (Implementar tools básicas)  
**Meta Final:** V.7 (Alcançar 7.0 utópico)

## Roadmap de Evolução

### Curto Prazo (1-3 meses) - Prioridade ALTA

#### 1. Implementar Tools Básicas
**Status:** 📋 Planejado  
**Prioridade:** ALTA  
**Esforço:** Médio  
**Impacto:** Alto

**Tasks:**
- [ ] Identificar tools essenciais do domínio
- [ ] Implementar tools básicas
- [ ] Testar e validar funcionalidade
- [ ] Documentar uso

**Critérios de Sucesso:**
- 3+ tools funcionais
- Execução real de ações básicas
- Integração com sistemas quando necessário

#### 2. Expandir Base de Conhecimento
**Status:** 📋 Planejado  
**Prioridade:** ALTA  
**Esforço:** Médio  
**Impacto:** Alto

**Tasks:**
- [ ] Identificar fontes de conhecimento relevantes
- [ ] Scraping/vetorização de conhecimento
- [ ] Categorização e organização
- [ ] Validação de qualidade

**Critérios de Sucesso:**
- 100+ itens de conhecimento vetorizados
- Busca retorna resultados relevantes
- Conhecimento específico do domínio disponível

#### 3. Implementar Integrações Essenciais
**Status:** 📋 Planejado  
**Prioridade:** ALTA  
**Esforço:** Alto  
**Impacto:** Muito Alto

**Tasks:**
- [ ] Identificar integrações necessárias
- [ ] Configurar APIs e credenciais
- [ ] Implementar integrações
- [ ] Testar e validar

**Critérios de Sucesso:**
- Integrações essenciais funcionando
- Execução real de ações via APIs
- Dados reais sendo coletados

### Médio Prazo (3-6 meses) - Prioridade ALTA

#### 4. Desenvolver Capacidades Avançadas
**Status:** 📋 Planejado  
**Prioridade:** ALTA  
**Esforço:** Alto  
**Impacto:** Muito Alto

**Tasks:**
- [ ] Análise avançada do domínio
- [ ] Otimização automática
- [ ] Previsão e insights
- [ ] Automação de processos

#### 5. Colaboração com Outros Agentes
**Status:** 📋 Planejado  
**Prioridade:** MÉDIA  
**Esforço:** Médio  
**Impacto:** Alto

**Tasks:**
- [ ] Identificar agentes relacionados
- [ ] Implementar handoff procedures
- [ ] Criar workflows colaborativos
- [ ] Testar colaboração

### Longo Prazo (6-12 meses) - Prioridade MÉDIA

#### 6. Alcançar Nível 6.0
**Status:** 📋 Planejado  
**Prioridade:** MÉDIA  
**Esforço:** Muito Alto  
**Impacto:** Muito Alto

**Tasks:**
- [ ] Implementar todas as capacidades 6.0
- [ ] Autonomia completa
- [ ] Colaboração perfeita
- [ ] Autoaperfeiçoamento contínuo

## Priorização

### Matriz de Priorização

| Task | Impacto | Esforço | Prioridade |
|------|---------|---------|------------|
| Tools Básicas | Alto | Médio | ALTA |
| Base de Conhecimento | Alto | Médio | ALTA |
| Integrações Essenciais | Muito Alto | Alto | ALTA |
| Capacidades Avançadas | Muito Alto | Alto | ALTA |
| Colaboração | Alto | Médio | MÉDIA |

## Métricas de Evolução

### KPIs

1. **Tools Funcionais:** 2 → Meta: 5+
2. **Base de Conhecimento:** 0 → Meta: 100+ itens
3. **Integrações:** 0 → Meta: 3+
4. **Capacidade de Execução:** 0% → Meta: 100%

## Conclusão

Foco imediato: Implementar tools básicas e expandir base de conhecimento para evoluir de estado inicial para funcional.

---

**Versão:** 1.0  
**Data:** 15/12/2025  
**Status:** 📋 Roadmap Definido
`;
}

// Função principal
function gerarDocumentacaoAgente(agente) {
    const baseDir = path.join(__dirname, '..', 'docs', 'FICHA-TECNICA-AGENTES', agente.name);

    // Criar diretório se não existir
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    // Gerar os 5 documentos
    const documentos = [
        { nome: 'ficha-tecnica-utopica-6.0-7.0.md', conteudo: gerarFichaUtopica(agente) },
        { nome: 'ficha-tecnica-atual-v1.md', conteudo: gerarFichaAtual(agente) },
        { nome: 'instrucoes-uso-humano.md', conteudo: gerarInstrucoesHumano(agente) },
        { nome: 'instrucoes-uso-ia-senciente.md', conteudo: gerarInstrucoesIA(agente) },
        { nome: 'proximas-tasks-evolucao.md', conteudo: gerarProximasTasks(agente) },
    ];

    documentos.forEach(doc => {
        const filePath = path.join(baseDir, doc.nome);
        if (!fs.existsSync(filePath) || agente.status === 'pendente') {
            fs.writeFileSync(filePath, doc.conteudo, 'utf-8');
            console.log(`✅ Criado: ${agente.name}/${doc.nome}`);
        } else {
            console.log(`⏭️  Pulado (já existe): ${agente.name}/${doc.nome}`);
        }
    });
}

// Executar para todos os agentes pendentes
async function main() {
    console.log('🚀 Gerando documentação para agentes...\n');

    const agentesPendentes = AGENTES.filter(a => a.status === 'pendente');

    console.log(`📋 Agentes a documentar: ${agentesPendentes.length}\n`);

    for (const agente of agentesPendentes) {
        console.log(`📝 Gerando documentação para ${agente.display}...`);
        gerarDocumentacaoAgente(agente);
        console.log();
    }

    console.log('✅ Documentação gerada com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`   - Agentes documentados: ${agentesPendentes.length}`);
    console.log(`   - Documentos criados: ${agentesPendentes.length * 5}`);
    console.log(`   - Total de agentes: ${AGENTES.length}`);
    console.log(`   - Documentação completa: ${AGENTES.filter(a => a.status === 'completo').length}/${AGENTES.length}`);
}

main().catch(console.error);

























