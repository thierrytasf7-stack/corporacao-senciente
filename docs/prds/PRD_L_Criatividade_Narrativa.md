# PRD L: Criatividade e Narrativa

## Visão Geral

Sistema de geração criativa de ideias e criação de narrativas sobre o desenvolvimento do sistema, permitindo documentação natural além da técnica.

**Versão:** 1.0.0  
**Status:** Implementado  
**Prioridade:** Média (enriquece capacidade do sistema)

## Objetivo

Capacitar o sistema para:
- Gerar ideias novas e criativas
- Realizar brainstorming automático
- Descobrir padrões ocultos
- Criar narrativas sobre decisões e desenvolvimento
- Documentar de forma natural (não apenas técnica)

## Personas e Casos de Uso

### Personas

1. **Coordenador**: Sistema que gera ideias e narrativas
2. **Inovador**: Agente de inovação
3. **Narrador**: Sistema que documenta narrativamente

### Casos de Uso Principais

1. **UC1: Brainstorming Automático**
   - Como coordenador, preciso gerar ideias sobre um tópico
   - **Critério de sucesso**: Múltiplas ideias geradas, categorizadas por novidade

2. **UC2: Experimentação Controlada**
   - Como coordenador, preciso criar experimento A/B controlado
   - **Critério de sucesso**: Experimento definido com variantes e métricas

3. **UC3: Descobrir Padrões Ocultos**
   - Como coordenador, preciso descobrir padrões não explícitos
   - **Critério de sucesso**: Padrões identificados com exemplos

4. **UC4: Gerar Narrativa**
   - Como coordenador, preciso criar narrativa sobre decisão/desenvolvimento
   - **Critério de sucesso**: Narrativa completa com personagens e arco

5. **UC5: Identidade Narrativa**
   - Como coordenador, preciso construir identidade narrativa
   - **Critério de sucesso**: Identidade definida (who, what, why, how)

## Requisitos Funcionais

### RF1: Criatividade e Inovação
- **RF1.1**: Brainstorming automático baseado em tópico
- **RF1.2**: Experimentação controlada (A/B)
- **RF1.3**: Descoberta de padrões ocultos
- **RF1.4**: Ideação disruptiva
- **RF1.5**: Sessão completa de inovação

### RF2: Narrativa e Storytelling
- **RF2.1**: Gerar narrativa sobre decisão
- **RF2.2**: Criar narrativa de desenvolvimento
- **RF2.3**: Construir identidade narrativa
- **RF2.4**: Documentação natural (não técnica)
- **RF2.5**: Gerar história completa

## Requisitos Não-Funcionais

### RNF1: Criatividade
- Ideias devem ter níveis de novidade (incremental/radical/disruptive)
- Padrões devem ser não-triviais (não apenas palavras-chave comuns)
- Narrativas devem ser coerentes e envolventes

### RNF2: Performance
- Brainstorming: < 5s
- Descoberta de padrões: < 10s
- Geração de narrativa: < 8s

### RNF3: Qualidade
- Ideias devem ser factíveis e relevantes
- Narrativas devem ter arco narrativo coerente
- Documentação natural deve usar metáforas apropriadas

### RNF4: Integração
- Usa memória global para buscar ideias relacionadas
- Salva sessões de inovação na memória global
- Salva narrativas na memória global

## Arquitetura

### Componentes Principais

1. **Creative Generator** (`scripts/innovation/creative_generator.js`)
   - Brainstorming automático
   - Experimentação controlada
   - Descoberta de padrões
   - Ideação disruptiva

2. **Story Generator** (`scripts/narrative/story_generator.js`)
   - Narrativa de decisão
   - Narrativa de desenvolvimento
   - Identidade narrativa
   - Documentação natural

### Categorias de Ideias

- **incremental**: Melhorias incrementais
- **radical**: Mudanças significativas
- **disruptive**: Mudanças disruptivas

### Integrações

- Usa memória global para buscar ideias relacionadas
- Pode ser acionado sob demanda ou periodicamente
- Salva resultados na memória global

## Métricas e KPIs

- Número de ideias geradas
- Taxa de ideias implementadas
- Qualidade das narrativas (subjetivo)
- Padrões descobertos que levaram a insights

## Testes

### Testes Unitários
- Brainstorming (gerar ideias)
- Descoberta de padrões
- Geração de narrativa

### Testes de Validação
- Avaliar qualidade/novidade das ideias (pode ser manual)
- Validar coerência das narrativas

## Documentação

- Integrado no sistema de coordenador
- Ver código: `scripts/innovation/creative_generator.js`
- Ver código: `scripts/narrative/story_generator.js`

## Próximos Passos

1. Melhorar brainstorming com LLM (ideias realmente novas)
2. Análise de sentimento em narrativas
3. Visualização de padrões descobertos
4. Dashboard de inovação

---

**Aprovado por:** [Nome]  
**Data:** 2025-01-13






























