# Task: Decompose Story into Tasks

> **Phase**: Planning
> **Owner Agent**: @sm-aider
> **Squad**: dev-aider
> **Elicit**: Yes - requires story path or content

---

## Purpose

Break a story into atomic, independently-implementable tasks that each fit in Aider's 4k context window.

---

## Execution Flow

### Step 1: Elicit Story Input

Ask: "Provide the story file path or paste the story content:"

- Option A: `--story-file docs/story.md`
- Option B: `--story "{story content}"`

Validate file exists or content is non-empty.

### Step 2: Parse Story

Extract from story:
- Feature name
- Acceptance criteria
- Files affected
- Complexity level

### Step 3: Build Decomposition Prompt

Generate prompt for Aider:

```
Break this story into atomic tasks. Each task must:
1. Reference at most 3 files
2. Have a one-sentence success check
3. Fit in 4k token context
4. Be independently implementable

[story content]

Output: Numbered list with:
- Task name
- Files affected
- Success check (command/test)
- Dependencies
- Complexity
```

### Step 4: Invoke task-decomposer.js

```bash
node scripts/task-decomposer.js --story-file story.md
```

### Step 5: Validate Decomposition

Check each task:
- [ ] References ≤3 files
- [ ] Has executable success check
- [ ] No circular dependencies
- [ ] Complexity is realistic

If validation fails, flag in summary.

### Step 6: Generate Task List

Save to: `tasks-{story-name}.md`

Format: Numbered list with dependency graph.

### Step 7: Update Story Summary

Populate `templates/story-summary-tmpl.md` with:
- Task count
- Estimated total effort
- Parallelization opportunities

Save as: `story-summary-{story-name}.md` (updated)

### Step 8: HALT for Claude Review

Display summary. Tell user:

```
✅ Tasks decomposed!

Summary: story-summary-{name}.md

Claude action: Type APPROVED (proceed) or CHANGES_REQUESTED (refine)
```

---

## Error Handling

### Error 1: Story file not found

**Cause**: Path is wrong or file was moved

**Resolution**: Ask for path again or accept pasted content

### Error 2: Tasks don't fit atomicity criteria

**Cause**: Aider generated tasks that are too large/complex

**Resolution**: Re-prompt Aider with stricter constraints. Retry decomposition.

### Error 3: Circular dependencies detected

**Cause**: Task A depends on B, B depends on A

**Resolution**: Reorder tasks to eliminate cycles. Edit task list manually.

---

## Success Criteria

- [ ] All acceptance criteria have corresponding tasks
- [ ] Each task has executable success check
- [ ] Dependencies are explicit and acyclic
- [ ] Task count is reasonable (3-8 typical)
- [ ] No task references >3 files
- [ ] Summary is populated for Claude review

---

## Metadata

```yaml
story: SQS-XX
version: 1.0.0
created: 2026-02-04
author: dev-aider squad
tags: [task-decomposition, sm-aider, planning]
```

---

*Task definition for @sm-aider *create-tasks command.*
