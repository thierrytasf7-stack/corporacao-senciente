# 🎯 Quick Agents Reference

## AIOS Agents (Claude-Powered)

```
@analyst          | Alex - Business Analyst          | 📊 Research, market analysis, PRD
@pm               | Morgan - Product Manager         | 📈 Strategy, roadmap, prioritization
@po               | Pax - Product Owner              | 📖 Stories, backlog, requirements
@architect        | Aria - Technical Architect       | 🏛️ System design, architecture
@ux-design-expert | Uma - UX/UI Designer            | 🎨 UI/UX design, usability
@sm               | River - Scrum Master             | 🗂️ Sprint planning, task breakdown
@dev              | Dex - Senior Developer           | 💻 Code implementation, debugging
@qa               | Quinn - QA Engineer              | ✓ Testing, quality assurance
@data-engineer    | Dara - Data Architect           | 🗄️ Database design, migrations
@devops           | Gage - DevOps Guardian          | 🔧 CI/CD, git push (EXCLUSIVE)
@aios-master      | Orchestrator                     | 🌐 Workflow coordination
@squad-creator    | Expansion Builder                | 📦 Create new squads
@skills-architect | Luma - Skills Architect          | ✨ Skills creation & integration
```

## Aider Squad Agents (FREE - Arcee Trinity)

```
/aider-dev        | Aider Dev - Developer Econômico | 💰 Implementation, refactoring
/aider-optimize   | Aider Optimizer - Cost Analyst  | 💹 Cost-benefit analysis
/po-aider         | Visionary - Story Creator       | 📖 Stories via Aider (FREE)
/sm-aider         | Architect - Task Decomposer     | 🏗️ Task breakdown (FREE)
/qa-aider         | Inspector - Quality Validator   | ✅ Lint/test/typecheck (FREE)
/deploy-aider     | Guardian - Deploy Safe          | 🚀 Git ops with safety gates (FREE)
/status-monitor   | Monitor - Cost Tracker          | 📊 Dev-Aider metrics
```

---

## Workflow: Story → Deploy (Cost-Optimized)

```
Requirements → /po-aider *create-story (FREE)
           ↓
Story + Summary → Claude reviews (150 tokens)
           ↓
Approved → /sm-aider *create-tasks (FREE)
       ↓
Tasks + Summary → Claude reviews (150 tokens)
           ↓
Approved → @dev *develop OR /aider-dev *implement
       ↓
Code → /qa-aider *validate (FREE)
    ↓
QA Summary → Claude reviews (100 tokens)
         ↓
Approved → /deploy-aider *deploy (FREE)
       ↓
Pushed ✅
```

**Total Claude tokens:** ~300-400 tokens
**Cost savings:** 80-100% vs Claude-only

---

## By Task Type

| Task | Best Agent | Cost |
|------|-----------|------|
| Write story | `/po-aider` or `@po` | $0 or $2-5 |
| Break down tasks | `/sm-aider` or `@sm` | $0 or $3-7 |
| Simple code | `/aider-dev` | $0 |
| Complex code | `@dev` | $5-15 |
| Refactor | `/aider-dev` | $0 |
| Design system | `@architect` | $10-30 |
| Fix bugs | `/aider-dev` or `@dev` | $0 or $3-10 |
| Write tests | `/aider-dev` | $0 |
| Full QA | `/qa-aider` | $0 |
| Deploy safely | `/deploy-aider` | $0 |

---

## Quick Lookup

### By Problem
```
"I need to create a story"           → @po or /po-aider
"I need to break down a story"       → @sm or /sm-aider
"I need to implement a feature"      → @dev or /aider-dev
"I need to refactor code"            → @dev or /aider-dev
"I need to test code"                → @qa or /qa-aider
"I need to deploy code"              → @devops or /deploy-aider
"I need cost analysis"               → /aider-optimize
"I need system design"               → @architect
"I need UI/UX design"                → @ux-design-expert
"I need research"                    → @analyst
"I need budget strategy"             → @pm
"I need to save money"               → Use /aider-* agents
"I need best quality"                → Use @dev, @architect, @qa
"I need to create a skill"          → @skills-architect
"I need to compose workflows"       → @skills-architect or @aios-master
```

### By Budget
```
$0 budget    → Use all /aider-* agents (po, sm, qa, deploy)
$50 budget   → Use /aider-* for work, @dev for 2-3 complex tasks
$200 budget  → Mix: 70% Aider, 30% Claude for critical paths
```

---

## Command Shortcuts

```
*help              Show commands
*exit              Exit mode
*session-info      Session details

# Stories
*create-story      Create story
*refine-story      Refine story

# Tasks
*create-tasks      Decompose story
*refine-tasks      Refine tasks
*dependency-map    Show task graph

# Implementation
*implement         Start coding
*develop           Full development
*analyze-task      Check if Aider suitable

# Quality
*validate          Full: lint + typecheck + test
*lint-only         Lint only
*test-only         Tests only
*full-report       Detailed report

# Deployment
*deploy            Full cycle (checklist → commit → push)
*dry-run           Preview without pushing
*commit-only       Stage + commit, no push
*push-only         Push existing commit
*status            Git status

# Cost
*analyze-cost      Cost-benefit analysis
*estimate-cost     Estimate savings
*report            Cost tracking report
```

---

## Personas Quick Reference

| Archetype | Agent | Style | Best For |
|-----------|-------|-------|----------|
| Analyst | @analyst | Data-driven | Research, PRD |
| Visionary | @po, /po-aider | Expansive | Stories, requirements |
| Architect | @architect, /sm-aider | Precise | Design, tasks |
| Builder | @dev, /aider-dev | Pragmatic | Implementation |
| Guardian | @devops, /deploy-aider | Methodical | Safety, deployment |
| Inspector | @qa, /qa-aider | Binary | Quality gates |
| Optimizer | /aider-optimize | Cost-aware | Savings analysis |
| Composer | @skills-architect | Creative-pragmatic | Skills, workflows |

---

## Integration Points

```
Story lifecycle:
  @po → story file → @sm → task list → @dev/aider-dev → code
                                          ↓
                                        @qa/qa-aider
                                          ↓
                                      @devops/deploy-aider
                                          ↓
                                      Git remote
```

---

## When Aider Shines ⭐

✓ "Refactor this code"
✓ "Add comments/docs"
✓ "Implement pagination"
✓ "Write unit tests"
✓ "Fix linting errors"
✓ "Optimize query"
✓ "Add error handling"
✓ "Generate API docs"
✓ "Create user story"
✓ "Break down tasks"

## When Claude Required ❌ → Use @dev

✗ System architecture
✗ Complex algorithms
✗ Security decisions
✗ Multi-file refactoring
✗ Critical code review
✗ Strategic planning

---

## File Locations

```
AIOS Agents:     .aios-core/development/agents/
Aider Agents:    squads/dev-aider/agents/
Commands:        .claude/commands/
Tasks:           .aios-core/development/tasks/ OR squads/dev-aider/tasks/
Templates:       .aios-core/development/templates/ OR squads/dev-aider/templates/
Skills:          .claude/skills/
Config:          squads/dev-aider/config.yaml
```

---

## Activation

```
# Full names
/AIOS:agents:dev
/AIOS:agents:qa
/AIOS:agents:skills-architect
/Aider:agents:po-aider
/Aider:agents:qa-aider

# Shortcuts
@dev
@qa
/po-aider
/qa-aider
```

---

**Version:** 1.1.0 | **Updated:** 2026-02-04 | **Squad:** AIOS + Dev-Aider
