# Task: Create Story via Aider

> **Phase**: Planning
> **Owner Agent**: @po-aider
> **Squad**: dev-aider
> **Elicit**: Yes - requires user input

---

## Purpose

Generate a complete user story from requirements using Aider with free models. Output includes both the story file and a summary for Claude review.

---

## Prerequisites

- [ ] OPENROUTER_API_KEY environment variable set
- [ ] Aider CLI installed (`aider --version` works)
- [ ] User has requirements prepared (feature name, user persona, value statement)

---

## Execution Flow

### Step 1: Elicit Requirements

**Ask user for 3 inputs**:

1. **Feature name**: What is this feature called?
   - Example: "Add JWT token refresh endpoint"
   - Validate: Non-empty string, 2-50 characters

2. **User persona**: Who needs this? What's their role?
   - Example: "Backend API user needing long-lived session tokens"
   - Validate: Non-empty, describes a user type

3. **Value statement**: Why does it matter? What problem does it solve?
   - Example: "Enable long-lived sessions without forcing re-authentication frequently"
   - Validate: Non-empty, starts with "Enable", "Add", or similar

**After user responds**, proceed to Step 2.

### Step 2: Validate Inputs

Check that inputs are reasonable:
- [ ] All 3 fields are non-empty
- [ ] Feature name is 2-50 chars
- [ ] No typos or obviously wrong values

If validation fails, loop back to Step 1. Otherwise, proceed.

### Step 3: Build Aider Prompt

Generate a prompt optimized for Trinity 127B (4k context):

```
Generate a user story using this template:

# Story: {featureName}

## User Persona
{userPersona}

## Value Delivered
{valueStatement}

## Acceptance Criteria
- List specific, testable criteria

## Files Affected
- List expected files (max 5)

## Complexity
SIMPLE | STANDARD | COMPLEX

## Notes
- Any risks or dependencies
```

Keep prompt under 2,000 chars. If longer, truncate.

### Step 4: Invoke story-generator.js

```bash
node scripts/story-generator.js \
  --feature "{featureName}" \
  --persona "{userPersona}" \
  --value "{valueStatement}"
```

Wait for Aider subprocess to complete. Capture output.

### Step 5: Generate Story File

Save Aider output to: `story-{feature-name-slugified}.md`

Example: `story-jwt-token-refresh.md`

### Step 6: Generate Summary

Populate `templates/story-summary-tmpl.md` with:
- Feature name
- Scope (1-2 sentences)
- Task count (estimate from story)
- Risk assessment
- Cost ($0 for Aider)

Save as: `story-summary-{feature-name}.md`

### Step 7: HALT and Request Claude Review

Display the summary. Tell user:

```
✅ Story generated!

Summary file: story-summary-{name}.md

Claude action:
  Read the summary above.
  Type: APPROVED (proceed) or CHANGES_REQUESTED (refine)
```

---

## Error Handling

### Error 1: Aider subprocess fails

**Cause**: Aider CLI not found, API key invalid, or model unavailable

**Resolution**:
1. Check: `aider --version` works
2. Check: `echo $OPENROUTER_API_KEY` shows a key
3. Retry with fallback model via model-selector

**Recovery**: If persists after 2 retries, escalate to @po (Claude PO agent)

### Error 2: Aider times out (>30 seconds)

**Cause**: Model is slow or overloaded

**Resolution**: Retry with Qwen 2.5 7B (larger, sometimes faster)

**Recovery**: If timeout persists, split story into smaller requirement sets

### Error 3: User provides vague inputs

**Cause**: Feature name is unclear, persona is generic, value is non-specific

**Resolution**: Ask again with examples. Explain: "Be specific, not vague."

**Recovery**: Offer to let @po (Claude) refine requirements first

---

## Example: Real Execution

**User inputs**:
- Feature: "Add JWT refresh endpoint"
- Persona: "Mobile app needing to keep sessions alive without constant re-auth"
- Value: "Enable seamless background token refresh without user interruption"

**Aider generates**:
```markdown
# Story: Add JWT Token Refresh Endpoint

## User Persona
Mobile app developer building apps that communicate with our API.

## Value Delivered
Enable automatic token refresh without forcing users to re-authenticate.

## Acceptance Criteria
- POST /api/auth/refresh endpoint accepts refresh token
- Returns new access token + new refresh token
- Old refresh token is invalidated
- Tests: unit tests for endpoint, integration test with auth flow

## Files Affected
- src/routes/auth.js
- src/middleware/jwt.js
- tests/auth.test.js

## Complexity
STANDARD (4-6 hours, ~200 LOC)
```

**Summary generated**:
```
# Story Summary: Add JWT Token Refresh Endpoint

Status: PENDING_REVIEW
Scope: Mobile apps need to refresh tokens without re-authentication. Adds POST /api/auth/refresh.
Tasks Planned: 3 tasks
Risk: LOW (straightforward JWT implementation)
Cost: $0 (all via Aider)

Claude action: Type APPROVED or CHANGES_REQUESTED
```

---

## Integration Points

**Called by**: @po-aider *create-story command

**Calls**: story-generator.js (Aider subprocess wrapper)

**Outputs to**: story-{name}.md + story-summary-{name}.md

**Handoff to**: Claude (plan review gate) → @sm-aider (task decomposition)

---

## Success Criteria

- [ ] Story file created with complete content
- [ ] Summary file created and populated
- [ ] Acceptance criteria are testable
- [ ] Files affected are realistic (≤5)
- [ ] Complexity is assessed
- [ ] User can read summary and make approval decision

---

## Metadata

```yaml
story: SQS-XX (to be assigned)
version: 1.0.0
created: 2026-02-04
author: dev-aider squad
tags:
  - story-creation
  - aider-integration
  - po-aider
  - planning
```

---

*Task definition for @po-aider *create-story command. Part of aider-full-cycle workflow.*
