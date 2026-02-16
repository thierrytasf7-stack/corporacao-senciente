# Task: Execute Discovery Phase

## Metadata
- agent: ceo-planejamento
- trigger: `*run-discovery`
- delegates_to: analyst (Atlas)

## Execution

### Pre-conditions
- User request clearly defined
- Mode selected (standard or comprehensive)

### Execution
1. Activate @analyst via Skill: `Planejamento:Analyst-AIOS`
2. Brief Atlas:
   - Project context: {user_request}
   - Scope: {discovery_scope}
   - Deliverables needed: project brief, market research (if comprehensive), competitive analysis (if comprehensive)
3. Execute commands:
   - `*create-project-brief` (always)
   - `*perform-market-research` (comprehensive only)
   - `*create-competitor-analysis` (comprehensive only)
   - `*brainstorm {topic}` (if scope needs exploration)
4. Collect outputs
5. Validate against `gate-discovery.md`

### Post-conditions
- Project brief available with clear problem statement
- Domain understanding documented
- Ready for Strategy phase
