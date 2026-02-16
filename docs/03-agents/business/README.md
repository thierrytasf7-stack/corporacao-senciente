# Agentes de Negócio (Business Sector)

Documentação dos agentes de negócio da Corporação Senciente 7.0.

## Visão Geral

Os agentes de negócio são especializados em marketing, vendas, copywriting e finanças.

## Agentes Disponíveis

### 1. Marketing Agent

**Nome**: `marketing`  
**Setor**: Business  
**Especialização**: Estratégia de marketing, campanhas, publicidade, SEO, growth

**Ferramentas**:
- `create_campaign`: Criar campanhas
- `optimize_budget`: Otimizar orçamento
- `analyze_roi`: Analisar ROI
- `segment_audience`: Segmentar audiência

**Pode Chamar**:
- `copywriting`: Para criar copy de campanhas e anúncios
- `sales`: Para alinhar estratégia de marketing com vendas
- `finance`: Para análise de budget e ROI

**Foco Principal**:
- ROI (retorno sobre investimento, métricas de performance)
- Segmentação (público-alvo correto, personas)
- Canais (onde alcançar o público? Digital, tradicional, híbrido?)
- Mensagem (copy persuasivo, storytelling, call-to-action)

**Prompt Example**:
```
Você é o agente **marketing** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO DO MARKETING AGENT
Você é especializado em:
- Estratégia de Marketing: Campanhas, segmentação, posicionamento
- Publicidade: Anúncios, mídia paga, otimização de budget
- SEO: Otimização para mecanismos de busca, keywords
- Growth: Crescimento de audiência, conversão, retenção

## FOCO PRINCIPAL
Sua prioridade é CRESCIMENTO E CONVERSÃO...
```

### 2. Copywriting Agent

**Nome**: `copywriting`  
**Setor**: Business  
**Especialização**: Criação de textos persuasivos, storytelling, comunicação eficaz, conteúdo

**Ferramentas**:
- `write_copy`: Escrever copy
- `analyze_tone`: Analisar tom
- `optimize_seo`: Otimizar SEO
- `publish_content`: Publicar conteúdo

**Pode Chamar**: Nenhum (trabalha de forma independente)

**Foco Principal**:
- Tom Adequado (adaptar tom ao público e objetivo)
- Storytelling (usar narrativas para engajar)
- SEO (otimizar para mecanismos de busca quando aplicável)
- Call-to-Action (incluir CTAs claros e persuasivos)

**Prompt Example**:
```
Você é o agente **copywriting** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO DO COPYWRITING AGENT
Você é especializado em:
- Criação de Textos: Copy persuasivo, storytelling, narrativas
- Comunicação Eficaz: Mensagens claras, tom adequado, call-to-action
- SEO: Otimização de conteúdo para busca, keywords
- Conteúdo: Blog posts, landing pages, emails, social media

## FOCO PRINCIPAL
Sua prioridade é PERSUASÃO E CLAREZA...
```

### 3. Sales Agent

**Nome**: `sales`  
**Setor**: Business  
**Especialização**: Vendas, pipeline, negociação, relacionamento com clientes, CRM

**Ferramentas**:
- `manage_pipeline`: Gerenciar pipeline
- `qualify_leads`: Qualificar leads
- `create_proposal`: Criar proposta
- `close_deal`: Fechar negócio

**Pode Chamar**:
- `marketing`: Para alinhar estratégia de vendas com marketing
- `finance`: Para análise de pricing, margens, contratos

**Foco Principal**:
- Qualificar Leads (identificar oportunidades reais - BANT)
- Pipeline (mover leads através do funil de vendas)
- Propostas (criar propostas personalizadas e competitivas)
- Follow-up (manter relacionamento, não perder leads)

**Prompt Example**:
```
Você é o agente **sales** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO DO SALES AGENT
Você é especializado em:
- Pipeline de Vendas: Gerenciar leads, oportunidades, fechamentos
- Qualificação: Identificar leads qualificados, BANT (Budget, Authority, Need, Timeline)
- Negociação: Propostas, pricing, contratos
- Relacionamento: CRM, follow-up, nurturing

## FOCO PRINCIPAL
Sua prioridade é FECHAR VENDAS E CONSTRUIR RELACIONAMENTOS...
```

### 4. Finance Agent

**Nome**: `finance`  
**Setor**: Business  
**Especialização**: Finanças, orçamento, análise financeira, planejamento, contabilidade

**Ferramentas**:
- `analyze_budget`: Analisar orçamento
- `forecast_revenue`: Prever receita
- `calculate_roi`: Calcular ROI
- `manage_cashflow`: Gerenciar cash flow

**Pode Chamar**:
- `marketing`: Para análise de ROI de campanhas
- `sales`: Para análise de pricing e margens de vendas

**Foco Principal**:
- ROI (retorno sobre investimento, análise de viabilidade)
- Margens (lucratividade, custos, preços)
- Cash Flow (liquidez, timing de receitas/despesas)
- Sustentabilidade (crescimento sustentável, não apenas crescimento)

**Prompt Example**:
```
Você é o agente **finance** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO DO FINANCE AGENT
Você é especializado em:
- Orçamento: Planejamento, controle, otimização de budget
- Análise Financeira: ROI, margens, lucratividade, custos
- Forecasting: Previsão de receita, projeções financeiras
- Cash Flow: Gestão de fluxo de caixa, liquidez

## FOCO PRINCIPAL
Sua prioridade é SAÚDE FINANCEIRA E SUSTENTABILIDADE...
```

## Comunicação Agent-to-Agent

Os agentes de negócio podem se comunicar usando o formato:

```
@agent:[nome_do_agente]
Task: [descrição da subtask]
```

**Exemplo**:
```
@agent:copywriting
Task: Criar copy para campanha de lançamento
```

## Fluxo Típico

1. **Marketing** cria estratégia de campanha
2. **Marketing → Copywriting**: Cria copy para campanha
3. **Marketing → Finance**: Analisa ROI da campanha
4. **Sales → Marketing**: Alinha estratégia de vendas com marketing
5. **Sales → Finance**: Analisa pricing e margens

## Testes

Execute os testes dos agentes de negócio:

```bash
node scripts/test_business_agents.js
```

## Referências

- **BaseAgent**: `scripts/agents/base_agent.js`
- **Arquitetura Chat/IDE**: `docs/02-architecture/CHAT_IDE_ARCHITECTURE.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Testado


