# Task: Prepare Release / Hotfix

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*hotfix` or `*ship`

## Hotfix Pipeline
1. @dev creates hotfix branch and implements fix
2. @qa quick review (focused on fix only)
3. @devops `*pre-push` → `*push` → `*release` (patch version)
4. Time target: < 1 hour

## Release Pipeline
1. Verify all stories QA-approved
2. @devops `*version-check`
3. @devops `*pre-push` (full quality gates)
4. @devops `*push` → `*create-pr` → `*release`
5. Generate release notes
6. Update story statuses
