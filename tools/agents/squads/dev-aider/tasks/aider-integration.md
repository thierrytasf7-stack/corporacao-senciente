# Task: Aider Integration Setup

> **Phase**: Configuration
> **Owner Agent**: @devops
> **Squad**: dev-aider

---

## Purpose

Reference documentation for integrating Aider + OpenRouter with AIOS projects.

---

## Setup Requirements

### 1. Environment Variables

```bash
export OPENROUTER_API_KEY=sk-or-v1-xxxxxxx    # From https://openrouter.ai/keys
export AIOS_AIDER_MODEL=arcee-ai/trinity-large-preview:free
export AIOS_AIDER_FALLBACK=qwen/qwen2.5-7b-instruct:free
```

### 2. Python Dependencies

```bash
pip install aider-chat
aider --version   # Verify installed
```

### 3. Project Configuration

Create `.aider.conf.yml` (optional, for Aider customization):

```yaml
model: arcee-ai/trinity-large-preview:free
auto-commits: false
pretty: true
```

### 4. Squad Activation

```bash
# Activate any agent in dev-aider squad
/AIOS:agents:po-aider      # Story creation
/AIOS:agents:sm-aider      # Task decomposition
/AIOS:agents:dev-aider     # Implementation (existing)
/AIOS:agents:qa-aider      # Validation
/AIOS:agents:deploy-aider  # Deployment
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Aider not found" | Not installed | `pip install aider-chat` |
| "API key not set" | Missing env var | `export OPENROUTER_API_KEY=...` |
| "Model not available" | Rate limit | Fallback to Qwen or wait |
| "Timeout" | Slow model | Retry or use faster model |

---

*Reference documentation for dev-aider integration.*
