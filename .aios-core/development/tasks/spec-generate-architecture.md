# Spec Generate Architecture

## Overview
Generates system architecture documentation from PRD using Aider.

## When to Use
- When PRD is complete and needs architecture design
- For complex features requiring detailed system design
- When preparing for implementation phase

## Prerequisites
- PRD must exist and be complete
- PRD must be validated and approved
- Aider must be properly configured and available

## Input
- PRD file path (mandatory)
- Story ID (optional, for context)

## Output
- Generated architecture file in `docs/architecture/{prd-id}.md`
- Updated PRD with architecture reference
- Decision log entry documenting the generation

## Process
1. Validate PRD exists and is complete
2. Analyze PRD requirements and constraints
3. Generate architecture using Aider with appropriate template
4. Validate generated architecture structure
5. Save architecture to documentation location
6. Update PRD with architecture reference
7. Create decision log entry

## Validation Gates
- BLOCK: PRD not found or incomplete
- BLOCK: Aider execution failed
- WARN: Architecture generation took > 3 minutes
- WARN: Architecture size < 200 words (may be incomplete)

## Example Usage
```bash
@devops spec-generate-architecture docs/prd/STORY-123.md
```

## Success Criteria
- Architecture file created at `docs/architecture/STORY-123.md`
- Architecture covers all PRD requirements
- PRD file updated with architecture reference
- Decision log entry created
- No validation errors

## Error Handling
- If PRD not found: Report error and suggest checking path
- If PRD incomplete: Report missing sections
- If Aider fails: Report error with Aider output
- If validation fails: Report specific validation issues

## Integration Points
- Connects to PRD system for input
- Uses Aider for generation
- Updates decision logging system
- Integrates with architecture documentation structure
