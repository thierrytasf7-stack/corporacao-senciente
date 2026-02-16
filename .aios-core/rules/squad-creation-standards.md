# Squad Creation Standards - Triple AIOS Ecosystem

**Severity:** MANDATORY
**Applies To:** @squad-creator (Claude), squadcreator-aider (Aider), @mordomo (Gemini)
**Principle:** All squads must support triple execution (Gemini CLI + Claude AIOS + Aider AIOS)

---

## 🎯 Core Rule: One Command Per Squad (Sector Model)

### ❌ WRONG (Individual Agent Commands)
```
/AIOS:agents:content-strategist
/AIOS:agents:creative-director
/AIOS:agents:analytics-expert
/AIOS:agents:community-manager
```
❌ Fragmented, disjointed, no sector cohesion

### ✅ CORRECT (Unified Sector Command)
```
/AIOS:agents:SocialMediaSquad (Claude)
/Aider:agents:SocialMediaSquad (Aider)
/Gemini:agents:SocialMediaSquad (Gemini)
  → Unified interface across all platforms
  → All agents work together everywhere
  → Complete sector activation in one command
```

---

## 📋 Squad Creation Workflow (MANDATORY PATTERN)

Every squad created by **any squad-creator** MUST follow this 8-step process:

### Step 1: Define Sector Identity
- **Squad name** (e.g., "social-media-squad")
- **Command ID** (e.g., "SocialMediaSquad")
- **Icon & Title** (e.g., "📱 Social Media Management Sector")
- **Description** (sector purpose and agents)

### Step 2: Create Agent Definitions
- Create 2-5 specialized agents
- Each agent has documented framework/methodology
- Each agent has specific role in the sector
- Example: Content Strategist, Creative Director, Analytics Expert, Community Manager

### Step 3: Define Workflows
- Create workflows that show how agents work TOGETHER
- Example: "Start Campaign" workflow uses all 4 agents in sequence
- Example: "Content Creation" workflow uses creative + analytics
- **NOT individual workflows per agent** - sector-level workflows

### Step 4: Create Templates & Knowledge Bases
- Output templates for the sector (content calendars, analytics reports, etc.)
- Knowledge bases with best practices for the domain
- Checklists for quality assurance within the sector

### Step 5: Build Sector Command Files

**File locations:**
- `.claude/commands/AIOS/agents/{SquadName}.md` (Claude)
- `.claude/commands/Aider/agents/{SquadName}.md` (Aider Bridge)
- `.gemini/commands/agents/{SquadName}.md` (Gemini CLI)

**Requirements:**
- Unified interface (one command, all agents available)
- All agents listed with roles
- All workflows documented
- All commands accessible from one place
- Complete sector instructions

**Example structure:**
```markdown
# SquadName

ACTIVATION-NOTICE: Sector command - unified interface for X operations

## Core Agents
- agent1 (role1)
- agent2 (role2)
- agent3 (role3)
- agent4 (role4)

## Commands
- *start-workflow → Run complete sector workflow
- *command1 → Specific command for agent1
- *command2 → Specific command for agent2
...

## Workflows
- start-campaign-workflow (uses all 4 agents)
- content-workflow (uses agents 1,2,3)
...
```

### Step 6: Create Aider Delegation Bridge

**File location:** `.claude/commands/Aider/agents/{SquadName}.md`

**Requirements:**
- Routes to same squad in Aider AIOS
- Same commands, $0 cost
- Parallel execution explanation
- Cost comparison (Claude vs Aider)

**Example:**
```markdown
# Aider:agents:SquadName

ACTIVATION-NOTICE: Delegation bridge to Aider AIOS squad

When you use /Aider:agents:SquadName:
1. Routes to same squad in Aider AIOS
2. Parallel execution (4-6 agents simultaneously)
3. Cost: $0 (completely free)
4. Same quality results

[Show cost comparison]
[Show dual execution flow]
```

### Step 7: Create/Update Aider AIOS Squad

**Location in Aider AIOS:** `squads/{squad-name}/`

**Requirements:**
- Exact same structure as Claude AIOS squad
- Same agents, same workflows, same templates
- Can be created by squadcreator-aider in Aider AIOS
- Registered in Aider squad registry

**Triple Registration Pattern:**
```
Claude AIOS:
  - Squad files in squads/squad-name/
  - Command in .claude/commands/AIOS/agents/SquadName.md
  - Aider delegation in .claude/commands/Aider/agents/SquadName.md

Gemini CLI:
  - Command in .gemini/commands/agents/SquadName.md

Aider AIOS:
  - Squad files in squads/squad-name/
  - Registered in aider squad registry
  - Available via /aider-squad:squad-name
```

### Step 8: Register & Activate

**Auto-Activation (Part of Creation Workflow):**

```yaml
POST-CREATION CHECKLIST:
  ✓ Register sector command: /AIOS:agents:SquadName (Claude)
  ✓ Register Aider delegation: /Aider:agents:SquadName (Aider)
  ✓ Register Gemini command: /Gemini:agents:SquadName (Gemini)
  ✓ Verify Aider AIOS squad created
  ✓ Test ALL command routes work (Claude, Aider, Gemini)
  ✓ Populate CLI command index for all platforms
  ✓ Mark squad: ACTIVE
  ✓ Report: "Squad created and activated for Gemini, Claude and Aider"
```

---

## 🏗️ Squad Structure (MANDATORY)

Every squad MUST have this structure:

```
squads/{squad-name}/
├── config.yaml                    # Squad metadata + sector definition
├── README.md                      # Sector documentation
├── agents/                        # 2-5 specialized agents
│   ├── agent-1.md
│   ├── agent-2.md
│   ├── agent-3.md
│   └── agent-4.md
├── workflows/                     # Sector-level workflows
│   ├── main-workflow.md          # Primary workflow (all agents)
│   ├── workflow-2.md             # Secondary (subset of agents)
│   └── workflow-3.md
├── tasks/                         # Tasks used by workflows
│   ├── task-1.md
│   ├── task-2.md
│   └── task-3.md
├── templates/                     # Output templates
│   ├── output-template-1.md
│   ├── output-template-2.md
│   └── output-template-3.md
├── data/                          # Knowledge bases
│   ├── knowledge-1.md
│   └── knowledge-2.md
└── checklists/                    # Quality assurance
    ├── squad-launch-checklist.md
    └── quality-gate-checklist.md

Additional Files (Auto-Created):
├── .claude/commands/AIOS/agents/{SquadName}.md
│   → Sector command for Claude AIOS
├── .claude/commands/Aider/agents/{SquadName}.md
│   → Delegation bridge to Aider AIOS
├── .gemini/commands/agents/{SquadName}.md
│   → Sector command for Gemini CLI
└── AIDER-AIOS/aios-core/squads/{squad-name}/
    → Mirror squad in Aider AIOS
```

---

## 🎭 Agent Roles (Within Sector)

Each agent has a DEFINED ROLE in the sector:

```yaml
agents:
  agent-1:
    role: "Strategic Director / Planning Lead"
    framework: "Named methodology (e.g., Gary Vaynerchuk)"
    focus: "What does this agent uniquely contribute?"
    workflow_position: "First - defines strategy"

  agent-2:
    role: "Creative/Execution Lead"
    framework: "Named methodology"
    focus: "What does this agent uniquely contribute?"
    workflow_position: "Second - executes based on strategy"

  agent-3:
    role: "Analytics/Measurement Lead"
    framework: "Named methodology"
    focus: "What does this agent uniquely contribute?"
    workflow_position: "Third - measures results"

  agent-4:
    role: "Engagement/Optimization Lead"
    framework: "Named methodology"
    focus: "What does this agent uniquely contribute?"
    workflow_position: "Fourth - optimizes and engages"
```

---

## 🔄 Workflow Design (SECTOR-LEVEL)

Workflows MUST show how agents work together:

```yaml
workflows:
  main_workflow:
    name: "Start Complete Sector Campaign"
    description: "Uses all 4 agents in coordinated flow"
    steps:
      - step: 1
        agent: content-strategist
        action: "Define 90-day strategy"
        output: "Strategy document"

      - step: 2
        agent: creative-director
        action: "Create assets based on strategy"
        input: "Strategy document"
        output: "Content assets"

      - step: 3
        agent: analytics-expert
        action: "Validate metrics and setup tracking"
        input: "Strategy + Assets"
        output: "Analytics dashboard"

      - step: 4
        agent: community-manager
        action: "Plan community engagement"
        input: "Strategy + Analytics"
        output: "Engagement playbook"

    dependencies: "Linear (1→2→3→4)"
    parallel_opportunities: "None (sequential flow)"
    duration: "90 minutes for complete flow"

  secondary_workflow:
    name: "Weekly Content Creation"
    description: "Uses creative + analytics (subset of agents)"
    steps:
      - agent: creative-director
        action: "Create weekly content"
      - agent: analytics-expert
        action: "Validate metrics"
    dependencies: "Linear (creative→analytics)"
```

---

## 📦 Command File Structure (MANDATORY)

The `.claude/commands/AIOS/agents/{SquadName}.md` file MUST include:

```markdown
# SquadName
ACTIVATION-NOTICE: Sector command

## YAML Definition
```yaml
squad:
  name: squad-name
  id: SquadName
  personas: [list of 4 agents with roles]
  core_principles: [4-6 sector principles]
  commands:
    - *workflow-command → for main workflow
    - *agent-command → for specific agent commands
    - *help, *workflows, *status
  dependencies:
    agents: [4 agent files]
    workflows: [workflow files]
    tasks: [task files]
    templates: [template files]
  execution_modes:
    claude_aios: "execute via Claude AIOS"
    aider_aios: "delegate to Aider AIOS ($0)"
```

## How This Sector Works
[Explain unified interface]

## Dual Execution Modes
[Explain Claude vs Aider options]

## Sector Workflows
[List and explain each workflow]

## Quick Start Examples
[3-4 examples of using the sector]
```

---

## 💰 Dual Execution Model (MANDATORY)

Every squad MUST support both:

### Option 1: Claude AIOS (This Interface)
```bash
/AIOS:agents:SquadName *command
→ Execute via Claude AIOS
→ Fast, immediate, integrated
→ Costs Claude tokens
```

### Option 2: Aider AIOS (Free Delegation)
```bash
/Aider:agents:SquadName *command
→ Routes to Aider AIOS
→ Parallel execution
→ Cost: $0 (completely free)
```

**Both must always be available!**

---

## ✅ Activation Checklist (MANDATORY)

After squad creation, BEFORE reporting "ready":

```markdown
REGISTRATION:
  ✓ Squad exists in squads/{name}/
  ✓ All agents defined (2-5 agents)
  ✓ All workflows created
  ✓ All templates in place
  ✓ All knowledge bases populated

COMMAND FILES:
  ✓ .claude/commands/AIOS/agents/{SquadName}.md created
  ✓ .claude/commands/Aider/agents/{SquadName}.md created
  ✓ .gemini/commands/agents/{SquadName}.md created
  ✓ All files properly formatted

AIDER AIOS:
  ✓ Squad created in Aider AIOS mirror
  ✓ Same agents, workflows, templates
  ✓ Registered in Aider squad registry

CLI REGISTRATION:
  ✓ /AIOS:agents:SquadName appears in command list
  ✓ /Aider:agents:SquadName appears in command list
  ✓ /Gemini:agents:SquadName appears in command list
  ✓ All commands functional

ACTIVATION:
  ✓ Test: /AIOS:agents:SquadName *help → works
  ✓ Test: /Aider:agents:SquadName *help → works
  ✓ Test: /Gemini:agents:SquadName *help → works
  ✓ Squad status: ACTIVE
  ✓ All agents: ACTIVE

REPORT:
  ✓ NOT: "Squad created, ready to activate"
  ✓ BUT: "Squad created and activated, ready to use immediately"
  ✓ Include: "Available via /AIOS:agents:SquadName, /Aider:agents:SquadName or /Gemini:agents:SquadName"
```

---

## 🚫 Common Mistakes (DO NOT DO)

### ❌ WRONG: Creating Individual Agent Commands
```
/AIOS:agents:agent-name-1
/AIOS:agents:agent-name-2
/AIOS:agents:agent-name-3
```
❌ Fragmented, no sector unity, users get lost

### ❌ WRONG: Not Creating Aider Delegation
```
Squad exists only in Claude AIOS
No /Aider:agents:SquadName available
Users can't use $0 Aider option
```

### ❌ WRONG: Forgetting Aider AIOS Squad
```
Claude AIOS has squad
Aider AIOS doesn't have squad
/Aider:agents:SquadName fails
```

### ❌ WRONG: No Workflows
```
Individual agents only
No workflows showing coordination
Users don't understand how to use together
```

### ❌ WRONG: Manual Activation Required
```
"Squad created, you must activate it"
"Follow these 5 steps to activate"
Creation and activation are SEPARATE
```

---

## ✅ Correct Implementation Example

See: `squads/social-media-squad/` + `.claude/commands/AIOS/agents/SocialMediaSquad.md`

---

## Rules for @squad-creator (Claude AIOS)

When creating a squad:

1. **Create squad structure** in `squads/{squad-name}/`
2. **Create sector command** in `.claude/commands/AIOS/agents/{SquadName}.md`
3. **Create Aider delegation** in `.claude/commands/Aider/agents/{SquadName}.md`
4. **Create Gemini command** in `.gemini/commands/agents/{SquadName}.md`
5. **Trigger Aider** to create mirror squad in Aider AIOS
6. **Register all commands** in CLI
7. **AUTO-ACTIVATE** (not manual)
8. **Report ready** - "Available via /AIOS:agents:SquadName, /Aider:agents:SquadName or /Gemini:agents:SquadName"

---

## Rules for squadcreator-aider (Aider AIOS)

When creating a squad:

1. **Create squad structure** in `squads/{squad-name}/`
2. **Register in Aider squad registry**
3. **Trigger Claude/Gemini AIOS** to create mirror commands
4. **Create sector command** in Claude `.claude/commands/AIOS/agents/{SquadName}.md`
5. **Create Aider delegation** in Claude `.claude/commands/Aider/agents/{SquadName}.md`
6. **Create Gemini command** in `.gemini/commands/agents/{SquadName}.md`
7. **AUTO-ACTIVATE** (not manual)
8. **Report ready** - "Squad synced to all AIOS frameworks"

---

## Integration Points

### When Claude @squad-creator Creates Squad
```
Claude creates squad in squads/
  ↓
Claude creates .claude/commands/AIOS/agents/SquadName.md
  ↓
Claude creates .claude/commands/Aider/agents/SquadName.md (delegation)
  ↓
Claude creates .gemini/commands/agents/SquadName.md
  ↓
Claude triggers squadcreator-aider to mirror in Aider AIOS
  ↓
Aider creates same squad structure
  ↓
All registries updated
  ↓
/AIOS:agents:SquadName → Claude execution
  ↓
/Aider:agents:SquadName → Aider execution ($0)
  ↓
/Gemini:agents:SquadName → Gemini execution
```

---

## Verification Commands

After squad creation:

```bash
# Test Claude execution
/AIOS:agents:SquadName *help
→ Should show sector interface with all agents

# Test Aider delegation
/Aider:agents:SquadName *help
→ Should route to Aider AIOS and return same help

# Test Gemini execution
/Gemini:agents:SquadName *help
→ Should show Gemini-specific sector interface

# Check all exist
@squad-creator *list-squads
→ Should show SquadName: ACTIVE (in all registries)
```

---

## Success Criteria

Squad creation is successful when:

```markdown
✅ Command: /AIOS:agents:SquadName works
✅ Command: /Aider:agents:SquadName works
✅ Command: /Gemini:agents:SquadName works
✅ Squad status: ACTIVE (all registries)
✅ All agents: ACTIVE
✅ All workflows: Available
✅ Both AIOS have same squad structure
✅ User can execute via Claude, Gemini OR delegate to Aider ($0)
✅ Auto-activation complete (no manual steps)
✅ Report says "ready to use immediately"
```

---

*Squad Creation Standards | Dual AIOS Ecosystem | Sector Model | Mandatory Implementation*
