# Deployment Checklist

Run this checklist before @deploy-aider performs git operations.

---

## 1. Pre-Commit Verification

- [ ] QA summary exists and is marked APPROVED
- [ ] No untracked files cluttering the repo (`git status` clean except for changes)
- [ ] Current branch is NOT main (unless explicitly approved for hotfix)
- [ ] All changes are already staged or will be staged explicitly

---

## 2. Commit Quality

- [ ] Commit message follows conventional format: `feat(scope): description [Story ID]`
- [ ] Story ID is referenced (e.g., [Story 2.1])
- [ ] Message is concise (< 50 chars for subject line)
- [ ] Files to be committed match the work done

---

## 3. Push Safety

- [ ] Branch is up-to-date with remote (`git pull --rebase` if needed)
- [ ] No force-push flag (--force, -f) will be used
- [ ] Target branch is correct (usually main, or PR target branch)
- [ ] User has confirmed they want to push (elicit: "Confirm push? (yes/no)")

---

## 4. Post-Push Verification

- [ ] Push command succeeded (exit code 0)
- [ ] No authentication errors
- [ ] Deployment confirmation message generated
- [ ] Summary includes: branch, files count, commit hash

---

## 5. Sign-Off

**Deployment Status**:

- [ ] **SUCCESS** - Changes pushed to remote
- [ ] **FAILURE** - Push failed, error documented

**Details**:
```
Branch: {branch-name}
Commit: {commit-hash}
Files: {N} modified
Message: {commit-message}
Status: {SUCCESS / FAILURE}
```

**Deployed by**: @deploy-aider
**Date**: {AUTO}
**Time**: {AUTO}

---

*Checklist for @deploy-aider before git operations. Run before every push.*
