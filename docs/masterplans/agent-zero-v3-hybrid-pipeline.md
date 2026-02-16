# MASTERPLAN: Agent Zero v3 — Hybrid Pipeline with Tool Use

**Status:** IMPLEMENTED (Sprint 1-3 complete, Feb 14 2026)
**CEO-Planejamento:** Athena
**Data:** 2026-02-13
**Handoff para:** CEO-Desenvolvimento (Prometheus)
**Complexidade Total:** F8 (~6 stories, ~20 tasks)

---

## 1. STRATEGY (@pm Morgan)

### 1.1 Visão
Dar "mãos" ao Agent Zero — capacidade de I/O (web, filesystem, DB, PDF) — mantendo custo $0 usando modelos free com function calling.

### 1.2 Problema
Agent Zero v2 é text-in/text-out. Tasks que precisam de I/O (web scraping, gerar arquivos, acessar DB) vão direto pro Opus ($0.025+/task). Isso limita o ROI do sistema de delegação.

### 1.3 Solução
Implementar tool use loop no Agent Zero usando function calling nativo dos modelos free (DeepSeek R1, Qwen3, Llama 3.3 — todos suportam tools em 2026). O LLM decide quais tools chamar; scripts Node.js locais executam.

### 1.4 Métricas de Sucesso
| Métrica | Atual (v2) | Target (v3) |
|---------|-----------|-------------|
| Tasks delegáveis ao Zero | ~40% (text only) | ~85% (text + I/O) |
| Custo médio por task | $0.009 (text) | $0.00 (free tier) |
| PUV pipeline custo | ~$0.15 (Opus) | $0.00 (Zero) |
| Qualidade média | 9.3/10 | >= 8.5/10 |

### 1.5 Escopo

**IN scope:**
- Tool use loop no task-runner.js
- 6 tools nativos (web_fetch, file_read, file_write, html_to_pdf, db_query, shell_exec)
- Tool definitions como JSON Schema (OpenAI-compatible)
- Tiered routing: F1-F2 text-only, F3+ tool-use
- Security: whitelist de comandos, path sandboxing
- Migração PUV como proof of concept

**OUT of scope (futuro):**
- MCP client integration (S3 futuro — reusar MCP servers do Claude Code)
- Streaming de tool calls
- Multi-agent tool sharing
- UI para configurar tools

---

## 2. ARCHITECTURE (@architect Aria)

### 2.1 Visão Geral da Mudança

```
ANTES (v2):
  task.json → prompt-builder → LLM(text) → result.json

DEPOIS (v3):
  task.json → prompt-builder → LLM(text+tools) ←→ tool-executor → result.json
                                    ↕ (loop max 5x)
                               tool-executor
                              ┌─────────────────┐
                              │ web_fetch        │
                              │ file_read        │
                              │ file_write       │
                              │ html_to_pdf      │
                              │ db_query         │
                              │ shell_exec       │
                              └─────────────────┘
```

### 2.2 Arquitetura de Componentes

#### Novos arquivos:
```
workers/agent-zero/
├── lib/
│   ├── tool-executor.js      # NEW - Executa tool calls do LLM
│   ├── tools/                # NEW - Definições e implementações
│   │   ├── index.js          # Registry de tools disponíveis
│   │   ├── web-fetch.js      # fetch URL → texto limpo
│   │   ├── file-read.js      # ler arquivo → conteúdo
│   │   ├── file-write.js     # salvar conteúdo → arquivo
│   │   ├── html-to-pdf.js    # HTML/MD → PDF via Puppeteer
│   │   ├── db-query.js       # SQL query → resultados (read-only)
│   │   └── shell-exec.js     # comando → output (whitelist only)
│   ├── task-runner.js        # MODIFIED - adicionar tool use loop
│   └── llm-client.js         # MODIFIED - suportar tools parameter
```

#### Arquivos modificados:
- `llm-client.js` — Adicionar `tools` parameter no payload da API
- `task-runner.js` — Adicionar tool use loop entre LLM call e result
- `config.json` — Adicionar `tools` config e `tool_use` settings
- `prompt-builder.js` — Injetar tool descriptions no system prompt (fallback)

### 2.3 Tool Use Loop (core algorithm)

```javascript
// Pseudo-código do loop em task-runner.js
async processTaskWithTools(task, messages, modelConfig) {
  const tools = this.toolExecutor.getToolsForTask(task);
  let iterations = 0;
  const maxIterations = task.max_tool_iterations || 5;

  while (iterations < maxIterations) {
    // Call LLM with tools
    const response = await this.client.callWithTools(
      modelConfig.cascade, messages, tools, {
        temperature: modelConfig.temperature
      }
    );

    // Se LLM retornou texto final (sem tool calls) → done
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return response;
    }

    // Executar cada tool call
    for (const toolCall of response.tool_calls) {
      const toolResult = await this.toolExecutor.execute(toolCall);
      // Adicionar resultado como message para próxima iteração
      messages.push({ role: 'assistant', content: null, tool_calls: [toolCall] });
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      });
    }

    iterations++;
  }

  // Safety: se esgotou iterações, retornar último conteúdo
  return { content: '[MAX_ITERATIONS] Tool use loop exceeded limit', status: 'truncated' };
}
```

### 2.4 Especificação dos Tools

Cada tool segue o formato OpenAI function calling (compatível com OpenRouter):

```javascript
// Exemplo: web_fetch tool definition
{
  type: "function",
  function: {
    name: "web_fetch",
    description: "Fetch a URL and return clean text content (HTML stripped). Use for web scraping, reading APIs, downloading content.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to fetch" },
        selector: { type: "string", description: "Optional CSS selector to extract specific content" }
      },
      required: ["url"]
    }
  }
}
```

#### Tool Specifications:

| Tool | Input | Output | Limites |
|------|-------|--------|---------|
| `web_fetch` | url, ?selector | texto limpo (max 10k chars) | Timeout 15s, no JS rendering |
| `file_read` | path (relativo ao projeto) | conteúdo (max 5k chars) | Sandbox: só dentro do projeto |
| `file_write` | path, content | { success, path, bytes } | Sandbox: só `results/`, `data/`, `workers/agent-zero/output/` |
| `html_to_pdf` | html_content, output_path | { success, path, pages } | Max 50 pages, Puppeteer |
| `db_query` | sql (SELECT only) | { rows, count } (max 100 rows) | READ-ONLY, timeout 10s |
| `shell_exec` | command | { stdout, stderr, code } | WHITELIST: npx, node, npm test |

### 2.5 Segurança (NON-NEGOTIABLE)

| Controle | Implementação |
|----------|---------------|
| **Path Sandboxing** | `file_write` só em dirs permitidas. `file_read` só dentro do projeto. Reject `../`, absolute paths fora do projeto |
| **SQL Read-Only** | Regex reject qualquer query que não começa com SELECT. Block DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE |
| **Shell Whitelist** | Array de comandos permitidos: `['npx', 'node', 'npm test']`. Reject tudo fora da lista |
| **URL Filtering** | Block localhost, 127.0.0.1, internal IPs (SSRF prevention) |
| **Output Truncation** | Tool results truncados a 10k chars para não estourar context window |
| **Iteration Limit** | Hard max 5 iterações do tool use loop |
| **Timeout** | Cada tool call tem timeout individual (15s web, 10s db, 30s pdf) |

### 2.6 Mudanças no LLM Client

```javascript
// llm-client.js - novo método
async callWithTools(modelCascade, messages, tools, opts = {}) {
  // Mesmo que call(), mas adiciona 'tools' ao payload
  // E retorna tool_calls se presente na resposta
  const payload = {
    model, messages, temperature,
    tools: tools,               // <-- novo
    tool_choice: "auto"         // LLM decide se usa tools
  };

  // Parse response: verificar se choices[0].message.tool_calls existe
  const msg = json.choices?.[0]?.message || {};
  return {
    content: msg.content || '',
    tool_calls: msg.tool_calls || [],  // <-- novo
    model: json.model,
    tokens_in: usage.prompt_tokens,
    tokens_out: usage.completion_tokens,
    finish_reason: json.choices?.[0]?.finish_reason
  };
}
```

### 2.7 Mudanças no Config

```json
// config.json - novas seções
{
  "tool_use": {
    "enabled": true,
    "max_iterations": 5,
    "tools_enabled": ["web_fetch", "file_read", "file_write", "html_to_pdf", "db_query", "shell_exec"],
    "security": {
      "file_write_dirs": ["results/", "data/", "workers/agent-zero/output/"],
      "file_read_root": ".",
      "shell_whitelist": ["npx", "node", "npm"],
      "db_read_only": true,
      "url_block_internal": true,
      "max_output_chars": 10000
    },
    "timeouts": {
      "web_fetch": 15000,
      "file_read": 5000,
      "file_write": 5000,
      "html_to_pdf": 30000,
      "db_query": 10000,
      "shell_exec": 30000
    }
  },
  "task_routing": {
    "...existing...": "...",
    "scrape": "coding",
    "generate-pdf": "coding",
    "pipeline": "coding"
  }
}
```

### 2.8 Tiered Routing (CEO-ZERO integration)

```
Task chega no CEO-ZERO:
  ├─ F1-F2 (text only): modo atual (text-in/text-out, sem tools)
  ├─ F3-F4 (I/O simples): tool use mode (web_fetch + file_write etc)
  └─ F5+ (complexo demais): AIOS/Opus direto
```

O campo `tools_required` no task JSON determina o modo:
```json
{
  "task_type": "pipeline",
  "tools_required": ["web_fetch", "file_write", "html_to_pdf"],
  "prompt": "Scrape o site X, analise PUV, gere scorecard PDF"
}
```

Se `tools_required` está presente → ativa tool use loop.
Se ausente → modo text-only (compatibilidade v2).

### 2.9 Dependências

| Pacote | Para | Já instalado? |
|--------|------|---------------|
| `cheerio` | web_fetch HTML parsing | Verificar |
| `puppeteer` | html_to_pdf | Sim (PUV squad) |
| `pg` | db_query PostgreSQL | Verificar |

---

## 3. STORIES (@po Pax + @sm River)

### Story 1: Core Tool Use Loop
**Complexidade:** F5 | **Prioridade:** CRITICAL

**Como** CEO-ZERO, **quero** que o Agent Zero suporte function calling no loop de execução, **para** que modelos free possam chamar tools de I/O.

**Acceptance Criteria:**
- [x] `llm-client.js` suporta `tools` parameter no payload OpenRouter
- [x] `llm-client.js` parseia `tool_calls` da resposta
- [x]`task-runner.js` implementa tool use loop (max 5 iterações)
- [x]Loop termina quando LLM retorna texto final (sem tool_calls)
- [x]Loop termina com safety message se exceder max_iterations
- [x]Messages acumulam tool results entre iterações
- [x]Métricas registram número de tool calls por task
- [x]Compatibilidade v2 mantida (tasks sem tools funcionam igual)

**Tasks:**
1. Criar método `callWithTools()` em `llm-client.js`
2. Criar `tool-executor.js` com interface de execução
3. Criar `tools/index.js` como registry de tools
4. Modificar `processTask()` em `task-runner.js` para tool use loop
5. Adicionar `tool_use` section em `config.json`
6. Atualizar `metrics.js` para registrar tool_calls count
7. Testes: task sem tools (v2 compat), task com tools (mock), max iterations

---

### Story 2: Tools de I/O Básico (web_fetch + file_read + file_write)
**Complexidade:** F5 | **Prioridade:** HIGH

**Como** Agent Zero, **quero** buscar URLs, ler e escrever arquivos, **para** executar tasks de scraping e geração de conteúdo.

**Acceptance Criteria:**
- [x]`web_fetch`: busca URL, retorna texto limpo (HTML stripped via cheerio)
- [x]`web_fetch`: timeout 15s, max 10k chars output
- [x]`web_fetch`: bloqueia URLs internas (localhost, 127.0.0.1, 10.x, 192.168.x)
- [x]`file_read`: lê arquivo relativo ao projeto root
- [x]`file_read`: rejeita paths fora do projeto (../ ou absolutos externos)
- [x]`file_read`: max 5k chars output com truncation notice
- [x]`file_write`: escreve arquivo apenas em dirs permitidas (config)
- [x]`file_write`: cria dirs intermediários se necessário
- [x]`file_write`: rejeita paths fora das dirs permitidas
- [x]Cada tool retorna JSON estruturado { success, data/error }
- [x]Cada tool tem timeout configurável via config.json

**Tasks:**
1. Implementar `tools/web-fetch.js` com cheerio
2. Implementar `tools/file-read.js` com path sandboxing
3. Implementar `tools/file-write.js` com dir whitelist
4. Registrar os 3 tools em `tools/index.js`
5. Instalar `cheerio` se necessário
6. Testes: fetch real URL, read existente, write em dir permitido, rejects de segurança

---

### Story 3: Tool html_to_pdf
**Complexidade:** F3 | **Prioridade:** HIGH

**Como** Agent Zero, **quero** converter HTML/MD em PDF, **para** gerar documentos formatados (scorecards, relatórios).

**Acceptance Criteria:**
- [x]`html_to_pdf`: recebe HTML string + output path → gera PDF
- [x]Usa Puppeteer headless para renderização
- [x]Output path validado contra dirs permitidas
- [x]Max 50 páginas (safety limit)
- [x]Timeout 30s
- [x]Retorna { success, path, pages, bytes }

**Tasks:**
1. Implementar `tools/html-to-pdf.js` com Puppeteer
2. Registrar em `tools/index.js`
3. Testes: HTML simples → PDF, validação de path, timeout

---

### Story 4: Tool db_query (read-only)
**Complexidade:** F3 | **Prioridade:** MEDIUM

**Como** Agent Zero, **quero** consultar o PostgreSQL, **para** analisar dados e gerar relatórios baseados em dados reais.

**Acceptance Criteria:**
- [x]`db_query`: executa SELECT queries no PostgreSQL local
- [x]REJEITA qualquer query que não seja SELECT (regex validation)
- [x]Max 100 rows retornadas
- [x]Timeout 10s
- [x]Connection string via config (reusar settings existentes)
- [x]Retorna { success, rows, columns, count }

**Tasks:**
1. Implementar `tools/db-query.js` com `pg` client
2. Implementar SQL validation (SELECT-only guard)
3. Registrar em `tools/index.js`
4. Testes: query válida, rejeição de DELETE/DROP, timeout

---

### Story 5: Tool shell_exec (whitelisted)
**Complexidade:** F3 | **Prioridade:** MEDIUM

**Como** Agent Zero, **quero** executar comandos shell específicos, **para** rodar scripts, npm, conversões.

**Acceptance Criteria:**
- [x]`shell_exec`: executa comando se está na whitelist
- [x]Whitelist configurável em config.json (default: npx, node, npm)
- [x]REJEITA qualquer comando fora da whitelist
- [x]REJEITA operadores perigosos: `&&`, `||`, `;`, `|`, `>`, `<`, `` ` ``
- [x]Timeout 30s
- [x]Retorna { success, stdout, stderr, exit_code }

**Tasks:**
1. Implementar `tools/shell-exec.js` com child_process.execFile
2. Implementar command validation (whitelist + operator rejection)
3. Registrar em `tools/index.js`
4. Testes: comando permitido, rejeição de rm/del, rejeição de pipe

---

### Story 6: PUV Pipeline Migration (Proof of Concept)
**Complexidade:** F5 | **Prioridade:** HIGH

**Como** operador da Diana, **quero** rodar o pipeline PUV inteiro via Agent Zero, **para** provar que o custo cai de $0.15 para $0.00.

**Acceptance Criteria:**
- [x]Task JSON de PUV com tools_required: [web_fetch, file_write, html_to_pdf]
- [x]Zero faz: web_fetch(site) → analisa → file_write(data.json) → html_to_pdf(scorecard)
- [x]Output equivalente ao pipeline Opus atual (scorecard PDF com scores)
- [x]Qualidade >= 8/10
- [x]Custo $0.00 (free model + local tools)
- [x]CEO-ZERO routing atualizado: PUV → tool-use mode
- [x]Documentação: como disparar PUV via *fire

**Tasks:**
1. Criar task template JSON para PUV pipeline
2. Configurar prompt com contexto PUV (scoring criteria, output format)
3. Testar end-to-end: site real → scorecard PDF
4. Comparar qualidade: Zero v3 vs Opus output
5. Atualizar CEO-ZERO routing para PUV tasks
6. Documentar em squads/ceo-zero/

---

## 4. VALIDATION (Athena — Quality Scorecard)

### Arete Quality Assessment

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| **Security** | 9/10 | Path sandboxing, SQL read-only, shell whitelist, SSRF prevention, iteration limits |
| **Performance** | 8/10 | Tool calls adicionam latência (~15s/tool), mas custo $0 compensa. Parallel tool calls futuro |
| **Scalability** | 8/10 | Tools são stateless, registry extensível, novos tools = novo arquivo + registro |
| **Maintainability** | 9/10 | Cada tool é arquivo isolado, interface uniforme, config centralizada |
| **Testability** | 8/10 | Cada tool testável isoladamente, tool-executor mockável, integration tests definidos |
| **Cost Efficiency** | 10/10 | De $0.15/task para $0.00. ROI infinito |
| **Time to Market** | 8/10 | 6 stories, ~20 tasks. Sprint 1 (Stories 1-2) já entrega 70% do valor |
| **UX Excellence** | N/A | Backend/CLI — sem UI |
| **UI Polish** | N/A | Backend/CLI — sem UI |
| **Accessibility** | N/A | Backend/CLI — sem UI |

**Score Ponderado: 8.7/10** ✅ PASSED (threshold: 7.0)

### Riscos Residuais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Free models hallucinam tool calls inválidos | MÉDIA | MÉDIO | Validar schema antes de executar + try/catch por tool |
| Context window estoura com tool results | BAIXA | ALTO | Truncar outputs a 10k chars, summarizar se necessário |
| Puppeteer falha no Windows | BAIXA | MÉDIO | Já funciona no PUV squad atual |
| Rate limit OpenRouter em sessions longas | MÉDIA | BAIXO | Key rotation já implementado (v2) |

---

## 5. EXECUTION ROADMAP

### Sprint Recomendado

| Ordem | Story | Complexidade | Valor | Dependência |
|-------|-------|-------------|-------|-------------|
| 1 | **Story 1**: Core Tool Use Loop | F5 | Fundação | — |
| 2 | **Story 2**: web_fetch + file_read + file_write | F5 | 70% dos casos | Story 1 |
| 3 | **Story 3**: html_to_pdf | F3 | PUV enabler | Story 1 |
| 4 | **Story 6**: PUV Pipeline Migration | F5 | Proof of concept | Stories 1-3 |
| 5 | **Story 4**: db_query | F3 | Analytics | Story 1 |
| 6 | **Story 5**: shell_exec | F3 | Extensibilidade | Story 1 |

**Sprint 1 (Stories 1-3):** Fundação + I/O básico + PDF → Agent Zero já resolve 70% dos casos I/O
**Sprint 2 (Story 6):** Proof of concept com PUV → valida ROI
**Sprint 3 (Stories 4-5):** DB + Shell → cobertura completa

### Handoff para CEO-Desenvolvimento

**Artefatos entregues:**
1. Este masterplan com arquitetura detalhada
2. 6 stories com acceptance criteria e tasks
3. Especificação de cada tool (inputs, outputs, limites, segurança)
4. Quality scorecard aprovado (8.7/10)
5. Execution roadmap priorizado

**Para Prometheus executar:**
```
/CEOs:CEO-DESENVOLVIMENTO *execute
```

Stories estão prontas para decomposição em subtasks pelo @sm e implementação pelo @dev.

---

*Masterplan gerado por Athena (CEO-Planejamento) | Arete Score: 8.7/10 | 2026-02-13*
*Agents envolvidos: @pm Morgan (Strategy), @architect Aria (Architecture), @po Pax + @sm River (Stories)*
