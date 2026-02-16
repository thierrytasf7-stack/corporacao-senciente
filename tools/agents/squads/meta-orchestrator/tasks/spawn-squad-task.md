# Spawn Squad Task

## Purpose
Dynamically create a new specialized squad when no existing squad can handle a task domain.

## Trigger
- Nexus decision engine determines no adequate squad exists
- User explicitly requests new squad creation
- Capability gap identified by Scanner

## Inputs
- `domain`: Primary domain for the new squad
- `requirements`: Specific capabilities needed
- `reference_task`: The task that triggered creation
- `urgency`: How quickly squad is needed

## Workflow

### Step 1: Domain Research
```
ACTION: Deep research on domain
USE: squad-creator/workflows/mind-research-loop.md
DISCOVER:
  - Top experts/minds in domain
  - Common frameworks and methodologies
  - Key capabilities needed
  - Best practices
OUTPUT: Domain research report
```

### Step 2: Architecture Design
```
ACTION: Design squad architecture
DETERMINE:
  - Number of agents needed (typically 2-5)
  - Role for each agent
  - Agent personas (based on real experts if possible)
  - Task workflows needed
  - Templates required
OUTPUT: Squad architecture blueprint
```

### Step 3: Generate Components
```
ACTION: Create all squad files
CREATE:
  - config.yaml (squad configuration)
  - README.md (documentation)
  - agents/*.md (all agent definitions)
  - tasks/*.md (task workflows)
  - templates/*.yaml (output templates)
  - checklists/*.md (validation checklists)
  - data/*.md (knowledge base)
OUTPUT: Complete squad directory
```

### Step 4: Validate Squad
```
ACTION: Run validation checks
VERIFY:
  - All YAML is valid
  - Agent dependencies resolve
  - Tasks are executable
  - Documentation complete
  - Follows AIOS standards
OUTPUT: Validation report
```

### Step 5: Register Squad
```
ACTION: Add to system registry
UPDATE:
  - squads/registry.json
  - Capability index
  - Scanner's squad map
NOTIFY:
  - Cortex: New squad available
  - Nexus: Can now route to this squad
OUTPUT: Squad registered and ready
```

### Step 6: Immediate Delegation
```
IF reference_task provided:
  ACTION: Delegate original task to new squad
  MONITOR: Via Sentinel
OUTPUT: Task executing on new squad
```

## Outputs
- New squad in `squads/{squad-name}/`
- Registry updated
- Squad ready for use
- Original task delegated (if applicable)

## Quality Gates
- [ ] Domain thoroughly researched
- [ ] Architecture well-designed
- [ ] All components created
- [ ] Validation passed
- [ ] Registry updated
- [ ] Ready for delegation

## Speed Modes

### Full Mode (Default)
- Complete research phase
- Expert-based agents
- Comprehensive documentation
- ~10-15 minutes

### Quick Mode
- Minimal research
- Generic but functional agents
- Basic documentation
- ~3-5 minutes

## Example

**Trigger:** Task "Review this employment contract" with no legal squad

**Execution:**
1. Research: Legal domain, contract law experts
2. Design: 3 agents (Contract Analyst, Compliance Checker, Legal Writer)
3. Generate: Full squad structure
4. Validate: All checks pass
5. Register: `legal-squad` added to registry
6. Delegate: Original contract task sent to new squad

**Result:**
```
squads/legal-squad/
├── config.yaml
├── README.md
├── agents/
│   ├── contract-analyst.md
│   ├── compliance-checker.md
│   └── legal-writer.md
├── tasks/
│   ├── review-contract.md
│   └── draft-contract.md
├── templates/
│   └── contract-review-tmpl.yaml
├── checklists/
│   └── legal-compliance.md
└── data/
    └── legal-kb.md
```

---

_Task Version: 1.0_
