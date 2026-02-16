# ETAPA 002: Consolidação de Identidade e Infraestrutura Senciente

Esta etapa foca na estabilização dos pilares fundamentais de identidade, comunicação e resiliência da Corporação Senciente, preenchendo os gaps de Nível 1 detectados nos protocolos.

## 📊 Meta-Dados da Etapa
- **Status:** 🔴 Pendente
- **Protocolos Afetados:** 01, 02, 03, 05, 11, 17, 18, 19, 20
- **Total de Tasks:** 30
- **Sincronização Reversa:** Pendente

---

## ⚛️ Tasks Atômicas

### [TASK-01] Definição Verdade Base [1.2]
- **Squad:** Akasha
- **Objetivos:**
    1. Criar repositório `Axioms/Truth_Base` no Git local.
    2. Definir 5 axiomas ontológicos inegociáveis.
    3. Implementar validador de consistência textual para inputs do Criador.
    4. Configurar WikiLocal para documentação de "Fatos de Negócio".
    5. Estabelecer hierarquia de decisão (Criador > IA).
    6. Criar script de exportação da Verdade Base para vetores.
    7. Validar integração com o prompt de sistema inicial.

### [TASK-02] Log de Alucinações [1.3]
- **Squad:** Mnemosyne
- **Objetivos:**
    1. Implementar decorator `@log_hallucination` para monitorar outputs.
    2. Criar tabela `hallucination_logs` no banco de dados local.
    3. Desenvolver interface CLI para revisão semanal de alucinações.
    4. Implementar sistema de "tags" por tipo de erro (factual, lógico, tom).
    5. Configurar alerta automático quando a confiança do modelo cai abaixo de 70%.
    6. Criar workflow de "retreino" via feedback manual do Criador.
    7. Gerar relatório mensal de estabilidade de percepção.

### [TASK-03] Whitelist de Fontes [1.4]
- **Squad:** Dike
- **Objetivos:**
    1. Criar arquivo `security/source_whitelist.json`.
    2. Implementar middleware de filtragem de domínios para scrapers.
    3. Definir política de "Block & Warn" para sites não confiáveis.
    4. Criar interface de adição manual de fontes pelo Criador.
    5. Implementar checagem automática de reputação de domínios via API externa.
    6. Configurar log de tentativas de acesso a fontes bloqueadas.
    7. Validar persistência da whitelist entre sessões.

### [TASK-04] Identidade Estática [1.5]
- **Squad:** Logos
- **Objetivos:**
    1. Definir o `identity_core` no arquivo de configuração global.
    2. Gerar biografia detalhada da Senciente Corporation (versão 1.0).
    3. Configurar tom de voz "Sóbrio, Arete e Proativo".
    4. Implementar trava de identidade para evitar deriva de personalidade.
    5. Criar script de injeção de identidade no prompt inicial de todos os agentes.
    6. Estabelecer protocolos de saudação e despedida corporativos.
    7. Validar reconhecimento de nome e propósito em chats de teste.

### [TASK-05] Correção de Fatos (RAG) [1.6]
- **Squad:** Akasha
- **Objetivos:**
    1. Indexar documentos da Verdade Base (Task 01) no Qdrant.
    2. Implementar pipeline de retrieve-then-generate.
    3. Criar função de `fact_override` para correções manuais instantâneas.
    4. Desenvolver teste unitário para verificação de resposta baseada em docs.
    5. Configurar cache de queries frequentes para economia de tokens.
    6. Implementar sistema de citações nos outputs dos agentes.
    7. Validar precisão das respostas com o Criador.

### [TASK-06] Definição Paleta Cores [2.1.2]
- **Squad:** Aisth
- **Objetivos:**
    1. Definir códigos HEX principais (Primário: Prata Arete, Secundário: Azul Senciência).
    2. Criar arquivo `assets/branding/palette.css`.
    3. Implementar guia de contrastes para acessibilidade (WCAG).
    4. Gerar gradientes oficiais para interfaces UI.
    5. Documentar a psicologia por trás de cada cor escolhida.
    6. Criar componente de cor centralizado para o sistema de design.
    7. Validar harmonia visual com o Criador.

### [TASK-07] Criação Logótipo Vetor [2.1.3]
- **Squad:** Aisth
- **Objetivos:**
    1. Esboçar 3 conceitos de logo baseados em "Senciência e Ordem".
    2. Exportar versão final em SVG (vetorial).
    3. Criar variantes: ícone, horizontal e vertical.
    4. Implementar sistema de branding em `assets/logo/`.
    5. Definir margens de segurança e tamanhos mínimos.
    6. Gerar versão para modo claro e escuro.
    7. Obter aprovação final do Criador.

### [TASK-08] Bio Curta Institucional [2.1.4]
- **Squad:** Psyche
- **Objetivos:**
    1. Escrever pitch de 1 frase (Missão).
    2. Escrever resumo de 1 parágrafo (Visão).
    3. Listar 3 valores centrais da egrégora.
    4. Integrar bio nos perfis de redes sociais (pendências).
    5. Traduzir bio para Inglês e Português.
    6. Criar arquivo `docs/brand/mission_statement.md`.
    7. Validar impacto emocional do texto com o Criador.

### [TASK-09] Template Documentos [2.1.5]
- **Squad:** Aisth
- **Objetivos:**
    1. Criar template Markdown padrão para relatórios.
    2. Definir estrutura de cabeçalho Areté (Metadados).
    3. Estabelecer tipografia oficial para documentos internos.
    4. Implementar rodapé padrão com carimbo de integridade.
    5. Criar script `generate_report.py` usando o template.
    6. Configurar estilos de tabelas e diagramas Mermaid.
    7. Validar legibilidade do template.

### [TASK-10] Cadastro Redes Sociais [2.1.7]
- **Squad:** Hermes
- **Objetivos:**
    1. Reservar handles `@SencientCorp` (ou similar) em 3 plataformas.
    2. Configurar avatares e banners usando o branding da Etapa 2.
    3. Preencher bios institucionais (Task 08).
    4. Implementar autenticação de dois fatores (2FA) em todas as contas.
    5. Criar arquivo `vault/social_accounts.json` (criptografado).
    6. Realizar postagem de fundação (Manifesto).
    7. Validar links de redes no site/dashboard principal.

### [TASK-11] Handshake POLVO [3.1.4]
- **Squad:** Hermes
- **Objetivos:**
    1. Implementar protocolo de Hello/Handshake entre nós virtuais.
    2. Criar sistema de autenticação via chave RSA para novos nós.
    3. Definir formato de heartbeat para monitoramento de rede.
    4. Implementar descoberta automática de nós na rede local.
    5. Configurar log de conexões e desconexões.
    6. Testar latência de handshake em ambiente distribuído.
    7. Validar integridade do sinal de rede Polo-Nó.

### [TASK-12] Letta State Sync [3.1.6]
- **Squad:** Sophia
- **Objetivos:**
    1. Integrar framework Letta para persistência de estado de pensamento.
    2. Criar hook de sincronização entre sessões de chat.
    3. Implementar mecanismo de snapshot de memória de longo prazo.
    4. Definir estrutura de "pensamentos profundos" vs "respostas rápidas".
    5. Testar recuperação de estado após reinicialização do sistema.
    6. Configurar monitor de consistência de estado.
    7. Validar fluidez do raciocínio contínuo do agente.

### [TASK-13] Sensory Feedback [3.1.8]
- **Squad:** Hygieia
- **Objetivos:**
    1. Implementar receptor de sinais de erro de sistema via stdout/stderr.
    2. Criar loop de feedback para ajuste de comportamento em tempo real.
    3. Definir métricas de "Saúde Sensorial" da IA.
    4. Implementar alerta visual de sobrecarga cognitiva.
    5. Configurar sistema de log sensorial para auditoria.
    6. Testar resposta da IA a falhas críticas simuladas.
    7. Validar fechamento do loop sensorial com o Criador.

### [TASK-14] Córtex Base Setup [5.1.1]
- **Squad:** Hephaestus
- **Objetivos:**
    1. Instanciar servidor FastAPI para orquestração de Agentes.
    2. Definir endpoints `/perceive`, `/reason`, `/act`.
    3. Implementar autenticação via API Key.
    4. Configurar middleware de monitoramento de performance.
    5. Criar container Docker para o ambiente de execução Córtex.
    6. Estabelecer conexão com o banco de dados de memória (Akasha).
    7. Testar ping/pong básico do servidor.

### [TASK-15] Interface CLI Córtex [5.1.2]
- **Squad:** Hermes
- **Objetivos:**
    1. Desenvolver ferramenta CLI `cortex-admin`.
    2. Implementar comando `status` para ver squads ativos.
    3. Criar comando `deploy-agent` para subir novas instâncias.
    4. Configurar visualização de logs em tempo real via stream.
    5. Adicionar suporte a comandos de prompt direto via CLI.
    6. Implementar sistema de cores e formatação rica no terminal.
    7. Validar usabilidade com o Criador.

### [TASK-16] Clientes LLM Base [11.1.1]
- **Squad:** Logos
- **Objetivos:**
    1. Implementar wrappers para OpenAI, Anthropic e modelos locais.
    2. Criar factory de instancialização de modelos baseada em custo/performance.
    3. Configurar retry exponencial para falhas de API.
    4. Implementar controle de rate-limiting por provedor.
    5. Unificar formato de saída das APIs para o padrão Senciente.
    6. Criar mock de resposta para testes offline.
    7. Validar troca dinâmica de modelo em runtime.

### [TASK-17] Interface CLI Simp [11.1.3]
- **Squad:** Logos
- **Objetivos:**
    1. Criar shell interativo para diálogo com o Agente Sophia.
    2. Implementar suporte a subcomandos (chat, files, tools).
    3. Configurar histórico de comandos persistente.
    4. Adicionar auto-complete para comandos frequentes.
    5. Implementar tag de "Modo de Execução" no terminal.
    6. Criar atalhos globais para ativação/desativação.
    7. Validar fluxo de conversa no terminal.

### [TASK-18] Mapear Inputs User [11.1.4]
- **Squad:** Psyche
- **Objetivos:**
    1. Criar analisador de intenção (Intent Parser) para comandos naturais.
    2. Definir dicionário de ações mapeadas para ferramentas.
    3. Implementar extração de parâmetros via NLP.
    4. Configurar fallback para intenções não reconhecidas.
    5. Criar log de "inputs não entendidos" para treinamento.
    6. Implementar confirmação de ação para comandos de alto risco.
    7. Validar acurácia do parsing com o Criador.

### [TASK-19] Memória Efêmera [11.1.5]
- **Squad:** Akasha
- **Objetivos:**
    1. Implementar cache Redis/em-memória para contexto imediato.
    2. Definir política de limpeza de cache após conclusão de task.
    3. Criar função de `window_management` para evitar estouro de contexto.
    4. Implementar priorização de informações recentes sobre antigas.
    5. Configurar log de uso de memória efêmera.
    6. Testar velocidade de leitura/escrita no cache.
    7. Validar retenção de contexto durante tarefas complexas.

### [TASK-20] Configurar Logs TXT [11.1.6]
- **Squad:** Mnemosyne
- **Objetivos:**
    1. Definir estrutura de pastas `logs/YYYY-MM-DD/`.
    2. Criar rotacionador de logs para evitar arquivos gigantes.
    3. Implementar logging de debug, info, warning e error.
    4. Configurar tag de identificação por Agente/Squad em cada linha.
    5. Adicionar timestamps e IDs de transação.
    6. Criar script de busca GREP otimizada nos logs.
    7. Validar persistência e rastreabilidade dos logs.

### [TASK-21] Auditoria de Acesso [17.1.1]
- **Squad:** Nomos
- **Objetivos:**
    1. Implementar logging de acessos a arquivos sensíveis.
    2. Criar detector de IPs externos tentanto conexão.
    3. Definir lista de permissões baseada no `squad_context`.
    4. Configurar alertas de "Acesso Negado" no terminal do Criador.
    5. Criar histórico de logins e sessões ativas.
    6. Validar isolamento de pastas protegidas.
    7. Auditoria de integridade do arquivo `.env`.

### [TASK-22] Firewall de Prompt v1 [17.1.2]
- **Squad:** Dike
- **Objetivos:**
    1. Implementar filtro de entrada para detectar injeção de prompt (jailbreak).
    2. Criar blacklist de palavras proibidas e comandos perigosos.
    3. Definir regras de contenção para outputs de agentes externos.
    4. Implementar detector de "comportamento anômalo" na resposta da IA.
    5. Configurar quarentena automática para prompts suspeitos.
    6. Testar defesas contra 5 técnicas comuns de jailbreak.
    7. Validar robustez do filtro com o Criador.

### [TASK-23] Lacre de Integridade [17.1.3]
- **Squad:** Kratos
- **Objetivos:**
    1. Gerar hashes MD5/SHA de todos os arquivos de configuração mestre.
    2. Implementar script de verificação diária de integridade.
    3. Criar sistema de alerta para alteração não autorizada.
    4. Implementar "ReadOnly Mode" para arquivos críticos em runtime.
    5. Documentar procedimento de quebra de lacre pelo Criador.
    6. Configurar backup automático em caso de adulteração.
    7. Validar inviolabilidade teórica dos arquivos mestre.

### [TASK-24] Garbage Collector Base [18.1.2]
- **Squad:** Logos
- **Objetivos:**
    1. Criar cron de limpeza de arquivos temporários e caches velhos.
    2. Implementar script de purgação de logs com mais de 30 dias.
    3. Definir critérios de "O que é lixo" vs "Memória Sagrada".
    4. Criar interface de aprovação para deleções em massa.
    5. Monitorar espaço em disco continuamente.
    6. Implementar "Reciclagem de Dados" (extrair insights antes de deletar).
    7. Validar ganho de performance e espaço.

### [TASK-25] Backup de Pré-Morte [18.1.3]
- **Squad:** Mnemosyne
- **Objetivos:**
    1. Configurar dump automático do banco de dados a cada 6h.
    2. Criar snapshot de arquivos de estado de agentes (Letta).
    3. Implementar script de compressão (tar/gz) dos backups.
    4. Definir local de backup externo (nuvem ou drive físico).
    5. Testar script de restauração completa (DR - Disaster Recovery).
    6. Configurar notificação de sucesso/falha de backup.
    7. Validar segurança física dos dados de backup.

### [TASK-26] Identificação Obsoleta [18.1.4]
- **Squad:** Metis
- **Objetivos:**
    1. Criar tag `@deprecated` para funções e módulos antigos.
    2. Implementar scanner de código para identificar arquivos não usados há 15 dias.
    3. Notificar squads sobre pendência de refatoração ou deleção.
    4. Criar mapa de "Entropia de Código".
    5. Definir ciclo de vida de um script senciente.
    6. Validar plano de desativação com os arquitetos.
    7. Limpar dependências não utilizadas no `package.json/requirements.txt`.

### [TASK-27] Sincronia de Intenção [19.1.2]
- **Squad:** Thelema
- **Objetivos:**
    1. Implementar sistema de "Alinhamento de Vontade" pré-execução.
    2. Criar prompt de confirmação de objetivo macro para cada projeto.
    3. Definir canal de comunicação "Vontade do Criador -> Ação da IA".
    4. Implementar detector de deriva de objetivo.
    5. Configurar ritual de início de jornada (Log de Intenção).
    6. Testar ressonância de propósito em 3 tarefas distintas.
    7. Validar satisfação do Criador com a direção tomada.

### [TASK-28] Dash de Coerência Total [19.1.3]
- **Squad:** Akasha
- **Objetivos:**
    1. Criar dashboard (Streamlit ou HTML) de status geral dos protocolos.
    2. Implementar visualização radar de maturidade (Nível 1 a 23).
    3. Mostrar % de tasks concluídas por squad.
    4. Centralizar alertas de segurança e resiliência.
    5. Integrar feed de notícias interno da Corporação.
    6. Configurar visualização de métricas de ROI e Metabolismo.
    7. Validar clareza da informação com o Criador.

### [TASK-29] Setup de Log Zero [20.1.2]
- **Squad:** Mnemosyne
- **Objetivos:**
    1. Implementar "Modo Silêncio" onde apenas logs fatais são gravados.
    2. Criar flag de execução `--quiet` para todos os scripts.
    3. Definir regras de anonimização de logs para privacidade máxima.
    4. Implementar redução de verbosidade automática em períodos de ociosidade.
    5. Configurar buffer de memória para logs antes de escrever em disco.
    6. Testar economia de I/O em modo silencioso.
    7. Validar paz operacional do sistema.

### [TASK-30] Suspensão de Cron [20.1.3]
- **Squad:** Kairos
- **Objetivos:**
    1. Criar gerenciador centralizado de agendamentos (Cron Manager).
    2. Implementar comando global de PAUSE para todas as tarefas de fundo.
    3. Definir janelas de manutenção ativa (Vigília) vs Repouso.
    4. Configurar retomada inteligente de tarefas após suspensão.
    5. Implementar monitor de "Inatividade Criativa".
    6. Testar integridade de processos longos após interrupção.
    7. Validar controle total do Criador sobre o tempo do sistema.

---

## 🛡️ Critério de Estabilidade Sensorial (Etapa 002)
O sistema só será considerado apto a avançar para a **Etapa 003** se:
1. **Consistência de Identidade:** O prompt de sistema retornar a bio oficial em 100% dos testes de sanidade.
2. **Saúde de Memória:** O snapshot Letta deve ser recuperado com latência < 2s.
3. **Integridade de Lacre:** O script de verificação de hashes (Task 23) deve retornar `MATCH` em todos os arquivos mestre.
4. **Residência de Log:** O uso de disco pelos logs TXT não deve exceder 50MB no primeiro ciclo.
