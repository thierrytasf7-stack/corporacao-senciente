# Squad Quality Checklist (via Aider)

Complete validation checklist for created AIOS expansion packs.

## Directory Structure Validation

- [ ] Base directory exists: `squads/{pack_name}/`
- [ ] `agents/` directory exists
- [ ] `tasks/` directory exists
- [ ] `templates/` directory exists
- [ ] `checklists/` directory exists
- [ ] `data/` directory exists
- [ ] `workflows/` directory exists (if applicable)
- [ ] All directories have `.gitkeep` files
- [ ] No extraneous files in directories

## Configuration Validation

- [ ] `config.yaml` exists
- [ ] YAML syntax is valid
- [ ] `name` field matches pack name
- [ ] `version` field present (e.g., 1.0.0)
- [ ] `short-title` present and descriptive
- [ ] `description` complete (3+ sentences)
- [ ] `author` field documented
- [ ] `slashPrefix` in camelCase
- [ ] All required fields present

## Package Configuration

- [ ] `package.json` exists
- [ ] JSON syntax valid
- [ ] `name` follows @aios/ naming convention
- [ ] `version` matches config.yaml
- [ ] `description` matches purpose
- [ ] `keywords` array includes: aios, expansion-pack
- [ ] `engines` specifies Node.js 18+

## Agent Validation

For each agent created:
- [ ] Agent file exists in `agents/` directory
- [ ] Filename follows kebab-case convention
- [ ] YAML/Markdown syntax valid
- [ ] Agent has `id` matching filename
- [ ] Persona section complete (role, style, identity, focus)
- [ ] At least 5 commands listed
- [ ] Core principles documented (3+)
- [ ] Dependencies section present
- [ ] Security section present
- [ ] Agent scores 80+ on agent-quality-gate-checklist.md

## Task Validation

For each task created:
- [ ] Task file exists in `tasks/` directory
- [ ] Filename follows kebab-case convention
- [ ] Markdown syntax valid
- [ ] `## Purpose` section present
- [ ] `## Inputs` section present
- [ ] `## Key Activities` section present (numbered)
- [ ] `## Outputs` section present
- [ ] `## Validation Criteria` section present
- [ ] `## Integration with AIOS` section present
- [ ] `## Dependencies` section documented
- [ ] All success checks are testable (objective)
- [ ] No subjective criteria ("good quality", "professional")
- [ ] Task Anatomy Standard (8 fields) complete

## Template Validation

For each template created:
- [ ] Template file exists in `templates/` directory
- [ ] Filename follows kebab-case convention
- [ ] YAML/JSON/Markdown syntax valid
- [ ] All placeholders follow {variable-name} format
- [ ] Each placeholder has example value
- [ ] At least 3 main sections
- [ ] Usage examples provided
- [ ] Customization guidance included
- [ ] Consistent placeholder naming

## Checklist Validation

- [ ] At least one checklist exists in `checklists/` directory
- [ ] Checklist filename follows kebab-case convention
- [ ] Markdown syntax valid
- [ ] Checklist has 10+ validation items
- [ ] All items are checkbox format: `[ ]`
- [ ] Criteria are clear and testable

## Knowledge Base Validation

- [ ] Knowledge base file exists in `data/` directory (e.g., `squad-kb.md`)
- [ ] Markdown syntax valid
- [ ] Domain terminology documented
- [ ] At least 5 best practices included
- [ ] At least 5 common patterns documented
- [ ] Industry standards referenced (if applicable)
- [ ] Glossary included for domain terms

## Documentation Validation

- [ ] `README.md` exists in base directory
- [ ] Markdown syntax valid
- [ ] Overview section present (2-3 sentences)
- [ ] Purpose section explaining benefit
- [ ] "When to Use" section with 3+ use cases
- [ ] "What's Included" with agents, tasks, templates listed
- [ ] Installation instructions provided
- [ ] Usage examples (2+) included
- [ ] Key features documented
- [ ] Best practices section present
- [ ] Support/contribution info included
- [ ] All agent/task/template names referenced match actual files

## YAML Syntax Validation

- [ ] All .yaml files parse without errors
- [ ] Proper indentation (2 spaces)
- [ ] All required fields present
- [ ] No syntax errors in quotes/lists
- [ ] No trailing whitespace

## Markdown Syntax Validation

- [ ] All .md files have valid markdown
- [ ] Headers follow hierarchy (# → ## → ###)
- [ ] Code blocks properly formatted with ```
- [ ] Lists use consistent formatting
- [ ] Links properly formatted
- [ ] No broken internal references

## Security Validation

- [ ] No hardcoded API keys or credentials
- [ ] No SQL injection vulnerabilities
- [ ] No command injection vulnerabilities
- [ ] All file operations use safe paths
- [ ] No eval() or dynamic code execution
- [ ] User inputs properly sanitized
- [ ] Security sections present in agents

## Pattern Library Validation

- [ ] Pattern library documented (data/pattern-library.md)
- [ ] Naming convention defined (e.g., SC-A-NNN)
- [ ] Categories defined (orchestration, execution, etc.)
- [ ] At least 5 patterns documented
- [ ] Each pattern has: ID, name, category, when-to-use, implementation

## Executor Matrix Validation

- [ ] Executor matrix documented
- [ ] Agent type defined with criteria
- [ ] Task type defined with criteria
- [ ] Workflow type defined with criteria
- [ ] Script type defined with criteria (if used)
- [ ] Manual type defined with criteria (if used)
- [ ] Each executor has invocation pattern documented

## Quality Gates Validation

- [ ] Quality gates defined for phase transitions
- [ ] At least 4 gates (Requirements, Design, Implementation, Testing)
- [ ] Each gate has blocking criteria
- [ ] Escalation path defined for failed gates
- [ ] Documentation for each gate

## Dual AIOS Integration Validation

- [ ] Squad directory copied to Claude AIOS framework
- [ ] Squad directory copied to Aider AIOS framework
- [ ] Memory layer registration confirmed
- [ ] Both AIOS instances can see created squad
- [ ] Agents activatable in both frameworks
- [ ] Tasks executable in both frameworks

## Final Integration

- [ ] All files follow AIOS naming conventions
- [ ] No spelling or grammar errors in documentation
- [ ] All file paths are correct
- [ ] All cross-references valid
- [ ] Ready for installation via `npm run install:expansion`
- [ ] Squad scores 90+ on completeness
- [ ] No critical issues found
- [ ] Documentation is professional and clear

---

## Scoring

- ✅ All items checked: **PASS - Squad ready for deployment**
- ⚠️ 1-2 items unchecked: **WARNING - Minor issues, fix before deploy**
- ❌ 3+ items unchecked: **FAIL - Major issues, address before deploy**

---

_Checklist Version: 1.0 | Last Updated: 2026-02-05_
