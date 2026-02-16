# Briefing: FNW PUV Score - Sistema Automatizado de Diagnostico Comercial

## Origem
- **Conversa WhatsApp:** EU + Alex
  - Numero pessoal: `5511911595028`
  - Numero empresa/ID: `160112454971619`
- **Data:** 09-13/Feb/2026
- **Exportado em:** `exports/alex-semana/` (textos) + `exports/alex-semana/reenvio/` (midias)
- **Marca:** FNW (Freenat Work)

---

## O Produto: FNW PUV Score

Sistema de **Diagnostico de Proposta Unica de Valor (PUV)** que analisa a presenca digital de um negocio/profissional e gera um relatorio completo com score, analise e plano de acao.

### Os 4 Inputs (CONFIRMADO via screenshot)
O cliente escolhe **1 dos 4 canais** e fornece o **link**:

| # | Canal | Exemplo |
|---|-------|---------|
| 1 | **Website** | https://www.empresa.com.br |
| 2 | **Perfil do Google** | Link do Google Business |
| 3 | **Instagram** | https://www.instagram.com/perfil |
| 4 | **Anuncio no Mercado Livre** | Link do anuncio ML |

### O Scoring: PUV Score (0-20)
5 criterios, cada um pontuado de 0-4:

| Criterio | Peso |
|----------|------|
| Diferenciacao e Posicionamento | /4 |
| Clareza da Proposta/Beneficio | /4 |
| Linguagem e Conexao Emocional | /4 |
| Credibilidade e Confianca | /4 |
| Jornada Guiada e CTA | /4 |

**Classificacoes:**
- 0-5: Fraco
- 6-9: Abaixo da Media
- 10-13: **Media** (ex: Studio Jardim da Gloria = 11/20)
- 14-17: **Forte** (ex: @canellacomunica = 17/20)
- 18-20: Excelente

### Os 3 Entregaveis

#### 1. Infografico/Scorecard (Imagem)
- Gauge visual do PUV Score
- Breakdown dos 5 criterios
- Top 3 Acoes recomendadas
- Formato: imagem (JPG/PNG)
- Referencia: `doc_1770992119264.jpg` (PUV SCORE Amostra)

#### 2. Apresentacao (10+ Slides)
- "Analise de Posicionamento Estrategico"
- Diagnostico completo com dados do alvo
- "Onde podemos escalar (O salto de 3 para 4)"
- Feito com **Gamma** (ferramenta de slides AI)
- Formato: Link hospedado ou PDF
- Referencia: `img_1770992116438.jpg`

#### 3. Documento de Recomendacoes (PDF)
- Plano detalhado com 6 secoes:
  1. Diagnostico de Performance
  2. Desconstrucao da PUV
  3. Reposicionamento por Persona
  4. Engenharia de Linguagem
  5. Estrategias de Autoridade
  6. Plano de Acao Imediato
- Formato: PDF (Gamma)
- Referencia: `doc_1770992119541.pdf` (amostra completa)

### Modelo de Negocio
- **Estagio atual:** "Package → Scale" (entre Product e Scale)
- **Framework:** Learn → Sell → Package → Scale
- **Referencia:** `img_1770992105899.jpg` (Both Paths Converge)
- **Estrategia:** Versao gratuita (scorecard) → "DESBLOQUEAR RELATORIO COMPLETO" (QR code / lead capture)

---

## Caso de Uso Real (Amostra Analisada)

### Caso 1: Studio Jardim da Gloria (Anuncio Imobiliario)
- **Input:** Anuncio de studio mobiliado no Jardim da Gloria, SP
- **Score:** 11/20 (Media)
- **Problemas identificados:**
  - Adjetivos ocos ("imperdivel", "excelente")
  - Comunicacao "tamanho unico" (morador + investidor na mesma frase)
  - Ausencia de conexao emocional
  - Falha na resposta a dor do cliente
- **Solucao:** Segmentacao por persona (Morador vs Investidor)

### Caso 2: @canellacomunica (Instagram)
- **Input:** https://www.instagram.com/canellacomunica
- **Score:** 17/20 (Forte)
- **Destaques:**
  - Clareza Imediata: 4/4 Excelente
  - Linguagem e Conexao: 4/4 Excelente
  - Comunicacao em 5 Segundos: SIM
  - Bio "Mini-Landing Page" bem posicionada
- **Oportunidades:** Prova Social (3/4), Jornada (3/4), CTA (3/4)

---

## Arquitetura do Sistema Automatizado

### Fluxo Completo
```
CLIENTE (WhatsApp/CLI/Web)
    |
    v
[ESCOLHE CANAL] → 1.Website 2.Google 3.Instagram 4.Mercado Livre
    |
    v
[FORNECE LINK] → https://...
    |
    v
[SCRAPING] → Playwright extrai dados da pagina/perfil
    |
    v
[ANALISE IA] → Claude analisa com criterios PUV Score
    |
    +--> [SCORECARD] → Imagem com gauge + scores + top 3 acoes
    +--> [SLIDES 10+] → Gamma API ou HTML→PDF apresentacao
    +--> [DOCUMENTO] → PDF com plano detalhado 6 secoes
    |
    v
[ENTREGA] → WhatsApp / Email / Link com QR
    |
    v
[LEAD CAPTURE] → "Desbloquear relatorio completo" (upsell)
```

### Scraping por Canal
| Canal | Dados a Extrair |
|-------|-----------------|
| Website | Titulo, meta description, headlines, CTA, design, conteudo |
| Google Business | Reviews, fotos, descricao, categorias, horarios, avaliacao |
| Instagram | Bio, posts recentes, engagement, hashtags, highlights, CTA |
| Mercado Livre | Titulo, descricao, fotos, preco, reputacao, reviews |

### Stack Tecnologica
| Componente | Tecnologia |
|------------|------------|
| Scraping | Playwright (headless browser) |
| Analise | Claude API (prompt estruturado com rubrica PUV) |
| Scorecard | HTML template → Puppeteer screenshot → JPG |
| Slides | Gamma API ou HTML slides → PDF |
| Documento | Markdown → Puppeteer → PDF |
| Entrega | WhatsApp API (porta 21350) + Email |
| Trigger | WhatsApp grupo / CLI / API REST |

### Integracao Diana
- **Squad:** `puv-score` (novo)
- **Worker Claude:** recebe link + canal, executa pipeline
- **WhatsApp Bridge:** recebe pedido do cliente, entrega resultado
- **Invocacao:** `/Squads:PuvScore-AIOS --canal instagram --link https://...`

---

## Midias Baixadas (Inventario)

### Documentos
| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `doc_1770992119541.pdf` | Plano Reposicionamento Comercial (amostra completa) | 100KB |
| `doc_1770992121388.pdf` | Segundo documento (7.8MB - provavelmente slides exportados) | 7.8MB |
| `doc_1770992119264.jpg` | PUV SCORE Amostra - Infografico scorecard | 256KB |

### Imagens
| Arquivo | Descricao |
|---------|-----------|
| `img_1770992105899.jpg` | "Both Paths Converge" - modelo de negocio |
| `img_1770992106192.jpg` | Mesma imagem com anotacao "Estamos aqui" (Package→Scale) |
| `img_1770992110603.jpg` | Screenshot WhatsApp: 4 inputs + exemplo @canellacomunica PUV 17/20 |
| `img_1770992116438.jpg` | Entregavel completo: slides + documento + QR "desbloquear" |

### Audios (20 arquivos .ogg) - TRANSCRITOS
- Transcritos via Whisper (faster-whisper, modelo base)
- Resultado: `exports/alex-semana/transcricoes/transcricoes.txt`
- Total: ~23 minutos de audio

---

## Insights dos Audios (Transcricao Completa)

### Parceria EU + Alex
- **Alex:** Tem o produto (PUV Score), mecanismo conceitual, business, vendas, treinamento
- **EU (Terry):** Tem a infra tecnica (AIOS, automacoes, agentes), mecanismo tecnologico
- **Acordo:** Alex vai pro mercado com vendas/estrategia, EU ajuda na parte de infra/automacao
- **Modelo:** Parceria tecnico + comercial, split de receita via gateway (Grim/outro)

### Detalhes Tecnico-Comerciais (dos audios)
1. **Alex esta fazendo demos manuais** - manda mensagem, recebe link, processa no NotebookLM, gera amostra, cliente paga pra ver completo
2. **Nichos sendo testados:** Agencias, imobiliarias, corretores (anuncios parados)
3. **Mais de 4 inputs:** Alex mencionou que tem mais opcoes na manga alem dos 4 mostrados
4. **Mercado imobiliario** eh um nicho prioritario - anuncios parados em portais
5. **Ferramentas atuais:** NotebookLM (Google) para gerar infografico, slides e relatorio
6. **Padronizacao:** Sempre mesma primeira tela (infografico com ponteiro), depois slides, depois documento
7. **Gateway de pagamento:** QR code no material leva ao PIX/gateway, split automatico
8. **Entrega via grupo WhatsApp:** Cliente envia link no grupo → IA processa → responde no grupo
9. **Visao futura:** Vender acesso a grupo WhatsApp como servico (chat com agente IA que faz slides, analises, publicacoes)
10. **Alex tem prompts prontos** que geram os outputs - pode fornecer se necessario

### Sequencia Comercial (do audio 11)
```
1. Cliente recebe mensagem/amostra gratis (scorecard)
2. Cliente ve QR code → "Desbloquear relatorio completo"
3. QR leva ao gateway de pagamento (PIX)
4. Split automatico: parte Alex + parte EU
5. Cliente recebe PDF completo + slides
6. Upsell: implementacao do plano de acao
```

### Prioridades Identificadas
- **MVP:** Automatizar o fluxo que Alex faz manualmente no NotebookLM
- **Canal principal:** Grupo WhatsApp (cliente envia link → recebe analise)
- **Template prioritario:** Imobiliario (Alex considera o melhor, "ficou perfeito")
- **Padrao visual:** Infografico com ponteiro (gauge) + scores + top 3 acoes

---

## Proximos Passos
1. [x] ~~Reobter templates do Alex~~ FEITO (25 midias baixadas)
2. [x] ~~Definir os 4 inputs exatos~~ CONFIRMADO (Website/Google/Instagram/ML + imobiliario)
3. [x] ~~Definir caso de uso~~ CONFIRMADO (Diagnostico PUV Score)
4. [x] ~~Transcrever audios~~ FEITO (20 audios, ~23min)
5. [x] ~~Criar PRD completo via @PO~~ FEITO (`docs/prd/fnw-puv-score.md` + `docs/stories/epic-fnw-puv-score.md`)
6. [x] ~~Criar squad `puv-score`~~ FEITO (`squads/puv-score/` + `/Squads:PuvScore-AIOS`)
7. [x] ~~Implementar pipeline de scraping por canal~~ FEITO (`squads/puv-score/scripts/scraper.js` - 4 canais)
8. [x] ~~Implementar geracao de scorecard (imagem com gauge)~~ FEITO (`scorecard-gen.js` - testado com canellacomunica)
9. [x] ~~Implementar geracao de slides (replicar template imobiliario)~~ FEITO (`slides-gen.js` - 10 slides PDF)
10. [x] ~~Implementar geracao de documento PDF (6 secoes)~~ FEITO (`document-gen.js` - 6 secoes A4)
11. [ ] Configurar ANTHROPIC_API_KEY e testar pipeline end-to-end com analise real
12. [ ] Integrar com WhatsApp Bridge (grupo → IA → resposta)
13. [ ] Gateway de pagamento (QR → PIX → split)
