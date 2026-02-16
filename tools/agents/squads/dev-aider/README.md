# Dev-Aider Squad 💰

**Ultra-Low-Cost Development with Free AI Models**

Reduce your AI development costs by **100%** on suitable tasks using AIDER-AIOS with completely free Arcee Trinity 127B model via OpenRouter.

---

## 🚨 CRITICAL: MANDATORY AIDER CLI USAGE

**ALL aider-* agents MUST invoke Aider CLI for implementation work.**

```bash
# REQUIRED: Invoke Aider CLI via Bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file {target_files} \
      --message "{task_prompt}"
```

**FORBIDDEN:** Writing code directly via Claude Write/Edit tools.

**See:** `AIDER-EXECUTION-RULES.md` for complete rules.

---

## Agents & Their Mandatory Execution

| Agent | Execution Method | Cost |
|-------|-----------------|------|
| **@po-aider** | Aider CLI → Story generation | $0 |
| **@sm-aider** | Aider CLI → Task decomposition | $0 |
| **@aider-dev** | Aider CLI → Code implementation | $0 |
| **@qa-aider** | Bash → npm run lint/test | $0 |
| **@deploy-aider** | Bash → git commands | $0 |

---

## What is Dev-Aider?

A specialized AIOS squad that orchestrates development work through two different AI engines:

1. **Claude (AIOS)** - Expensive but excellent for complex reasoning & design
2. **Aider + Trinity 127B (Free)** - Cheap but excellent for implementation & refactoring

**The Goal:** Use the right tool for each task to maximize value (quality ÷ cost).

---

## Why Use Dev-Aider?

### Cost Comparison

| Task | Claude Cost | Aider Cost | Savings |
|------|------------|-----------|---------|
| Refactor 200-line module | $2-5 | $0 | **100%** |
| Implement CRUD API (300 lines) | $5-10 | $0 | **100%** |
| Add unit tests (200 lines) | $3-7 | $0 | **100%** |
| Document API (500 lines) | $5-10 | $0 | **100%** |
| **Monthly (20 tasks)** | **$50-100** | **$0** | **100%** |

### Real Numbers

If you do **20 development tasks per month:**
- **All Claude:** $50-100/month = $600-1,200/year
- **Dev-Aider Mix:** $0 (Aider) + $25 (Claude for complex) = ~$300/year
- **Savings:** $300-900/year with SAME quality

---

## How It Works

### Architecture

```
Claude AIOS (Orchestrator)
    ↓
Dev-Aider Squad
    ├─ @aider-dev          (Implementation agent)
    └─ @aider-optimizer    (Cost analysis agent)
    ↓
AIDER-AIOS (Tool)
    ├─ Aider CLI
    └─ Arcee Trinity 127B (FREE via OpenRouter)
```

### Workflow Example

```
User: "Implement user authentication API"

@aider-optimizer analyzes:
  - Complexity: STANDARD
  - Type: Implementation
  - Estimate: 3-4 hours
  - Verdict: PERFECT for Aider!
  - Savings: ~$10 vs Claude

@aider-dev executes:
  - Prepares optimized prompt
  - Invokes AIDER-AIOS subprocess
  - Trinity generates code
  - Validates & tests
  - Reports: DONE + Cost Saved

Total Cost: $0 ✓
```

---

## Usage

See [Quick Start](#quick-start) below for setup, and [The Two Agents](#the-two-agents) for detailed command reference.

---

## Quick Start

### 1. Setup (5 minutes)

**Prerequisites:**
- Node.js 18+
- Python 3.8+
- Aider CLI: `pip install aider-chat`

**Configuration:**
```bash
# Set OpenRouter API key (free tier available!)
export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx

# Verify setup
aider --version
```

### 2. Activate Squad

```bash
# In Claude Code
/AIOS:agents:aider-dev

# Or
/AIOS:agents:aider-optimizer
```

### 3. Use It

```bash
# Analyze cost-benefit of a task
@aider-optimizer *analyze-cost "Implement user CRUD API"

# Implement with Aider
@aider-dev *implement "story-5.2" "Create authentication middleware"

# Or directly invoke
@aider-dev *invoke-aider
```

---

## When to Use Dev-Aider

### ✅ PERFECT Use Cases (Use Aider)

- ✓ Code implementation (SIMPLE to STANDARD complexity)
- ✓ Refactoring & cleanup
- ✓ Adding unit tests
- ✓ Writing documentation
- ✓ Simple bug fixes
- ✓ API endpoints (standard CRUD)
- ✓ Configuration changes

**Expected Outcome:** 85%+ quality, 100% cost savings

### ⚠️ GOOD USE Cases (Analyze with Optimizer)

- ⚠️ Standard implementation with some complexity
- ⚠️ Refactoring complex modules
- ⚠️ Tests for complex logic
- ⚠️ Documentation for complex systems

**Recommendation:** Use Aider + have Claude review

### ❌ DON'T Use Aider (Escalate to @dev)

- ❌ System architecture design
- ❌ Security-critical decisions
- ❌ Complex algorithms
- ❌ Multi-file coordinated changes
- ❌ When quality >> cost

**Recommendation:** Use @dev (Claude Opus)

---

## The Two Agents

### @aider-dev - Implementation Specialist

**Role:** Execute implementation tasks via AIDER-AIOS

**Commands:**
- `*help` - Show all commands
- `*implement {story-id}` - Implement a story via Aider
- `*estimate-cost {task}` - Show cost savings
- `*analyze-task` - Check if task suits Aider
- `*invoke-aider` - Directly invoke AIDER subprocess
- `*handoff` - Escalate to @dev if needed

**Example:**
```
@aider-dev *implement story-4.2 "Add JWT authentication to Express API"

Output:
┌─────────────────────────────────────────┐
│ Task Analysis                           │
├─────────────────────────────────────────┤
│ Complexity: STANDARD                    │
│ Type: Implementation                    │
│ Cost (Claude): $8-12                    │
│ Cost (Aider): $0                        │
│ Verdict: ✓ USE AIDER (save $12!)        │
│                                         │
│ Starting AIDER-AIOS...                  │
│ [Aider executes...]                     │
│                                         │
│ ✓ COMPLETE                              │
│ Files: 3 modified, 1 created            │
│ Tests: 15/15 passed ✓                   │
│ Cost Saved: $12                         │
└─────────────────────────────────────────┘
```

### @aider-optimizer - Cost Analyst

**Role:** Decide when to use Aider vs Claude, maximize value

**Commands:**
- `*help` - Show all commands
- `*analyze-cost {task}` - Detailed cost analysis
- `*estimate-savings {story-id}` - Total savings for story
- `*decision-matrix` - Decision rules by task type
- `*prompt-optimize {prompt}` - Optimize for free models
- `*recommend {task}` - Aider or Claude recommendation
- `*quality-report` - Quality metrics Aider vs Claude

**Example:**
```
@aider-optimizer *analyze-cost "Implement product search feature"

Output:
┌──────────────────────────────────────────────┐
│ Cost-Quality Analysis                        │
├──────────────────────────────────────────────┤
│ Task: Implement product search feature      │
│ Complexity: STANDARD (8 hours estimated)    │
│                                              │
│ Option 1: Claude Opus                       │
│   Cost: $15-20                              │
│   Time: 3-4 hours                           │
│   Quality: 10/10                            │
│   Value: 0.5                                │
│                                              │
│ Option 2: Aider (Free)                      │
│   Cost: $0                                  │
│   Time: 5-6 hours                           │
│   Quality: 8/10                             │
│   Value: ∞ (infinite!)                      │
│                                              │
│ RECOMMENDATION: Use Aider                   │
│ Savings: $20 (100%)                         │
│ Quality: Still 8/10 (acceptable)            │
│                                              │
│ Should I proceed? (Yes/No)                  │
└──────────────────────────────────────────────┘
```

---

## Files & Structure

```
squads/dev-aider/
├── config.yaml                    # Squad configuration
├── README.md                      # This file
├── AIDER-EXECUTION-RULES.md       # Mandatory execution rules
├── agents/
│   ├── aider-dev.md               # Implementation agent
│   ├── aider-optimizer.md         # Cost analysis agent
│   ├── po-aider.md                # Story creator
│   ├── sm-aider.md                # Task decomposer
│   ├── qa-aider.md                # Validator
│   └── deploy-aider.md            # Deploy guardian
├── tasks/
│   ├── invoke-aider.md            # Invoke AIDER-AIOS subprocess
│   ├── cost-analysis.md           # Cost-benefit analysis
│   ├── aider-handoff.md           # Escalation protocol
│   ├── po-aider-create-story.md   # Story creation task
│   ├── sm-aider-create-tasks.md   # Task decomposition task
│   ├── qa-aider-validate.md       # Validation task
│   └── deploy-aider-deploy.md     # Deployment task
├── data/
│   ├── arcee-trinity-guide.md     # Model capabilities & best practices
│   ├── cost-strategies.md         # When to use Aider vs Claude
│   └── free-models-comparison.md  # Free model comparison
├── templates/
│   ├── aider-prompt-tmpl.md       # Optimized prompt template
│   ├── cost-report-tmpl.md        # Cost report template
│   ├── story-summary-tmpl.md      # Story summary for Claude
│   └── qa-summary-tmpl.md         # QA summary for Claude
├── checklists/
│   ├── story-review-checklist.md  # Story review gate
│   ├── qa-summary-checklist.md    # QA sign-off gate
│   └── deploy-checklist.md        # Pre-deploy checklist
├── workflows/
│   └── aider-full-cycle.yaml      # Complete story-to-deploy cycle
├── integrations/
│   └── aider_aios_integration.py  # Python wrapper for AIDER-AIOS
└── scripts/
    ├── aider-invoke.js            # Wrapper to invoke AIDER
    ├── cost-calculator.js         # Calculate savings
    ├── model-selector.js          # Choose model by context size
    ├── story-generator.js         # Generate stories via Aider
    ├── task-decomposer.js         # Decompose stories into tasks
    └── qa-runner.js               # Run validation and generate summary
```

---

## Integration with AIOS

### Works With

- **@mordomo** - **PRIMARY ORCHESTRATOR** - Routes all tasks to Aider agents first ($0), parallel execution
- **@dev** - Escalate complex tasks to Claude Opus
- **@architect** - System design (not suitable for Aider)
- **@qa** - Validate Aider-generated code
- **@devops** - Push commits to remote

### Mordomo Integration (RECOMMENDED)

Use `@mordomo` as your entry point for all work:

```bash
# Mordomo analyzes and auto-delegates to Aider agents
@mordomo *orchestrate "Implement auth feature with tests"

# Result:
# → Decomposes into 4 tasks
# → Delegates to @aider-dev, @qa-aider (all $0)
# → Executes in PARALLEL (up to 4 terminals)
# → Reports savings
```

### Workflow in AIOS

```
Story Assigned
    ↓
@aider-optimizer analyzes
    ├─ Simple/Standard? → Use Aider
    └─ Complex? → Use @dev
    ↓
@aider-dev (if Aider) or @dev (if Claude) executes
    ↓
@qa validates quality
    ↓
@devops pushes to remote
```

---

## Cost Breakdown

### Free Models via OpenRouter

| Model | Size | Context | Cost |
|-------|------|---------|------|
| **Arcee Trinity** | 127B | 4k | **FREE** |
| Qwen 2.5 | 7B | 8k | **FREE** |
| DeepSeek R1 | 1.5B | 4k | **FREE** |

All completely free. No hidden costs.

### Comparison

| Model | Input | Output | Suitable For |
|-------|-------|--------|--------------|
| Trinity 127B | **FREE** | **FREE** | Implementation, refactoring, docs |
| Claude Opus | $15/M | $60/M | Complex logic, design, reasoning |
| GPT-4 | $30/M | $60/M | Expensive, similar quality to Claude |

---

## Quality Expectations

### Trinity 127B Quality

**Good at (8-9/10):**
- ✅ Code generation
- ✅ Refactoring
- ✅ Documentation
- ✅ Test generation
- ✅ Bug fixes (simple)
- ✅ Pattern adherence

**OK at (6-7/10):**
- ⚠️ Complex logic
- ⚠️ Edge cases
- ⚠️ Performance optimization
- ⚠️ Security details

**Poor at (4-5/10):**
- ❌ Novel algorithms
- ❌ System design
- ❌ Complex reasoning
- ❌ Trade-off analysis

**Recommendation:** Always test Aider-generated code. Quality is good but not perfect.

---

## Example Savings

### Scenario 1: Monthly Development

**Typical Month (20 tasks):**
- 15 simple/standard tasks
- 5 complex tasks

**Cost Comparison:**

| Approach | Cost | Year |
|----------|------|------|
| All Claude | $1,200 | $14,400 |
| Dev-Aider Mix | $300 | $3,600 |
| **Savings** | **$900/mo** | **$10,800/yr** |

### Scenario 2: Large Project

**Project: Build e-commerce platform (100 story points)**

| Component | Tasks | Claude Cost | Aider Cost | Savings |
|-----------|-------|-------------|-----------|---------|
| Auth system | 8 | $40 | $0 | $40 |
| User CRUD | 6 | $30 | $0 | $30 |
| Product API | 10 | $50 | $0 | $50 |
| Search | 4 | $20 | $0 | $20 |
| Tests | 12 | $40 | $0 | $40 |
| Documentation | 8 | $30 | $0 | $30 |
| **Totals** | **48** | **$210** | **$0** | **$210** |

---

## Getting Started

### 1. Install Prerequisites

```bash
# Python 3.8+
python --version

# Node.js 18+
node --version

# Aider
pip install aider-chat
aider --version
```

### 2. Configure OpenRouter

```bash
# Get API key from https://openrouter.ai/keys
# (Free tier includes free models like Trinity)

export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

### 3. Activate Squad in Claude Code

```bash
# Use the squad
/AIOS:agents:aider-dev

# Or optimize first
/AIOS:agents:aider-optimizer
```

### 4. Use It!

```bash
# Implement a task
@aider-dev *implement story-5.2 "Add user authentication"

# Or analyze cost first
@aider-optimizer *analyze-cost "Build search feature"
```

---

## Documentation

- **[Arcee Trinity Guide](data/arcee-trinity-guide.md)** - Model capabilities, best practices, troubleshooting
- **[Invoke Aider Task](tasks/invoke-aider.md)** - How to execute AIDER-AIOS subprocess
- **[@aider-dev Agent](agents/aider-dev.md)** - Implementation specialist
- **[@aider-optimizer Agent](agents/aider-optimizer.md)** - Cost analyst

---

## FAQ

**Q: Is the free model really free?**
A: Yes! Arcee Trinity on OpenRouter's free tier has absolutely no cost. OpenRouter subsidizes it.

**Q: Will I get bad code quality?**
A: Not if you use it correctly. With proper prompts and testing, quality is 85%+ on suitable tasks.

**Q: When should I use Aider vs Claude?**
A: Use @aider-optimizer to decide. General rule: Simple/Standard = Aider, Complex = Claude.

**Q: What if I already have a Claude subscription?**
A: Even better! You can still save 50%+ of your Claude quota by using Aider for suitable tasks.

**Q: Can I use this for production code?**
A: Yes, but test thoroughly. Aider is good for implementations, less suitable for critical logic.

**Q: What if Aider produces bad code?**
A: Test it. If fails, either have Claude fix it, or @aider-dev will handoff to @dev.

---

## Troubleshooting

### "Model not available"
→ OpenRouter rate limit. Use fallback: `aider --model qwen/qwen2.5-7b-instruct:free`

### "OPENROUTER_API_KEY not set"
→ Set it: `export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx`

### "Generated code fails tests"
→ Review error, improve prompt, try again. If persistent, escalate to @dev.

### "Generated code doesn't follow patterns"
→ Reference existing code in prompt. Trinity learns from examples.

---

## Support

- 📖 **Documentation:** See `/data/` and `/agents/`
- 💬 **Ask Questions:** Activate @aider-optimizer *help
- 🐛 **Bug Reports:** Check arcee-trinity-guide.md troubleshooting
- 🚀 **Feature Requests:** Open issue in squad repo

---

## Contributing

Want to improve Dev-Aider? See CONTRIBUTING.md (TODO)

---

## License

Part of Synkra AIOS - MIT License

---

**Save 50-100% on AI development costs without sacrificing quality.** 💰

Start with `@aider-optimizer *help` to learn commands!
