# Guia de Comandos (CLI References)

O **Senciente CLI** (`senc`) é a ferramenta unificada para controlar toda a corporação.

## Estrutura Básica

```bash
senc <comando> [subcomando] [opções]
```

Aliases comuns no npm:

- `npm run s -- <args>`
- `npm run senc -- <args>`

---

## 1. Comandos de Status e Diagnóstico

### `senc status`

Mostra o painel de status geral da corporação.

- **Uso:** Ver se Banco de Dados e APIs estão online.
- **Output:** Tabela com status de Brain, Memory, Supabase, etc.

### `senc dashboard`

Inicia o servidor do dashboard visual (frontend React).

- **Porta Padrão:** 3000
- **Acesso:** `http://localhost:3000`

---

## 2. Incorporação (Modo Assistido)

### `senc incorporar brain "<tarefa>"`

Gera um prompt "Brain-Level" para a tarefa e tenta injetá-lo no chat.

- **Exemplo:** `senc incorporar brain "Refatorar o sistema de login"`
- **Fluxo:** Brain analisa -> Gera Prompt -> Usuário cola no Chat.

### `senc incorporar agente <nome> "<tarefa>"`

Gera um prompt específico para um agente executar uma tarefa.

- **Exemplo:** `senc incorporar agente dev_backend "Criar rota POST /login"`
- **Opções:**
  - `--contexto <arquivo>`: Adiciona conteúdo de arquivo ao contexto.

### `senc prompt <brain|agente> ...`

Apenas mostra o prompt no terminal, sem tentar injetar no chat. Útil para copiar manualmente.

---

## 3. Gestão de Agentes

### `senc agentes listar`

Lista todos os agentes registrados, agrupados por setor (Técnico, Negócios, Operações).

### `senc agentes status <nome>`

Mostra detalhes de um agente específico (últimas tarefas, status, ferramentas).

### `senc avaliar "<pergunta>"` (Mesa Redonda)

Convoca uma reunião de emergência onde agentes relevantes debatem um tópico.

- **Exemplo:** `senc avaliar "Devemos usar MongoDB ou Postgres?"`
- **Retorno:** Votos, justificativas e veredito final.

---

## 4. Modo Autônomo (Daemon)

### `senc daemon start`

Inicia o processo daemon em background (ou foreground dependendo da config).

- **Ciclo:** Brain Phase -> Arms Phase -> Learning Phase.

### `senc daemon stop`

Para o daemon de forma segura (aguarda término da task atual).

### `senc daemon status`

Mostra o que o daemon está fazendo agora (Pensando, Executando ou Dormindo).

---

## 5. Gestão de Projetos

### `senc projeto criar "<nome>"`

Cria um novo contexto de projeto isolado.

### `senc projeto listar`

Lista projetos ativos.

### `senc projeto selecionar "<nome>"`

Define o projeto atual no arquivo de configuração local.

---

## Troubleshooting

- **Erro "Supabase não configurado":** Verifique se o arquivo `.env` existe e tem `SUPABASE_URL`.
- **Erro "Agente não encontrado":** Use `senc agentes listar` para ver os nomes corretos (ex: use `dev_backend` em vez de `backend developer`).
