# Guia de Monitoramento e Observabilidade

Este documento descreve como monitorar a saúde, performance e status operacional da Corporação Senciente, focando no Daemon Autônomo e no Swarm de PCs.

## 1. Monitoramento do Daemon (Modo Autônomo)

O script `scripts/senciencia/daemon_monitor.js` fornece informações em tempo real sobre o ciclo Brain/Arms.

### Comando

```bash
senc monitor
# ou diretamente
node scripts/senciencia/daemon_monitor.js
```

### Métricas Monitoradas

* **Status Operacional**: `ONLINE`, `THINKING`, `EXECUTING`, `OFFLINE`, `ERROR`.
* **Fila de Tarefas**: Número de itens pendentes no Inbox (`inbox_reader.js`).
* **Confiança Média**: Nível de certeza nas decisões recentes.
* **Taxa de Sucesso**: Proporção de tarefas concluídas vs falhas.

## 2. Monitoramento de Swarm (Multi-PC)

O `PCMonitor` (`scripts/infra/pc_monitor.js`) rastreia a conectividade entre máquinas.

### Comando

```bash
senc swarm status
```

### Indicadores

* 🟢 **Online**: PC respondendo a pings via protocolo SSH/HTTP interno.
* 🔴 **Offline**: PC inativo ou desconectado.
* **Carga de CPU/RAM**: (Futuro) Métricas de hardware.

## 3. Logs e Alertas

### Arquivos de Log

Os logs são estruturados em JSON e armazenados em `logs/`:

* `logs/daemon-error.log`: Erros críticos de execução.
* `logs/daemon-combined.log`: Histórico completo de operações.

### Níveis de Alerta

1. **INFO (Verde)**: Operação normal (ex: Tarefa concluída).
2. **WARN (Amarelo)**: Tentativa de re-execução, baixa confiança.
3. **ERROR (Vermelho)**: Falha em ferramenta, exceção não tratada.
4. **FATAL (Roxo)**: Daemon parou. Intervenção humana necessária.

## 4. Dashboard (Web)

*Status: Em desenvolvimento (Stub)*

Futuramente, o dashboard web disponível em `localhost:3000` exibirá gráficos visuais destas métricas.

## 5. Troubleshooting Comum

* **Daemon travado em THINKING**: Verifique se o LLM está respondendo ou se houve timeout.
* **Swarm Offline**: Verifique conexões de rede e chaves SSH.
* **Fila crescendo**: Aumente `maxTasksPerCycle` em `senciencia.daemon.json` ou reduza o `thinkInterval`.
