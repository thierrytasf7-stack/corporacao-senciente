# Task: Execute Architecture Phase

## Metadata
- agent: ceo-planejamento
- trigger: `*run-architecture`
- delegates_to: architect (Aria)

## Execution

### Pre-conditions
- PRD or Epic from Strategy phase
- Quality dimension priorities

### Execution
1. Activate @architect via Skill: `Planejamento:Architect-AIOS`
2. Brief Aria:
   - PRD/Epic: {strategy_output}
   - Quality mandates:
     - Performance: caching, lazy loading, CDN, efficient queries
     - Scalability: stateless, horizontal scaling, message queues
     - Security: OWASP top 10, auth strategy, encryption
     - Testability: dependency injection, testable boundaries
   - Constitution constraints:
     - CLI First (Article I)
     - Port range 21300-21399
     - Absolute imports (@synkra/ or @/)
     - TypeScript strict mode
3. Execute commands:
   - `*create-full-stack-architecture` (greenfield)
   - `*create-brownfield-architecture` (brownfield)
   - `*analyze-project-structure` (if needs code analysis)
   - `*assess-complexity` (always - for story sizing)
   - `*create-plan` (comprehensive mode)
4. Ensure architecture covers:
   - System overview with diagrams
   - Tech stack with justification
   - API design (endpoints, contracts)
   - Database design direction (delegate details to @data-engineer)
   - Security architecture
   - Performance strategy
   - Deployment strategy
   - Complexity assessment per feature/story
5. Validate against `gate-architecture.md`

### Post-conditions
- Architecture document complete
- Complexity assessed (fibonacci estimates)
- Ready for Design phase (or Stories if no UI)
