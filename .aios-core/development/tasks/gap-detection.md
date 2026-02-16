# Task: Gap Detection & Auto-Creation

> **Phase:** analysis
> **Owner Agent:** @mordomo
> **Cost:** $0 (detection free, creation via Aider)

---

## Purpose

Detect missing AIOS components (agents, tasks, workflows, squads) required for a task and automatically create them using Aider CLI, following AIOS quality standards.

---

## Prerequisites

1. ✓ Task description provided by user
2. ✓ Access to AIOS component directories
3. ✓ Aider CLI available for creation
4. ✓ Knowledge of AIOS component templates

---

## Component Locations

| Component | Directory | Pattern |
|-----------|-----------|---------|
| Agents | `.aios-core/development/agents/` | `{name}.md` |
| Tasks | `.aios-core/development/tasks/` | `{name}.md` |
| Workflows | `.aios-core/development/workflows/` | `{name}.yaml` |
| Squads | `squads/{name}/` | Directory structure |
| Templates | `.aios-core/development/templates/` | `{name}-tmpl.md` |
| Checklists | `.aios-core/development/checklists/` | `{name}.md` |

---

## Execution Flow

### Step 1: Analyze Task Requirements

Extract required capabilities from task description:

```
Task: "Implement real-time notifications with WebSocket"

Required Capabilities:
- WebSocket implementation → @dev or @aider-dev
- Real-time architecture → @architect
- Message queue design → @data-engineer (maybe)
- Testing → @qa or @qa-aider
- Deployment → @deploy-aider

Required Tasks:
- implement-websocket.md (if complex)
- notification-service.md (if exists)

Required Workflows:
- real-time-feature.yaml (if complex)
```

### Step 2: Check Existing Components

```bash
# Check agents
ls .aios-core/development/agents/

# Check tasks
ls .aios-core/development/tasks/ | grep -i "websocket\|notification\|real-time"

# Check workflows
ls .aios-core/development/workflows/ | grep -i "websocket\|notification"

# Check squads
ls squads/ | grep -i "websocket\|notification\|real-time"
```

### Step 3: Identify Gaps

```yaml
gap_analysis:
  agents:
    existing:
      - dev.md ✓
      - architect.md ✓
      - qa.md ✓
    missing: []

  tasks:
    existing:
      - implement-feature.md ✓
    missing:
      - websocket-setup.md (RECOMMENDED)
      - notification-service.md (OPTIONAL)

  workflows:
    existing: []
    missing:
      - real-time-feature.yaml (OPTIONAL - if complex)

  squads:
    existing: []
    missing:
      - real-time-squad (OPTIONAL - if recurring pattern)
```

### Step 4: Report Gaps to User

```
════════════════════════════════════════════════════════════
🔍 GAP ANALYSIS REPORT
════════════════════════════════════════════════════════════

Task: "Implement real-time notifications with WebSocket"

✅ EXISTING COMPONENTS:
   - @dev (implementation)
   - @architect (design)
   - @qa (testing)
   - @aider-dev (cost-free implementation)

⚠️ OPTIONAL GAPS (can create if helpful):
   1. Task: websocket-setup.md
      → Would provide step-by-step WebSocket setup guide
      → Create with Aider? ($0)

   2. Workflow: real-time-feature.yaml
      → Would orchestrate multi-agent real-time feature dev
      → Create with Aider? ($0)

❓ RECOMMENDATION:
   For this task, existing agents are SUFFICIENT.
   Creating websocket-setup.md would help future similar tasks.

Should I create the optional components? (y/n)
════════════════════════════════════════════════════════════
```

### Step 5: Auto-Create Missing Components (if approved)

#### Creating an Agent

```bash
# Use Aider to create agent following AIOS patterns
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file .aios-core/development/agents/{name}.md \
      --message "Create AIOS agent file for {name}.

Follow this structure from dev.md:
1. ACTIVATION-NOTICE header
2. YAML block with:
   - agent: name, id, title, icon, whenToUse, customization
   - persona_profile: archetype, communication
   - persona: role, style, identity, focus
   - core_principles: list of principles
   - commands: list with name, visibility, description
   - dependencies: tasks, data, scripts
   - autoClaude: version, execution config
3. Quick Commands section
4. Agent Guide section

Specific for {name}:
- Purpose: {purpose}
- Core capabilities: {capabilities}
- Commands needed: {commands}
"
```

#### Creating a Task

```bash
# Use Aider to create task following AIOS patterns
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file .aios-core/development/tasks/{name}.md \
      --message "Create AIOS task file for {name}.

Follow this structure:
1. Title with # Task: {name}
2. Metadata block:
   > Phase: {phase}
   > Owner Agent: @{agent}
3. Purpose section
4. Prerequisites section (numbered list)
5. Execution Flow section with Steps
6. Error Handling section
7. Example section
8. Metadata YAML block

Specific for {name}:
- Purpose: {purpose}
- Steps: {steps}
- Owner: @{owner}
"
```

#### Creating a Workflow

```bash
# Use Aider to create workflow following AIOS patterns
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file .aios-core/development/workflows/{name}.yaml \
      --message "Create AIOS workflow file for {name}.

Follow YAML structure:
workflow:
  name: {name}
  description: {description}
  phases:
    - name: phase_1
      agent: @{agent}
      tasks: [task1, task2]
      artifacts: [artifact1]
      gates:
        - condition: {gate}

Specific for {name}:
- Phases: {phases}
- Agents involved: {agents}
- Expected artifacts: {artifacts}
"
```

#### Creating a Squad

```bash
# Create squad directory structure
mkdir -p squads/{name}/{agents,tasks,templates,data,checklists,workflows}

# Create config.yaml
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --yes \
      --file squads/{name}/config.yaml \
      --message "Create squad config.yaml for {name} squad.

Include:
squad:
  name: {name}
  description: {description}
  agents: [list]
  version: 1.0.0
"

# Create README.md
aider --yes \
      --file squads/{name}/README.md \
      --message "Create squad README for {name}.

Include:
- Purpose
- Agents in squad
- How to use
- Example workflows
"
```

### Step 6: Validate Created Components

```bash
# For agents - check structure
grep -E "^agent:|^persona:|^commands:" .aios-core/development/agents/{created}.md

# For tasks - check sections
grep -E "^# Task:|^## Purpose|^## Execution" .aios-core/development/tasks/{created}.md

# For workflows - YAML validation
python -c "import yaml; yaml.safe_load(open('.aios-core/development/workflows/{created}.yaml'))"

# For squads - structure check
ls squads/{created}/
```

---

## Gap Detection Heuristics

### When to Suggest Agent Creation

```yaml
suggest_agent_if:
  - Domain-specific expertise needed repeatedly
  - Existing agents don't cover the domain
  - Pattern appears 3+ times in different tasks
  - Complex enough to warrant dedicated commands
```

### When to Suggest Task Creation

```yaml
suggest_task_if:
  - Multi-step process with clear phases
  - Reusable across different projects
  - Requires specific validation/gates
  - Would benefit from documentation
```

### When to Suggest Workflow Creation

```yaml
suggest_workflow_if:
  - Involves 3+ agents in sequence
  - Has clear phases with gates
  - Produces multiple artifacts
  - Common pattern in development
```

### When to Suggest Squad Creation

```yaml
suggest_squad_if:
  - Domain requires multiple specialized agents
  - Pattern repeats across projects
  - Would benefit from dedicated knowledge base
  - Has unique tasks/templates
```

---

## Quality Gates for Created Components

### Agent Quality Gate

- [ ] Has ACTIVATION-NOTICE
- [ ] Has complete YAML config
- [ ] Has persona_profile
- [ ] Has commands list
- [ ] Has dependencies
- [ ] Has Quick Commands section
- [ ] Follows naming convention

### Task Quality Gate

- [ ] Has metadata (Phase, Owner)
- [ ] Has Purpose section
- [ ] Has Prerequisites
- [ ] Has Execution Flow
- [ ] Has Error Handling
- [ ] Has clear steps
- [ ] Has validation criteria

### Workflow Quality Gate

- [ ] Valid YAML syntax
- [ ] Has all required phases
- [ ] References existing agents
- [ ] Has gates between phases
- [ ] Has expected artifacts
- [ ] Has clear dependencies

---

## Metadata

```yaml
task: gap-detection
owner: @mordomo
estimated_time: "5-10 minutes"
difficulty: STANDARD
tags:
  - analysis
  - auto-creation
  - aider
  - quality
  - components
```
