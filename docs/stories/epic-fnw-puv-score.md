# Epic: FNW PUV Score - Pipeline Automatizado de Diagnostico Comercial

> **Epic ID:** EPIC-PUV-001
> **PRD:** `docs/prd/fnw-puv-score.md`
> **Briefing:** `docs/briefings/alex-research-slides-workflow.md`
> **Status:** Ready for Development
> **Created:** 2026-02-13
> **Author:** Pax (PO Agent)
> **Squad:** puv-score

---

## Overview

Automatizar o pipeline FNW PUV Score: receber link de presenca digital → scraping → analise IA → gerar 3 entregaveis (scorecard, slides, documento) → entregar via WhatsApp.

---

## Stories

### Sprint 1: Foundation (MVP Scorecard via CLI)

---

### Story PUV-001: Squad AIOS puv-score
**Prioridade:** P0 | **Estimativa:** S (1-2 dias) | **Dependencias:** Nenhuma

**Como** desenvolvedor do AIOS,
**Quero** uma squad `puv-score` completa,
**Para que** o pipeline seja estruturado e invocavel via AIOS.

**Tasks:**
- [ ] Criar `squads/puv-score/squad.yaml` com manifest
- [ ] Criar `squads/puv-score/agents/puv-agent.md`
- [ ] Criar 9 task files em `squads/puv-score/tasks/`
- [ ] Criar `squads/puv-score/templates/puv-prompt.md` (rubrica PUV)
- [ ] Criar `squads/puv-score/data/puv-rubric.json`
- [ ] Criar `.claude/commands/Squads/PuvScore-AIOS.md` (slash command)

**Acceptance Criteria:**
- [ ] Squad carrega via squad-loader sem erros
- [ ] `/Squads:PuvScore-AIOS` ativa o agente corretamente
- [ ] Todas as tasks sao invocaveis via agent commands

---

### Story PUV-002: Scraping Engine (4 canais)
**Prioridade:** P0 | **Estimativa:** M (3-5 dias) | **Dependencias:** Playwright

**Como** o pipeline PUV,
**Quero** extrair dados de 4 tipos de pagina web,
**Para que** a IA tenha informacoes estruturadas para pontuar.

**Tasks:**
- [ ] Instalar/verificar Playwright no ambiente
- [ ] Implementar `scraper.js` com interface CLI
- [ ] Scraper Website: titulo, meta, headlines, CTA, conteudo principal
- [ ] Scraper Google Business: reviews, rating, descricao, categorias, fotos
- [ ] Scraper Instagram: bio, followers, posts recentes (10), engagement rate, hashtags, CTA bio
- [ ] Scraper Mercado Livre: titulo, descricao, fotos, preco, reputacao vendedor, reviews
- [ ] Output JSON padronizado para todos os canais
- [ ] Tratamento de erros (timeout 30s, pagina inacessivel, captcha)
- [ ] Testes com URLs reais de cada canal

**Acceptance Criteria:**
- [ ] `node squads/puv-score/scripts/scraper.js --canal website --link URL` retorna JSON
- [ ] `node squads/puv-score/scripts/scraper.js --canal google --link URL` retorna JSON
- [ ] `node squads/puv-score/scripts/scraper.js --canal instagram --link URL` retorna JSON
- [ ] `node squads/puv-score/scripts/scraper.js --canal mercadolivre --link URL` retorna JSON
- [ ] JSON output tem campos padronizados: `{canal, url, data, scraped_at, content: {...}}`
- [ ] Erro retorna JSON com `{error: true, message: "..."}`

---

### Story PUV-003: Motor de Analise PUV Score
**Prioridade:** P0 | **Estimativa:** S (1-2 dias) | **Dependencias:** PUV-002

**Como** o pipeline PUV,
**Quero** analisar dados scraped usando Claude API com rubrica PUV,
**Para que** cada negocio receba um score de 0-20 preciso e fundamentado.

**Tasks:**
- [ ] Criar prompt estruturado com rubrica PUV Score (5 criterios x 0-4)
- [ ] Implementar `analyzer.js` com Claude API call
- [ ] Output JSON: `{score_total, classificacao, criterios: [{nome, score, justificativa}], top3_acoes, oportunidades_salto}`
- [ ] Analise por persona quando detectada (ex: morador vs investidor)
- [ ] Secoes do documento (6 secoes) geradas na mesma call
- [ ] Teste de consistencia: mesma URL = variacao < 2pts entre runs

**Acceptance Criteria:**
- [ ] `node squads/puv-score/scripts/analyzer.js --data scraped.json` retorna analise completa
- [ ] Score total eh soma dos 5 criterios (0-20)
- [ ] Cada criterio tem justificativa textual de 2-3 frases
- [ ] Top 3 acoes sao especificas e acionaveis (nao genericas)
- [ ] Match > 90% com analise manual do Alex nos casos de referencia

---

### Story PUV-004: Gerador de Scorecard (Imagem)
**Prioridade:** P0 | **Estimativa:** M (3-5 dias) | **Dependencias:** PUV-003

**Como** o pipeline PUV,
**Quero** gerar uma imagem JPG com gauge visual do PUV Score,
**Para que** o cliente receba um infografico profissional como amostra gratis.

**Tasks:**
- [ ] Instalar/verificar Puppeteer no ambiente
- [ ] Criar template HTML `scorecard.html` com gauge (ponteiro tipo velocimetro)
- [ ] Implementar barras/radar dos 5 criterios
- [ ] Area de top 3 acoes recomendadas
- [ ] Score grande centralizado + classificacao
- [ ] QR code "DESBLOQUEAR RELATORIO COMPLETO" (placeholder URL)
- [ ] Branding FNW (cores, tipografia)
- [ ] Implementar `scorecard-gen.js` (injeta dados no template → screenshot)
- [ ] Output: JPG 1080x1920 (vertical/stories)

**Acceptance Criteria:**
- [ ] `node squads/puv-score/scripts/scorecard-gen.js --analysis analysis.json --output scorecard.jpg` gera imagem
- [ ] Imagem contem gauge visual com ponteiro no score correto
- [ ] Todos os 5 criterios visiveis com score individual
- [ ] Top 3 acoes legiveis
- [ ] QR code escaneavel (mesmo que URL placeholder)
- [ ] Visual profissional comparavel a referencia `doc_1770992119264.jpg`

---

### Story PUV-005: Pipeline Orquestrador (CLI)
**Prioridade:** P0 | **Estimativa:** M (3-5 dias) | **Dependencias:** PUV-002, PUV-003, PUV-004

**Como** operador do sistema,
**Quero** um comando unico que execute todo o fluxo,
**Para que** uma invocacao produza o scorecard completo.

**Tasks:**
- [ ] Implementar `puv-pipeline.js` que orquestra: scrape → analyze → generate
- [ ] CLI: `node squads/puv-score/scripts/puv-pipeline.js --canal website --link URL --output ./results/`
- [ ] Criar diretorio de output com estrutura: `scorecard.jpg`, `analysis.json`, `scraped.json`
- [ ] Logs de cada etapa com timestamps e duracao
- [ ] Se etapa falha, salvar progresso parcial e reportar erro
- [ ] Medir tempo total (target < 3 min)

**Acceptance Criteria:**
- [ ] Comando unico produz scorecard JPG a partir de URL
- [ ] Output organizado em diretorio estruturado
- [ ] Logs mostram progresso de cada etapa
- [ ] Tempo total < 3 minutos para uma analise completa
- [ ] Teste end-to-end com URL real do nicho imobiliario

---

### Sprint 2: Monetizacao (Slides + Documento + WhatsApp)

---

### Story PUV-006: Gerador de Slides (PDF 10+)
**Prioridade:** P1 | **Estimativa:** L (5-8 dias) | **Dependencias:** PUV-003

**Como** o pipeline PUV,
**Quero** gerar uma apresentacao de 10+ slides em PDF,
**Para que** o cliente receba diagnostico completo pos-pagamento.

**Tasks:**
- [ ] Criar template HTML multi-slide com layout profissional
- [ ] Slide 1: Capa (nome do negocio + PUV Score + branding)
- [ ] Slide 2: Score Overview (gauge + classificacao)
- [ ] Slides 3-7: Um slide por criterio (score, justificativa, exemplos do alvo)
- [ ] Slide 8: Oportunidades de Salto (de 3 para 4)
- [ ] Slide 9: Top 5 Acoes Priorizadas
- [ ] Slide 10: Proximos Passos + Contato + QR
- [ ] Implementar `slides-gen.js` (dados → HTML multi-page → PDF)
- [ ] Design responsivo para impressao A4 landscape

**Acceptance Criteria:**
- [ ] `node squads/puv-score/scripts/slides-gen.js --analysis analysis.json --output slides.pdf` gera PDF
- [ ] PDF contem minimo 10 slides
- [ ] Dados do alvo integrados em cada slide (nao sao genericos)
- [ ] Design profissional comparavel a referencia `doc_1770992121388.pdf`

---

### Story PUV-007: Gerador de Documento PDF (6 secoes)
**Prioridade:** P1 | **Estimativa:** M (3-5 dias) | **Dependencias:** PUV-003

**Como** o pipeline PUV,
**Quero** gerar um documento PDF com plano detalhado de reposicionamento,
**Para que** o cliente receba recomendacoes acionaveis pos-pagamento.

**Tasks:**
- [ ] Criar template Markdown com 6 secoes
- [ ] Secao 1: Diagnostico de Performance (dados quantitativos + score)
- [ ] Secao 2: Desconstrucao da PUV (analise profunda cada criterio)
- [ ] Secao 3: Reposicionamento por Persona (identificar e segmentar audiencias)
- [ ] Secao 4: Engenharia de Linguagem (antes vs depois de copy)
- [ ] Secao 5: Estrategias de Autoridade (prova social, credibilidade)
- [ ] Secao 6: Plano de Acao Imediato (acoes com timeline)
- [ ] Implementar `document-gen.js` (dados → Markdown → HTML → PDF)
- [ ] Formatacao profissional com headers, tabelas, destaques

**Acceptance Criteria:**
- [ ] `node squads/puv-score/scripts/document-gen.js --analysis analysis.json --output report.pdf` gera PDF
- [ ] PDF contem todas as 6 secoes com conteudo especifico do alvo
- [ ] Qualidade comparavel a referencia `doc_1770992119541.pdf`
- [ ] PDF formatado com tipografia profissional

---

### Story PUV-008: Integracao WhatsApp (Trigger + Entrega)
**Prioridade:** P1 | **Estimativa:** M (3-5 dias) | **Dependencias:** PUV-005, WhatsApp Bridge

**Como** cliente,
**Quero** enviar um link no grupo WhatsApp e receber a analise,
**Para que** eu nao precise usar CLI.

**Tasks:**
- [ ] Detector de trigger no grupo: `#puv {canal} {link}` ou link direto
- [ ] Resposta imediata: "Analisando [link]... Aguarde ~2 min"
- [ ] Execucao do pipeline em background
- [ ] Envio do scorecard (imagem) como resposta no grupo
- [ ] Mensagem com link para relatorio completo (pos-pagamento)
- [ ] Tratamento de erro: informar cliente se falhou
- [ ] Integracao com sentinela existente

**Acceptance Criteria:**
- [ ] Mensagem `#puv website https://site.com` no grupo WhatsApp trigga analise
- [ ] Scorecard enviado como imagem no grupo em < 3 min
- [ ] Pipeline completo funciona end-to-end via WhatsApp

---

### Story PUV-009: Pipeline Completo (3 outputs)
**Prioridade:** P1 | **Estimativa:** S (1-2 dias) | **Dependencias:** PUV-005, PUV-006, PUV-007

**Como** operador do sistema,
**Quero** que o pipeline gere todos os 3 outputs de uma vez,
**Para que** o pacote completo esteja disponivel apos pagamento.

**Tasks:**
- [ ] Atualizar `puv-pipeline.js` para gerar 3 outputs em paralelo
- [ ] Output: `scorecard.jpg` + `slides.pdf` + `report.pdf` + `analysis.json`
- [ ] Flag `--full` para gerar tudo, default gera so scorecard
- [ ] Opcao `--deliver whatsapp --chat {jid}` para entrega automatica

**Acceptance Criteria:**
- [ ] `node puv-pipeline.js --canal website --link URL --output ./results/ --full` gera 3 arquivos
- [ ] Geracao em paralelo dos 3 outputs (nao sequencial)
- [ ] Tempo total < 5 minutos para pipeline completo

---

## Dependency Graph

```
PUV-001 (Squad) ──────────────────────────────────────────┐
                                                          │
PUV-002 (Scraping) ──> PUV-003 (Analise) ──> PUV-004 (Scorecard) ──> PUV-005 (Pipeline CLI)
                                         │                                       │
                                         ├──> PUV-006 (Slides)   ──> PUV-009 (Full Pipeline)
                                         │                                       │
                                         └──> PUV-007 (Documento) ──────────────┘
                                                                                │
                                              PUV-008 (WhatsApp) <──────────────┘
```

---

## Metricas de Sucesso

| Metrica | Sprint 1 Target | Sprint 2 Target |
|---------|-----------------|-----------------|
| Stories completadas | 5/5 (PUV-001 a PUV-005) | 4/4 (PUV-006 a PUV-009) |
| Pipeline funcional via CLI | Scorecard only | 3 outputs completos |
| Tempo de processamento | < 3 min | < 5 min |
| Validacao Alex | Scorecard aprovado | Pipeline completo aprovado |

---

*— Epic FNW PUV Score | 9 Stories | 2 Sprints | Pax (PO)*
