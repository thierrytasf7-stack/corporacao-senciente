# Workflow: Generate Summaries & Documentation via Aider

**Cost:** $0 (100% Aider FREE)
**Efficiency:** 90% token savings vs Claude
**Quality:** Consistent, pattern-compliant output

---

## 🎯 Why This Workflow

**Problem:** Every conversation ends with summaries/docs
- Claude reads everything → generates summary → costs $$
- Repeated for every project/task

**Solution:** Aider generates summaries
- Aider reads files/context → generates docs → costs $0
- 90% cheaper than Claude doing it
- Consistent quality via templates
- Scalable (reusable for all projects)

---

## 🔄 Workflow Overview

```
Project/Conversation Complete
    ↓
TRIGGER: Generate Summaries
    ↓
Collect Context Files
    ├─ docs/stories/*.md
    ├─ Git history (git log)
    ├─ Changes (git diff)
    └─ Project metadata
    ↓
BATCH 1 (Parallel - 2 Aider terminals):
    Terminal 1: @aider-dev → Generate Executive Summary
    Terminal 2: @aider-dev → Generate Technical Summary
    ↓
BATCH 2 (Sequential):
    Terminal 1: @aider-dev → Generate Documentation
    ↓
OUTPUT:
    ✓ docs/summaries/executive-summary.md
    ✓ docs/summaries/technical-summary.md
    ✓ docs/generated/documentation.md
    ↓
VALIDATE:
    ✓ Quality gates
    ✓ Pattern compliance
    ✓ Completeness
    ↓
COMMIT & STORE
    ✓ Git add summaries
    ✓ Archive in docs/
```

---

## 📋 Task 1: Executive Summary Generation

**Trigger:** When project/sprint complete

**Command:**
```bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file docs/summaries/executive-summary.md \
      --message "Generate Executive Summary:

CONTEXT FILES:
$(git log --oneline -20)

INSTRUCTIONS:
1. Read project stories from docs/stories/
2. Read git diff summary
3. Generate 1-page executive summary with:
   - Project name & objective
   - What was delivered (bullet points)
   - Metrics (cost, time, quality)
   - Key achievements
   - Next steps (if any)
4. Format: Markdown, <500 words
5. Style: Non-technical, business-focused
6. Include: Team, timeline, budget impact"
```

**Output Template:**
```markdown
# Executive Summary: [Project Name]

## Overview
[1-2 sentences about project]

## Delivered
- [Feature 1]
- [Feature 2]
- [Feature 3]

## Metrics
- Cost: [$ or $0 if Aider]
- Time: [X hours]
- Quality: [Pass/Fail]

## Impact
[1-2 paragraphs on business value]

## Next
- [Future work]
```

---

## 📋 Task 2: Technical Summary Generation

**Trigger:** When implementation complete

**Command:**
```bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file docs/summaries/technical-summary.md \
      --message "Generate Technical Summary:

CONTEXT:
$(git diff --stat)
$(git log --format='%H %s' -10)

INSTRUCTIONS:
1. Analyze code changes (git diff)
2. Read story files from docs/stories/
3. Generate technical summary with:
   - Architecture overview
   - Files changed (grouped by component)
   - Key implementations
   - Tests added (coverage %)
   - Performance impact
   - Technical debt (if any)
4. Format: Markdown, technical audience
5. Include: Dependencies, compatibility, migration notes"
```

**Output Template:**
```markdown
# Technical Summary: [Project Name]

## Architecture
[Component diagram or text description]

## Changes
### Backend
- [file]: [change description]

### Frontend
- [file]: [change description]

## Implementation Highlights
- [Key technical decision 1]
- [Key technical decision 2]

## Testing
- Unit tests: [N passing]
- Integration tests: [N passing]
- Coverage: [X%]

## Performance
- [Metric 1]: [improvement]
- [Metric 2]: [impact]

## Migration
[If needed, migration instructions]

## Dependencies
- [Dependency]: [version]
```

---

## 📋 Task 3: Full Documentation Generation

**Trigger:** When code + tests + stories all complete

**Command:**
```bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file docs/generated/[project]-documentation.md \
      --message "Generate Complete Documentation:

SOURCE FILES:
- Stories: docs/stories/*.md
- Code: src/[relevant files]
- Tests: tests/[relevant tests]

INSTRUCTIONS:
1. Read all source files
2. Generate comprehensive documentation with:
   - Table of contents
   - Feature overview (for each feature)
   - API reference (if applicable)
   - Configuration guide
   - Usage examples
   - Troubleshooting
   - FAQ
3. Structure: Beginner-to-advanced flow
4. Code examples: Real, working examples
5. Keep: Clear, readable, scannable"
```

**Output Template:**
```markdown
# [Project Name] Documentation

## Table of Contents
1. Getting Started
2. Features
3. API Reference
4. Configuration
5. Examples
6. Troubleshooting
7. FAQ

## Getting Started

### Prerequisites
- [requirement 1]

### Installation
\`\`\`bash
[install instructions]
\`\`\`

## Features

### Feature 1: [Name]
[Description]
\`\`\`javascript
[example code]
\`\`\`

## API Reference

### Function: [name]
\`\`\`typescript
[signature]
\`\`\`
[Description]

## Configuration
[Config options]

## Examples
[Real, working examples]

## Troubleshooting
[Common issues + solutions]

## FAQ
[Q&A]
```

---

## 🎯 When to Use This Workflow

### Trigger: Project Complete
```
✓ All features implemented
✓ All tests passing
✓ Code reviewed
✓ Merged to main
→ RUN SUMMARY GENERATION WORKFLOW
```

### Trigger: Sprint End
```
✓ Sprint tasks complete
✓ Deployment done
✓ Metrics gathered
→ RUN SUMMARY GENERATION WORKFLOW
```

### Trigger: Major Feature Done
```
✓ Feature fully implemented
✓ Documentation written
✓ Tests comprehensive
→ RUN SUMMARY GENERATION WORKFLOW
```

---

## 💰 Cost Analysis

### All-Claude Approach
```
Executive summary:      $5 (Claude reads + generates)
Technical summary:      $8 (Claude reads + generates)
Documentation:          $20 (Claude reads + generates)
────────────────────────────────
Total:                  ~$33 per project
```

### Aider-First Approach
```
Executive summary:      $0 (@aider-dev)
Technical summary:      $0 (@aider-dev)
Documentation:          $0 (@aider-dev)
────────────────────────────────
Total:                  $0 per project

Savings: $33 × 12 projects/year = $396/year
```

---

## ⚡ Parallel Execution

### Batch 1 (2 Terminals, Simultaneous)
```
Terminal 1:
  aider → Generate Executive Summary ($0)
  Time: ~3 minutes

Terminal 2:
  aider → Generate Technical Summary ($0)
  Time: ~3 minutes

[Both run simultaneously]
```

### Batch 2 (Sequential)
```
Terminal 1:
  aider → Generate Full Documentation ($0)
  Time: ~5 minutes
```

**Total Time:** ~8 minutes (vs 25 minutes if sequential)

---

## 🔍 Quality Validation

### Pre-Generation
```
✓ Context files ready?
✓ Git history available?
✓ Code committed?
✓ Tests passing?
→ If all YES: Generate
```

### Post-Generation
```
✓ Summary complete?
✓ AIOS patterns followed?
✓ Markdown valid?
✓ No placeholders?
✓ Content accurate?
→ If all YES: Commit & Store
```

### Quality Checklist
```
Executive Summary:
  ✓ <500 words
  ✓ Non-technical language
  ✓ Metrics included
  ✓ Business value clear

Technical Summary:
  ✓ Architecture explained
  ✓ Changes documented
  ✓ Tests mentioned
  ✓ Performance impact clear

Documentation:
  ✓ Complete TOC
  ✓ Examples working
  ✓ Troubleshooting included
  ✓ FAQ comprehensive
```

---

## 🛠️ Implementation in Mordomo

### Mordomo Command
```bash
@mordomo *generate-summaries

# Or with options:
@mordomo *generate-summaries --type executive
@mordomo *generate-summaries --type technical
@mordomo *generate-summaries --type all
@mordomo *generate-summaries --output docs/
```

### Mordomo Workflow
```
1. Detect: Project complete? (check git status)
2. Collect: Context files needed
3. Batch 1: Spawn 2 Aider terminals (parallel)
4. Batch 2: Spawn 1 Aider terminal (sequential)
5. Monitor: Capture all outputs
6. Validate: Quality gates
7. Commit: git add summaries/
8. Report: Summary generation complete + cost=$0
```

---

## 📁 Directory Structure

```
docs/
├── stories/                    # Original stories
├── summaries/                  # Generated summaries
│   ├── executive-summary.md    # Business summary
│   └── technical-summary.md    # Technical summary
├── generated/                  # Generated documentation
│   ├── [project]-documentation.md
│   ├── [feature]-guide.md
│   └── [api]-reference.md
└── archive/                    # Old summaries (for history)
```

---

## 🚀 Usage Examples

### Example 1: After Sprint
```bash
@mordomo *generate-summaries --sprint "Sprint 2.1"

Mordomo:
  ✓ Reading sprint stories
  ✓ Analyzing git changes (sprint branch)
  ✓ Terminal 1: Executive summary
  ✓ Terminal 2: Technical summary (parallel)
  ✓ Validating quality
  ✓ Committing docs/summaries/

Result:
  ✅ docs/summaries/sprint-2.1-executive.md
  ✅ docs/summaries/sprint-2.1-technical.md
  📊 Cost: $0
  ⏱️  Time: 8 minutes
```

### Example 2: After Feature
```bash
@mordomo *generate-summaries --feature "auth-system"

Mordomo:
  ✓ Reading feature story
  ✓ Analyzing code changes
  ✓ Terminal 1: Executive summary
  ✓ Terminal 2: Technical summary (parallel)
  ✓ Terminal 3: Full documentation
  ✓ Quality validation
  ✓ Committing

Result:
  ✅ docs/summaries/auth-system-executive.md
  ✅ docs/summaries/auth-system-technical.md
  ✅ docs/generated/auth-system-documentation.md
  📊 Cost: $0
  ⏱️  Time: 12 minutes
```

### Example 3: Complete Project
```bash
@mordomo *generate-summaries --project "squadcreator-aider"

Mordomo:
  ✓ Reading all project files
  ✓ Analyzing complete git history
  ✓ Terminal 1: Executive summary
  ✓ Terminal 2: Technical summary (parallel)
  ✓ Terminal 3: Full documentation
  ✓ Quality validation (comprehensive)
  ✓ Committing to docs/

Result:
  ✅ docs/summaries/squadcreator-aider-executive.md
  ✅ docs/summaries/squadcreator-aider-technical.md
  ✅ docs/generated/squadcreator-aider-complete.md
  📊 Cost: $0
  ⏱️  Time: 15 minutes
```

---

## 🔧 Configuration

### In `.aios-core/core-config.yaml`

```yaml
summary-generation:
  enabled: true
  auto-trigger: "on-merge-main"
  parallelism: 2
  output-dir: "docs/summaries"

  templates:
    executive: ".aios-core/templates/summary-executive.md"
    technical: ".aios-core/templates/summary-technical.md"
    documentation: ".aios-core/templates/doc-complete.md"

  validation:
    min-words: 100
    max-words: 1000
    require-metrics: true
    require-examples: true

  aider-config:
    model: "openrouter/arcee-ai/trinity-large-preview:free"
    no-auto-commits: true
    yes: true
```

---

## 📊 Savings Over Time

```
Projects per year:      12
Summaries per project:  3 (executive, technical, full docs)
Total summaries:        36

Cost per summary (Claude):  ~$10
Total cost (all Claude):    $360/year

Cost per summary (Aider):   $0
Total cost (all Aider):     $0/year

Annual savings:             $360
```

---

## ✅ Implementation Checklist

- [ ] Create workflow file
- [ ] Add Aider commands
- [ ] Create templates
- [ ] Add Mordomo integration
- [ ] Test with real project
- [ ] Document in user guide
- [ ] Add to CI/CD pipeline
- [ ] Monitor first 5 runs
- [ ] Optimize based on results

---

## 🎯 Success Criteria

```
✅ Summaries generated via Aider (not Claude)
✅ Cost remains $0
✅ Quality gates all pass
✅ Execution time <15 minutes
✅ All outputs stored in docs/
✅ Committed to git with proper messages
✅ Repeatable (same input = same quality output)
✅ Scalable (works for projects of any size)
```

---

## 📞 Troubleshooting

### Issue: Aider timeout
```
Solution: Break into smaller files
  Instead of: One 5000-word doc
  Do: Split into 3 × 1500-word docs
```

### Issue: Output quality inconsistent
```
Solution: Use detailed templates
  Instead of: "Generate summary"
  Do: "Generate summary following template X"
```

### Issue: Missing context
```
Solution: Provide files explicitly
  Instead of: "Read everything"
  Do: "Read files: story.md, git diff, tests/"
```

---

## 🚀 Next Steps

1. **Create workflow file** (this file - DONE)
2. **Add to Mordomo** - Integrate `*generate-summaries` command
3. **Create templates** - Executive, technical, full doc
4. **Test with real project** - Run on squadcreator-aider
5. **Validate quality** - Check against checklist
6. **Document usage** - Add to user guide
7. **Automate trigger** - On merge to main
8. **Monitor costs** - Track @status-monitor reports

---

## 🎓 Philosophy

**Original approach:** Claude reads everything, generates summary ($$)
**Aider approach:** Aider reads context, generates summary ($0)
**Result:** Same quality, zero cost, repeatable, scalable

This is how Aider-First works: delegate to Aider whenever possible.

---

*Workflow: Generate Summaries & Documentation via Aider | Cost: $0 | Savings: 90% vs Claude*
