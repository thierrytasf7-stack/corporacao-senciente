# Create Complete Squad Task (via Aider)

## Purpose

Orchestrate complete AIOS expansion pack creation through guided interactive elicitation and Aider delegation.

## Inputs

- User's domain expertise and requirements
- Reference to squad-creator patterns
- Templates from squadcreator-aider/templates/
- Knowledge base from squadcreator-aider/data/

## Key Activities & Instructions

### 1. Confirm Creation Mode

Ask the user to choose:
- **Incremental Mode:** Step-by-step with elicitation and review at each stage
- **Rapid Mode:** Gather all requirements upfront and generate complete pack

### 2. Domain & Purpose Elicitation

- Domain or industry for the pack
- Primary purpose and problems it solves
- Target users and their expertise level
- 3-5 key use cases for the pack

### 3. Define Pack Structure

Elicit pack metadata:
- Pack name (kebab-case)
- Pack title (human-readable)
- Version (default: 1.0.0)
- Author name or organization
- Slash prefix (camelCase)

### 4. Define Pattern Library

- Pattern prefix (e.g., "SC-A" for Squad Creator - Aider)
- Pattern categories (orchestration, execution, validation, integration)
- Document naming convention: {PREFIX}-{NNN}: {Pattern Name}

### 5. Create Executor Matrix

Document executor types:
- Agent, Task, Workflow, Script, Manual
- For each: when to use, strengths, limitations, invocation pattern

### 6. Create Pack Directory Structure

- Create squads/{pack_name}/ directory
- Create subdirectories: agents/, tasks/, templates/, checklists/, data/
- Create config.yaml and README.md

### 7. Create Agents (Delegate to @aider-dev)

For each agent, delegate to @aider-dev:
- Agent name and role
- Expertise and domain knowledge
- Personality traits
- Supported commands
- Dependencies
- Generate using expansion-agent-tmpl.md

### 8. Create Tasks (Delegate to @aider-dev)

For each task, delegate to @aider-dev:
- Task name and purpose
- Inputs and outputs
- Workflow steps
- Generate using expansion-task-tmpl.md
- Validate Task Anatomy (8 fields)

### 9. Create Templates (Delegate to @aider-dev)

For each template, delegate to @aider-dev:
- Template type and format
- Main sections
- Placeholders and variables
- Generate using expansion-template-tmpl.yaml

### 10. Create Validation Checklist

Document quality criteria:
- Completeness validation
- Quality standards
- Domain-specific requirements
- Security validation
- Integration validation

### 11. Create Knowledge Base

Document domain knowledge:
- Terminology and concepts
- Best practices
- Common patterns
- Industry standards
- Regulatory considerations

### 12. Generate Documentation

Update README.md with:
- List of all created agents
- List of all created tasks
- List of all created templates
- Usage examples
- Installation instructions
- Integration guidance

### 13. Validate Pack Structure

- Verify all required files exist
- Check YAML syntax
- Verify markdown formatting
- Ensure AIOS standards compliance

### 14. Test Pack Integration

- Activate one of the created agents
- Execute one of the created tasks
- Verify template generates expected output
- Document any issues

### 15. Dual AIOS Integration

- Copy squad to Claude AIOS
- Copy squad to Aider AIOS
- Register in memory layer

## Outputs

- Complete expansion pack in squads/{pack_name}/
- All agents, tasks, templates, checklists, knowledge base
- Comprehensive README.md
- config.yaml with pack metadata

## Validation Criteria

- [ ] Pack directory structure matches AIOS standards
- [ ] config.yaml is valid YAML with all required fields
- [ ] At least 2 agents created
- [ ] At least 2 tasks created
- [ ] README.md includes usage examples
- [ ] All agent dependencies reference existing files
- [ ] All YAML files have valid syntax
- [ ] Documentation is complete and clear
- [ ] Pattern Library defined with prefix
- [ ] Executor Matrix documented
- [ ] All tasks follow Task Anatomy Standard (8 fields)
- [ ] Quality gates defined for critical transitions
- [ ] Dual AIOS integration verified

## Integration with AIOS

This task creates expansion packs that integrate with:
- Core AIOS-FULLSTACK framework
- Standard installer (npm run install:expansion)
- Memory layer for tracking created packs
- Agent activation system (@agent-id syntax)

## Notes

- Incremental mode provides higher quality through iterative refinement
- Rapid mode is faster but may require post-creation editing
- All generated components follow AIOS best practices
- Delegate implementation to @aider-dev for $0 cost
- Use dual-aios-support.js for both framework creation

---

_Task Version: 1.0 - Aider-Delegated | Squad Creation Orchestration_
