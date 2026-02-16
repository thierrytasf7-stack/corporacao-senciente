# Task: Quality Gate Check

## Metadata
- agent: ceo-desenvolvimento
- trigger: `*quality-gate {story}`

## Checks by Level

### Minimal (fibonacci 1-2)
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Basic tests pass

### Standard (fibonacci 3-5)
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] CodeRabbit light review (0 CRITICAL)
- [ ] QA review passed

### Comprehensive (fibonacci 8+)
- [ ] All standard checks
- [ ] CodeRabbit full review (0 CRITICAL, 0 HIGH)
- [ ] Security check passed
- [ ] NFR assessment passed
- [ ] Performance acceptable
- [ ] Build succeeds
- [ ] Coverage targets met

### Release
- [ ] All comprehensive checks
- [ ] All tests pass (unit + integration + e2e)
- [ ] CodeRabbit pre-PR (0 CRITICAL tolerance)
- [ ] Version check passed
- [ ] Release notes generated
