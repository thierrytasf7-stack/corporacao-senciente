# Create Expansion Task (via Aider)

## Purpose
Create a task workflow following Task Anatomy Standard (8 required fields).

## Inputs
- Task name and purpose
- Input requirements
- Workflow steps (numbered)
- Expected outputs
- Success validation criteria
- AIOS integration points
- Task dependencies
- Notes and considerations

## Key Activities
1. Elicit task name and purpose
2. Elicit inputs (what feeds into this task)
3. Elicit step-by-step activities (numbered, clear)
4. Elicit outputs (what this task produces)
5. Define validation criteria (testable success checks)
6. Document AIOS integration points
7. List dependencies
8. Add notes (gotchas, tips, customization)
9. Use expansion-task-tmpl.md
10. Validate Task Anatomy compliance (8 fields)

## Outputs
- Complete tasks/{task-name}.md file
- 8 required sections present and complete
- Follows Task Anatomy Standard exactly
- Success checks are testable (not subjective)
- Ready for immediate execution via @agent-name *task-name

## Validation Criteria
- [ ] Task file created in tasks/ directory
- [ ] ## Purpose section present
- [ ] ## Inputs section present
- [ ] ## Key Activities section present (numbered)
- [ ] ## Outputs section present
- [ ] ## Validation Criteria section present
- [ ] ## Integration with AIOS section present
- [ ] ## Dependencies section present (if needed)
- [ ] ## Notes section present
- [ ] All success checks are objectively testable
- [ ] No subjective criteria (like "code quality")

---

_Task Version: 1.0 - Task Creation_
