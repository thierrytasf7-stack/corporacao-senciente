# Task: Integration Check

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*integration-check`

## Execution
Post-merge verification:
1. Run full test suite
2. Check for integration regressions
3. Verify API contracts still valid
4. Check database migrations applied correctly
5. Verify environment variables set
6. Build production bundle
7. Report results
