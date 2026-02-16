# Task: Planning Status Report

## Metadata
- agent: ceo-planejamento
- trigger: `*status`

## Execution

### Generate Status Report

```
═══════════════════════════════════════════
  ATHENA - PLANNING STATUS REPORT
═══════════════════════════════════════════

Projeto: {project_name}
Modo: {execution_mode}
Iniciado: {start_time}

FASES:
  {phase_icon} Discovery    [{status}] @analyst  {outputs}
  {phase_icon} Strategy     [{status}] @pm       {outputs}
  {phase_icon} Architecture [{status}] @architect {outputs}
  {phase_icon} Design       [{status}] @ux       {outputs}
  {phase_icon} Stories      [{status}] @po+@sm   {outputs}
  {phase_icon} Validation   [{status}] @ceo      {outputs}

Progresso: {completed}/{total} fases ({percentage}%)
Quality Gate: {last_gate_result}
Proxima fase: {next_phase} via @{next_agent}

Artefatos gerados: {artifact_count}
Stories criadas: {story_count}
Bloqueios: {blockers_count}
═══════════════════════════════════════════
```

Status icons:
- Completed: [DONE]
- In progress: [>>]
- Pending: [..]
- Skipped: [--]
- Failed: [!!]
