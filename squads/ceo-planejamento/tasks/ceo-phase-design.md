# Task: Execute Design Phase

## Metadata
- agent: ceo-planejamento
- trigger: `*run-design`
- delegates_to: ux-design-expert (Uma)
- skip_when: backend-only, cli-only, api-only

## Execution

### Pre-conditions
- PRD/Epic from Strategy
- Architecture document (especially frontend section)
- Not a backend-only feature

### Execution
1. Activate @ux-design-expert via Skill: `Planejamento:UX-AIOS`
2. Brief Uma:
   - PRD user stories: {strategy_user_stories}
   - Architecture frontend: {architecture_frontend}
   - Quality mandates:
     - UX Level 10000: fluid, intuitive, delightful, zero friction
     - UI Level 1000: polished, modern, consistent design system
     - Accessibility WCAG AA minimum
     - Responsive first, mobile-friendly
   - Existing design system (if brownfield): {design_system_path}
3. Execute commands:
   - `*research` (comprehensive - user research)
   - `*wireframe medium` (standard) or `*wireframe high` (comprehensive)
   - `*create-front-end-spec` (always for UI features)
   - `*audit {path}` (brownfield - audit existing patterns)
   - `*generate-ui-prompt` (for AI UI tool generation)
   - `*tokenize` (if design system needed)
4. Ensure design covers:
   - User personas and flows
   - Wireframes (appropriate fidelity)
   - Component inventory (atomic design)
   - Interaction patterns
   - Accessibility plan
   - Responsive breakpoints
   - Frontend specification for @dev
5. Validate against `gate-design.md`

### Post-conditions
- Wireframes and frontend spec available
- Design system considerations documented
- Ready for Stories phase
