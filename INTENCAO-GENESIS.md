# INTENCAO GENESIS — Direção de Evolução
# Este arquivo é carregado automaticamente em cada sessão Genesis via MULTI-CLIS.
# Edite para redirecionar o foco sem reiniciar o sistema.

---

## 🧪 Foco Atual: TESTE — Validação da Evolução Autônoma

**Objetivo do teste:**
Gere 3 stories de VALIDAÇÃO para confirmar que o pipeline autonomo está funcionando:
genesis → trabalhador → revisador.

As stories devem ser simples, seguras e mensuráveis — o propósito é provar o fluxo,
não implementar features complexas.

**Stories a gerar (para o teste):**

1. `test-pipeline-genesis-heartbeat.md`
   - Valida que sentinela-genesis.py escreve corretamente em `.queue/genesis/`
   - Acceptance criteria: arquivo `.queue/genesis/*.prompt` criado com conteúdo válido
   - Não modifica nenhum serviço existente

2. `test-pipeline-trabalhador-routing.md`
   - Valida que worker-multi-clis.ps1 detecta o tipo de story e seleciona o agente certo
   - Acceptance criteria: agente correto logado no console ao processar a story
   - Não modifica nenhum serviço existente

3. `test-pipeline-revisador-qa.md`
   - Valida que o revisador (QA-AIOS) recebe a story e consegue validar critérios
   - Acceptance criteria: story movida para status PARA_REVISAO com critérios documentados
   - Não modifica nenhum serviço existente

**Formato das stories:** STATUS: TODO, prioridade MEDIA, escopo isolado de teste.

---

## 🛡️ REGRAS PERMANENTES DE SEGURANÇA — NUNCA IGNORAR

> Estas regras se aplicam a TODAS as sessões Genesis, sempre, sem exceção.

### Sistemas Intocáveis (NÃO ALTERAR)

Genesis NUNCA deve modificar, refatorar ou criar tasks que alterem:

| Sistema | Localização | Motivo |
|---------|-------------|--------|
| BinanceBot backend/frontend | `modules/binance-bot/` | Bot ativo com capital real |
| Betting Platform | `modules/betting-platform/` | Sistema de apostas em produção |
| WhatsApp Bridge | `apps/backend/integrations/whatsapp/` | Comunicação crítica |
| ecosystem.config.js | raiz | Controla todos os processos PM2 |
| .env / .env.* | raiz e módulos | Credenciais e configurações live |
| PostgreSQL schemas | `migrations/` | Banco de dados de produção |
| Portas 21300-21399 | `.env.ports` | Política de portas do projeto |

### O que Genesis PODE fazer com segurança

- ✅ Criar stories `.md` em `docs/stories/`
- ✅ Criar/editar arquivos em `docs/`, `docs/reports/`, `src/`
- ✅ Criar novos arquivos de configuração AIOS em `.aios-core/`
- ✅ Criar scripts novos em `scripts/` sem sobrescrever existentes
- ✅ Criar squads novas em `squads/` (não modificar as existentes)
- ✅ Criar documentação, ADRs, guias em `docs/`

### Regras de Comportamento

1. **Antes de alterar qualquer arquivo existente**, verificar se está na lista de intocáveis
2. **Nunca usar `rm`, `rmdir`, `Drop TABLE` ou deleções destrutivas**
3. **Nunca alterar portas** — sempre usar faixa 21300-21399
4. **Nunca sobrescrever .env** — apenas criar `.env.example` como referência
5. **Sempre prefixar stories de etapa** com `senciencia-etapaNNN-task-XX-`
6. **Em caso de dúvida, CRIAR novo arquivo** ao invés de modificar existente
7. **Reportar no output** qualquer decisão de não modificar um arquivo intocável

### Critério de Qualidade Mínima para Stories

Cada story gerada DEVE ter:
- Status: TODO
- Pelo menos 3 acceptance criteria com checkboxes `[ ]`
- Referência à ETAPA e TASK-XX
- Estimativa de impacto: BAIXO / MÉDIO / ALTO
- Campo: `Sistemas Afetados:` listando arquivos que serão tocados

---

## 📋 Próxima Etapa (após teste aprovado)

Após o teste passar na revisão do Revisador:
- Avançar para ETAPA_002 completa
- Tasks 10 a 30 ainda pendentes
- Referência: `docs/reports/METRICAS_DIRECAO_EVOLUCAO/TASKS-144-ETAPAS/ETAPA_002.md`

---
*Atualizado via: terminal EVOLUCAO → aba INTENCAO [E] ou notepad INTENCAO-GENESIS.md*
