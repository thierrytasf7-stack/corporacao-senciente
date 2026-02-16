# Referência de APIs Internas

Documentação para desenvolvedores que desejam estender a Senciência.

## 1. Brain API (`scripts/swarm/brain.js`)

### `Brain.think(task, context)`

Processa uma tarefa e decide o próximo passo.

- **task**: string - Descrição do que fazer.
- **context**: object - Dados adicionais.
- **Returns**: `Decision` object.

## 2. Router API (`scripts/swarm/router.js`)

### `getRouter().findBestAgent(task)`

Encontra o agente mais adequado.

- **Returns**: `{ primaryAgent: string, score: number, reasoning: string }`

### `getRouter().cache`

Map interno de cache. Persistido em `.cache/router_cache.json`.

## 3. Executor API (`scripts/swarm/executor.js`)

### `executeAction(action)`

Executa uma ação no sistema.

- **action**: `{ type: string, payload: any }`
- **Tipos Suportados**: `run_command`, `write_file`, `update_memory`, `git_commit`.

## 4. Memory API (Protocolo L.L.B.)

### `getLLBProtocol().letta.updateState(key, value)`

Atualiza o estado atual do projeto.

### `getLLBProtocol().langmem.addWisdom(entry)`

Adiciona um aprendizado à memória de longo prazo.

## 5. CLI Framework

O CLI é construído sobre `commander`. Para adicionar um novo comando, edite `scripts/cli/senciente_cli.js`:

```javascript
program
  .command('novo-comando')
  .description('Faz algo novo')
  .action(async () => {
    // Lógica aqui
  });
```
