# Task: Final Validation & Masterplan Generation

## Metadata
- agent: ceo-planejamento
- trigger: `*validate`

## Execution

### Step 1: Collect All Artifacts
Gather outputs from all phases:
- Discovery: project brief, research, competitive analysis
- Strategy: PRD/Epic, prioritization
- Architecture: architecture doc, complexity assessment, implementation plan
- Design: wireframes, frontend spec, design audit
- Stories: detailed stories, backlog, sprint plan

### Step 2: Consistency Check
Verify cross-phase consistency:
- [ ] PRD objectives align with architecture decisions
- [ ] Architecture supports all PRD features
- [ ] Design spec references architecture patterns
- [ ] Stories cover ALL PRD acceptance criteria
- [ ] Complexity estimates are consistent with architecture
- [ ] Dependencies between stories are properly mapped
- [ ] No orphan features (in PRD but not in stories)
- [ ] No phantom features (in stories but not in PRD)

### Step 3: Quality Scorecard
Rate each dimension (1-10):

| Dimension | Score | Notes |
|-----------|-------|-------|
| Performance | /10 | |
| Scalability | /10 | |
| Security | /10 | |
| UX Excellence | /10 | |
| UI Polish | /10 | |
| Accessibility | /10 | |
| Maintainability | /10 | |
| Testability | /10 | |
| Cost Efficiency | /10 | |
| Time to Market | /10 | |
| **Average** | **/10** | |

**Minimum threshold: Average >= 7**

### Step 4: Risk Assessment
Identify and document:
- Technical risks (new tech, complex integration)
- Scope risks (feature creep, unclear requirements)
- Timeline risks (dependencies, unknown complexity)
- Resource risks (skills needed, external services)

### Step 5: Generate Masterplan
Create consolidated masterplan document using `masterplan-tmpl.md`:
- Executive summary
- Scope and objectives
- Architecture overview
- UX/UI strategy
- Implementation roadmap (phased)
- Story list (prioritized)
- Risk mitigation plan
- Quality scorecard
- Next steps

### Step 6: Deliver
Present masterplan to user with clear next steps:
1. Review and approve masterplan
2. Activate @dev for implementation
3. Follow story sequence for incremental delivery
