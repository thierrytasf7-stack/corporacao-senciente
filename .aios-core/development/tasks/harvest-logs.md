# Harvest Logs

**Purpose:** Extract valuable technical insights (the "gold") from terminal logs to feed the system's memory and avoid future errors.

---

## Execution Modes

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts) [DEFAULT]
- Scans logs from the last 5 minutes automatically.
- Extracts patterns without user intervention.
- Feeds findings directly to `.aios/knowledge/efficiency_log.json`.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: harvestLogs()
responsible: @aider-dev
responsible_type: Agent
atomic_layer: Memory
elicit: false

inputs:
- field: timeRange
  type: string
  default: "5m"
  description: "Time range to scan logs (e.g., 5m, 1h)"

- field: logDir
  type: string
  default: "logs/terminal/"
  description: "Directory where terminal logs are stored"

outputs:
- field: harvest_report
  type: markdown
  destination: Console/Guardian Log

- field: knowledge_updates
  type: json
  destination: .aios/knowledge/mordomo_harvest.json
```

---

## Step-by-Step Logic

1. **Log Discovery:** Identify all log files in `logDir` modified within the `timeRange`.
2. **Analysis:**
    - **Model Efficiency:** Identify prompts/responses that worked well vs failed on Small Models (OpenRouter).
    - **Aider Patterns:** Capture common Aider failures (e.g., file not found, permission issues).
    - **Git Context:** Identify common merge/commit issues.
    - **Creator Needs:** Identify missing credentials (API Keys), required manual configurations, or specific guidance needed from the Creator to unblock tasks.
    - **Golden Knowledge:** Extract code snippets or architectural decisions found in log interactions.
3. **Persist:** Update the knowledge base in `.aios/knowledge/` and prepare inputs for the "Report for Creator".
4. **Report:** Summarize findings for the Guardian, including a specific section: "ACTION ITEMS FOR CREATOR".

---

## Acceptance Criteria

- [ ] Logs from the specified time range were analyzed.
- [ ] At least one efficiency insight or error pattern was identified (if present).
- [ ] Knowledge base file updated successfully.
- [ ] No sensitive data (API keys) captured in insights.

---

## Metadata

```yaml
version: 1.0.0
agent: aider-dev
tags: [learning, logs, harvesting]
```
