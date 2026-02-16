# Squad Creator Knowledge Base (Aider-Driven)

Comprehensive knowledge base for creating high-quality AIOS expansion packs via Aider agents.

## Domain Terminology

**Squad/Expansion Pack:** Self-contained collection of specialized AI agents for a specific domain
**Agent:** Individual AI persona with expertise, commands, and dependencies
**Task:** Executable workflow following Task Anatomy Standard (8 fields)
**Template:** Output format with embedded elicitation patterns
**Pattern:** Reusable solution to a common problem (SC-A-NNN format)
**Executor:** Type of entity executing a step (Agent, Task, Workflow, Script, Manual)
**Quality Gate:** Validation checkpoint at phase transition
**Mind:** Real expert or practitioner whose documented framework becomes an agent

## Best Practices

### 1. Mind-First Agent Creation
- Research 3-5 iterations before creating agents
- Use devil's advocate to validate frameworks
- Only create agents from minds with documented methodologies
- Clone real experts, never generic bots
- Verify framework defensibility before proceeding

### 2. Pattern Library Consistency
- Define prefix at pack creation (SC-A for Squad Creator - Aider)
- Use consistent naming: {PREFIX}-{NNN}: {Pattern Name}
- Document categories: Orchestration, Execution, Validation, Integration
- Cross-reference related patterns
- Update pattern library as new patterns emerge

### 3. Quality Gates at Transitions
- Define gates for: Requirements→Design, Design→Impl, Impl→Testing, Testing→Deploy
- Set blocking criteria for each gate
- Document escalation path for repeated failures
- Never skip gates, even under pressure
- Use gates to prevent low-quality squads

### 4. Task Anatomy Enforcement
- All tasks must have 8 required fields:
  1. Purpose
  2. Inputs
  3. Key Activities
  4. Outputs
  5. Validation Criteria
  6. Integration with AIOS
  7. Dependencies
  8. Notes
- Success checks must be testable (not subjective)
- No single task should exceed 500 LOC or 3 files

### 5. Executor Matrix Clarity
- Define each executor type clearly
- Document when to use each type
- Specify invocation pattern (how to call it)
- Include strengths and limitations
- Help users choose correct executor

### 6. Documentation Completeness
- README should be 500+ words
- Include usage examples (2+ real-world examples)
- Explain integration with core AIOS
- Document customization options
- Provide troubleshooting guidance

### 7. Dual AIOS Consistency
- Create in both Claude and Aider frameworks
- Test in both before declaring complete
- Register in memory layer for both
- Ensure agents activatable in both
- Validate integration fully

### 8. Aider-First Cost Model
- All implementation via @aider-dev ($0)
- Achieve parallelization for speed (50% faster)
- Zero cost means 100% investment in quality
- Can iterate more freely without budget pressure
- Document cost savings in squad README

## Common Patterns (SC-A-NNN)

### SC-A-001: Mind Research Loop Pattern
3-5 iterations of research → devil's advocate → filtering → framework validation
- When: Creating new agents from domain experts
- Benefit: Ensures agent quality based on real frameworks
- Risk: Time investment (1-2 hours)

### SC-A-002: Pattern-First Design
Identify domain patterns → Create SC-A pattern library → Build agents around patterns
- When: Creating domain-specific squads
- Benefit: Consistency across squad
- Implementation: Document 5-10 core patterns first

### SC-A-003: Task Anatomy Enforcement
Every task follows 8-field standard → Validated before acceptance
- When: Creating task workflows
- Benefit: Consistency, reusability, testability
- Validation: Checklist check before accepting task

### SC-A-004: Quality Gate Implementation
Define gates at phase transitions → Block progression on failure
- When: Squad creation reaches critical points
- Benefit: Prevents low-quality squads from deploying
- Escalation: Manual review if gate fails 3x

### SC-A-005: Executor Matrix Definition
Map each workflow step to executor type (Human/Agent/Hybrid/Worker)
- When: Designing complex workflows
- Benefit: Clear responsibility assignment
- Method: Use automation tipping point heuristic (PV_PM_001)

### SC-A-006: Dual AIOS Synchronization
Create squad in both frameworks simultaneously
- When: Squad creation finalizes
- Benefit: Maximum framework compatibility
- Validation: Test activation in both frameworks

### SC-A-007: Memory Layer Integration
Register squad metadata for discovery and tracking
- When: Squad deployed
- Benefit: Enables future squad discovery
- Data: Squad name, domain, agents, creation date, author

### SC-A-008: Security Validation
Check for hardcoded secrets, injection vulnerabilities, path traversal
- When: Before deployment
- Validation: Agent-quality-gate-checklist review
- Automated: Grep for common issues

### SC-A-009: Documentation Automation
Generate README, usage examples, integration guides automatically
- When: Squad creation finalizes
- Benefit: Professional documentation
- Template: expansion-readme-tmpl.md

### SC-A-010: Elicitation Pattern Embedding
Include "what question to ask user" in templates and checklists
- When: Creating templates and checklists
- Benefit: Guides users to quality output
- Format: [Elicitation]: {Question} in template sections

## Domain-Specific Best Practices

### For Legal/Compliance Squads
- Emphasize regulatory compliance
- Include audit trail patterns
- Validate against regulatory checklists
- Document evidence collection

### For Healthcare Squads
- HIPAA compliance and privacy
- Evidence-based methodology requirement
- Validation against medical literature
- Error handling for life-critical decisions

### For Financial Squads
- Regulatory compliance (SEC, FINRA, etc.)
- Audit trails and documentation
- Risk assessment frameworks
- Regulatory change tracking

### For Creative Squads
- Portfolio/case study examples
- Creative frameworks from documented artists
- Feedback loop patterns
- Iteration and refinement workflows

## Heuristics & Decision Rules

### Automation Tipping Point (PV_PM_001)

Calculate whether to automate:
```
Score = (Frequency × Impact × Guardrails) / Complexity

Frequency: How often does this occur? (1-5 scale)
Impact: How much value if automated? (1-5 scale)
Guardrails: How safely can we constrain it? (1-5 scale)
Complexity: How hard to automate? (1-5 scale)

Score > 3: Automate (Agent or Task)
Score 1-3: Consider (Hybrid executor)
Score < 1: Keep Manual (Human executor)
```

### Mind Validation Checklist (Quick)

- ✅ Does this person have documented framework?
- ✅ Is framework defensible (survives devil's advocate)?
- ✅ Can framework be systematized (not too intuitive)?
- ✅ Is person still active/relevant in field?
- ✅ Are there 2+ reference materials?

If ANY answer is NO → Remove from candidate list

## Anti-Patterns to Avoid

❌ **Generic Bots Instead of Minds**
- Problem: Agents with no real basis in expert methodology
- Solution: Always start with mind research loop

❌ **Skipping Quality Gates**
- Problem: Low-quality squads deployed
- Solution: Never skip gates, even on deadline

❌ **Subjective Success Criteria**
- Problem: Can't validate task completion objectively
- Solution: All success checks must be testable/binary

❌ **Inconsistent Naming**
- Problem: Confusion and reduced reusability
- Solution: Use SC-A patterns consistently

❌ **Over-Automation**
- Problem: Automating decisions that need human judgment
- Solution: Use executor matrix and PV_PM_001 heuristic

❌ **Poor Documentation**
- Problem: Squads unused because users don't understand them
- Solution: README 500+ words with 2+ real examples

❌ **Single AIOS Framework**
- Problem: Compatibility issues, reduced utility
- Solution: Test and deploy to both Claude and Aider AIOS

## FAQ

**Q: How long does squad creation typically take?**
A: 5-6 hours with parallelization (20 parallel tasks), vs 15+ hours sequentially. With Aider delegation, all development is $0.

**Q: Do I need to be an AI expert to create squads?**
A: No. If you're an expert in your domain, squadcreator-aider handles the AI/agent creation via Aider delegation.

**Q: What's the minimum squad size?**
A: Start with 2 agents and 2 tasks. Grow from there based on domain needs.

**Q: How do I know if a framework is "documented enough"?**
A: If you can write 500+ words explaining the method, it's documented enough. If you can't, it's too intuitive.

**Q: What if my agent creation fails quality gate?**
A: Schedule 30-min improvement with @aider-dev. Most issues fixed quickly. Re-validate after improvement.

**Q: Can I mix expert minds with generic frameworks?**
A: Not recommended. All agents should be based on minds with documented frameworks for consistency.

**Q: How do I update an existing squad?**
A: Use @expansion-creator-aider *create-agent to add new agent, or *create-task to add task. Existing squad persists.

---

_Knowledge Base Version: 1.0 | Last Updated: 2026-02-05_
