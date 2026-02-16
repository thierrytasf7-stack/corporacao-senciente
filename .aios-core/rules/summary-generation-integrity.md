# Summary Generation Integrity Rules

**Severity:** MANDATORY (enforced by workflow)
**Cost:** $0 (100% Aider, never Claude)
**Quality:** Consistent, pattern-compliant, automatically validated

---

## 🎯 Core Principle

**Summaries, documentation, and final reports MUST be generated via Aider FREE, never via Claude paid models.**

This is non-negotiable to maintain cost efficiency and consistency.

---

## 📋 Rule 1: Use Aider-Only Models

### What's Required
```
✅ MUST use: openrouter/arcee-ai/trinity-large-preview:free
✅ MUST NOT use: claude-3.5, gpt-4, paid models
✅ MUST NOT use: Claude ($$) for summaries
```

### When Applied
```
Every time you generate:
  - Executive summary
  - Technical summary
  - Documentation
  - Project report
  - Sprint review
  - Feature overview
  - API reference
  - User guide

ALL MUST go via Aider FREE
```

### Verification
```
Terminal output must show:
  "Model: openrouter/arcee-ai/trinity-large-preview:free"

If shows different model:
  ❌ FAIL - Wrong model used
  ❌ Cost not $0
  ❌ Violates rule
```

---

## 📋 Rule 2: Context Over Assumptions

### What's Required
```
✅ MUST: Provide actual context (files, git history, stories)
✅ MUST: Let Aider read real sources
✅ MUST NOT: "Assume" what to write
✅ MUST NOT: Generate from memory/prior knowledge
```

### Why
```
Assumption-based:
  You know the project
  → You write summary
  → Uses Claude tokens ($$)
  → Cost: $X

Context-based:
  Aider reads actual files
  → Aider generates summary
  → Uses Aider FREE ($0)
  → Cost: $0 + More accurate
```

### How
```
When generating summary:

1. Provide context:
   aider --file summary.md \
         --message "Context: [git diff]
                    Files: [list]
                    Stories: [content]
                    Generate: ..."

2. Let Aider analyze (not you)

3. Aider generates (not you)

4. You validate (checklist)
```

---

## 📋 Rule 3: Templates First

### What's Required
```
✅ MUST: Use templates for consistency
✅ MUST: Aider follows template structure
✅ MUST NOT: Free-form generation
✅ MUST NOT: Vary format per project
```

### Templates Exist For
```
Executive Summary:
  → Template: .aios-core/templates/summary-executive.md
  → Structure: Overview, Delivered, Metrics, Impact, Next

Technical Summary:
  → Template: .aios-core/templates/summary-technical.md
  → Structure: Architecture, Changes, Tests, Performance, Migration

Full Documentation:
  → Template: .aios-core/templates/doc-complete.md
  → Structure: TOC, Getting Started, Features, API, Examples, FAQ
```

### Implementation
```
aider --file docs/summaries/summary.md \
      --message "Generate using template:
        $(cat .aios-core/templates/summary-executive.md)

        Context files:
        [provide actual files]

        Keep template structure, fill with real data."
```

---

## 📋 Rule 4: Quality Gates (Automatic)

### Pre-Generation Checks
```
MUST pass ALL before generating:

✓ Git repo committed
  → No uncommitted changes that should be included

✓ Tests passing
  → Quality validation exists

✓ Stories written
  → What was the intent?

✓ Code complete
  → Implementation actually done

✓ Context available
  → Can Aider read real files?

If ANY fails:
  → HALT generation
  → Fix blocker first
  → Then generate
```

### Post-Generation Validation
```
MUST pass ALL after generating:

✓ Markdown valid
  → No syntax errors
  → Renders properly

✓ Length appropriate
  → Executive: 300-500 words
  → Technical: 500-1000 words
  → Documentation: 2000+ words

✓ Metrics present
  → Cost, time, quality
  → Numbers, not "good"

✓ Examples working
  → Code examples valid
  → Not placeholders

✓ No placeholders
  → "[TODO]" not in output
  → All sections filled

✓ Pattern compliant
  → Follows AIOS standards
  → Consistent with other docs

✓ Accurate
  → Matches actual project
  → No false claims

✓ Complete
  → All sections present
  → No missing parts

If ANY fails:
  → Mark as FAILED
  → Regenerate with fixes
  → Don't commit incomplete
```

---

## 📋 Rule 5: Parallel Execution (When Applicable)

### What's Allowed
```
✅ Multiple Aider tasks simultaneously:
   Terminal 1: Executive summary
   Terminal 2: Technical summary
   [Both run parallel = 2x faster]

✅ Different types in sequence:
   Batch 1 (parallel): Summaries
   Batch 2 (sequential): Full documentation
   [Depends-on logic respected]

✅ Parallel across independent features:
   Terminal 1: Feature A docs
   Terminal 2: Feature B docs
   [No dependencies]
```

### What's NOT Allowed
```
❌ More than 4 terminals
   → Resource constraints
   → Monitoring becomes hard

❌ Dependent tasks in parallel
   → Feature docs before feature complete
   → Summary before implementation done

❌ Same task twice in parallel
   → Causes conflicts
   → Redundant work
```

---

## 📋 Rule 6: Version Control

### What's Required
```
✅ MUST: Commit all generated docs
  git add docs/summaries/
  git add docs/generated/
  git commit -m "docs: generate summaries via aider ($0)"

✅ MUST: Include in git history
  → Summaries are artifacts of development
  → Track evolution over time

✅ MUST: Archive old versions
  → docs/archive/[date]-summary.md
  → Keep history for reference
```

### What's NOT Required
```
❌ Commit every intermediate version
  → Only final (validated) version

❌ Pollute commit history
  → Use squash if needed
```

---

## 📋 Rule 7: No Manual Summarization

### What's Forbidden
```
❌ You read project → write summary (uses Claude tokens)
❌ You describe → call it summary (not accurate)
❌ You assume → claim it's validated (not verified)
❌ You write summaries manually (breaks $0 promise)
```

### What's Required
```
✅ Aider reads context → generates summary ($0)
✅ You validate → check quality gate ($0)
✅ Store result → commit to git ($0)
✅ Repeatable process → same input = same quality
```

---

## 📋 Rule 8: Cost Transparency

### What Must Be Reported
```
Every summary generation MUST report:

Cost: $0 ✓
  - Executive summary: $0 (Aider)
  - Technical summary: $0 (Aider)
  - Documentation: $0 (Aider)
  → Total: $0

Time: X minutes
  - Single task: ~3-5 min
  - Parallel: ~8 min
  - Sequential: ~15 min

Quality: Pass/Fail
  - All gates pass: ✓ Deploy
  - Any gate fail: ✗ Regenerate

Tokens: 0 Claude, X Aider
  - Never shows Claude tokens
  - Aider usage is tracked but free
```

### What Cannot Be Claimed
```
❌ "Cost is ~$X" (should be exactly $0)
❌ "Probably costs less" (must be verified)
❌ "Faster than Claude" (irrelevant if costs $$)
❌ "Good enough" (quality gates are objective)
```

---

## 📋 Rule 9: Consistency Across Projects

### What's Required
```
✅ All projects use SAME workflow
✅ All projects use SAME templates
✅ All projects use SAME quality gates
✅ All projects report SAME metrics
```

### Why
```
Consistency:
  Project A summary → Same format as Project B
  → Makes comparison easy
  → Reduces confusion
  → Improves professional appearance

Reusability:
  Template tested once
  → Works for all projects
  → No reinventing

Efficiency:
  Same process
  → Faster setup
  → Fewer mistakes
  → Lower learning curve
```

### Implementation
```
Use standard templates for all projects:
  .aios-core/templates/summary-executive.md
  .aios-core/templates/summary-technical.md
  .aios-core/templates/doc-complete.md

Use standard workflow:
  .aios-core/workflows/generate-summaries-aider.md

Use standard quality gates:
  .aios-core/checklists/summary-quality-gates.md

Use standard reporting:
  Cost: $0, Time: X min, Quality: Pass/Fail
```

---

## 📋 Rule 10: Integration with Mordomo

### What Mordomo Must Do
```
When command: @mordomo *generate-summaries

✅ MUST:
  1. Validate context (git, stories, code)
  2. Spawn Aider terminals (not Claude)
  3. Pass actual files to Aider (not assume)
  4. Use templates (not free-form)
  5. Capture output (proof of execution)
  6. Run quality gates (validation checklist)
  7. Commit results (git add + commit)
  8. Report: Cost=$0, Time=X, Quality=Pass/Fail

✅ MUST NOT:
  1. Use Claude for generation
  2. Assume context (read actual files)
  3. Skip templates
  4. Ignore quality gates
  5. Claim success without validation
```

### Integration Points
```
Mordomo Command:
  @mordomo *generate-summaries [--type all|executive|technical]

Mordomo Delegates To:
  @aider-dev: Actual Aider CLI execution

Mordomo Validates:
  .aios-core/checklists/summary-quality-gates.md

Mordomo Reports:
  "Summaries generated via Aider
   Cost: $0
   Time: 8 minutes
   Quality: All gates pass ✓
   Files: docs/summaries/[files]"
```

---

## 🔍 Enforcement

### Automated Enforcement
```
Gate 1: Pre-generation validation
  → Checks: repo committed, tests pass, context available
  → Blocks: generation if ANY check fails

Gate 2: Model verification
  → Checks: terminal output shows openrouter/arcee
  → Blocks: if different model detected

Gate 3: Quality gate validation
  → Checks: markdown, length, metrics, examples, accuracy
  → Blocks: if ANY check fails

Gate 4: Integrity verification
  → Checks: files exist, git shows them, cost=$0
  → Blocks: if integrity violation detected
```

### Manual Enforcement
```
Code review:
  → Verify summaries make sense
  → Check accuracy against code
  → Validate metrics correct

Spot checks:
  → Occasionally read terminal output
  → Verify Aider really ran
  → Confirm cost actually $0
```

---

## 📊 Checklist: Before Claiming Summary Complete

Use this EVERY time:

```
Pre-Generation:
  ✓ Git repo has all work committed
  ✓ Tests passing (npm test)
  ✓ Code review complete
  ✓ Stories written
  ✓ Story checkboxes updated

Generation:
  ✓ Aider model: openrouter/arcee-ai/trinity-large-preview:free
  ✓ Terminal output captured
  ✓ Files actually created (not simulated)
  ✓ No Claude used

Post-Generation:
  ✓ Summary markdown valid
  ✓ All sections filled (no placeholders)
  ✓ Metrics present (cost, time, quality)
  ✓ Examples working/accurate
  ✓ Length appropriate
  ✓ Tone matches audience
  ✓ Grammar/spelling correct
  ✓ Matches actual project

Validation:
  ✓ All quality gates PASS
  ✓ @status-monitor confirms $0
  ✓ Git shows files committed
  ✓ Cost report shows $0

If ANY ✗:
  → Don't claim complete
  → Regenerate or fix blocker
  → Revalidate
  → Then claim complete
```

---

## 🚫 What Causes Failure

```
❌ Using Claude instead of Aider
   → Cost violation
   → Integrity failure

❌ Assuming context instead of providing files
   → Accuracy failure
   → Aider-First principle violation

❌ Skipping quality gates
   → Quality failure
   → Framework principle violation

❌ Free-form generation instead of templates
   → Consistency failure
   → Standard violation

❌ Committing incomplete summaries
   → Integrity failure
   → Data corruption risk

❌ Not reporting $0 cost
   → Transparency failure
   → Trust breach

❌ Claiming success without validation
   → Honesty failure
   → Framework violation
```

---

## ✅ Success Criteria

```
Summary generation successful when:

✅ Generated via Aider FREE (not Claude)
✅ Uses actual context files (not assumptions)
✅ Follows standard template
✅ All quality gates PASS
✅ Cost = $0 (verified)
✅ Committed to git
✅ Accurately represents project
✅ Repeatable (same input = same quality)
✅ Consistent with other summaries
✅ No rule violations
```

---

## 📞 Enforcement Process

If violation detected:

```
1. HALT generation
2. Document violation
   → Which rule violated?
   → What happened?
   → Evidence?

3. Investigate
   → Why did it happen?
   → Was it intentional?
   → How to prevent?

4. Fix
   → Regenerate correctly
   → Use Aider (not Claude)
   → Validate properly

5. Report
   → User needs to know
   → Document lesson learned
```

---

## 🎓 Philosophy

**Goal:** High-quality summaries at zero cost

**Method:**
  1. Use Aider FREE (not Claude $$)
  2. Provide real context (read actual files)
  3. Follow templates (consistency)
  4. Validate quality (gates)
  5. Report transparently ($0 cost)

**Result:**
  - Quality ✅ (templates + validation)
  - Cost $0 ✅ (Aider FREE)
  - Consistency ✅ (same process)
  - Integrity ✅ (rules enforced)
  - Scalability ✅ (repeatable)

---

*Summary Generation Integrity Rules | Severity: MANDATORY | Cost: $0 | Quality: Guaranteed*
