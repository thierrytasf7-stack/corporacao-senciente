# Protocolo de Operação: Aider & Hive Guardian

**Data:** 06/02/2026
**Contexto:** Prevenção de falhas no Sistema Operacional da Corporação (AIOS)
**Status:** ATIVO E OBRIGATÓRIO

Este documento estabelece o padrão ouro para criação de tarefas (Stories), uso do Hive Guardian e scripts de trabalhadores (Workers).

---

## 1. Anatomia de uma Story (Task)

Para que o **Hive Guardian** e seus trabalhadores (`aider-worker-engine.nu`) processem uma tarefa corretamente, ela DEVE seguir estritamente este formato.

### Formato Obrigatório
Local: `docs/stories/*.md`

```markdown
# Story: [Título Descritivo e Único]
Status: TODO
subStatus: pending_worker

## Contexto
[Descrição breve do que precisa ser feito]

## Aider Prompt
> ```text
> [INSTRUÇÃO CLARA E ATÔMICA PARA O AIDER]
> [Exemplo: Edite o arquivo src/app.ts para adicionar log na função init()]
> ```
```

### Regras Críticas:
1.  **Status Inicial:** Sempre `Status: TODO` e `subStatus: pending_worker` para novas tarefas.
2.  **Bloco de Código:** O prompt do Aider **DEVE** estar dentro de um bloco de código triplo (```` ```text ... ``` ````) citado (`>`). O parser busca exatemente essa estrutura.
3.  **Comandos Especiais:**
    *   Para rodar comando de shell direto: use `EXECUTE_COMMAND: <comando>` dentro do bloco de texto.
    *   Exemplo: `EXECUTE_COMMAND: npm install pg`

---

## 2. Regras de Ouro dos Workers (Nushell)

Ao editar `scripts/aider-worker-engine.nu` ou `scripts/observer-engine.nu`, **NUNCA** viole estas regras:

### A. Funções Essenciais
Jamais remova ou renomeie estas funções, pois o script depende delas para I/O básico e auto-preservação:
*   `read_file_safely`: Necessária para ler arquivos UTF-8/Binários sem crashar.
*   `write_log`: Coração do sistema de memória da colmeia (`hive_memory.log`).
*   `register_on_dashboard`: Garante que o Guardian saiba que o worker está vivo.

### B. Tratamento de Erro (Crash Prevention)
Todo bloco crítico deve estar envolto em `try { ... } catch { ... }`.
*   **Motivo:** Se um script worker crasha sem tratamento, a janela fecha instantaneamente e perdemos o log do erro.
*   **Padrão:** Sempre adicione um `sleep 15sec` no final do script ou no bloco `catch` para permitir leitura humana do erro antes da janela fechar.

### C. JSON Parsing
O Nushell é estrito com tipos. Ao ler JSONs (`agent_status.json`, `package.json`):
*   Use `from json` ou `open` com cuidado.
*   Sempre verifique se o arquivo existe antes de abrir.
*   Use `upsert` para garantir que campos existam.

---

## 3. Fluxo de Banco de Dados e Ambiente

### A. Migrações
Nunca assuma que tabelas existem.
*   **Erro Comum:** `relation "public.pcs" does not exist`.
*   **Solução:** Sempre verifique se as migrações em `supabase/migrations/` foram aplicadas. Se não, use o script `apps/backend/scripts/infra/fix_db_final.js` (ou equivalente) para aplicar via `pg`.

### B. Variáveis de Ambiente (.env)
*   O sistema usa múltiplos `.env` (raiz, backend, frontend).
*   **Regra:** O script de infraestrutura deve ser capaz de ler o `.env` da raiz se o local falhar.
*   **Conexão DB:** A string de conexão `postgresql://` deve ser montada dinamicamente usando `SUPABASE_URL` (extraindo o Project ID) e `DB_PASSWORD` se não estiver explícita.

---

## 4. Auditoria e QA (O Loop de Feedback)

O sistema agora possui um loop de auto-correção robusto com **Contador de Revisões**.

1.  **Worker:** Executa a tarefa e move para `Status: WAITING_REVIEW` e `subStatus: ready_for_review`.
2.  **Observer (Guardian/QA):**
    *   Lê a story e o campo opcional `Revisions: N`.
    *   Chama `aider` com persona `@qa`.
    *   **Se Aprovado:** Move para `Status: COMPLETED`.
    *   **Se Reprovado:**
        *   Incrementa o contador `Revisions`.
        *   **Abaixo de 7 Revisões:**
            *   Chama `aider` com persona `@po-pm` para replanejar e corrigir o curso.
            *   Reseta para `Status: TODO` e `subStatus: pending_worker`.
            *   O Guardian re-agendará um worker automaticamente.
        *   **Igual ou Acima de 7 Revisões:**
            *   Move para `Status: ERROR`.
            *   Define `subStatus: human_review_required`.
            *   O Guardian para de processar a tarefa automaticamente para evitar loops infinitos.

**Regra Crítica:** Se uma tarefa atingir 7 revisões, ela é considerada "presa" e requer intervenção humana para ajustar os critérios de aceitação ou o código base.

---

## 5. Resolução de Erros Comuns (Troubleshooting)

| Sintoma | Causa Provável | Solução |
| :--- | :--- | :--- |
| **Janela abre e fecha rápido** | Erro de sintaxe no `.nu` ou função faltando | Verificar logs em `C:/AIOS/hive_memory.log` ou adicionar `sleep` no script. |
| **Guardian não abre janela** | Tarefa não está em `TODO/pending_worker` ou `WAITING_REVIEW` | Corrigir cabeçalho do arquivo Markdown da story. |
| **"Command not found" no log** | Função auxiliar removida do script | Restaurar funções base (`read_file_safely`). |
| **Dashboard não inicia** | Conflito de merge ou erro JSON no `package.json` | Limpar o arquivo e o cache `.next`. |
| **Banco de dados falha** | Tabela inexistente | Rodar migração SQL via script Node.js com `pg`. |
| **Tarefa em ERROR** | Limite de 7 revisões atingido | Revisão humana necessária para desbloquear a story. |


**Assinado:** *Hive Guardian & Atomic Architect*
