# Create Complete Squad Task

## Purpose

To create a complete AIOS-FULLSTACK expansion pack through guided interactive elicitation. This task orchestrates the creation of all necessary components (agents, tasks, templates, checklists, and knowledge bases) required for a domain-specific expansion pack.

## Inputs

- User's domain expertise and requirements
- Reference to existing expansion packs for pattern guidance
- Templates from `expansion-creator/templates/`
- Knowledge base from `expansion-creator/data/squad-kb.md`

## Key Activities & Instructions

### 1. Confirm Creation Mode

- Ask the user: "How would you like to create your expansion pack?
  A. **Incremental Mode (Recommended):** We'll build each component step-by-step, with detailed elicitation and review at each stage. This ensures high quality and allows for refinement as we go.
  B. **Rapid Mode ("YOLO"):** I'll gather all requirements upfront and generate a complete pack quickly. This is faster but provides less opportunity for iterative refinement."
- Request the user to select their preferred mode (e.g., "Please let me know if you'd prefer A or B.").
- Once the user chooses, confirm the selected mode and proceed accordingly.

### 2. Domain & Purpose Elicitation

- Ask: "What domain or industry is this expansion pack for? (e.g., Legal, Healthcare, Real Estate, Education)"
- Ask: "What is the primary purpose of this expansion pack? What problems will it solve?"
- Ask: "Who is the target user for this pack? What is their role and expertise level?"
- Ask: "What are 3-5 key use cases this pack should support?"
- Document all responses for use in component generation

### 3. Define Pack Structure

**If Incremental Mode:**
- Elicit pack name (kebab-case): "What should we name this pack? (e.g., 'legal-assistant')"
- Elicit pack title: "What's the human-readable title? (e.g., 'Legal Assistant Pack')"
- Elicit version: "Starting version?" (default: "1.0.0")
- Elicit author: "Author name or organization?"
- Elicit slash prefix (camelCase): "Command prefix for this pack? (e.g., 'legalAssistant')"

**If Rapid Mode:**
- Gather all pack metadata in one go:
  - Pack name, title, version, author, slash prefix
  - List of planned agents
  - List of planned tasks
  - List of planned templates

### 3.5 Define Pattern Library

- Ask: "What is the prefix for patterns in this pack? (e.g., 'HO' for Hybrid-Ops → HO-001, HO-002)"
- Ask: "What categories of patterns will this pack define?"
  - Suggested categories: `orchestration`, `execution`, `validation`, `integration`
- Document pattern naming convention: `{PREFIX}-{NNN}: {Pattern Name}`
- Create initial pattern library structure in `data/pattern-library.md`
- Include for each pattern:
  - Pattern ID and name
  - Category
  - When to use
  - Implementation guidance
  - Related patterns

### 3.6 Create Executor Matrix

- Ask: "What types of executors will this pack use?"
  - Common types: `Agent`, `Task`, `Workflow`, `Script`, `Manual`
- For each executor type, document:
  - **When to use:** Criteria for selecting this executor
  - **Strengths:** What this executor does best
  - **Limitations:** When NOT to use
  - **Invocation pattern:** How to call/activate
- Create executor matrix in `data/executor-matrix.md`
- Example structure:
  ```
  | Executor | When to Use | Invocation |
  |----------|-------------|------------|
  | Agent    | Complex reasoning, multi-step | @agent-name |
  | Task     | Defined workflow, repeatable | *task-name |
  | Workflow | Multi-agent orchestration | /workflow-name |
  ```

### 4. Create Pack Directory Structure

- Create base directory: `squads/{pack_name}/`
- Create subdirectories:
  - `agents/` - Domain-specific agents
  - `tasks/` - Workflow tasks
  - `templates/` - Output templates
  - `checklists/` - Validation checklists
  - `data/` - Knowledge bases
- Create `config.yaml` using `expansion-config-tmpl.yaml` template
- Create `README.md` using `expansion-readme-tmpl.md` template

### 5. Create Agents

**If Incremental Mode:**
- For each agent:
  - Ask: "What is the name and role of this agent?"
  - Ask: "What is this agent's expertise and domain knowledge?"
  - Ask: "What personality traits should this agent have? (style, focus, approach)"
  - Ask: "What commands should this agent support?"
  - Ask: "What tasks, templates, and checklists will this agent use?"
  - Generate agent using `expansion-agent-tmpl.md` template
  - Review generated agent with user
  - Refine if needed
  - Ask: "Do you want to create another agent? (yes/no)"

**If Rapid Mode:**
- Generate all planned agents based on initial requirements
- Present all agents for bulk review

### 6. Create Tasks

**If Incremental Mode:**
- For each task:
  - Ask: "What is the name and purpose of this task?"
  - Ask: "What are the input requirements?"
  - Ask: "What are the expected outputs?"
  - Ask: "Should this task be interactive (elicit user input) or automated?"
  - Ask: "What are the workflow steps?"
  - Generate task using `expansion-task-tmpl.md` template
  - Review generated task with user
  - Refine if needed
  - Ask: "Do you want to create another task? (yes/no)"

**If Rapid Mode:**
- Generate all planned tasks based on initial requirements
- Present all tasks for bulk review

### 6.5 Design Quality Gates

- Ask: "What are the critical transitions between phases that require validation?"
- For each quality gate:
  - **Gate ID:** Sequential identifier (QG-001, QG-002, etc.)
  - **Transition:** From phase → To phase
  - **Checkpoint criteria:** What must be true to proceed
  - **Blocking vs Warning:** Does failure block progress or just warn?
  - **Escalation path:** What happens if gate fails repeatedly?
- Create quality gates document in `checklists/quality-gates.md`
- Example quality gates:
  - QG-001: Requirements → Design (all requirements approved)
  - QG-002: Design → Implementation (architecture review passed)
  - QG-003: Implementation → Testing (code review completed)
  - QG-004: Testing → Deployment (all tests passing)

### 7. Create Templates

**If Incremental Mode:**
- For each template:
  - Ask: "What type of document or artifact does this template generate?"
  - Ask: "What is the output format? (markdown, yaml, json, etc.)"
  - Ask: "What are the main sections of this template?"
  - Ask: "Should this template use interactive elicitation?"
  - Ask: "What placeholders and variables are needed?"
  - Generate template using `expansion-template-tmpl.yaml` template
  - Review generated template with user
  - Refine if needed
  - Ask: "Do you want to create another template? (yes/no)"

**If Rapid Mode:**
- Generate all planned templates based on initial requirements
- Present all templates for bulk review

### 8. Create Validation Checklist

- Ask: "What quality criteria should be validated for outputs from this pack?"
- Ask: "Are there domain-specific compliance or regulatory requirements?"
- Ask: "What security considerations are important for this domain?"
- Generate checklist in markdown format with sections for:
  - Completeness validation
  - Quality standards
  - Domain-specific requirements
  - Security validation
  - Integration validation
- Create additional standard checklists:
  - `checklists/task-anatomy-checklist.md` - Validates tasks follow the 8-field standard
  - `checklists/quality-gate-checklist.md` - Validates quality gates are properly defined
  - `checklists/executor-matrix-checklist.md` - Validates executor selection criteria

### 9. Create Knowledge Base

- Ask: "What domain knowledge should be documented for this pack?"
- Ask: "Are there best practices, standards, or guidelines specific to this domain?"
- Generate knowledge base documenting:
  - Domain terminology and concepts
  - Best practices
  - Common patterns
  - Industry standards
  - Regulatory considerations (if applicable)

### 10. Generate Documentation

- Update README.md with:
  - Complete list of all created agents
  - Complete list of all created tasks
  - Complete list of all created templates
  - Usage examples for each component
  - Installation instructions
  - Integration guidance
- Create usage examples showing:
  - How to activate agents
  - How to execute tasks
  - How to use templates
  - Common workflows

### 11. Validate Pack Structure

- Verify all required files are created
- Check that agent dependencies reference existing tasks/templates
- Validate YAML syntax in config.yaml and all template files
- Ensure all markdown files are properly formatted
- Verify directory structure matches AIOS standards

### 12. Test Pack Integration

- Ask: "Would you like to test this expansion pack by creating a sample output?"
- If yes:
  - Activate one of the created agents
  - Execute one of the created tasks
  - Verify template generates expected output
  - Document any issues found
  - Refine components if needed

### 13. Final Review & Handoff

- Present complete pack structure to user
- Summarize what was created:
  - Number of agents
  - Number of tasks
  - Number of templates
  - Checklist and knowledge base
- Explain how to install the pack:
  ```bash
  npm run install:expansion {pack_name}
  ```
- Explain how to activate agents:
  ```bash
  @{agent_id}
  ```
- Ask: "Would you like to make any final adjustments or refinements?"

### 14. Memory Layer Integration

- Save pack metadata to memory layer:
  - Pack name and purpose
  - Domain and target users
  - Created components list
  - Creation date and author
- Tag for easy retrieval:
  - `squad`
  - `{domain}`
  - `{pack_name}`

## Outputs

- Complete expansion pack in `squads/{pack_name}/`
- All agents, tasks, templates, checklist, and knowledge base
- Comprehensive README.md with usage examples
- config.yaml with pack metadata

## Validation Criteria

- [ ] Pack directory structure matches AIOS standards
- [ ] config.yaml is valid YAML with all required fields
- [ ] At least one agent is created
- [ ] At least one task is created
- [ ] README.md includes usage examples
- [ ] All agent dependencies reference existing files
- [ ] All YAML files have valid syntax
- [ ] Documentation is complete and clear
- [ ] Pattern Library defined with prefix
- [ ] Executor Matrix documented
- [ ] Quality Gates defined for critical transitions
- [ ] All tasks follow Task Anatomy Standard (8 fields)

## Integration with AIOS

This task creates expansion packs that seamlessly integrate with:
- Core AIOS-FULLSTACK framework
- Standard installer (`npm run install:expansion`)
- Memory layer for tracking created packs
- Agent activation system (@agent-id syntax)

## Notes

- Incremental mode provides higher quality through iterative refinement
- Rapid mode is faster but may require more post-creation editing
- All generated components follow AIOS best practices and security guidelines
- Templates include embedded elicitation patterns for quality output generation
- Created packs are immediately usable with standard AIOS tools

---

_Task Version: 1.1_
_Last Updated: 2026-01-24_
