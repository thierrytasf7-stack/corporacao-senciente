# Create Expansion Agent Task (via Aider)

## Purpose
Create a single expansion pack agent following AIOS standards and Aider delegation patterns.

## Inputs
- Agent name and ID (kebab-case)
- Domain expertise and focus
- Persona details (role, style, identity)
- Required commands and capabilities
- Dependencies (tasks, templates, data)

## Key Activities
1. Elicit agent name, role, and expertise
2. Elicit personality traits and communication style
3. Elicit list of commands this agent will support
4. Elicit dependencies (tasks, templates, checklists it uses)
5. Use expansion-agent-tmpl.md template
6. Validate YAML syntax and structure
7. Validate against agent-quality-gate-checklist.md
8. Ensure security sections present
9. Integrate with memory layer

## Outputs
- Complete agents/{agent-name}.md file
- YAML-valid with all 8 required sections
- Follows AIOS agent standards exactly
- Ready for immediate activation via @{agent-id}

## Validation Criteria
- [ ] Agent file created in agents/ directory
- [ ] YAML syntax is valid
- [ ] Persona section complete (role, style, identity, focus)
- [ ] Core principles documented
- [ ] Commands section includes 5+ commands
- [ ] Dependencies section correct
- [ ] Security section present
- [ ] Knowledge areas documented
- [ ] Score 80+ on agent-quality-gate-checklist.md

---

_Task Version: 1.0 - Agent Creation_
