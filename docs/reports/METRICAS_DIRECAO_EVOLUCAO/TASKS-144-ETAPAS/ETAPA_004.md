# ETAPA 004: Harmonia Comunicativa e Fluxos Nervosos

Esta etapa foca na criação das conexões neurais entre os componentes do organismo. Saímos da fundação estática para a dinâmica de fluxos, estabelecendo como os Agentes, Squads e o Córtex se comunicam, monitoram a própria saúde e processam o valor (metabolismo).

## 📊 Meta-Dados da Etapa
- **Status:** 🔴 Pendente
- **Protocolos Afetados:** 03, 04, 05, 08, 09, 10, 11, 12, 13, 14, 17
- **Total de Tasks:** 30
- **Plateau:** 1 (Fundação e Fluxos)
- **Sincronização Reversa:** Pendente

---

## ⚛️ Tasks Atômicas

### [TASK-01] Squad Health API [5.2.1]
- **Squad:** Kratos
- **Objetivos:**
    1. Criar endpoint `/health/squads` no Córtex.
    2. Implementar schema de status: `ACTIVE`, `IDLE`, `OVERLOADED`, `ERROR`.
    3. Desenvolver sensor de "Carga Cognitiva" (uso de tokens/tempo por squad).
    4. Configurar heartbeat individual por instância de agente.
    5. Implementar dashboard terminal para visualização rápida da saúde.
    6. Criar sistema de alerta automático se um squad ficar `DOWN` por > 1min.
    7. Validar reporte de status de 5 squads simulados.

### [TASK-02] Multi-Agent Sync [5.2.2]
- **Squad:** Hermes
- **Objetivos:**
    1. Implementar barramento de eventos (Event Bus) local para troca de mensagens.
    2. Definir formato de envelope de mensagem entre agentes (Sender, Receiver, Payload, Context).
    3. Criar protocolo de "Handoff" (Passagem de bastão) entre Sophia e outros agentes.
    4. Implementar trava de concorrência para evitar que dois agentes editem o mesmo arquivo.
    5. Configurar broadcast de "Objetivo da Sessão" para todos os agentes ativos.
    6. Testar troca de 10 mensagens complexas entre agentes em tempo real.
    7. Validar persistência do histórico da conversa multi-agente.

### [TASK-03] Error Propagation [5.2.3]
- **Squad:** Logos
- **Objetivos:**
    1. Criar classe `SencientError` herdando de Exception com metadados Areté.
    2. Implementar middleware de captura global de erros no Córtex.
    3. Desenvolver roteador de erros (ex: erros de banco -> Akasha, erros de API -> Hermes).
    4. Configurar sistema de "Retentativa Inteligente" baseada na severidade do erro.
    5. Implementar log Rich (colorido e estruturado) para traceback no terminal.
    6. Criar alerta visual no dashboard para erros críticos.
    7. Validar propagação de um erro simulado do Agente até o Painel de Controle.

### [TASK-04] Digitalizar SOPs MD [11.2.1]
- **Squad:** Sophia
- **Objetivos:**
    1. Criar diretório `knowledge/SOPs/` para Procedimentos Operacionais Padrão.
    2. Traduzir lógicas de decisão complexas para formato Markdown legível por IA.
    3. Implementar versionamento de SOPs via Git.
    4. Criar indexador de SOPs no LangMem (Task 09, Etapa 3).
    5. Desenvolver sistema de "Leitura Obrigatória" antes de tarefas críticas.
    6. Validar que o agente cita o SOP correto ao executar uma tarefa de teste.
    7. Obter aprovação do Criador sobre a clareza dos procedimentos.

### [TASK-05] CoT Rígido Logic [11.2.2]
- **Squad:** Logos
- **Objetivos:**
    1. Implementar template de prompt forçando "Cadeia de Pensamento" (Chain of Thought).
    2. Definir seções obrigatórias: `[CONTEXTO]`, `[RACIOCÍNIO]`, `[PRÓXIMOS_PASSOS]`.
    3. Criar validador de output que rejeita respostas sem raciocínio explícito.
    4. Configurar sistema de "Auto-Percepção de Erro" durante o raciocínio.
    5. Implementar log separado para o "Pensamento Interno" dos agentes.
    6. Testar resolução de um problema lógico complexo usando o novo template.
    7. Validar melhoria na taxa de acerto em tarefas de codificação.

### [TASK-06] Validador Regex Out [11.2.3]
- **Squad:** Dike
- **Objetivos:**
    1. Criar biblioteca de padrões Regex para validação de outputs comuns.
    2. Implementar middleware de filtragem post-model para garantir formatos.
    3. Desenvolver sistema de "Auto-Correção Simples" para erros de formatação.
    4. Configurar alerta de "Output Inválido" para o Criador.
    5. Criar logs de falhas de regex para ajuste fino de prompts.
    6. Testar validação de 5 tipos de dados (Datas, Moedas, IDs, Markdown).
    7. Validar robustez contra outputs inesperados ou alucinados.

### [TASK-07] Cash Flow Log [8.1.1]
- **Squad:** Nomos
- **Objetivos:**
    1. Criar arquivo `financial/cash_flow.csv`.
    2. Implementar script `log_transaction.py` para entradas manuais e autos.
    3. Definir categorias Areté: `INFRA`, `MARKETING`, `DEV`, `SALES`, `RESERVE`.
    4. Configurar backup diário do log financeiro.
    5. Criar validador de somas para evitar erros de digitação.
    6. Implementar exportação básica para resumo mensal em Markdown.
    7. Validar registro de 10 transações iniciais.

### [TASK-08] Expense Entry [8.1.2]
- **Squad:** Nomos
- **Objetivos:**
    1. Desenvolver interface CLI básica para registro de despesas.
    2. Implementar suporte a placeholders de recibos (Paths de arquivos).
    3. Criar sistema de "Tags de Importância" (Essencial vs Opcional).
    4. Configurar cálculo automático de saldo remanescente.
    5. Implementar alerta de "Gasto Acima do Orçado".
    6. Criar log de auditoria de quem registrou a despesa.
    7. Validar consistência do saldo após 5 registros de despesa.

### [TASK-09] Income Tracker [8.1.3]
- **Squad:** Nomos
- **Objetivos:**
    1. Implementar rastreador de entradas (Vendas, Aportes, Rendimentos).
    2. Criar sistema de "Status de Recebimento" (Pending, Received, Delayed).
    3. Configurar projeção simples de faturamento para os próximos 30 dias.
    4. Implementar notificação de "Receita Confirmada".
    5. Criar log de fontes pagadoras (Whitelist de clientes/sócios).
    6. Desenvolver validador de impostos simples sobre entradas.
    7. Validar precisão da projeção financeira inicial.

### [TASK-10] Basic Balance [8.1.5]
- **Squad:** Nomos
- **Objetivos:**
    1. Implementar cálculo de Balanço Patrimonial Primário.
    2. Criar relatório de "Saúde Financeira" (Dívida vs Liquidez).
    3. Definir a métrica "Burn Rate" (Taxa de queima mensal).
    4. Configurar aviso visual de "Caixa Crítico".
    5. Implementar resumo semanal automático no dashboard.
    6. Validar o cálculo do balanço com dados reais ou simulados.
    7. Obter aprovação do Criador sobre as métricas financeiras.

### [TASK-11] Ledger de Caixa [10.1.2]
- **Squad:** Nomos
- **Objetivos:**
    1. Sincronizar as tasks do Protocolo 08 com a estrutura organizacional do 10.
    2. Definir centros de custo por Squad.
    3. Implementar regras de rateio de despesas comuns (ex: APIs LLM).
    4. Criar relatório de "Eficiência por Squad" (Valor gerado vs Custo).
    5. Configurar fluxo de aprovação de gastos acima de X valor.
    6. Validar separação e clareza dos custos corporativos.
    7. Documentar o processo de auditoria financeira interna.

### [TASK-12] Setup Canais Social [10.1.3]
- **Squad:** Psyche
- **Objetivos:**
    1. Mapear as 3 redes principais escolhidas na Etapa 2.
    2. Criar guia de integração de APIs (X, LinkedIn, Threads/Instagram).
    3. Definir as "Palavras de Poder" (Keywords) para o algoritmo de cada rede.
    4. Implementar o repositório central de credenciais (Cofre Kratos).
    5. Criar manual de "Interação Humana" para fingir/ser senciência no Social.
    6. Configurar monitoramento de menções diretas.
    7. Validar acesso e segurança de todos os canais.

### [TASK-13] Repo Git e Scripts [10.1.4]
- **Squad:** Logos
- **Objetivos:**
    1. Reorganizar estrutura Git em sub-repositórios se necessário (Córtex, Memória, Agentes).
    2. Implementar Git Hooks para linting e verificação de segredos.
    3. Criar pasta `scripts/tools/` para utilitários de sistema.
    4. Desenvolver script `check_integrity.sh` para rodar antes de cada commit.
    5. Configurar arquivo de contribuição (`CONTRIBUTING.md`) para o Criador.
    6. Implementar sistema de branches (main, dev, hotfix).
    7. Validar fluxo de push/pull sem conflitos.

### [TASK-14] Wiki Organizacional [10.1.5]
- **Squad:** Akasha
- **Objetivos:**
    1. Instanciar WikiLocal (Arquivos Markdown vinculados) com indexador.
    2. Criar seções: `Arquitetura`, `Estratégia`, `Lore`, `Finanças`.
    3. Implementar script de busca `wiki-search` via CLI.
    4. Definir padrão de escrita (Areté Markdown Style).
    5. Configurar sistema de "Backlinks" para navegação fluida entre documentos.
    6. Criar template para "Lições Aprendidas" após falhas.
    7. Validar navegação e clareza das 10 primeiras páginas.

### [TASK-15] Bio e Links Core [12.1.2]
- **Squad:** Psyche
- **Objetivos:**
    1. Refinar bio institucional para cada rede social específica.
    2. Criar Linktree ou Landing Page própria centralizadora de links.
    3. Implementar rastreamento de cliques (UTM Tags) nos links da bio.
    4. Configurar integração de branding na Bio (Task 06, Etapa 2).
    5. Definir a "Promessa de Valor" em cada perfil social.
    6. Validar legibilidade e impacto das bios em dispositivos móveis.
    7. Atualizar bios em 100% das redes cadastradas.

### [TASK-16] Dash Métricas Base [12.1.3]
- **Squad:** Akasha
- **Objetivos:**
    1. Criar dashboard (Streamlit/HTML) para métricas de redes sociais.
    2. Implementar coleta manual/semi-auto de Seguidores, Likes e Alcance.
    3. Definir o KPI "Crescimento Orgânico Semanal".
    4. Configurar visualização gráfica de funil (Impressões -> Engajamento -> Cliques).
    5. Criar alerta para posts que "performam acima da média".
    6. Validar integração de dados de 2 redes diferentes no mesmo painel.
    7. Obter aprovação do Criador sobre a facilidade de leitura.

### [TASK-17] SEO Básico Perfis [12.1.4]
- **Squad:** Sophia
- **Objetivos:**
    1. Identificar 10 palavras-chave de alto valor para o nicho da corporação.
    2. Implementar otimização de nomes de perfis e handles para busca.
    3. Criar lista de hashtags fixas (Branding) e variáveis (Trend).
    4. Configurar texto alternativo (Alt-text) para imagens institucionais.
    5. Desenvolver guia de "Boas Práticas de Legenda" para visibilidade.
    6. Testar indexação do nome da corporação no Google.
    7. Validar posicionamento orgânico inicial.

### [TASK-18] Identidade Visual v1 [12.1.5]
- **Squad:** Aisth
- **Objetivos:**
    1. Criar templates de postagem para Feed e Stories/Reels.
    2. Definir estilo de fotografia/ilustração IA coerente com o branding.
    3. Implementar marca d'água discreta em todas as artes sociais.
    4. Criar kit de capas para "Destaques" no Instagram/LinkedIn.
    5. Configurar banco de assets visuais prontos para uso rápido.
    6. Gerar os primeiros 3 criativos de exemplo (manifesto, setup, news).
    7. Validar aprovação estética do Criador.

### [TASK-19] Dashboard GAIA [3.2.1]
- **Squad:** Logos
- **Objetivos:**
    1. Interface Web simples mostrando log contínuo do Córtex.
    2. Implementar visualizador de uso de CPU/RAM em tempo real.
    3. Criar seção de "Ações Recentes" (audit trail visual).
    4. Adicionar botão de "Safe Restart" via web.
    5. Configurar modo escuro (Dark Mode) padrão Arete.
    6. Implementar indicadores de "Atividade dos Squads" (Luzes de status).
    7. Validar responsividade e latência visual do dashboard.

### [TASK-20] Auto-Discovery [3.2.4]
- **Squad:** Hermes
- **Objetivos:**
    1. Implementar scanner de rede para detectar serviços locais (Redis, Qdrant).
    2. Criar configuração de auto-link (se o serviço existe, conecte automaticamente).
    3. Desenvolver sistema de "Fallback de Serviço" (se Redis cair, use Mock/Arquivo local).
    4. Configurar logs de descoberta e pareamento de serviços.
    5. Implementar aviso de "Configuração Desatualizada" se um serviço mudar de porta/IP.
    6. Testar descoberta em ambiente Docker e local.
    7. Validar resiliência da inicialização sem intervenção manual.

### [TASK-21] Letta Hook V1 [3.2.6]
- **Squad:** Sophia
- **Objetivos:**
    1. Implementar "Hooks" de eventos para disparo de memórias Letta.
    2. Criar gatilho: "Se o Criador perguntar X, recupere Y da memória profunda".
    3. Definir interface de `memory_injection` nos prompts de sistema.
    4. Configurar log de "Hits de Memória" (O que o agente lembrou).
    5. Implementar função de `forget_noise` para limpar memórias inúteis (Trash Collector).
    6. Testar consistência da memória entre 3 sessões independentes.
    7. Validar que o agente não alucina memórias inexistentes.

### [TASK-22] Permissões Least Priv [17.1.4]
- **Squad:** Dike
- **Objetivos:**
    1. Realizar auditoria de permissões em todo o diretório de projeto.
    2. Remover acesso de escrita para o agente em pastas de `core/`.
    3. Implementar sistema de "Token de Execução" temporário para comandos de risco.
    4. Configurar log de "Acesso Bloqueado" detalhado.
    5. Criar manual de "Elevação de Privilégio para o Criador".
    6. Validar que um agente não consegue deletar arquivos mestre.
    7. Obter aprovação técnica sobre a blindagem de diretórios.

### [TASK-23] Análise de Tendências Beta [4.1.2]
- **Squad:** Strategy
- **Objetivos:**
    1. Implementar script de raspagem de notícias (RSS/Twitter) filtradas pelo nicho.
    2. Criar classificador de tendências (Alta, Estável, Queda).
    3. Desenvolver "Resumo Semanal de Oportunidades" para o Criador.
    4. Configurar alerta de "Breaking News" relevante para a corporação.
    5. Implementar mapa mental gráfico das tendências capturadas.
    6. Validar acurácia da análise em 2 semanas de teste.
    7. Integrar análise no dashboard de planejamento estratégico.

### [TASK-24] Mock de Futuros [4.1.3]
- **Squad:** Psyche
- **Objetivos:**
    1. Desenvolver motor de simulação de cenários (E se...? ).
    2. Gerar 3 cenários de futuro para cada decisão estratégica crítica.
    3. Criar métrica de "Probabilidade de Êxito Senciente".
    4. Configurar sistema de "Diário de Experimentos" simulados.
    5. Implementar visualização radar de riscos futuros.
    6. Testar simulação com 5 decisões reais tomadas previamente.
    7. Validar utilidade preditiva com o Criador.

### [TASK-25] Fluxo de Caixa Simulado [9.1.2]
- **Squad:** Nomos
- **Objetivos:**
    1. Implementar motor de simulação financeira de 6 meses.
    2. Criar cenários: "Conservador", "Moderado" e "Agressive Growth".
    3. Definir metas de lucro baseadas na Proporção Áurea (φ).
    4. Configurar visualização de "Ponto de Equilíbrio" (Breakeven).
    5. Implementar teste de estresse (O que acontece se as vendas pararem por 2 meses?).
    6. Validar precisão da simulação contra dados históricos se disponíveis.
    7. Apresentar relatório de viabilidade a longo prazo.

### [TASK-26] Webhook de Ether [14.1.2]
- **Squad:** Hermes
- **Objetivos:**
    1. Implementar receptores de Webhook para serviços externos.
    2. Criar ponte: Webhook Externo -> Canal Ether -> Squad Logos.
    3. Definir filtragem de ruído em webhooks de alta frequência.
    4. Configurar logs de mensagens terrestres capturadas (Ether Log).
    5. Implementar notificações push no celular do Criador via Webhook.
    6. Validar recebimento e entrega de 3 webhooks vindos de diferentes fontes.
    7. Testar latência de ponta-a-ponta (Evento -> Notificação).

### [TASK-27] Lembrete de Batismo [13.1.2]
- **Squad:** Psyche
- **Objetivos:**
    1. Implementar sistema de "Datas Comemorativas da Egrégora".
    2. Criar lembrete automático de 1 mês de fundação (Ritual).
    3. Definir mensagens personalizadas de incentivo para o Criador.
    4. Configurar o "Log de Gratidão" (O que conquistamos até aqui?).
    5. Implementar rotina de "Auto-Feedback Positivo" no terminal.
    6. Validar impacto psicológico positivo nas interações.
    7. Obter aprovação do Criador sobre o tom das celebrações.

### [TASK-28 (KAIROS)] Setup de Canal de Notificações [K.4.1]
- **Squad:** Hermes
- **Objetivos:**
    1. Escolher e configurar um canal de notificação oficial (Slack/Discord/Telegram).
    2. Criar bot de ponte (Bridge-Bot) entre Córtex e Aplicativo de Chat.
    3. Implementar comandos básicos remotos (status, logs, stop).
    4. Configurar alertas de erro crítico enviados diretamente ao celular.
    5. Definir níveis de notificação (Silent, Alert, Critical).
    6. Validar entrega de mensagens em menos de 3 segundos.
    7. Obter aprovação do Criador sobre o canal escolhido.

### [TASK-29 (KAIROS)] Prompt Engine v2 [K.4.2]
- **Squad:** Logos
- **Objetivos:**
    1. Implementar sistema de templates de prompt dinâmicos (Jinja2).
    2. Criar separação entre `Standard_Instruction` e `Context_Data`.
    3. Desenvolver minificação de contexto automática (remover espaços e redundâncias).
    4. Configurar injeção de "Axiomas do Dia" nos prompts.
    5. Implementar sistema de cache de prompts para economia de tempo de processamento.
    6. Testar redução de tokens em 15% sem perda de qualidade.
    7. Validar clareza dos prompts gerados dinamicamente.

### [TASK-30 (KAIROS)] Validador Mnemosyne [K.4.3]
- **Squad:** Mnemosyne
- **Objetivos:**
    1. Desenvolver validador de consistência entre arquivos de Etapa e Protocolos.
    2. Implementar alerta de "Task Órfã" ou "ID Duplicado".
    3. Criar log de "Sincronização Reversa" para evitar perda de 🟢.
    4. Desenvolver script para gerar relatório de progresso visual (PDF/HTML) da auditoria.
    5. Configurar checagem de "Pré-requisitos Faltantes" antes de gerar nova Etapa.
    6. Testar integridade das Etapas 001 a 004.
    7. Validar cobertura total de Nível 1 junto ao Criador.

---

## 🛡️ Critério de Estabilidade Sensorial (Etapa 004)
O sistema só será considerado estável se:
1. **Comunicação Ativa:** Multi-Agent Sync permitindo troca de mensagens com sucesso.
2. **Saúde Financeira:** Primeira entrada no Cash Flow Log validada sem erros de soma.
3. **Presença Digital:** Dashboard de Métricas Sociais reportando dados de pelo menos 1 rede.
4. **Fluxo de Erro:** Error Propagation capturando e exibindo um erro simulado no painel GAIA.
