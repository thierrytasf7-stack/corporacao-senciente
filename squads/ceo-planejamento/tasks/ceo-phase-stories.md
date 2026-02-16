# Task: Execute Stories Phase

## Metadata
- agent: ceo-planejamento
- trigger: `*run-stories`
- delegates_to: po (Pax) + sm (River)

## Execution

### Pre-conditions
- PRD/Epic from Strategy
- Architecture document
- Design spec (if UI feature)

### Execution

#### Sub-phase A: Backlog Creation (@po)
1. Activate @po via Skill: `Planejamento:PO-AIOS`
2. Brief Pax:
   - All previous outputs: PRD, architecture, design spec
   - Priority framework: {RICE or MoSCoW}
   - Sprint capacity: {if known}
3. Execute commands:
   - `*create-story` (from epic/prd features)
   - `*validate-story-draft` (quality check each story)
   - `*backlog-review` (prioritization)
   - `*execute-checklist-po` (master checklist)
4. Output: Prioritized backlog structure

#### Sub-phase B: Story Detailing (@sm)
1. Activate @sm via Skill: `Planejamento:SM-AIOS`
2. Brief River:
   - Validated backlog from PO
   - Architecture complexity assessments
   - Design specs for UI stories
   - Constitution requirements (especially CodeRabbit integration section)
3. Execute commands:
   - `*draft` (for each story in backlog)
   - `*story-checklist` (validate each story)
4. Ensure each story has:
   - Clear title and description
   - Acceptance criteria (testable, specific)
   - Complexity estimate (fibonacci)
   - Dependencies mapped
   - File list (expected changes)
   - CodeRabbit integration section
   - Quality gates defined
5. Validate against `gate-stories.md`

### Post-conditions
- All stories created in docs/stories/
- Backlog prioritized
- Stories ready for @dev implementation
- Sprint plan (if applicable)
