# Task: Plan Brownfield Feature

## Metadata
- agent: ceo-planejamento
- trigger: `*plan-feature`
- elicit: true
- mode: standard

## Execution Steps

### Step 1: Understand Context
```
Qual feature voce quer adicionar?
Em qual parte do sistema? (app, modulo, servico)
Tem UI ou e backend-only?
```

### Step 2: Analyze Existing Code
- Activate `@architect` → `*analyze-project-structure`
- Map existing codebase patterns, conventions, tech stack
- Identify integration points and constraints

### Step 3: Strategy
- Activate `@pm` → `*create-brownfield-prd` or `*create-epic`
- Focus on incremental delivery
- Respect existing architecture decisions

### Step 4: Architecture Impact
- Activate `@architect` → `*create-brownfield-architecture`
- `*assess-complexity` for sizing
- Focus on: What changes? What stays? What breaks?

### Step 5: Design (if UI)
- Activate `@ux-design-expert` → `*create-front-end-spec`
- Respect existing design system
- `*audit {path}` if design system exists

### Step 6: Stories
- Activate `@po` → validate backlog
- Activate `@sm` → `*draft` detailed stories
- Include migration/rollback considerations

### Step 7: Deliver
- Consolidate into brownfield masterplan
- Highlight breaking changes and migration steps
- Prioritize stories for incremental delivery
