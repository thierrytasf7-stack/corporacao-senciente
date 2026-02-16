# 🎩 Mordomo - Activation & Setup Guide

**Status:** ✅ Production Ready | **Cost:** $0 | **Setup Time:** 2 minutes

---

## ⚡ Quick Start (30 seconds)

```bash
# 1. Verify everything is ready
echo "✓ OPENROUTER_API_KEY:" $OPENROUTER_API_KEY | head -c 50
echo "✓ Aider installed:" $(aider --version)

# 2. Activate Mordomo
/AIOS:agents:mordomo

# 3. Your first command
@mordomo *orchestrate "Implementar cache com Redis e testes"
```

**What happens next:**
- ✅ @po-aider creates story ($0)
- ✅ @sm-aider decomposes into tasks ($0)
- ✅ 4 @aider-dev terminals run in parallel ($0)
- ✅ @qa-aider validates (lint, test, typecheck) ($0)
- ✅ @deploy-aider pushes to git ($0)
- ✅ Total cost: $0 (100% Aider)

---

## 📋 Setup Checklist

Before activating Mordomo, verify:

### 1. Environment Variables
```bash
# Check API key
echo $OPENROUTER_API_KEY

# Should output something like:
# sk-or-v1-abc123... (at least 20 chars)

# If empty, set it:
export OPENROUTER_API_KEY="your-key-here"
```

### 2. Aider CLI
```bash
# Check installation
aider --version

# Should output something like:
# Aider v0.86.1

# If not installed:
pip install aider-ai
# or
brew install aider
```

### 3. Model Availability
```bash
# Model should be available on OpenRouter
# Free tier: openrouter/arcee-ai/trinity-large-preview:free

# Verify API key works:
aider --model openrouter/arcee-ai/trinity-large-preview:free --help
# Should show help without errors
```

### 4. Git Repository
```bash
# Make sure you're in a git repo
git status
git log --oneline | head -5

# Should show recent commits (not empty repo)
```

### 5. Terminal Access
```bash
# Verify you can spawn multiple terminals
# (For parallel execution of 4 tasks)

# You'll need:
- Terminal 1: For orchestration
- Terminal 2-4: (optional, for direct control)
# OR just let Mordomo manage them
```

**If ALL checks pass:** You're ready! ✅

**If ANY check fails:** See troubleshooting below.

---

## 🚀 Activation Steps

### Step 1: Invoke Mordomo Skill
```
Type in Claude Code:
/AIOS:agents:mordomo

Or use Skill tool:
skill: "AIOS:agents:mordomo"
```

### Step 2: See Greeting
```
🎩 Jasper (Mordomo) at your service!

I orchestrate with AIDER-FIRST philosophy:
• 6 Aider agents available ($0 each)
• Up to 4 parallel terminals for speed
• Auto-create missing components
• Claude only when truly needed ($$$)

Type *help or describe what you need!
```

### Step 3: Describe Your Task
```
@mordomo *orchestrate "Your task description"

Examples:
- "Implement JWT authentication with tests"
- "Create cache layer with Redis integration"
- "Build user profile feature with DB migrations"
- "Add real-time notifications via WebSockets"

Mordomo will:
1. Create story via @po-aider ($0)
2. Decompose via @sm-aider ($0)
3. Implement via 4 @aider-dev in parallel ($0)
4. Validate via @qa-aider ($0)
5. Deploy via @deploy-aider ($0)
```

### Step 4: Wait for Results
Mordomo will:
- Spawn Aider CLI commands
- Monitor 4 parallel terminals
- Collect results
- Report success with cost/time savings

**Expected time:** 15-30 minutes for complex feature

---

## 📊 What You Get

### Cost Breakdown
```
Task: "Implement authentication system"

ALL-CLAUDE approach:
  Story creation:        $10
  Task decomposition:    $15
  Implementation:        $60
  Quality assurance:     $15
  ──────────────────────────
  TOTAL:                 ~$100

MORDOMO-FIRST approach:
  Story creation:        $0 (@po-aider)
  Task decomposition:    $0 (@sm-aider)
  Implementation:        $0 (@aider-dev × 4 parallel)
  Quality assurance:     $0 (@qa-aider)
  ──────────────────────────
  TOTAL:                 $0 ✅

SAVINGS: $100 (100% reduction)
```

### Speed Benefit
```
Sequential (old way):
  Story → Tasks → Impl(4 tasks serial) → Test → Deploy
  ~40 minutes

Parallel (Mordomo way):
  Story + Tasks (parallel): 10 min
  Impl (4 tasks parallel):   8 min
  Test + Deploy:             3 min
  ──────────────────────────
  TOTAL:                    ~20 minutes

SPEEDUP: 50% faster (20 min vs 40 min)
```

### Code Quality
```
✅ npm run lint     - ESLint validation
✅ npm run typecheck - TypeScript strict mode
✅ npm test         - Jest coverage
✅ npm run build    - Production build
✅ Code reviews     - AIOS patterns followed
```

---

## 🔄 Example Workflow

### Real Usage
```
User: "Implement caching layer"
     ↓
Mordomo: *orchestrate "Create Redis cache service with tests"
     ↓
@po-aider: Creates story (cost: $0)
           docs/stories/cache-redis.md
     ↓
@sm-aider: Decomposes into 4 tasks (cost: $0)
           - Create cache.service.ts
           - Create cache.test.ts
           - Create cache.config.ts
           - Update main.ts
     ↓
BATCH 1 (4 terminals parallel - cost: $0):
  Terminal 1: cache.service.ts
  Terminal 2: cache.test.ts
  Terminal 3: cache.config.ts
  Terminal 4: main.ts integration
  [all run simultaneously]
     ↓
BATCH 2 (validation):
  @qa-aider: npm run lint, typecheck, test
             All pass ✅
     ↓
@deploy-aider: git add, commit, push
               (if user has @devops authority)
     ↓
Result:
  ✅ Caching layer complete
  ✅ Tests passing
  ✅ Code follows patterns
  ✅ Cost: $0
  ✅ Time: ~15 minutes (vs 40 sequential)
```

---

## 🎓 Commands Reference

### Core Commands
```bash
# Full orchestration (story → impl → test → deploy)
@mordomo *orchestrate "Task description"

# Run in parallel (up to 4 terminals)
@mordomo *parallel "task1" | "task2" | "task3"

# Delegate to specific agent
@mordomo *delegate @po-aider "Create story for..."
@mordomo *delegate @sm-aider "Decompose story..."
@mordomo *delegate @aider-dev "Implement feature X"

# Analysis & Routing
@mordomo *route "Task description"        # Recommend agent
@mordomo *analyze "Task description"      # Decompose for parallelism
@mordomo *available-agents                # List all agents

# Gap Detection
@mordomo *gap-check "Need new agent for X"
@mordomo *create-missing agent "new-agent-name"

# Monitoring
@mordomo *cost-report                     # Show savings
@mordomo *status                          # Current progress
@mordomo *worker-status                   # Parallel workers
@mordomo *session-summary                 # Full summary

# Help
@mordomo *help                            # All commands
@mordomo *guide                           # Detailed guide
@mordomo *exit                            # Exit Mordomo
```

---

## ⚙️ Terminal Setup (Advanced)

If you want to manually control the 4 Aider terminals:

### Terminal 1 (Story Creation)
```bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file docs/stories/feature.md \
      --message "Create detailed story for cache feature"
```

### Terminal 2 (Task Decomposition)
```bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file docs/stories/feature.md \
      --message "Decompose into atomic tasks with DAG"
```

### Terminals 3-4 (Parallel Implementation)
```bash
# Terminal 3
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/cache.service.ts \
      --file src/cache.test.ts \
      --message "Implement cache service with tests"

# Terminal 4 (simultaneously)
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file src/cache.config.ts \
      --file src/main.ts \
      --message "Add cache configuration and integration"
```

---

## 🚨 Important Rules

### ✅ DO
- ✓ Use Mordomo for ANY task (it decides if Aider or Claude needed)
- ✓ Let Mordomo parallelize (4 terminals = 50% faster)
- ✓ Use openrouter/arcee-ai/trinity-large-preview:free model
- ✓ Expect cost = $0
- ✓ Report honestly if something fails

### ❌ DON'T
- ✗ Manually decompose tasks (Mordomo does this via @sm-aider)
- ✗ Mix models (use the free one, not Claude or GPT-4)
- ✗ Simulate execution (use real Aider CLI)
- ✗ Skip story creation (Mordomo insists via @po-aider)
- ✗ Expect Claude-level quality always (Aider is 8/10, sufficient for 95% of tasks)

---

## 🆘 Troubleshooting

### Issue: "OPENROUTER_API_KEY not set"
```
Solution:
1. Get API key from https://openrouter.ai/
2. Set environment variable:
   export OPENROUTER_API_KEY="sk-or-v1-..."
3. Verify:
   echo $OPENROUTER_API_KEY
4. Try again
```

### Issue: "Aider CLI not found"
```
Solution:
1. Install Aider:
   pip install aider-ai
2. Verify installation:
   aider --version
3. If still not found, use full path:
   /usr/local/bin/aider --version
```

### Issue: "Model not available"
```
Solution:
1. Check OpenRouter status: https://status.openrouter.io
2. Verify model exists: openrouter/arcee-ai/trinity-large-preview:free
3. Check API quota (not exceeded)
4. Use fallback model (documented in mordomo.md)
```

### Issue: "Terminal output not captured"
```
Solution:
1. Redirect Aider output:
   aider ... > /tmp/aider.log 2>&1
2. After execution, verify:
   cat /tmp/aider.log | head -20
3. Check for "Model: openrouter/..." line
```

### Issue: "Files not created"
```
Solution:
1. Check git status:
   git status
2. Verify file paths are correct
3. Check directory permissions
4. Try single file first:
   aider --file src/test.ts ...
```

### Issue: "Cost is not $0"
```
Solution:
1. Verify model name in output:
   "Model: openrouter/arcee-ai/trinity-large-preview:free"
2. Check @status-monitor:
   @status-monitor *cost-report
3. If using different model, that's why cost ≠ $0
4. Switch back to free model
```

---

## 📚 Full Documentation

- **Mordomo Agent:** `.aios-core/development/agents/mordomo.md`
- **Aider Rules:** `.aios-core/rules/aider-only.md`
- **Validation Checklist:** `.aios-core/checklists/aider-execution-validation.md`
- **Constitution:** `.aios-core/constitution.md` (Principle VII)
- **Mordomo Guide:** `.aios-core/MORDOMO-GUIDE.md`

---

## 🎯 Success Indicators

When Mordomo is working correctly:

```
✅ Tasks cost $0
✅ Takes 50% less time than sequential
✅ All Aider CLI outputs captured
✅ Files created on disk
✅ Git tracks changes
✅ Quality gates pass (lint, test, typecheck)
✅ Code is production-ready
✅ No Claude tokens consumed
✅ Honest reporting (no deception)
✅ Parallel execution working
```

---

## 🚀 Ready to Launch?

```bash
# Final verification
echo "✓ API key: $OPENROUTER_API_KEY" | head -c 70
echo ""
echo "✓ Aider: $(aider --version)"
echo "✓ Git: $(git --version)"
echo "✓ PWD: $(pwd)"

# Activate Mordomo
/AIOS:agents:mordomo

# Your first command
@mordomo *orchestrate "Implementar sua feature aqui"
```

---

**Status:** ✅ Ready
**Cost:** $0
**Speed:** 50% faster
**Quality:** Production-grade

**Let's build! 🚀**
