# Task: Design Sprint

## Metadata
- agent: ceo-planejamento
- trigger: `*design-sprint`
- elicit: true
- mode: standard (design-first)

## Execution Steps

### Step 1: Frame the Challenge
```
Qual problema estamos tentando resolver?
Para quem? (usuario, persona)
Quais constraints conhecidos?
```

### Step 2: Diverge (Discovery)
- Activate `@analyst` → `*brainstorm {challenge}`
- Generate multiple solution directions
- No filtering yet - quantity over quality

### Step 3: Design Exploration
- Activate `@ux-design-expert`
- `*research` - quick user research
- `*wireframe low` - multiple lo-fi concepts
- `*generate-ui-prompt` - AI UI generation prompts
- Explore 2-3 different approaches visually

### Step 4: Converge (Strategy)
- Present design explorations to user
- Activate `@pm` → `*create-prd` informed by chosen design direction
- Prioritize with MoSCoW

### Step 5: Plan for Prototype
- Activate `@architect` → `*assess-complexity`
- Activate `@sm` → `*draft` stories for MVP prototype
- Focus on minimum viable experience

### Step 6: Deliver
```
DESIGN SPRINT OUTPUT:
- Explorations: {n} concepts explored
- Chosen direction: {description}
- PRD: {link}
- Prototype stories: {count} stories
- Ready for rapid @dev implementation
```
