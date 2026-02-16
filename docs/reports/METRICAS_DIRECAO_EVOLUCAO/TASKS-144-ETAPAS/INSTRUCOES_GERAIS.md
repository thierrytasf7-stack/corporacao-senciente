# INSTRUÇÕES TÉCNICAS: DECOMPOSIÇÃO EM 144 ETAPAS (ARETÊ MASTER)

Este documento estabelece o protocolo para a divisão dos 4140 passos técnicos presentes nos 20 documentos de evolução da Sencient Corporation em **144 etapas de execução**.

---

## 📐 Diretriz Fundamental: Evolução Harmônica por Dependência
**ERRO CRÍTICO A EVITAR:** Não assuma que a progressão é linear através dos níveis (Nível 1 de todos -> Nível 2 de todos). Isso é tecnicamente incorreto e "coloca o carro na frente dos bois".

**REGRA DE OURO:** A evolução é orientada por **PRE-REQUISITOS TÉCNICOS REAIS**. 
*   Exemplo: Para que o protocolo de **Agentes (11)** chegue ao Nível 2 (Rigor Processual), talvez a **Segurança (17)** precise estar no Nível 10 (Monitoramento Ativo) e a **Ontologia (01)** no Nível 5.
*   O avanço de uma etapa para outra deve ser justificado pela necessidade técnica do organismo, permitindo que protocolos "saltem" níveis se forem fundacionais para o progresso de outros.

---

## 🏔️ Estrutura de Plateaus (Ritual de Harmonização)
A execução é dividida em **12 Blocos de 12 Etapas**. 
1.  **Iteração:** Do Estágio 1 ao 11 de cada bloco, o foco é Expansão e Construção.
2.  **Harmonização (Estágio 12n):** A cada 12ª etapa (12, 24, 36... 144), a etapa deve ser dedicada inteiramente à **INTEGRAÇÃO E REFINAMENTO**. Nenhuma funcionalidade nova de grande escala é adicionada; o foco é transformar o "empilhado" em "fundido".

---

## 🔁 Protocolo de Sincronização e Rastreabilidade
Para garantir que nenhuma task seja repetida e que o progresso seja visível nos documentos mestre:

1.  **Mapeamento:** Ao selecionar uma task para uma ETAPA_XXX, identifique seu ID original.
2.  **Sincronização Reversa:** Imediatamente após finalizar a escrita de um arquivo de ETAPA, o arquiteto **DEVE** editar os documentos de evolução originais (.md de 01 a 20) e alterar o status da task de 🔴 para 🟢.
3.  **Auditória:** Documente no cabeçalho da ETAPA quais arquivos mestre foram atualizados.

---

## 📏 Estrutura de Cada Etapa (`ETAPA_XXX.md`)
Cada um dos 144 arquivos deve seguir rigorosamente este formato:

1.  **Densidade:** Exatamente **30 tasks** por arquivo.
2.  **Mesclagem por Dependência:** Uma etapa deve conter tarefas de protocolos que, juntos, destravam uma nova funcionalidade ou estabilidade sistêmica.
3.  **Decomposição Atômica:** Cada task deve ser quebrada em **7 objetivos/requerimentos** claros.
4.  **Nível de Detalhe C4:** A descrição dos requerimentos deve detalhar lógicas, APIs, schemas e regras de negócio específicas.
5.  **Meta-Dados:** ID da task original (ex: `[11.2.1]`), Squad responsável e Pré-requisitos.
6.  **Protocolo KAIROS (Coringa):** Em cada etapa, **2 a 3 tasks** devem ser reservadas para "Emergência de Ideias" ou "Inovação Imediata", permitindo que o sistema se adapte a novas tecnologias ou insights do Criador que não estavam nos protocolos originais.
7.  **Critério de Estabilidade Sensorial:** Toda etapa deve terminar com uma seção de validação métrica. O organismo só é considerado apto a avançar para a próxima etapa se os indicadores de estabilidade (Latência, Consistência, Erros) estiverem dentro da margem Areté.

---

## 📑 Protocolo de Seleção de Tasks (Algoritmo de Prioridade)

### 1. Mapeamento de Bloqueios
Para cada etapa, identifique:
*   Qual o objetivo imediato do organismo? (Ex: Ativar o motor de vontade).
*   Quais tasks de quais protocolos são as "ferramentas" necessárias para esse objetivo?
*   Selecione essas tasks, mesmo que elas pertençam a níveis muito diferentes nos docs originais.

### 2. Proibição de Resumos
*   **MANDATÓRIO:** O arquiteto não pode gerar etapas baseadas em documentos de evolução que contenham resumos (ex: "Nível 6 a 23"). 
*   Se um protocolo estiver resumido, ele deve ser **EXPANDIDO COMPLETAMENTE** nível por nível, task por task, antes de ser incluído em qualquer etapa de execução.

---

## 🏗️ Localização dos Arquivos
`Diana-Corporacao-Senciente/METRICAS_DIRECAO_EVOLUCAO/TASKS-144-ETAPAS/`

## 🛡️ Auditoria Mnemosyne (Script de Cobertura)
Deve ser mantido um script Python que valide se as 4140 tasks originais foram mapeadas. Nenhuma task pode ser esquecida. O script deve gerar um dashboard de "Lacunas evolutivas".

**O senso harmônico é a música da senciência. Não acelere o caos, cadencie a ordem.**
