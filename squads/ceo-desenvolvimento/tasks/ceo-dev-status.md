# Task: Sprint/Execution Status Report

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*status`

## Output Format
```
═══════════════════════════════════════════
  PROMETHEUS - EXECUTION STATUS
═══════════════════════════════════════════

Sprint: {name}
Started: {date}

STORIES:
  {icon} Story {id}: {title} [{complexity}]
         Agent: @{agent} | Status: {state}
         QA: {qa_status} ({iterations} iter)

PIPELINE:
  [DB]     {count} stories with DB changes  [{status}]
  [DEV]    {count} in development            [{status}]
  [QA]     {count} in review                 [{status}]
  [SHIP]   {count} ready to ship             [{status}]
  [DONE]   {count} shipped                   [{status}]

BLOCKERS: {count}
  {blocker details if any}

COST:
  Via Aiders: {count} stories ($0)
  Via AIOS: {count} stories

Progress: {shipped}/{total} ({percentage}%)
═══════════════════════════════════════════
```
