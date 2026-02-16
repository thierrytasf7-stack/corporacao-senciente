# Quality Gate: Post-Deploy Verification

## Mandatory
- [ ] Code pushed to remote
- [ ] PR created (if PR workflow)
- [ ] Release tagged (semantic version)
- [ ] All story statuses updated to SHIPPED
- [ ] Release notes generated

## Verification
- [ ] No runtime errors in logs
- [ ] Key endpoints responding
- [ ] Database accessible
- [ ] No performance degradation

## Gate Decision
- **VERIFIED**: All pass → sprint complete
- **ROLLBACK**: Issues detected → @devops rollback
