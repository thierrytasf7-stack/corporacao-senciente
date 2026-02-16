# PARALLEL TASK 1: Fix Jest Namespace Collision

**Status:** Ready for Aider Execution
**Complexity:** SIMPLE (1-2 hours)
**Model:** openrouter/arcee-ai/trinity-large-preview:free
**Cost:** Use (FREE)

## Problem Statement
AIDER-AIOS subdirectory creates Jest haste-map warnings due to duplicate package namespaces.

## Acceptance Criteria
- [ ] jest.config.js updated with testPathIgnorePatterns for AIDER-AIOS
- [ ] No haste-map warnings when running Jest
- [ ] All existing tests still pass
- [ ] AIDER-AIOS isolated from main repo test suite

## Files to Modify
1. `jest.config.js` - Add AIDER-AIOS to ignore patterns
2. `tsconfig.json` (if needed) - Verify path resolution

## Aider Execution Command
```bash
aider --model openrouter/arcee-ai/trinity-large-preview:free \
      --no-auto-commits \
      --yes \
      --file jest.config.js \
      --file tsconfig.json \
      --message "Fix Jest namespace collision by ignoring AIDER-AIOS subdirectory. Update testPathIgnorePatterns in jest.config.js to exclude AIDER-AIOS from test discovery. Verify no haste-map warnings occur."
```

## Success Validation
```bash
npm test -- --listTests 2>&1 | grep -c "AIDER-AIOS" # Should return 0
npm run typecheck # Should pass
```

## Commit Message (after validation)
```
fix(jest): ignore AIDER-AIOS namespace to prevent haste-map collision

- Add testPathIgnorePatterns to jest.config.js
- Isolate AIDER-AIOS from main test suite
- Prevent duplicate package namespace warnings

Fixes: Jest haste-map warnings
```
