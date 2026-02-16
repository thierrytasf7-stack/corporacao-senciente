# Guia de Prompts e Engenharia de Comandos
>
> **Referência Oficial** para interação com o Sistema Senciente (Fase 3+)

Este guia define os padrões para solicitar tarefas, interagir com agentes e estruturar comandos para obter os melhores resultados do Brain e do Swarm.

## 1. Estrutura de Comandos Slash (CLI/Chat)

O sistema aceita comandos diretos iniciados por `/` ou via CLI `senc`.

| Comando | Descrição | Exemplo |
|---|---|---|
| `/brain` | Invoca o Brain para análise profunda e planejamento. | `/brain Analisar arquitetura do novo módulo de vendas` |
| `/agent` | Delega diretamente para um agente especialista. | `/agent params:marketing Criar copy para lançamento` |
| `/status` | Solicita relatório de status do sistema ou tarefa. | `/status --detailed` |
| `/swarm` | Gerencia ou consulta o estado do cluster multi-PC. | `/swarm list variables` |

## 2. Templates de Solicitação

Para maximizar a precisão, use os seguintes templates ao formular suas solicitações.

### 2.1 Template Padrão (Geral)

```text
[AÇÃO]: <Verbo de ação: Criar, Analisar, Refatorar, Testar>
[CONTEXTO]: <Contexto relevante, arquivos, restrições>
[OBJETIVO]: <Resultado esperado específico>
```

### 2.2 Template de Correção de Bug

```text
[BUG]: <Descrição do erro>
[ARQUIVO]: <Caminho do arquivo>
[COMPORTAMENTO ESPERADO]: <O que deveria acontecer>
[COMPORTAMENTO ATUAL]: <O que está acontecendo>
```

### 2.3 Template de Nova Feature

```text
[FEATURE]: <Nome da funcionalidade>
[USER STORY]: Como <usuário>, eu quero <ação>, para que <benefício>.
[CRITÉRIOS DE ACEITE]:
- [ ] Critério 1
- [ ] Critério 2
```

## 3. Convenções de Feedback Visual

O CLI e o Chat retornam feedbacks visuais padronizados:

* 🧠 **Brain Thinking:** O sistema está planejando.
* ⚡ **Executing:** Uma ação está em curso.
* 🐛 **Swarm/Debug:** Informações de infraestrutura ou erro.
* ✅ **Success:** Tarefa concluída com sucesso.
* ❌ **Error:** Falha na execução.

## 4. Exemplos Práticos

### Exemplo 1: Refatoração de Código
>
> `senc think "Refatorar scripts/cli/senciente_cli.js para usar classes ES6 e melhorar tratamento de erros"`

### Exemplo 2: Análise de Mercado (Agente Marketing)
>
> `senc execute marketing "Analisar tendências de IA para 2026 e sugerir 3 features para o produto"`

### Exemplo 3: Diagnóstico de Infra
>
> `senc swarm status --detailed`

---
**Nota:** Este guia deve ser atualizado conforme novos agentes e capacidades são adicionados ao sistema.
