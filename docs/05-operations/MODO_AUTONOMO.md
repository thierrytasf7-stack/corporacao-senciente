# Modo Autônomo e Sistema Híbrido

O **Sistema Híbrido da Corporação Senciente** permite alternar entre execução assistida (com aprovação humana) e execução autônoma (via daemon), baseando-se em métricas de confiança, risco e complexidade.

## Arquitetura

O sistema é gerido pelo **BrainArmsDaemon**, que implementa o ciclo "Brain → Arms → Brain":

1. **Thinking Phase (Brain)**: O daemon analisa o estado do sistema, memórias recentes e fila de entrada para decidir "O que fazer agora?".
2. **Delegation Phase**: O Brain decide qual agente é o mais qualificado para a tarefa.
3. **Execution Phase (Arms)**: O agente selecionado executa a tarefa.
    * **Assistido**: Solicita aprovação se a confiança for baixa (< 0.8) ou o risco alto.
    * **Autônomo**: Executa diretamente via Chat Interface ou Executor se a confiança for alta.
4. **Learning Phase**: O resultado da execução (sucesso/falha) é usado para calibrar os thresholds de confiança.

## Configuração

O arquivo de configuração `senciencia.daemon.json` na raiz do projeto controla o comportamento:

```json
{
  "mode": "hybrid",           // "autonomous", "hybrid", "assisted"
  "thinkInterval": 30000,     // Tempo entre ciclos de pensamento (ms)
  "confidenceThreshold": 0.8, // Nível mínimo de confiança para autonomia
  "maxConcurrentTasks": 3     // Máximo de tarefas em paralelo
}
```

## Comandos do Daemon

### Iniciar Daemon

```bash
# Via script de conveniência
npm run daemon

# Ou manualmente
node scripts/senciencia/daemon_chat.js
```

### Comandos de Controle (CLI)

```bash
senc daemon status      # Ver status atual e fila
senc daemon stop        # Parar gracefuly
senc daemon mode auto   # Mudar para modo 100% autônomo
senc daemon mode assist # Mudar para modo 100% assistido
```

## Sistema de Priorização

A fila de tarefas é ordenada por um **Score de Prioridade**:

$$ Score = BasePriority + AgeBonus + ContextBonus $$

* **BasePriority**: Critical (100), High (75), Medium (50), Low (25).
* **AgeBonus**: +1 ponto por minuto na fila (max 50).
* **ContextBonus**: +10 se relacionado a projeto ativo.

Isso garante que tarefas críticas sejam atendidas imediatamente, mas tarefas de baixa prioridade não fiquem estagnadas para sempre (starvation).

## Segurança e Logs

Todas as ações autônomas são registradas em:

* `data/logs/daemon.log`: Log técnico detalhado.
* `supabase.agent_logs`: Tabela de auditoria imutável (via Protocolo L.L.B.).

Em caso de falhas consecutivas, o daemon entra automatiamente em modo de segurança (Safety Mode) e solicita intervenção humana.
