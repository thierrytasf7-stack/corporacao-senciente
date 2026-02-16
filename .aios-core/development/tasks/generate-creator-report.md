# Generate Creator Report

**Purpose:** Consolidate all identified creator needs, missing credentials, and manual action items into a clear, actionable markdown report.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: generateCreatorReport()
responsible: @mordomo
responsible_type: Agent
atomic_layer: Communication
elicit: false

inputs:
- field: actionItems
  type: list
  required: true
  description: "List of unblocking actions identified during log harvesting"

outputs:
- field: report_file
  type: markdown
  destination: .aios/reports/RELATORIO_PARA_CRIADOR.md
```

---

## Report Structure Protocol

1. **Header:** Clearly state the date and time of the report.
2. **Urgent Blockers:** List items that are currently preventing tasks from progressing (e.g., missing API keys).
3. **Environment Setup:** Required manual installs or configurations that the agents couldn't perform.
4. **Knowledge Requests:** Specific questions or guidance needed from the Creator.
5. **No-Mock Policy:** Explicitly report failures without using mock data or simulations.

---

## Step-by-Step Logic

1. **Aggregation:** Collect all `creator_action_items` from the `harvest_logs` step.
2. **Deduplication:** Remove repeated requests for the same credentials across different logs.
3. **Drafting:** Generate a markdown file following the defined structure.
4. **Persistence:** Write or update the file in `.aios/reports/RELATORIO_PARA_CRIADOR.md`.
5. **Notification:** Print a concise summary in the console to alert the Creator.

---

## Acceptance Criteria

- [ ] Report file created or updated in the correct path.
- [ ] No duplicate entries for the same issue.
- [ ] Language is clear, technical, and objective.
- [ ] Strictly follows the Anti-Mock protocol (honest reporting).

---

## Metadata

```yaml
version: 1.0.0
agent: mordomo
tags: [communication, creator, report]
```
