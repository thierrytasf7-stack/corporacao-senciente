# Spec Generate PRD

## Overview
Generates a Product Requirements Document (PRD) from story acceptance criteria using Aider.

## When to Use
- When a story has clear acceptance criteria and needs formal PRD documentation
- For new features that require detailed requirements specification
- When preparing for architecture design phase

## Prerequisites
- Story must be in "In Progress" status
- Story must have acceptance criteria defined
- Aider must be properly configured and available

## Input
- Story ID (mandatory)
- Story file path (auto-detected from story ID)

## Output
- Generated PRD file in `docs/prd/{story-id}.md`
- Updated story file with PRD reference
- Decision log entry documenting the generation

## Process
1. Validate story exists and is in progress
2. Extract acceptance criteria from story
3. Generate PRD using Aider with appropriate template
4. Validate generated PRD structure
5. Save PRD to documentation location
6. Update story with PRD reference
7. Create decision log entry

## Validation Gates
- BLOCK: Story not found or not in progress
- BLOCK: No acceptance criteria in story
- BLOCK: Aider execution failed
- WARN: PRD generation took > 2 minutes
- WARN: PRD size < 100 words (may be incomplete)

## Example Usage
```bash
@devops spec-generate-prd STORY-123
```

## Success Criteria
- PRD file created at `docs/prd/STORY-123.md`
- PRD contains all acceptance criteria from story
- Story file updated with PRD reference
- Decision log entry created
- No validation errors

## Error Handling
- If story not found: Report error and suggest checking story ID
- If no acceptance criteria: Prompt user to add criteria first
- If Aider fails: Report error with Aider output
- If validation fails: Report specific validation issues

## Integration Points
- Connects to story system for input
- Uses Aider for generation
- Updates decision logging system
- Integrates with PRD documentation structure
