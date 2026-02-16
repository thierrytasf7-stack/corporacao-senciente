# Squadcreator-Aider

## Overview

**Squadcreator-Aider** is an Aider-first expansion pack for AIOS that automates the creation of custom AIOS squads using free Aider agents. It maintains 100% of the original squad-creator's rigor while delegating all implementation to Aider agents for **$0 cost**.

This expansion pack creates squads in **both Claude AIOS and Aider AIOS** frameworks, ensuring compatibility across the entire AIOS ecosystem.

## Purpose

Squadcreator-Aider democratizes expansion pack creation by:

- **Aider-First Philosophy:** Delegates all implementation to free Aider agents
- **100% Original Rigor:** Maintains complete squad-creator quality standards
- **Dual AIOS Support:** Creates squads in both Claude and Aider AIOS frameworks
- **Zero Cost:** All development via Aider agents ($0)
- **Pattern Library:** Built-in SC-A patterns for consistency
- **Quality Gates:** Comprehensive validation at every phase
- **Mind Research Loop:** Iterative research for elite mind curation
- **Executor Matrix:** Clear definition of executor types and invocation patterns

## When to Use This Pack

Use Squadcreator-Aider when you want to:

- Create custom AIOS expansion packs for any domain
- Build domain-specific agent teams with minimal cost
- Transform expertise into AI-accessible formats
- Extend AIOS capabilities to new industries or workflows
- Maintain production-quality standards with free resources

## What's Included

### Agents (2)

- **expansion-creator-aider.md** - Main orchestrator agent (delegates to Aider)
- **sop-extractor-aider.md** - SOP extraction and automation analysis agent

### Tasks (4)

- **create-squad-aider.md** - Complete expansion pack creation workflow
- **create-expansion-agent-aider.md** - Individual agent creation
- **create-expansion-task-aider.md** - Task workflow creation
- **create-expansion-template-aider.md** - Output template creation

### Templates (4)

- **expansion-config-tmpl.yaml** - Squad configuration template
- **expansion-agent-tmpl.md** - Agent definition template
- **expansion-task-tmpl.md** - Task workflow template
- **expansion-readme-tmpl.md** - Squad README template

### Checklists (3)

- **squad-checklist-aider.md** - Comprehensive quality validation
- **quality-gate-checklist-aider.md** - Phase transition validation
- **executor-matrix-checklist-aider.md** - Executor type validation

### Workflows (2)

- **mind-research-loop-aider.md** - Iterative research (3-5 iterations with devil's advocate)
- **research-then-create-agent-aider.md** - Research to agent creation workflow

### Data & Utilities

- **squad-kb-aider.md** - Knowledge base with best practices and heuristics
- **pattern-library.md** - 10+ SC-A patterns for consistency
- **dual-aios-support.js** - Script for dual AIOS squad creation

## Installation

To install this expansion pack:

```bash
npm run install:expansion squadcreator-aider
```

Or manually:

```bash
node tools/install-squad.js squadcreator-aider
```

## Usage Examples

### 1. Create a Complete Squad (Aider-Driven)

```bash
# Activate the expansion creator agent
@expansion-creator-aider

# Start the interactive pack creation workflow
*create-pack

# Follow the guided elicitation process
# The agent will help you define:
# - Domain and purpose
# - Required agents and their personas (via mind research)
# - Tasks and workflows
# - Output templates
# - Documentation
```

### 2. Create Individual Components

```bash
# Create a standalone agent (via Aider)
*create-agent

# Create a task workflow (via Aider)
*create-task

# Create an output template (via Aider)
*create-template

# Validate a squad
*validate-pack
```

### 3. Extract SOPs and Create Squad Blueprint

```bash
# Activate the SOP extractor agent
@sop-extractor-aider

# Extract SOP from meeting transcript
*extract-sop

# Agent will:
# 1. Extract process structure
# 2. Classify cognitive types
# 3. Apply automation analysis
# 4. Generate squad blueprint
# 5. Document gaps and questions
```

## Key Features

### Aider-First Orchestration

All implementation delegates to free Aider agents:
- @aider-dev for code generation
- @po-aider for story creation
- @sm-aider for task decomposition
- @qa-aider for validation
- @deploy-aider for git operations

### Mind Research Loop (3-5 Iterations)

- Iterative research with devil's advocate
- Filters for elite minds with documented frameworks
- Validation against quality criteria
- Curated mind list with referenced frameworks

### Pattern Library (SC-A-NNN)

Consistent patterns across all created squads:
- SC-A-001 through SC-A-010+ patterns
- Categories: orchestration, execution, validation, integration
- Clear naming and documentation for each pattern

### Quality Gates at Critical Transitions

- QG-001: Requirements → Design
- QG-002: Design → Implementation
- QG-003: Implementation → Testing
- QG-004: Testing → Deployment

### Executor Matrix

Clear definition of executor types:
- **Agent:** Complex reasoning, multi-step workflows
- **Task:** Defined workflows, repeatable operations
- **Workflow:** Multi-agent orchestration
- **Script:** Automated operations
- **Manual:** Human-driven processes

### Dual AIOS Support

Squads automatically created in both:
- Claude AIOS framework
- Aider AIOS framework
- Seamless integration with both environments

## Created Squad Structure

Squadcreator-Aider generates squads with the following structure:

```
squads/your-squad-name/
├── agents/                      # Domain-specific agents
│   └── your-agent.md
├── checklists/                  # Validation checklists
│   └── your-checklist.md
├── config.yaml                  # Squad configuration
├── data/                        # Knowledge bases
│   ├── pattern-library.md
│   ├── executor-matrix.md
│   └── squad-kb.md
├── README.md                    # Squad documentation
├── tasks/                       # Workflow tasks
│   └── your-task.md
├── templates/                   # Output templates
│   └── your-template.yaml
└── workflows/                   # Multi-agent workflows
    └── your-workflow.md
```

## Example Squads You Can Create

### Professional Services
- Legal Assistant Pack
- Accounting & Finance Pack
- Real Estate Pack
- Healthcare Practice Pack

### Creative & Content
- Content Marketing Pack
- Video Production Pack
- Podcast Creation Pack
- Creative Writing Pack

### Technical
- DevOps Squad
- Data Engineering Squad
- Security Operations Squad
- Infrastructure Squad

### Education & Training
- Curriculum Design Pack
- Corporate Training Pack
- Online Course Creation Pack
- Skill Development Pack

### Business & Operations
- Sales Enablement Squad
- Customer Success Squad
- Project Management Squad
- Product Management Squad

## Best Practices

1. **Start Small** - Begin with one agent and a few tasks
2. **Research First** - Use mind research loop to find elite practitioners
3. **Pattern Consistent** - Use SC-A patterns for consistency
4. **Quality Gate** - Enforce quality gates at phase transitions
5. **Document Well** - Clear documentation ensures adoption
6. **Test Thoroughly** - Validate with real-world scenarios
7. **Iterate** - Refine based on user feedback
8. **Share** - Contribute your pack to the community

## Key Workflows

### Squad Creation Workflow (14 Steps)

1. Confirm creation mode (Incremental vs Rapid)
2. Domain & purpose elicitation
3. Define pack structure (name, title, version, author)
4. Define pattern library prefix and categories
5. Create executor matrix
6. Create directory structure
7. Create domain-specific agents (via mind research)
8. Create tasks (following Task Anatomy Standard)
9. Create templates
10. Create validation checklists
11. Create knowledge base
12. Generate documentation
13. Validate pack structure
14. Test pack integration

### Mind Research Loop (3-5 Iterations)

1. Initial research on domain experts
2. Devil's advocate critique
3. Iterative refinement with filtering
4. Validation against quality checklist
5. Final curated mind list with frameworks

### Quality Gate Enforcement

- Each phase transition validated
- Blocking criteria must pass
- Warning criteria documented
- Escalation path defined for failures

## Integration with Core AIOS

Squadcreator-Aider integrates seamlessly with:

1. **AIOS Installer** - Generated packs install via standard installer
2. **Memory Layer** - Tracks all created packs and components
3. **Agent System** - Works with all 11 core AIOS agents
4. **Dual AIOS** - Creates in both Claude and Aider frameworks
5. **Validation Gates** - Enforces AIOS quality standards

## Dependencies

This expansion pack requires:

- Core AIOS-FULLSTACK framework v4+
- Node.js 18+
- Basic understanding of your domain expertise
- Aider CLI installed (for @aider-dev delegation)

## Support & Community

- **Documentation:** See `docs/squads.md` for detailed guides
- **Examples:** Browse `squads/` for reference implementations
- **Issues:** Report problems via GitHub issues
- **Contributions:** Submit PRs with improvements
- **Discord:** Join AIOS community for questions

## Cost & Efficiency

### Aider-First Cost Model

```
Traditional Squad Creation:  20 hours × $100/hour = $2,000
Squadcreator-Aider via Aider: $0 (100% free Aider agents)

Savings: 100% | Time: 5-6 hours (parallelized)
```

### Parallelization Benefits

- 4 agents executing in parallel
- 8 template generations simultaneously
- 100% utilization of Aider capability
- Results: 75% faster than sequential

## Version History

- **v1.0.0** - Initial release with complete Aider-first pack creation workflow

## Notes

- All created expansion packs follow AIOS-FULLSTACK standards automatically
- Mind research loop ensures quality agents based on real frameworks
- Pattern library (SC-A) ensures consistency across all created squads
- Dual AIOS support means seamless integration with both ecosystems
- Quality gates prevent low-quality squads from being deployed
- Full automation means zero coding required to create production-ready squads

---

## Ready to Create Your First Squad? 🚀

**Start with:** `@expansion-creator-aider *create-pack`

Define your domain, let the mind research loop find the best minds, and Squadcreator-Aider will orchestrate Aider agents to create your complete squad for **$0**.

---

_**Squadcreator-Aider v1.0.0** - Aider-First Squad Creation | 100% Original Rigor | Dual AIOS Support | Zero Cost_

_Compatible with: AIOS-FULLSTACK v4+ | Requires: Node.js 18+ | License: MIT_
