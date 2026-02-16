# Task: Execute Strategy Phase

## Metadata
- agent: ceo-planejamento
- trigger: `*run-strategy`
- delegates_to: pm (Morgan)

## Execution

### Pre-conditions
- Discovery outputs (if applicable)
- User request context

### Execution
1. Activate @pm via Skill: `Planejamento:PM-AIOS`
2. Brief Morgan:
   - Discovery insights: {discovery_outputs}
   - User vision: {user_request}
   - Quality priorities: {quality_dimensions}
   - Constraints: {known_constraints}
3. Execute commands:
   - `*create-prd` (greenfield)
   - `*create-brownfield-prd` (brownfield + large scope)
   - `*create-epic` (brownfield)
   - `*gather-requirements` (if requirements unclear)
4. Ensure PRD/Epic includes:
   - Clear problem statement and objectives
   - User personas and use cases
   - Feature prioritization (MoSCoW or RICE)
   - Success metrics and KPIs
   - Non-functional requirements (performance, security, scalability)
   - CodeRabbit quality integration
5. Validate against `gate-strategy.md`

### Post-conditions
- PRD or Epic structure available
- Features prioritized
- Ready for Architecture phase
