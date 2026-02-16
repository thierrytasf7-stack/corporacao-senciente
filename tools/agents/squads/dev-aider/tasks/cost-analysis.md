# Task: Cost Analysis

> **Phase**: Decision
> **Owner Agent**: @aider-optimizer
> **Squad**: dev-aider

---

## Purpose

Analyze cost-benefit of using Aider vs Claude for a task. Output structured cost report.

---

## Execution Flow

### Step 1: Receive Task Description

User provides: task description, complexity estimate, file count

### Step 2: Run Cost Analysis

Invoke `node scripts/cost-calculator.js analyze --prompt "..." --complexity STANDARD --type implementation`

### Step 3: Display Report

Show formatted output:
- Token estimate (Aider vs Claude)
- Cost estimate (Aider $0 vs Claude $X)
- Quality scores
- Recommendation (Aider or Claude)
- Savings amount

### Step 4: Ask User

"Proceed with recommendation? (yes/no)"

- YES: Activate recommended agent
- NO: User can choose differently

---

## Success Criteria

- [ ] Report is accurate
- [ ] Recommendation is clear
- [ ] Savings are quantified
- [ ] User can make informed decision

---

*Backs @aider-optimizer *analyze-cost command.*
