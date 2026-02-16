# mind-research-loop-aider

Iterative workflow for researching and curating elite minds with documented frameworks.

## Purpose

Execute 3-5 iterative research cycles to identify the best minds in a domain, each validated as having sufficient documented frameworks to be replicated as agents.

## Workflow: 5 Research Iterations

### Iteration 1: Initial Research

**Inputs:**
- Domain name (e.g., "Legal Strategy")
- Initial search terms

**Steps:**
1. Delegate to @aider-dev: "Research top minds in {domain}"
2. Collect 10-15 initial candidates
3. Document: Name, field, key works, frameworks
4. Output: Candidate list with references

### Iteration 2: Framework Documentation Check

**Inputs:**
- Candidate list from Iteration 1

**Steps:**
1. For each candidate, ask: "Is there sufficient documentation to replicate this person's method?"
2. Classify each as:
   - ✅ FRAMEWORK COMPLETE: Clear, documented methodology
   - ⚠️ FRAMEWORK PARTIAL: Some documentation, needs interpretation
   - ❌ FRAMEWORK MISSING: No public documentation
3. ELIMINATE all ❌ FRAMEWORK MISSING candidates (no matter how famous)
4. Keep only ✅ and ⚠️ with preference for ✅
5. Output: Filtered list (typically 5-8 candidates)

### Iteration 3: Devil's Advocate Critique

**Inputs:**
- Filtered candidate list
- Their documented frameworks

**Steps:**
1. For each candidate, generate 3-5 critical questions:
   - "What would a critic say about this approach?"
   - "What are the limitations of this methodology?"
   - "Where does this person struggle or have blind spots?"
   - "What contradicts this person's public statements?"
   - "Has this been validated by independent research?"
2. Research answers to each critical question
3. Score candidates on "defensibility of approach"
4. Flag candidates that don't withstand critique
5. Output: Ranked list with critique summary

### Iteration 4: Executor Type Validation

**Inputs:**
- Ranked candidate list with critiques

**Steps:**
1. For each candidate, determine executor type (Human/Agent/Hybrid/Worker):
   - HUMAN: Requires judgment calls we can't automate
   - HYBRID: Some steps automatable via agent, some manual
   - AGENT: Fully systematized, can be automated
2. Evaluate: "Can this person's framework be systematized for agents?"
3. Rate systematization potential (High/Medium/Low)
4. KEEP: Candidates rated Medium or High systematization
5. REMOVE: Candidates rated Low (too intuitive, not systematic)
6. Output: Candidates with executor assignments

### Iteration 5: Final Curation & Framework Validation

**Inputs:**
- Validated candidates with executor assignments

**Steps:**
1. Verify each mind's documented framework is COMPLETE:
   - [ ] Core principles documented
   - [ ] Decision-making criteria defined
   - [ ] Workflow/process steps clear
   - [ ] Error handling documented
   - [ ] Success metrics defined
   - [ ] Examples provided
2. Create final mind profile for each:
   - Name, field, persona
   - Framework summary (500 words)
   - Key books/articles/references
   - Executor type (Human/Hybrid/Agent)
   - 2-3 quotes capturing their philosophy
   - Links to documentation
3. Generate squad blueprint structure:
   - Agent roles from minds
   - Tasks from frameworks
   - Patterns from key methods
4. Output: Final curated list ready for agent creation

## Success Criteria

- [ ] Started with 10-15 candidates
- [ ] Ended with 4-6 elite minds
- [ ] All minds have documented frameworks
- [ ] All frameworks survived devil's advocate critique
- [ ] All candidates have executor type assigned
- [ ] Squad blueprint generated and validated
- [ ] Total iterations: 3-5 (typically 4)

## Output

**Final Deliverable:**

```markdown
# {Domain} Elite Minds - Research Results

## Executive Summary
[Summary of research process and findings]

## Curated Minds (4-6)

### Mind 1: {Name}
- **Field:** {Field}
- **Executor Type:** {Human|Hybrid|Agent}
- **Framework:** {500-word summary}
- **Key Works:** [Links]
- **Squad Role:** {Proposed agent role}

[Repeat for each mind]

## Squad Blueprint
- **Agents:** {List from minds}
- **Key Patterns:** {SC-A patterns from frameworks}
- **Workflows:** {From framework steps}
- **Quality Gates:** {From critical decision points}

## How to Proceed
1. Review curated minds
2. Request agent creation via @expansion-creator-aider
3. System will create agents based on each mind's framework
4. Squad will be validated against quality gates
```

## Notes

- This workflow prioritizes DOCUMENTED FRAMEWORKS over fame
- Better to have 4 excellent minds than 10 questionable ones
- Devil's advocate ensures defensive methodologies
- Executor type assignment ensures practical implementation
- Always prefer systematized approaches over intuitive ones
