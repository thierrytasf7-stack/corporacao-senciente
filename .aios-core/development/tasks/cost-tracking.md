# Task: Cost Tracking & Savings Report

> **Phase:** monitoring
> **Owner Agent:** @mordomo, @status-monitor
> **Cost:** $0 (monitoring is free)

---

## Purpose

Track AI costs across Aider ($0) and Claude ($$) usage, calculate savings, and generate reports to demonstrate ROI of Aider-First strategy.

---

## Cost Structure

### Aider Agents (ALL FREE - $0)

| Agent | Model | Cost |
|-------|-------|------|
| @aider-dev | Arcee Trinity 127B | $0 |
| @aider-optimizer | Analysis only | $0 |
| @po-aider | Arcee Trinity 127B | $0 |
| @sm-aider | Arcee Trinity 127B | $0 |
| @qa-aider | Arcee Trinity 127B | $0 |
| @deploy-aider | Git operations | $0 |
| @status-monitor | Monitoring | $0 |

### Claude Agents (EXPENSIVE - $$)

| Agent | Model | Cost (estimated) |
|-------|-------|------------------|
| @dev | Claude Opus 4.5 | $5-15 per task |
| @architect | Claude Opus 4.5 | $10-25 per task |
| @analyst | Claude Opus 4.5 | $5-20 per task |
| @aios-master | Claude Opus 4.5 | $10-30 per task |
| @qa | Claude Opus 4.5 | $5-15 per task |
| @pm | Claude Opus 4.5 | $5-15 per task |

### Cost Estimation Formula

```
Claude Cost = (input_tokens / 1M × $15) + (output_tokens / 1M × $75)

Example:
- Small task: ~2k input, ~1k output = ~$0.10
- Medium task: ~10k input, ~5k output = ~$0.50
- Large task: ~50k input, ~20k output = ~$2.25
```

---

## Tracking Execution

### Step 1: Initialize Session Tracking

```javascript
// Session cost tracker (conceptual)
const sessionCosts = {
  sessionId: Date.now(),
  startTime: new Date().toISOString(),
  tasks: [],
  totals: {
    aider: { count: 0, cost: 0 },
    claude: { count: 0, cost: 0 },
    saved: 0
  }
};
```

### Step 2: Log Each Task

For every task executed:

```javascript
// When Aider task completes
sessionCosts.tasks.push({
  id: taskId,
  description: 'Implement auth.service.ts',
  agent: '@aider-dev',
  type: 'aider',
  cost: 0,
  estimatedClaudeCost: 8.50,  // What it would cost with Claude
  duration: 120,  // seconds
  status: 'completed'
});
sessionCosts.totals.aider.count++;
sessionCosts.totals.saved += 8.50;

// When Claude task completes
sessionCosts.tasks.push({
  id: taskId,
  description: 'Design system architecture',
  agent: '@architect',
  type: 'claude',
  cost: 15.00,
  estimatedClaudeCost: 15.00,
  duration: 300,
  status: 'completed'
});
sessionCosts.totals.claude.count++;
sessionCosts.totals.claude.cost += 15.00;
```

### Step 3: Calculate Savings

```javascript
function calculateSavings(session) {
  const totalClaudeEquivalent = session.tasks.reduce(
    (sum, t) => sum + t.estimatedClaudeCost, 0
  );
  const actualCost = session.totals.claude.cost;
  const savings = totalClaudeEquivalent - actualCost;
  const savingsPercent = (savings / totalClaudeEquivalent * 100).toFixed(1);

  return {
    totalClaudeEquivalent,
    actualCost,
    savings,
    savingsPercent
  };
}
```

### Step 4: Generate Report

```
════════════════════════════════════════════════════════════════
💰 MORDOMO COST REPORT - Session #{sessionId}
════════════════════════════════════════════════════════════════

📊 TASK BREAKDOWN:

AIDER TASKS ($0 each):
┌────┬────────────────────────────────────┬──────────┬───────────┐
│ #  │ Task                               │ Agent    │ Saved     │
├────┼────────────────────────────────────┼──────────┼───────────┤
│ 1  │ Implement auth.service.ts          │ aider-dev│ $8.50     │
│ 2  │ Create auth.test.ts                │ aider-dev│ $6.00     │
│ 3  │ Implement jwt.utils.ts             │ aider-dev│ $4.50     │
│ 4  │ Create story for feature           │ po-aider │ $5.00     │
│ 5  │ Decompose into tasks               │ sm-aider │ $4.00     │
│ 6  │ Run lint and tests                 │ qa-aider │ $3.00     │
│ 7  │ Push to remote                     │ deploy-ai│ $2.00     │
└────┴────────────────────────────────────┴──────────┴───────────┘
Subtotal: 7 tasks × $0 = $0.00

CLAUDE TASKS (when Aider insufficient):
┌────┬────────────────────────────────────┬──────────┬───────────┐
│ #  │ Task                               │ Agent    │ Cost      │
├────┼────────────────────────────────────┼──────────┼───────────┤
│ 1  │ Design auth architecture           │ architect│ $15.00    │
└────┴────────────────────────────────────┴──────────┴───────────┘
Subtotal: 1 task = $15.00

════════════════════════════════════════════════════════════════

📈 SUMMARY:

Total Tasks:           8
├─ Aider Tasks:        7 (87.5%)
└─ Claude Tasks:       1 (12.5%)

Cost Analysis:
├─ If ALL via Claude:  $48.00 (estimated)
├─ Actual Cost:        $15.00
└─ SAVINGS:            $33.00 (68.75%)

Performance:
├─ Parallel Batches:   3
├─ Sequential Time:    ~25 min (estimated)
├─ Actual Time:        ~12 min
└─ Time Saved:         ~52%

════════════════════════════════════════════════════════════════

💡 RECOMMENDATIONS:

1. ✓ Architecture task correctly routed to Claude (complex reasoning)
2. ✓ Implementation tasks optimally handled by Aider ($0)
3. Consider: Creating reusable auth-task for future similar work

════════════════════════════════════════════════════════════════
```

---

## Cumulative Tracking

### Daily Report

```
════════════════════════════════════════════════════════════════
📅 DAILY COST REPORT - 2026-02-05
════════════════════════════════════════════════════════════════

Sessions: 3
Total Tasks: 24

Aider Tasks: 20 (83%)
Claude Tasks: 4 (17%)

Daily Cost: $45.00
Daily Savings: $135.00 (75% reduction)

Running Monthly Total:
├─ Spent: $180.00
├─ Saved: $540.00
└─ Efficiency: 75%

════════════════════════════════════════════════════════════════
```

### Monthly Report

```
════════════════════════════════════════════════════════════════
📅 MONTHLY COST REPORT - February 2026
════════════════════════════════════════════════════════════════

Total Tasks: 450

By Agent Type:
├─ Aider: 380 tasks (84%) → $0
└─ Claude: 70 tasks (16%) → $525

Cost Analysis:
├─ If ALL Claude: $3,375 (estimated)
├─ Actual Spent: $525
└─ MONTHLY SAVINGS: $2,850 (84.4%)

Top Aider Uses:
1. @aider-dev: 250 tasks (implementation)
2. @qa-aider: 80 tasks (testing)
3. @po-aider: 30 tasks (stories)
4. @sm-aider: 20 tasks (decomposition)

Claude Usage (justified):
1. @architect: 35 tasks (complex design)
2. @analyst: 20 tasks (deep research)
3. @aios-master: 15 tasks (framework work)

ROI: For every $1 spent, saved $5.43

════════════════════════════════════════════════════════════════
```

---

## Integration Points

### Where to Track

1. **@mordomo orchestrate** - Track every delegated task
2. **@aider-dev implement** - Track each Aider invocation
3. **Claude agents** - Track when used and why
4. **Parallel execution** - Track batch efficiency

### Storage

```
.aios/
├── costs/
│   ├── sessions/
│   │   ├── 2026-02-05-001.json
│   │   ├── 2026-02-05-002.json
│   │   └── ...
│   ├── daily/
│   │   ├── 2026-02-05.json
│   │   └── ...
│   └── monthly/
│       ├── 2026-02.json
│       └── ...
```

---

## Metadata

```yaml
task: cost-tracking
owner: @mordomo, @status-monitor
estimated_time: "ongoing"
difficulty: SIMPLE
tags:
  - monitoring
  - costs
  - savings
  - reporting
  - analytics
```
