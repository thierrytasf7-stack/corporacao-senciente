# Task: Unblock Story/Sprint

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*unblock {story}`

## Blocker Types & Resolution

### Technical Blocker
- @dev attempts to resolve
- If @dev stuck after 2 attempts → CEO provides alternative approach
- If architectural issue → escalate to Athena/user

### Dependency Blocker
- Reorder sprint: move blocked story to later
- Execute dependency first
- If external dependency → document and skip

### Permission Blocker
- Escalate to user (API keys, access, etc.)
- Document requirement in RELATORIO_PARA_CRIADOR.md

### Requirement Unclear
- Escalate to Athena (CEO-Planejamento) for clarification
- Or escalate to user directly

### QA Blocker (BLOCKED verdict)
- Analyze root cause
- If design flaw → escalate to Athena
- If implementation issue → @dev rework
- If test issue → @qa revise criteria
