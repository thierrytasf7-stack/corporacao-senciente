# Task: Rapid Planning (Blitz Mode)

## Metadata
- agent: ceo-planejamento
- trigger: `*plan-rapid`
- elicit: true
- mode: blitz

## Execution Steps

### Step 1: Quick Scope
```
O que precisa mudar? (1 frase)
Onde no codigo? (se souber)
```

### Step 2: Quick Epic
- Activate `@pm` → `*create-epic` (minimal)
- 1-2 stories max

### Step 3: Impact Check
- Activate `@architect` → `*assess-complexity`
- Quick risk check: breaking changes? dependencies?

### Step 4: Story
- Activate `@sm` → `*draft`
- Clear acceptance criteria
- `*story-checklist` validation

### Step 5: Deliver
```
BLITZ PLAN: {description}
Complexidade: {fibonacci_estimate}
Story: {story_link}
Pronto para @dev.
```

## Time Target: < 30 minutes
