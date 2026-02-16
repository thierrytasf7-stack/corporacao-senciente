# Task: Deploy to Remote

> **Phase**: Deployment
> **Owner Agent**: @deploy-aider
> **Squad**: dev-aider
> **Elicit**: Yes - story ID + push confirmation

---

## Purpose

Safely push code to remote after QA approval. Includes checklists, conventions, and user confirmation gates.

---

## Execution Flow

### Step 1: Verify Deploy Checklist

Read `checklists/deploy-checklist.md`. Check each item:

- [ ] QA summary exists and marked APPROVED
- [ ] No stray untracked files
- [ ] Branch is not main (unless hotfix)
- [ ] git status is clean except for staged changes

### Step 2: Verify QA Approval

Read `qa-summary-{story}.md`:

Confirm it says: "Overall: ✅ ALL_PASS" and "Claude: APPROVED"

If not, HALT. Cannot proceed without QA sign-off.

### Step 3: Elicit Story ID

Ask: "Which story is this for? (e.g., Story 2.1)"

Use for commit message attribution.

### Step 4: Stage Files

Explicitly list files to commit. Do NOT use `git add .`

```bash
git add src/auth.js src/middleware/jwt.js tests/auth.test.js
```

### Step 5: Create Commit

Commit with conventional message:

```bash
git commit -m "feat(auth): add JWT refresh endpoint [Story 2.1]"
```

Format: `feat|fix|refactor(scope): description [Story X.Y]`

### Step 6: Dry-Run Push

Show what will be pushed:

```bash
git diff origin/main...HEAD
```

Display: files count, lines changed, commit hash.

### Step 7: Elicit Push Confirmation

Ask: "Confirm push? (yes/no)"

- If YES: proceed to Step 8
- If NO: leave committed locally, user can retry later

### Step 8: Push to Remote

```bash
git push origin {current-branch}
```

If behind remote: `git pull --rebase` first, then retry push.

### Step 9: Report Deployment

Generate `deploy-{story}.md`:

```
✅ DEPLOYED

Branch: main (or feature branch)
Commit: abc1234..def5678
Files: 3 modified
Message: feat(auth): add JWT refresh endpoint [Story 2.1]
Status: SUCCESS
Time: {timestamp}

Next: Story marked as DEPLOYED
```

---

## Error Handling

### Push fails: "Your branch is behind origin"

**Resolution**: `git pull --rebase origin main`, then retry push

### Push fails: "Permission denied"

**Cause**: No GitHub auth

**Resolution**: Check GitHub token. Run `gh auth login` if needed.

### Push fails: "Branch protection rule violation"

**Cause**: Pre-push hook failed or branch policy

**Resolution**: Contact @devops. This is out of scope for dev-aider.

### User says "no" to push confirmation

**Resolution**: Leave changes committed locally. User can push manually later.

---

## Success Criteria

- [ ] Commit message follows conventional format
- [ ] Story ID is referenced
- [ ] Push succeeded (exit code 0)
- [ ] Deployment report generated
- [ ] Summary confirms SUCCESS

---

*Task definition for @deploy-aider *deploy command.*
