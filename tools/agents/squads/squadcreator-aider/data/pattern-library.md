# Pattern Library (SC-A)

Reusable patterns for squadron creation with SC-A prefix (Squad Creator - Aider).

## Pattern Library Overview

**Prefix:** SC-A (Squad Creator - Aider)
**Naming Convention:** SC-A-{NNN}: {Pattern Name}
**Categories:** Orchestration, Execution, Validation, Integration

---

## Orchestration Patterns (SC-A-01x)

### SC-A-001: Mind Research Loop

**Category:** Orchestration
**When to Use:** Creating new agents from domain experts
**Frequency:** Every squad creation starts here

**Description:**
Iterative workflow (3-5 iterations) to research and curate elite minds in a domain:
- Iteration 1: Initial research (10-15 candidates)
- Iteration 2: Framework documentation check (filter to 5-8)
- Iteration 3: Devil's advocate critique
- Iteration 4: Executor type assignment
- Iteration 5: Final curation & validation

**Implementation:**
- Use `mind-research-loop-aider.md` workflow
- Delegate research to @aider-dev
- Filter ruthlessly for framework completeness
- Never skip devil's advocate iteration

**Related:** SC-A-002 (Pattern-First Design)

---

### SC-A-002: Pattern-First Design

**Category:** Orchestration
**When to Use:** Designing domain-specific squads
**Frequency:** During pack structure phase

**Description:**
Identify domain patterns first, then build agents/tasks around them:
1. Domain analysis (20-30 potential patterns)
2. Core pattern identification (5-10 core patterns)
3. Pattern library creation (document each)
4. Agent/task design around patterns
5. Consistency validation

**Implementation:**
- Document core patterns before creating agents
- Use SC-A naming for all patterns
- Cross-reference related patterns
- Update library as new patterns discovered

**Related:** SC-A-010 (Pattern Usage), SC-A-005 (Executor Matrix)

---

### SC-A-003: Parallel Batch Execution

**Category:** Orchestration
**When to Use:** Creating 3+ independent components
**Frequency:** Tasks/Templates creation phase

**Description:**
Execute multiple independent tasks in parallel via Aider for speed:
- Batch 1: Foundation (4 tasks, sequential dependency)
- Batch 2: Agents (4 tasks, fully parallel)
- Batch 3: Templates (8 tasks, fully parallel)
- Batch 4: Validation (4 tasks, fully parallel)

**Implementation:**
- Use @aider-dev in parallel
- Max 4 simultaneous Aider executions
- 50-75% faster than sequential execution
- Ideal for template/task generation

**Related:** SC-A-001, SC-A-004

---

## Execution Patterns (SC-A-02x)

### SC-A-004: Task Anatomy Enforcement

**Category:** Execution
**When to Use:** Creating any task workflow
**Frequency:** Every task created

**Description:**
All tasks follow 8-field mandatory structure:
1. Purpose - Why does this task exist?
2. Inputs - What feeds into it?
3. Key Activities - Step-by-step numbered instructions
4. Outputs - What does it produce?
5. Validation Criteria - Testable success checks
6. Integration with AIOS - Where/how it fits
7. Dependencies - What must complete first?
8. Notes - Gotchas, tips, customization

**Implementation:**
- Use `expansion-task-tmpl.md`
- Every task must have all 8 sections
- Success checks must be objective/testable
- No task > 500 LOC or 3 files

**Related:** SC-A-005 (Executor Matrix)

---

### SC-A-005: Executor Matrix Definition

**Category:** Execution
**When to Use:** Assigning responsibility for each workflow step
**Frequency:** During task/workflow design

**Description:**
Map each step to executor type:
- **Agent:** Complex reasoning, multi-step, judgment required
- **Task:** Defined workflow, repeatable, deterministic
- **Workflow:** Multi-agent orchestration
- **Script:** Automated background operations
- **Manual:** Human decision, empathy, creativity

**Implementation:**
- Use PV_PM_001 heuristic (Frequency × Impact × Guardrails / Complexity)
- Score > 3 = Automate (Agent/Task)
- Score 1-3 = Hybrid (Human+Agent)
- Score < 1 = Keep Manual
- Document reasoning for each assignment

**Related:** SC-A-004 (Task Anatomy), SC-A-006 (Quality Gates)

---

### SC-A-006: Mind Cloning from Framework

**Category:** Execution
**When to Use:** Creating agents from researched minds
**Frequency:** After mind research loop

**Description:**
Transform documented expert framework into agent persona:
1. Extract core principles from framework
2. Define decision-making criteria
3. Create commands from framework methods
4. Document dependencies (tasks, templates, data)
5. Embed security checks
6. Validate against original framework

**Implementation:**
- Use `expansion-agent-tmpl.md`
- Preserve expert's terminology and style
- Link to original documentation
- Test agent against framework examples

**Related:** SC-A-001 (Mind Research), SC-A-010 (Pattern Usage)

---

## Validation Patterns (SC-A-03x)

### SC-A-007: Quality Gate Implementation

**Category:** Validation
**When to Use:** Defining critical validation points
**Frequency:** At phase transitions

**Description:**
Validation checkpoints that can block progression:
- **QG-001:** Requirements → Design (requirements approved)
- **QG-002:** Design → Implementation (architecture reviewed)
- **QG-003:** Implementation → Testing (code reviewed)
- **QG-004:** Testing → Deployment (tests passing)

**Implementation:**
- Define blocking criteria (must pass to proceed)
- Define warning criteria (proceed but monitor)
- Escalation path for repeated failures (3x → manual review)
- Use `quality-gate-checklist-aider.md`

**Related:** SC-A-008 (Security Validation)

---

### SC-A-008: Security Validation

**Category:** Validation
**When to Use:** Before deploying any squad
**Frequency:** Pre-deployment

**Description:**
Security checks for generated code:
- [ ] No hardcoded credentials/API keys
- [ ] No SQL injection vulnerabilities
- [ ] No command injection vulnerabilities
- [ ] No path traversal issues
- [ ] No eval() or dynamic execution
- [ ] Inputs properly sanitized
- [ ] Security sections present in agents

**Implementation:**
- Use automated scanning
- Manual code review
- Use security checklist
- Address all critical issues before deploy

**Related:** SC-A-007 (Quality Gates)

---

### SC-A-009: Documentation Completeness

**Category:** Validation
**When to Use:** Before releasing squad
**Frequency:** Final validation

**Description:**
Comprehensive documentation requirements:
- README 500+ words
- 2+ usage examples
- Installation instructions
- Customization guidance
- Troubleshooting section
- Integration with AIOS documented

**Implementation:**
- Use `expansion-readme-tmpl.md`
- Include real-world examples
- Test all code snippets
- Review for clarity and professionalism

**Related:** SC-A-010 (Pattern Usage Documentation)

---

## Integration Patterns (SC-A-04x)

### SC-A-010: Pattern Usage in Documentation

**Category:** Integration
**When to Use:** Documenting agents, tasks, workflows
**Frequency:** Whenever explaining methodology

**Description:**
Reference patterns using SC-A prefix in all documentation:
- "This task uses SC-A-004 (Task Anatomy)"
- "This workflow implements SC-A-005 (Executor Matrix)"
- "See SC-A-001 for mind research details"

**Implementation:**
- Add "[Pattern: SC-A-XXX]" references
- Link to pattern library
- Explain pattern relevance
- Make patterns discoverable

**Related:** SC-A-002 (Pattern-First Design)

---

### SC-A-011: Dual AIOS Synchronization

**Category:** Integration
**When to Use:** Finalizing squad creation
**Frequency:** Squad deployment

**Description:**
Ensure squad works in both AIOS frameworks:
1. Copy squad to Claude AIOS
2. Copy squad to Aider AIOS
3. Register in memory layer
4. Test activation in both
5. Validate task execution in both

**Implementation:**
- Use `dual-aios-support.js` script
- Test agents in both frameworks
- Verify memory layer registration
- Document compatibility

**Related:** SC-A-007 (Quality Gates)

---

### SC-A-012: Memory Layer Registration

**Category:** Integration
**When to Use:** Squad creation complete
**Frequency:** Final step before release

**Description:**
Register squad metadata in memory for discovery:
- Squad name and domain
- Author and creation date
- Description and use cases
- Agents list
- Key patterns used
- Version and compatibility

**Implementation:**
- Use `registerSquadInMemory()` from dual-aios-support.js
- Tags for discovery (aios, squad, domain)
- Metadata schema consistency
- Enable future squad recommendations

**Related:** SC-A-011 (Dual AIOS Sync)

---

## Pattern Metrics

| Pattern | Implementation Time | Complexity | Frequency | Value |
|---------|-------------------|-----------|-----------|-------|
| SC-A-001 | 1-2 hours | Medium | Every squad | Essential |
| SC-A-002 | 1-2 hours | Low | Domain packs | High |
| SC-A-003 | Parallelized | Medium | 3+ components | Very High |
| SC-A-004 | Per task | Low | Every task | Essential |
| SC-A-005 | 30 min | Medium | During design | High |
| SC-A-006 | Per agent | Low | Every agent | High |
| SC-A-007 | 1 hour | Medium | Phase gates | Essential |
| SC-A-008 | 30 min | Low | Pre-deploy | Essential |
| SC-A-009 | 2-3 hours | Low | Final step | High |
| SC-A-010 | Ongoing | Low | All docs | Medium |
| SC-A-011 | 30 min | Low | Deployment | Essential |
| SC-A-012 | 15 min | Low | Final step | Medium |

---

## Pattern Interactions

```
Mind Research (SC-A-001)
  ↓
Pattern-First Design (SC-A-002)
  ↓
[Parallel: Agents (SC-A-006) | Tasks (SC-A-004) | Templates]
  ↓
Executor Matrix (SC-A-005)
  ↓
Quality Gates (SC-A-007)
  ↓
Security Validation (SC-A-008)
  ↓
Documentation (SC-A-009)
  ↓
Dual AIOS Sync (SC-A-011)
  ↓
Memory Registration (SC-A-012)
```

---

## When to Create New Patterns

Add new pattern to library when you find:
- Recurring solution to same problem
- Documented approach in industry
- Significant cost/time savings
- Consistency benefit

**New Pattern Template:**
```
### SC-A-{NNN}: {Pattern Name}

**Category:** {Category}
**When to Use:** {Conditions}
**Frequency:** {How often}

**Description:** {What it solves}

**Implementation:** {How to apply}

**Related:** {Links to other patterns}
```

---

_Pattern Library Version: 1.0 | Last Updated: 2026-02-05 | Total Patterns: 12_
