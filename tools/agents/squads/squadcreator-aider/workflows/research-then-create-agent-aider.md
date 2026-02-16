# research-then-create-agent-aider

Workflow combining mind research with agent creation via Aider delegation.

## Purpose

Execute complete research-to-agent workflow:
1. Research elite minds in a domain
2. Curate based on documented frameworks
3. Create agents for each mind via Aider
4. Validate agents against quality standards
5. Integrate into squad blueprint

## Workflow: 5 Phases

### Phase 1: Mind Research Loop
**Duration:** 1-2 hours
**Executor:** @aider-dev (via mind-research-loop-aider)

**Steps:**
1. Delegate to @aider-dev: Run mind-research-loop-aider
2. System executes 3-5 research iterations
3. Outputs: Curated list of 4-6 elite minds
4. Each mind has:
   - Documented framework (500+ words)
   - Executor type assignment
   - Framework defensibility score
   - Squad role recommendation

**Success Check:**
```
✓ 4-6 minds identified
✓ All have documented frameworks
✓ All survived devil's advocate critique
✓ Executor types assigned
```

### Phase 2: User Approval & Customization
**Duration:** 0.5-1 hour
**Executor:** User (interactive)

**Steps:**
1. Present curated minds list to user
2. Ask: "Do these minds align with your vision?"
3. Ask: "Any minds to remove or add?"
4. Ask: "Should we create agents based on all of them?"
5. User can:
   - Approve all minds as-is
   - Request modifications
   - Add additional research focus
   - Request executor type changes
6. Finalize agent creation list

**Success Check:**
```
✓ User confirms mind selection
✓ Final list locked for agent creation
```

### Phase 3: Agent Creation (Parallel via Aider)
**Duration:** 2-3 hours
**Executor:** @aider-dev (4 agents in parallel)

**For each mind:**
1. Delegate to @aider-dev: "Create agent based on {mind name}"
2. @aider-dev uses expansion-agent-tmpl.md
3. Generates:
   - Agent name and ID
   - Persona from mind's framework
   - Core principles from mind's documented approach
   - Commands for agent's specialty
   - Dependencies (tasks, templates, data)
   - Security considerations
   - Memory integration
4. Output: Complete agent.md file

**Parallelization:**
- 4 agents created simultaneously
- Total time: 45-60 minutes for all
- vs Sequential: 3-4 hours

**Success Check:**
```
✓ Agent created for each mind
✓ Each agent follows AIOS standards
✓ Persona accurately reflects mind's framework
✓ Commands aligned with mind's methods
```

### Phase 4: Quality Validation & Integration
**Duration:** 1 hour
**Executor:** @qa-aider (validation)

**Steps:**
1. Delegate to @qa-aider: Validate all created agents
2. Checks:
   - [ ] Agent template compliance
   - [ ] YAML syntax valid
   - [ ] Persona authenticity (reflects mind accurately)
   - [ ] Commands are complete and functional
   - [ ] Dependencies are correct
   - [ ] Security sections present
   - [ ] No hardcoded credentials
3. For each agent:
   - Run agent-quality-gate-checklist.md
   - Score on completeness (0-100)
   - Flag any issues
   - Generate improvement suggestions
4. Agents must score 80+ to proceed
5. If any agent scores <80:
   - Flag for improvement
   - Schedule refinement with @aider-dev
   - Re-validate

**Success Check:**
```
✓ All agents score 80+
✓ No security issues found
✓ All agents YAML-valid
✓ Quality gates passed
```

### Phase 5: Squad Blueprint Integration
**Duration:** 1 hour
**Executor:** @expansion-creator-aider

**Steps:**
1. Generate squad blueprint structure:
   ```
   squads/{domain}-squad/
   ├── agents/
   │   ├── {mind1}.md
   │   ├── {mind2}.md
   │   ├── {mind3}.md
   │   └── {mind4}.md
   ├── tasks/
   │   ├── {workflow1}.md
   │   ├── {workflow2}.md
   │   └── {workflow3}.md
   ├── templates/
   │   ├── {output1}.md
   │   └── {output2}.md
   ├── checklists/
   │   └── squad-validation.md
   ├── data/
   │   ├── pattern-library.md
   │   ├── executor-matrix.md
   │   └── squad-kb.md
   ├── workflows/
   │   └── squad-workflow.md
   ├── config.yaml
   └── README.md
   ```

2. Create squad documentation:
   - config.yaml with squad metadata
   - README.md with usage instructions
   - squad-kb.md with domain knowledge

3. Integrate with dual AIOS:
   - Copy squad to Claude AIOS framework
   - Copy squad to Aider AIOS framework
   - Register in memory layer

4. Final validation:
   - Run squad-checklist-aider.md
   - Verify dual AIOS integration
   - Validate pattern usage (SC-A patterns)
   - Check quality gates

**Success Check:**
```
✓ Squad directory structure created
✓ All agents integrated
✓ Documentation complete
✓ Dual AIOS sync verified
✓ Memory layer registration confirmed
```

## Timeline & Efficiency

| Phase | Duration | Parallelization |
|-------|----------|-----------------|
| 1: Research | 1-2h | Sequential |
| 2: Approval | 0.5-1h | User-driven |
| 3: Agent Creation | 2-3h | **4 parallel** |
| 4: Validation | 1h | **Parallel checks** |
| 5: Integration | 1h | Sequential |
| **TOTAL** | **5.5-7.5h** | **60% parallel** |

**vs Sequential (no parallelization): 10-12 hours**
**Speedup: 50% faster with parallelization**

## Success Criteria

- [ ] Mind research completed (Iteration 5)
- [ ] Curated minds list validated
- [ ] User approved final selection
- [ ] 4+ agents created (1 per mind)
- [ ] All agents scored 80+ on quality
- [ ] Squad directory structure created
- [ ] Dual AIOS integration verified
- [ ] Memory layer registration confirmed
- [ ] Documentation complete
- [ ] Ready for deployment

## Error Handling

**If agent quality score < 80:**
1. Review agent.md for issues
2. Document specific problems
3. Create improvement task for @aider-dev
4. Re-validate after improvement
5. Don't proceed until 80+ score

**If AIOS sync fails:**
1. Check installation paths
2. Verify dual-aios-support.js working
3. Manual backup copy to both frameworks
4. Re-test integration

## Integration with Core AIOS

- Squads created appear in both AIOS frameworks
- Memory layer tracks creation metadata
- Agents immediately available via @{agent-id}
- Full compatibility with core AIOS installer

## Notes

- This workflow automates 95% of squad creation work
- Mind research ensures quality agents based on real experts
- Parallelization keeps execution time manageable
- Quality gates prevent low-quality squads
- Dual AIOS support enables maximum compatibility
