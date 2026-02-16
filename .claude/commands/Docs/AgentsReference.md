# 🤖 AIOS + Aider Agents Reference Guide

Complete reference of all available agents with abbreviations, personas, and quick descriptions.

---

## AIOS Core Agents (11 agents)

### Planning & Product

| Cmd | Persona | Role | Description |
|-----|---------|------|-------------|
| `@analyst` | **Alex** - Analista | Business Analyst | Research, market analysis, requirements gathering, PRD creation |
| `@pm` | **Morgan** - Gerente | Product Manager | Product strategy, roadmap planning, prioritization |
| `@po` | **Pax** - Visionário de Produto | Product Owner | Story creation, backlog management, requirements |
| `@architect` | **Aria** - Arquiteto | Technical Architect | System design, architecture decisions, technical strategy |
| `@ux-design-expert` | **Uma** - Expert UX/UI | UX/UI Designer | UI/UX design, usability, design systems |

### Development & Operations

| Cmd | Persona | Role | Description |
|-----|---------|------|-------------|
| `@sm` | **River** - Planejador de Tasks | Scrum Master | Sprint planning, task breakdown, task decomposition |
| `@dev` | **Dex** - Builder | Senior Developer | Code implementation, debugging, refactoring |
| `@qa` | **Quinn** - Validador | QA Engineer | Testing, quality assurance, validation |
| `@data-engineer` | **Dara** - Data Engineer | Database Architect | Database design, migrations, data modeling |
| `@devops` | **Gage** - DevOps Guardian | DevOps Engineer | CI/CD, infrastructure, git push (exclusive authority) |

### Meta & Orchestration

| Cmd | Persona | Role | Description |
|-----|---------|------|-------------|
| `@aios-master` | **Orchestrator** | Meta-Coordinator | Framework orchestration, workflow coordination |
| `@squad-creator` | **Expansion Builder** | Squad Creator | Creating new expansion packs and custom squads |

---

## Aider Squad Agents (7 agents)

### Cost-Optimized Development Cycle

#### Core Agents (2)

| Cmd | Persona | Role | Description |
|-----|---------|------|-------------|
| `/aider-dev` | **Aider Dev** - Developer Econômico | Cost-Optimized Dev | Free Arcee Trinity model for implementation, refactoring, docs |
| `/aider-optimize` | **Aider Optimizer** - Otimizador de Custos | Cost Analyzer | Cost-benefit analysis, model selection, savings tracking |

#### Dev-Aider Squad - Full Cycle (4)

| Cmd | Persona | Role | Description |
|-----|---------|------|-------------|
| `/po-aider` | **Visionary** 📖 | Story Creator | Generate user stories via Aider (FREE) - zero Claude cost |
| `/sm-aider` | **Architect** 🏗️ | Task Decomposer | Break stories into atomic tasks (≤3 files, ≤500 LOC) |
| `/qa-aider` | **Inspector** ✅ | Quality Validator | Lint/typecheck/test validation with QA summary |
| `/deploy-aider` | **Guardian** 🚀 | Deploy Guard | Safe git operations with pre-deployment checklists |

#### Monitoring

| Cmd | Persona | Role | Description |
|-----|---------|------|-------------|
| `/status-monitor` | **Monitor** 📊 | Status Monitor | Dev-Aider cost tracking and performance metrics |

---

## Quick Command Reference

### AIOS Activation
```
/AIOS:agents:analyst          (Alex - Analista)
/AIOS:agents:pm               (Morgan - Gerente)
/AIOS:agents:po               (Pax - Visionário de Produto)
/AIOS:agents:architect        (Aria - Arquiteto)
/AIOS:agents:ux-design-expert (Uma - Expert UX/UI)
/AIOS:agents:sm               (River - Planejador de Tasks)
/AIOS:agents:dev              (Dex - Builder)
/AIOS:agents:qa               (Quinn - Validador)
/AIOS:agents:data-engineer    (Dara - Data Engineer)
/AIOS:agents:devops           (Gage - DevOps Guardian)
/AIOS:agents:aios-master      (Orchestrator)
/AIOS:agents:squad-creator    (Expansion Builder)
```

### Aider Squad Activation
```
/Aider:agents:aider-dev       (Aider Dev - Developer Econômico)
/Aider:agents:aider-optimizer (Aider Optimizer - Otimizador de Custos)
/Aider:agents:po-aider        (Visionary - Story Creator 📖)
/Aider:agents:sm-aider        (Architect - Task Decomposer 🏗️)
/Aider:agents:qa-aider        (Inspector - Quality Validator ✅)
/Aider:agents:deploy-aider    (Guardian - Deploy Guard 🚀)
/Aider:agents:status-monitor  (Monitor - Status Monitor 📊)
```

---

## Story-to-Deploy Workflow Map

### Full Cost-Optimized Cycle (Dev-Aider Squad)

```
Requirements
    ↓
@po-aider *create-story
    ↓ (Story + Summary)
Claude reviews (150 tokens) → Approves
    ↓
@sm-aider *create-tasks
    ↓ (Task list + Summary)
Claude reviews (150 tokens) → Approves
    ↓
@dev-aider *implement OR @aider-dev *implement
    ↓ (Code changes)
@qa-aider *validate
    ↓ (QA Summary)
Claude reviews (100 tokens) → Approves
    ↓
@deploy-aider *deploy
    ↓
Pushed to remote ✅
```

**Total Claude tokens for full cycle:** ~300-400 tokens
**Cost savings:** 80-100% reduction vs traditional Claude-only approach

---

## Agent Command Patterns

### By Abbreviation
- `po` → /po or @po (Product Owner)
- `sm` → /sm or @sm (Scrum Master)
- `dev` → /dev or @dev (Developer)
- `qa` → /qa or @qa (QA Engineer)
- `architect` → /architect or @architect
- `devops` → /devops or @devops (Git push exclusive)
- `po-aider` → /po-aider (Story Creator - Aider)
- `sm-aider` → /sm-aider (Task Decomposer - Aider)
- `qa-aider` → /qa-aider (Quality Validator - Aider)
- `deploy-aider` → /deploy-aider (Deploy Guard - Aider)

### By Category

**Planning & Requirements:**
- @analyst (Research & PRD)
- @pm (Strategy & Roadmap)
- @po (Stories & Backlog)
- /po-aider (Stories via Aider - FREE)

**Design & Architecture:**
- @architect (System Design)
- @ux-design-expert (UI/UX Design)
- @data-engineer (Database Design)

**Implementation:**
- @dev (Claude Opus code)
- /aider-dev (Free Arcee Trinity code)
- /aider-optimize (Cost analysis)

**Task Planning & Execution:**
- @sm (Sprint Planning)
- /sm-aider (Task Decomposition - FREE)

**Quality & Deployment:**
- @qa (Manual Testing)
- /qa-aider (Automated Validation - FREE)
- @devops (CI/CD & Git push)
- /deploy-aider (Safe Deployment - FREE)

**Cost Optimization:**
- /aider-dev (Implementation - $0)
- /sm-aider (Decomposition - $0)
- /qa-aider (Validation - $0)
- /deploy-aider (Deployment - $0)
- /aider-optimize (Analysis)
- /status-monitor (Tracking)

---

## When to Use Each Agent

### Choosing Between Claude (@) and Aider (/)

#### Use Claude AIOS (@dev, @qa, @architect)
- ✓ Complex system design
- ✓ Strategic decisions
- ✓ Advanced algorithms
- ✓ Security-critical code
- ✓ Performance optimization
- ✓ Code review & approval

#### Use Aider Squad (/)
- ✓ Simple to standard implementation
- ✓ Refactoring & cleanup
- ✓ Documentation & comments
- ✓ Adding tests
- ✓ Story creation
- ✓ Task decomposition
- ✓ Pre-deployment validation

#### Cost Impact
- **Claude approach:** $15-50 per task
- **Aider approach:** $0 per task
- **Hybrid approach:** Use Aider for 70% of work, Claude for 30% (critical parts)
- **Savings:** 80-100% on suitable tasks

---

## Personas at a Glance

### AIOS Core (Claude-powered)
| Icon | Name | Role |
|------|------|------|
| 📊 | Alex (Analyst) | Gathers intelligence |
| 📈 | Morgan (PM) | Plans strategy |
| 📖 | Pax (PO) | Writes requirements |
| 🏛️ | Aria (Architect) | Designs systems |
| 🎨 | Uma (UX Designer) | Creates interfaces |
| 🗂️ | River (Scrum Master) | Organizes tasks |
| 💻 | Dex (Developer) | Builds code |
| ✓ | Quinn (QA) | Tests everything |
| 🗄️ | Dara (Data Engineer) | Designs databases |
| 🔧 | Gage (DevOps) | Deploys & operates |
| 🌐 | Orchestrator | Coordinates workflows |
| 📦 | Expansion Builder | Creates packs |

### Aider Squad (Free Arcee Trinity)
| Icon | Name | Role |
|------|------|------|
| 💰 | Aider Dev | Cost-conscious coding |
| 💹 | Aider Optimizer | Analyzes costs |
| 📖 | Visionary | Creates stories |
| 🏗️ | Architect | Decomposes tasks |
| ✅ | Inspector | Validates code |
| 🚀 | Guardian | Deploys safely |
| 📊 | Monitor | Tracks costs |

---

## Quick Start by Use Case

### "I need to implement a feature"
→ Start with `@po` (*create-story) or `/po-aider` (*create-story)
→ Then `@sm` (*create-tasks) or `/sm-aider` (*create-tasks)
→ Then `@dev` (*develop) or `/aider-dev` (*implement)
→ Finally `@qa` or `/qa-aider` (*validate)

### "I need to save money on development"
→ Use `/po-aider` (story - FREE)
→ Use `/sm-aider` (tasks - FREE)
→ Use `/aider-dev` (code - FREE for simple tasks)
→ Use `/qa-aider` (validation - FREE)
→ Use `/deploy-aider` (deployment - FREE)
→ **Savings: 100% on suitable work**

### "I need help with complex design"
→ Use `@analyst` (market research)
→ Use `@architect` (system design)
→ Use `@ux-design-expert` (UI/UX)
→ Then use dev agents to implement

### "I need to deploy code safely"
→ Run `/qa-aider` (*validate) to verify code
→ Get Claude sign-off on QA summary
→ Use `/deploy-aider` (*deploy) with safety gates
→ Get deployment summary report

---

## Agent Commands Cheat Sheet

### Common Commands (All Agents)
```
*help              Show all available commands
*exit              Exit agent mode
*session-info      Show current session details
```

### Story/Task Creation
```
@po *create-story              Create user story (Claude)
/po-aider *create-story        Create user story (FREE Aider)
@sm *create-tasks              Decompose story into tasks (Claude)
/sm-aider *create-tasks        Decompose story into tasks (FREE Aider)
```

### Implementation
```
@dev *develop                  Implement story (Claude)
/aider-dev *implement          Implement task (FREE Aider)
@dev *refactor                 Refactor code (Claude)
/aider-dev *analyze-task       Analyze task suitability
```

### Quality & Validation
```
@qa *run-tests                 Run tests & validation (Claude)
/qa-aider *validate            Run tests & validation (FREE Aider)
/qa-aider *lint-only           Lint only
/qa-aider *test-only           Tests only
```

### Deployment
```
@devops *push                  Push to remote (EXCLUSIVE)
/deploy-aider *deploy          Full deploy cycle (checklist + push)
/deploy-aider *dry-run         Preview what will be pushed
/deploy-aider *status          Show git status
```

### Cost Analysis
```
/aider-optimize *analyze-cost  Analyze cost-benefit
/aider-dev *estimate-cost      Estimate savings
/status-monitor *report        Show cost tracking report
```

---

## Integration with Project

### Where Agents Live
- **AIOS Agents:** `.aios-core/development/agents/`
- **Aider Squad Agents:** `squads/dev-aider/agents/`
- **Commands:** `.claude/commands/`

### How to Activate
1. Use `/AIOS:agents:*` or `/Aider:agents:*` format
2. Or use shorthand: `@dev`, `/po-aider`, etc.
3. Or use `/aider-dev` format for Aider agents

### File Updates During Work
- Story tasks: Update story file checkboxes `[ ]` → `[x]`
- Commit messages: Reference story ID `[Story X.Y.Z]`
- Track changes: Keep File List in story updated

---

## Cost Comparison Reference

| Work Type | Claude (@dev) | Aider (/aider-dev) | Savings |
|-----------|---------------|-------------------|---------|
| Story creation | $2-5 | $0 | 100% |
| Task decomposition | $3-7 | $0 | 100% |
| Implementation (simple) | $5-10 | $0 | 100% |
| Refactoring | $3-8 | $0 | 100% |
| Test writing | $4-9 | $0 | 100% |
| Documentation | $3-7 | $0 | 100% |
| QA validation | $2-5 | $0 | 100% |
| **Full cycle (simple story)** | **$25-50** | **$0** | **100%** |

---

**Last Updated:** 2026-02-04
**AIOS Version:** 3.0+
**Aider Squad Version:** 1.1.0

---

*Reference guide for all available AI agents in AIOS + Aider ecosystem. Use this to quickly identify which agent to use for your task.*
