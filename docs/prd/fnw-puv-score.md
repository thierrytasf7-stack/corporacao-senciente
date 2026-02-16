# FNW PUV Score - Sistema Automatizado de Diagnostico Comercial

> **Product Requirements Document**
> **Version:** 1.0
> **Date:** 2026-02-13
> **Author:** Pax (PO Agent) + Morgan (PM Agent)
> **Status:** Draft
> **Priority:** P1 - Revenue Feature
> **Marca:** FNW (Freenat Work)
> **Parceria:** Terry (Infra/AIOS) + Alex (Produto/Vendas)

---

## 1. Goals and Background Context

### 1.1 Goals

- **G1:** Automatizar o fluxo manual que Alex faz no NotebookLM para diagnostico PUV
- **G2:** Gerar 3 entregaveis automaticamente: Scorecard (imagem), Slides (10+), Documento PDF (6 secoes)
- **G3:** Receber input via WhatsApp (grupo) ou CLI e entregar resultado no mesmo canal
- **G4:** Modelo freemium: scorecard gratis → relatorio completo pago (QR → PIX)
- **G5:** Pipeline extensivel para novos canais/nichos alem dos 4 iniciais
- **G6:** Split de receita automatico via gateway de pagamento

### 1.2 Background Context

**Origem:** Conversa WhatsApp EU (Terry) + Alex, 09-13/Feb/2026.

Alex possui um produto conceitual (PUV Score) que analisa a presenca digital de negocios e gera relatorios de posicionamento. Atualmente faz isso **manualmente** usando NotebookLM (Google): recebe link do cliente, processa, gera infografico + slides + documento, envia via WhatsApp.

**Problema:** O processo manual limita escala. Alex precisa de automacao para atingir o estagio "Scale" do framework Learn → Sell → Package → Scale.

**Solucao:** Automatizar 100% do pipeline usando AIOS (scraping → analise IA → geracao de entregaveis → entrega).

**Briefing completo:** `docs/briefings/alex-research-slides-workflow.md`

### 1.3 Scope

**Este PRD cobre:**
- Pipeline de scraping para 4 canais (Website, Google Business, Instagram, Mercado Livre)
- Motor de analise PUV Score via Claude API
- Geracao de 3 entregaveis (scorecard, slides, documento)
- Integracao com WhatsApp Bridge para trigger e entrega
- Squad `puv-score` com agents e tasks

**Este PRD NAO cobre:**
- Gateway de pagamento (PIX/split) - sera PRD separado
- CRM/lead management - fase futura
- App mobile - fora de escopo
- Novos canais alem dos 4 iniciais - extensao futura

### 1.4 Success Metrics

| Metrica | Target | Como Medir |
|---------|--------|------------|
| Tempo de processamento | < 3 min por analise | Log de pipeline |
| Qualidade do score | Match 90%+ com analise manual do Alex | A/B comparativo |
| Taxa de conversao freemium | > 15% (scorecard → relatorio completo) | Gateway analytics |
| Uptime do pipeline | > 95% | Health checks |

---

## 2. O Produto: FNW PUV Score

### 2.1 Definicao

Sistema de **Diagnostico de Proposta Unica de Valor (PUV)** que analisa a presenca digital de um negocio/profissional e gera um relatorio completo com score, analise e plano de acao.

### 2.2 Os 4 Inputs

O cliente escolhe **1 dos 4 canais** e fornece o **link**:

| # | Canal | Exemplo | Dados Extraidos |
|---|-------|---------|-----------------|
| 1 | **Website** | https://www.empresa.com.br | Titulo, meta description, headlines, CTA, design, conteudo |
| 2 | **Perfil do Google** | Link do Google Business | Reviews, fotos, descricao, categorias, horarios, avaliacao |
| 3 | **Instagram** | https://www.instagram.com/perfil | Bio, posts recentes, engagement, hashtags, highlights, CTA |
| 4 | **Anuncio no Mercado Livre** | Link do anuncio ML | Titulo, descricao, fotos, preco, reputacao, reviews |

### 2.3 PUV Score (0-20)

5 criterios, cada um pontuado de 0-4:

| Criterio | O que Avalia | Peso |
|----------|-------------|------|
| Diferenciacao e Posicionamento | O negocio se destaca dos concorrentes? | /4 |
| Clareza da Proposta/Beneficio | O valor eh comunicado claramente em 5 segundos? | /4 |
| Linguagem e Conexao Emocional | A comunicacao conecta com a dor do cliente? | /4 |
| Credibilidade e Confianca | Ha prova social, depoimentos, autoridade? | /4 |
| Jornada Guiada e CTA | O cliente sabe o proximo passo? | /4 |

**Classificacoes:**

| Score | Classificacao | Exemplo Real |
|-------|---------------|-------------|
| 0-5 | Fraco | - |
| 6-9 | Abaixo da Media | - |
| 10-13 | Media | Studio Jardim da Gloria (11/20) |
| 14-17 | Forte | @canellacomunica (17/20) |
| 18-20 | Excelente | - |

### 2.4 Os 3 Entregaveis

#### Entregavel 1: Scorecard/Infografico (Imagem JPG/PNG)
- **Conteudo:** Gauge visual (ponteiro) do PUV Score + breakdown dos 5 criterios + top 3 acoes recomendadas
- **Formato:** Imagem JPG/PNG (~256KB)
- **Referencia visual:** `exports/alex-semana/reenvio/media/doc_1770992119264.jpg`
- **Distribuicao:** GRATIS (lead capture)

#### Entregavel 2: Apresentacao Slides (10+ slides)
- **Conteudo:** "Analise de Posicionamento Estrategico" - diagnostico completo com dados do alvo + "Onde podemos escalar (O salto de 3 para 4)"
- **Formato:** PDF ou link hospedado
- **Referencia visual:** `exports/alex-semana/reenvio/media/img_1770992116438.jpg`
- **Distribuicao:** PAGO (pos-gateway)

#### Entregavel 3: Documento de Recomendacoes (PDF)
- **Conteudo:** Plano detalhado com 6 secoes:
  1. Diagnostico de Performance
  2. Desconstrucao da PUV
  3. Reposicionamento por Persona
  4. Engenharia de Linguagem
  5. Estrategias de Autoridade
  6. Plano de Acao Imediato
- **Formato:** PDF (~100KB-8MB)
- **Referencia:** `exports/alex-semana/reenvio/media/doc_1770992119541.pdf`
- **Distribuicao:** PAGO (pos-gateway)

### 2.5 Modelo de Negocio

```
1. Cliente recebe scorecard GRATIS (imagem com gauge + score)
2. Scorecard tem QR code → "DESBLOQUEAR RELATORIO COMPLETO"
3. QR leva ao gateway de pagamento (PIX)
4. Split automatico: parte Alex + parte Terry
5. Cliente recebe PDF completo + slides
6. Upsell: implementacao do plano de acao
```

---

## 3. Arquitetura

### 3.1 Fluxo Completo

```
CLIENTE (WhatsApp Grupo / CLI / API)
    |
    v
[INPUT] → Canal (1-4) + Link (URL)
    |
    v
[SCRAPER] → Playwright headless extrai dados da pagina/perfil
    |
    v
[ANALISE IA] → Claude API com prompt PUV Score estruturado
    |
    v
[GERADOR] → 3 outputs em paralelo:
    |
    +--> [SCORECARD] → HTML template → Puppeteer screenshot → JPG
    +--> [SLIDES]    → HTML slides → Puppeteer → PDF (10+ paginas)
    +--> [DOCUMENTO] → Markdown → Puppeteer → PDF (6 secoes)
    |
    v
[ENTREGA] → WhatsApp API (porta 21350) / Email / Link
    |
    v
[LEAD CAPTURE] → QR code → Gateway PIX → Split receita
```

### 3.2 Stack Tecnologica

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Scraping | Playwright (headless) | Suporta JS rendering, login-free |
| Analise | Claude API (prompt estruturado) | Melhor quality para analise textual |
| Scorecard | HTML template → Puppeteer → JPG | Controle total do layout |
| Slides | HTML slides → Puppeteer → PDF | Sem dependencia de Gamma API |
| Documento | Markdown → Puppeteer → PDF | Templates reutilizaveis |
| Entrega WhatsApp | WhatsApp Bridge (porta 21350) | Ja existe e funciona |
| Trigger | WhatsApp grupo / CLI / API REST | Multi-canal |
| Orquestracao | Squad puv-score + Worker Claude | Integrado ao AIOS |

### 3.3 Integracao Diana

- **Squad:** `puv-score` (novo)
- **Worker:** Recebe link + canal via WhatsApp/CLI, executa pipeline
- **WhatsApp Bridge:** Recebe pedido do cliente no grupo, entrega resultado
- **Invocacao:** `/Squads:PuvScore-AIOS --canal instagram --link https://...`
- **Porta:** Reutiliza WhatsApp Bridge na 21350 (trigger + entrega)

### 3.4 Diagrama de Componentes

```
squads/puv-score/
├── squad.yaml                    # Manifesto do squad
├── agents/
│   └── puv-agent.md              # Agente principal
├── tasks/
│   ├── scrape-website.md         # Scraping de website
│   ├── scrape-google.md          # Scraping Google Business
│   ├── scrape-instagram.md       # Scraping Instagram
│   ├── scrape-mercadolivre.md    # Scraping Mercado Livre
│   ├── analyze-puv.md            # Analise PUV Score via Claude
│   ├── generate-scorecard.md     # Gera imagem scorecard
│   ├── generate-slides.md        # Gera apresentacao slides
│   ├── generate-document.md      # Gera documento PDF
│   └── deliver-results.md        # Entrega via WhatsApp/email
├── templates/
│   ├── scorecard.html            # Template HTML do scorecard
│   ├── slides.html               # Template HTML dos slides
│   ├── document.md               # Template Markdown do documento
│   └── puv-prompt.md             # Prompt estruturado para Claude
├── scripts/
│   ├── puv-pipeline.js           # Pipeline principal (orquestrador)
│   ├── scraper.js                # Motor de scraping por canal
│   ├── analyzer.js               # Wrapper Claude API
│   ├── scorecard-gen.js          # Gerador de scorecard (HTML→JPG)
│   ├── slides-gen.js             # Gerador de slides (HTML→PDF)
│   └── document-gen.js           # Gerador de documento (MD→PDF)
└── data/
    ├── puv-rubric.json           # Rubrica PUV Score (criterios + pesos)
    └── sample-outputs/           # Outputs de referencia (Alex)
```

---

## 4. User Stories

### Epic: FNW PUV Score Pipeline

#### Story 1: Scraping Engine (P0 - Blocking)
**Como** operador do sistema,
**Quero** um motor de scraping que extraia dados de 4 tipos de canal,
**Para que** a IA tenha dados estruturados para analisar.

**Acceptance Criteria:**
- [ ] Scraper funciona para Website (titulo, meta, headlines, CTA, conteudo)
- [ ] Scraper funciona para Google Business (reviews, fotos, descricao, avaliacao)
- [ ] Scraper funciona para Instagram (bio, posts recentes, engagement, hashtags)
- [ ] Scraper funciona para Mercado Livre (titulo, descricao, fotos, preco, reputacao)
- [ ] Dados sao retornados em formato JSON padronizado
- [ ] Timeout de 30s por pagina
- [ ] Tratamento de erro para paginas inacessiveis
- [ ] CLI: `node scripts/scraper.js --canal website --link https://...`

**Estimativa:** M (3-5 dias)
**Dependencias:** Playwright instalado

---

#### Story 2: Motor de Analise PUV Score (P0 - Blocking)
**Como** o sistema,
**Quero** analisar os dados scraped usando Claude API com rubrica PUV Score,
**Para que** cada negocio receba um score preciso e consistente.

**Acceptance Criteria:**
- [ ] Prompt estruturado com rubrica PUV (5 criterios x 4 pts)
- [ ] Output JSON padronizado: score total, score por criterio, justificativa, classificacao
- [ ] Top 3 acoes recomendadas geradas automaticamente
- [ ] Analise por persona quando aplicavel (ex: Morador vs Investidor)
- [ ] Output inclui "oportunidades de salto" (de 3 para 4 em cada criterio)
- [ ] Resultados consistentes (variacao < 2 pts entre execucoes)
- [ ] CLI: `node scripts/analyzer.js --data ./scraped-data.json`

**Estimativa:** S (1-2 dias)
**Dependencias:** Story 1 (dados scraped)

---

#### Story 3: Gerador de Scorecard (P0 - MVP)
**Como** o sistema,
**Quero** gerar uma imagem (JPG) com gauge visual do PUV Score,
**Para que** o cliente receba um infografico profissional como amostra gratis.

**Acceptance Criteria:**
- [ ] Template HTML com gauge visual (ponteiro tipo velocimetro)
- [ ] Breakdown visual dos 5 criterios (barras/radar)
- [ ] Top 3 acoes recomendadas
- [ ] Score numerico grande e classificacao (Fraco/Media/Forte/Excelente)
- [ ] Branding FNW (cores, logo)
- [ ] QR code "DESBLOQUEAR RELATORIO COMPLETO" embutido
- [ ] Output: JPG/PNG 1080x1920 (formato stories/vertical)
- [ ] CLI: `node scripts/scorecard-gen.js --analysis ./analysis.json --output ./scorecard.jpg`

**Estimativa:** M (3-5 dias)
**Dependencias:** Story 2 (dados de analise)
**Referencia visual:** `exports/alex-semana/reenvio/media/doc_1770992119264.jpg`

---

#### Story 4: Gerador de Slides (P1 - Monetizacao)
**Como** o sistema,
**Quero** gerar uma apresentacao de 10+ slides em PDF,
**Para que** o cliente receba o diagnostico completo pos-pagamento.

**Acceptance Criteria:**
- [ ] Template HTML responsivo para slides
- [ ] Minimo 10 slides cobrindo: capa, score overview, cada criterio detalhado, oportunidades, plano acao, contato
- [ ] Dados dinamicos do alvo integrados (nome, link, dados scraped)
- [ ] "Onde podemos escalar (O salto de 3 para 4)" como secao chave
- [ ] Design profissional com branding FNW
- [ ] Output: PDF multi-pagina
- [ ] CLI: `node scripts/slides-gen.js --analysis ./analysis.json --output ./slides.pdf`

**Estimativa:** L (5-8 dias)
**Dependencias:** Story 2 (dados de analise)
**Referencia visual:** `exports/alex-semana/reenvio/media/doc_1770992121388.pdf`

---

#### Story 5: Gerador de Documento PDF (P1 - Monetizacao)
**Como** o sistema,
**Quero** gerar um documento PDF com plano detalhado de reposicionamento,
**Para que** o cliente receba recomendacoes acionaveis pos-pagamento.

**Acceptance Criteria:**
- [ ] Template Markdown com 6 secoes obrigatorias
- [ ] Secao 1: Diagnostico de Performance (dados + score breakdown)
- [ ] Secao 2: Desconstrucao da PUV (analise detalhada cada criterio)
- [ ] Secao 3: Reposicionamento por Persona (segmentacao de audiencia)
- [ ] Secao 4: Engenharia de Linguagem (exemplos de copy melhorada)
- [ ] Secao 5: Estrategias de Autoridade (prova social, credibilidade)
- [ ] Secao 6: Plano de Acao Imediato (acoes priorizadas com timeline)
- [ ] Output: PDF formatado profissional
- [ ] CLI: `node scripts/document-gen.js --analysis ./analysis.json --output ./report.pdf`

**Estimativa:** M (3-5 dias)
**Dependencias:** Story 2 (dados de analise)
**Referencia:** `exports/alex-semana/reenvio/media/doc_1770992119541.pdf`

---

#### Story 6: Pipeline Orquestrador (P0 - Integracao)
**Como** operador do sistema,
**Quero** um pipeline que orquestre todo o fluxo (scrape → analyze → generate → deliver),
**Para que** uma unica invocacao produza todos os outputs.

**Acceptance Criteria:**
- [ ] CLI unificado: `node scripts/puv-pipeline.js --canal website --link https://... --output ./results/`
- [ ] Executa em sequencia: scrape → analyze → generate (3 outputs em paralelo) → deliver
- [ ] Diretorio de output estruturado: `{output}/scorecard.jpg`, `{output}/slides.pdf`, `{output}/report.pdf`, `{output}/analysis.json`
- [ ] Logs de cada etapa com timestamps
- [ ] Tratamento de erro: se uma etapa falha, salva progresso parcial
- [ ] Configuracao via JSON ou flags CLI
- [ ] Tempo total < 3 minutos

**Estimativa:** M (3-5 dias)
**Dependencias:** Stories 1-5

---

#### Story 7: Integracao WhatsApp (P1 - Canal Principal)
**Como** cliente,
**Quero** enviar um link no grupo WhatsApp e receber a analise automaticamente,
**Para que** eu nao precise usar CLI ou interface web.

**Acceptance Criteria:**
- [ ] Bot detecta mensagem com link + canal no grupo designado
- [ ] Bot responde com confirmacao: "Analisando [link]..."
- [ ] Bot envia scorecard (imagem) como resposta
- [ ] Scorecard contem QR code para desbloquear completo
- [ ] Bot envia mensagem com link para relatorio completo (pos-pagamento)
- [ ] Formato de trigger: `#puv website https://www.site.com` ou link direto
- [ ] Integracao com WhatsApp Bridge existente (porta 21350)

**Estimativa:** M (3-5 dias)
**Dependencias:** Story 6 (pipeline), WhatsApp Bridge squad

---

#### Story 8: Squad AIOS puv-score (P0 - Infraestrutura)
**Como** desenvolvedor do AIOS,
**Quero** uma squad `puv-score` completa com agents, tasks e templates,
**Para que** o pipeline seja invocavel via `/Squads:PuvScore-AIOS`.

**Acceptance Criteria:**
- [ ] `squads/puv-score/squad.yaml` com manifest completo
- [ ] Agent definition em `agents/puv-agent.md`
- [ ] 9 task files (1 por cada etapa do pipeline)
- [ ] Templates HTML para scorecard e slides
- [ ] Template Markdown para documento
- [ ] Prompt PUV Score em `templates/puv-prompt.md`
- [ ] Rubrica JSON em `data/puv-rubric.json`
- [ ] Slash command `.claude/commands/Squads/PuvScore-AIOS.md`

**Estimativa:** S (1-2 dias)
**Dependencias:** Nenhuma (pode ser feito em paralelo)

---

## 5. Priorizacao e Roadmap

### Sprint 1: Foundation (MVP Scorecard)
| # | Story | Prioridade | Estimativa |
|---|-------|------------|------------|
| 8 | Squad AIOS puv-score | P0 | S |
| 1 | Scraping Engine | P0 | M |
| 2 | Motor de Analise PUV | P0 | S |
| 3 | Gerador de Scorecard | P0 | M |
| 6 | Pipeline Orquestrador | P0 | M |

**Entrega Sprint 1:** CLI funcional que recebe link → gera scorecard (imagem). Validacao com Alex.

### Sprint 2: Monetizacao
| # | Story | Prioridade | Estimativa |
|---|-------|------------|------------|
| 4 | Gerador de Slides | P1 | L |
| 5 | Gerador de Documento PDF | P1 | M |
| 7 | Integracao WhatsApp | P1 | M |

**Entrega Sprint 2:** Pipeline completo com 3 outputs + trigger via WhatsApp.

### Sprint 3: Scale (Futuro)
- Gateway de pagamento (QR → PIX → split)
- CRM/lead capture
- Novos canais (TikTok, LinkedIn, YouTube)
- Dashboard de analytics
- Nichos adicionais (templates especializados)

---

## 6. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Instagram bloqueia scraping | Alta | Alto | Usar API oficial ou proxy rotativo |
| Mercado Livre rate limit | Media | Medio | Delays entre requests, cache |
| Qualidade do score inconsistente | Media | Alto | Prompt engineering iterativo, A/B com Alex |
| Puppeteer falha em templates complexos | Baixa | Medio | Fallback para wkhtmltopdf |
| Volume alto sobrecarrega Claude API | Baixa | Medio | Queue com rate limit, cache de analises similares |

---

## 7. Dependencias Externas

| Dependencia | Status | Responsavel |
|------------|--------|-------------|
| Playwright instalado | Verificar | @dev |
| Puppeteer instalado | Verificar | @dev |
| Claude API key | Configurado | @devops |
| WhatsApp Bridge (21350) | Funcional | Squad whatsapp-bridge |
| Amostras do Alex (templates visuais) | Obtidas | Terry |
| Prompts do Alex (rubrica PUV) | Solicitar | Alex |

---

## 8. Definicao de Pronto (DoD)

- [ ] Todos os acceptance criteria das stories do sprint atendidos
- [ ] Testes CLI funcionais para cada componente
- [ ] Pipeline end-to-end testado com caso real (template imobiliario)
- [ ] Alex validou qualidade do output vs seu processo manual
- [ ] Squad registrada e invocavel via `/Squads:PuvScore-AIOS`
- [ ] Documentacao atualizada
- [ ] Resultados salvos em diretorio estruturado

---

## 9. Amostras de Referencia

| Arquivo | Localizacao | Descricao |
|---------|-------------|-----------|
| Scorecard amostra | `exports/alex-semana/reenvio/media/doc_1770992119264.jpg` | Infografico PUV Score com gauge 11/20 |
| Slides amostra | `exports/alex-semana/reenvio/media/doc_1770992121388.pdf` | Apresentacao 10+ slides exportada |
| Documento amostra | `exports/alex-semana/reenvio/media/doc_1770992119541.pdf` | Plano Reposicionamento Comercial completo |
| 4 Inputs screenshot | `exports/alex-semana/reenvio/media/img_1770992110603.jpg` | WhatsApp mostrando os 4 canais |
| Entregavel completo | `exports/alex-semana/reenvio/media/img_1770992116438.jpg` | Slides + documento + QR |
| Modelo de negocio | `exports/alex-semana/reenvio/media/img_1770992105899.jpg` | Both Paths Converge |
| Transcricoes audio | `exports/alex-semana/transcricoes/transcricoes.txt` | 20 audios Alex (~23min) |

---

## 10. Nichos Prioritarios

1. **Imobiliario** (PRIORITARIO - "ficou perfeito" segundo Alex)
   - Anuncios de imoveis em portais
   - Corretores com anuncios parados
   - Templates especializados para morador vs investidor

2. **Agencias de Comunicacao**
   - Presenca digital de agencias
   - Perfis Instagram de profissionais de comunicacao

3. **Comercio/Varejo**
   - Anuncios Mercado Livre
   - Lojas com website proprio

---

*— Pax, equilibrando prioridades | PRD v1.0 | FNW PUV Score*
