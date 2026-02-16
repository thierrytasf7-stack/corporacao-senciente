---
procedure: squad-creation-activation-procedure
id: squad-creation-activation-procedure
name: Squad Creation & Activation Procedure
severity: MANDATORY
appliesTo: Both Claude AIOS and Aider AIOS
principle: Auto-activation on creation
---

# Squad Creation & Activation Procedure

**Severity:** MANDATORY
**Applies To:** Both Claude AIOS and Aider AIOS
**Principle:** Auto-activation on creation (not manual post-creation)

---

## 🎯 Core Rule

**EVERY squad creation workflow MUST include automatic activation and multi-platform command registration (Gemini, Claude, Aider) as final step.**

NO manual activation after creation.
Activation IS part of the workflow.
Commands MUST be available immediately for ALL AI interfaces (Gemini, Claude, Aider).
Activation IS complete only when @mentions and /commands work on all supported platforms.

---

## 📋 Procedure Overview

```
Squad Creation Workflow:
    ↓
STEP 1: Create squad files (squadcreator)
    ↓
STEP 2: Validate squad structure
    ↓
STEP 3: Register agents + Multi-platform commands (AUTOMATIC)
        - Commands for Gemini CLI
        - Commands for Claude (AIOS)
        - Commands for Aider CLI
    ↓
STEP 4: Activate squad in system
    ↓
STEP 5: Verify commands available in all terminals/interfaces
    ↓
STEP 6: Report ready-to-use (not "creation complete, activation pending")
    ↓
User can invoke immediately: @agent-name or /command (Gemini, Claude, Aider)
```

---

## 🔄 Implementation: Claude AIOS

### In: squad-creator Agent (.aios-core/development/agents/squad-creator.md)

**Add to workflow definition:**

```yaml
post-creation-procedure:
  STEP_1_VALIDATE:
    - Check: Squad structure complete (agents/, tasks/, templates/, data/, checklists/)
    - Check: All agents have personas
    - Check: All agents have commands defined
    - Check: config.yaml valid

  STEP_2_REGISTER_AGENTS:
    - For each agent in squad:
      * Register agent ID in system registry
      * Register agent commands in CLI
      * Register agent in @-mention system
    - Example:
      @squad-creator *register-agent "social-media-squad" "content-strategist"

  STEP_3_REGISTER_COMMANDS:
    - For each command (from agents):
      * Register in slash-command system (e.g., /agent-name)
      * Register in @-mention system (e.g., @agent-name)
      * Verify command aliases
    - Example:
      @squad-creator *register-commands "social-media-squad"

  STEP_4_ACTIVATE_SQUAD:
    - Mark squad as ACTIVE in system
    - Update squad status: CREATED → ACTIVE
    - Verify agents available
    - Test agent invocation (internal check)

  STEP_5_VERIFY_TERMINAL:
    - Confirm agents available in terminal
    - Confirm commands work: @agent-name or /command
    - Report: "Ready to use immediately"

  STEP_6_REPORT_READY:
    - NOT: "Squad created. Activation pending."
    - BUT: "Squad active and ready. Use: @agent-name or /command"
```

**Update workflow in squad-creator.md:**

Before (OLD):
```
@squad-creator *create-squad "social-media-squad"
→ "Squad created. You can now activate it with..."
→ User must manually: @squad-creator *activate "social-media-squad"
```

After (NEW):
```
@squad-creator *create-squad "social-media-squad"
→ [CREATE] Squad files created
→ [VALIDATE] Structure verified ✓
→ [REGISTER] Agents registered ✓
→ [REGISTER] Commands registered ✓
→ [ACTIVATE] Squad activated ✓
→ [VERIFY] Terminal commands verified ✓
→ "Squad ready. Use: @agent-name or /command"
→ User can IMMEDIATELY invoke agents
```

---

## 🔄 Implementation: Aider AIOS

### In: squadcreator-aider Workflow (.aios-core/workflows/generate-summaries-aider.md)

**Add to workflow:**

```yaml
post-creation-steps:
  "After Aider creates squad files":
    - Validate: squads/squadcreator-aider/[squad-name]/ exists
    - For each agent in config.yaml:
      * Extract agent ID
      * Extract agent commands
      * Register in Aider AIOS registry
    - Mark squad: CREATED → ACTIVE
    - Verify agents available in Aider CLI
    - Report: Squad ready, use @agent-name
```

**Update squadcreator-aider agent (.aios-core/development/agents/expansion-creator-aider.md):**

```yaml
creation-workflow:
  step_7_post_creation: |
    After Aider CLI finishes creating squad files:

    1. VALIDATE squad structure
       - Check all directories exist
       - Check all files present
       - Check YAML syntax valid

    2. EXTRACT agent definitions
       - Read: agents/*.md
       - Parse: agent ID, commands, personas

    3. REGISTER in Aider AIOS
       - Add to agent registry
       - Register commands
       - Mark as ACTIVE

    4. VERIFY availability
       - Test: Can invoke @agent-name?
       - Test: Are /commands registered?

    5. REPORT READY
       - "Squad created and activated"
       - "Ready to use: @agent-name"
       - "Commands available: @agent-name, /command"
```

---

## 📋 Universal Procedure (Both Aider & Claude)

### Phase 1: Creation
```
@squad-creator *create-squad "name"
OR
/aider *create-squad "name"
    ↓
Files created (agents/, tasks/, templates/, data/, checklists/)
```

### Phase 2: Validation (AUTOMATIC)
```
✓ Structure valid
✓ YAML valid
✓ Agents defined
✓ Commands defined
```

### Phase 3: Registration (AUTOMATIC)
```
✓ Register agents in system
✓ Register commands (@agent-name)
✓ Register slash-commands (/command)
✓ Mark squad: ACTIVE
```

### Phase 4: Verification (AUTOMATIC)
```
✓ Agent @-mentions work
✓ Commands accessible
✓ System recognizes squad
```

### Phase 5: Report Ready (AUTOMATIC)
```
"Squad 'social-media-squad' created and activated ✓

Available agents:
  @content-strategist
  @creative-director
  @analytics-expert
  @community-manager

Ready to use immediately!"
```

---

## 🔧 Implementation Details

### For Claude AIOS

**File:** `.aios-core/development/agents/squad-creator.md`

Add to `commands` section:
```yaml
- name: register-squad
  description: |
    Registers squad agents + commands after creation.
    Automatic in create-squad workflow.
    Syntax: *register-squad {squad-name}
```

Add to workflow steps:
```yaml
creation-workflow:
  - step_1: create_squad_files
  - step_2: validate_structure
  - step_3: register_squad          ← AUTOMATIC
  - step_4: activate_squad          ← AUTOMATIC
  - step_5: verify_commands         ← AUTOMATIC
  - step_6: report_ready_to_use     ← AUTOMATIC
```

### For Aider AIOS

**File:** `.aios-core/squads/squadcreator-aider/agents/expansion-creator-aider.md`

Add to workflow:
```yaml
post_creation_activation: |
  After Aider CLI creates squad:

  1. Validate squad structure exists
  2. Parse agents from config.yaml
  3. Register each agent:
     - Agent ID
     - Commands
     - Persona
  4. Activate squad in registry
  5. Verify commands accessible
  6. Report: "Ready to use @agent-name"
```

---

## 📋 Checklist: Auto-Activation Procedure

Every squad creation MUST include:

```
PRE-CREATION:
  ✓ Squad name valid
  ✓ Squad purpose clear
  ✓ Agent personas defined

DURING-CREATION:
  ✓ Files created correctly
  ✓ Structure follows patterns

POST-CREATION (AUTOMATIC):
  ✓ Validation passed
  ✓ Agents registered in system
  ✓ Commands registered
  ✓ Squad marked ACTIVE
  ✓ Terminal commands verified
  ✓ Agents immediately available

REPORT:
  ✓ NOT: "Squad created, activation pending"
  ✓ BUT: "Squad active, ready to use: @agent-name"
```

---

## 🎯 What Each Agent Must Understand

### For @squad-creator (Claude)
```
Your create-squad workflow MUST automatically:
  1. Create files
  2. Validate structure
  3. Register agents
  4. Register commands
  5. Activate squad
  6. Verify in terminal
  7. Report "ready to use" (not "created, activate it")

NEVER require manual activation after creation.
Activation IS part of the workflow.
```

### For /aider-dev (Aider Implementation)
```
When creating squad files, DO NOT STOP after file creation.
CONTINUE with automatic:
  1. Validation
  2. Agent registration
  3. Command registration
  4. Squad activation
  5. Verification

Report: "Squad active and ready to use"
```

### For @dev (Claude Implementation)
```
Same as @squad-creator - include auto-activation in workflow.
If using @squad-creator, let it handle activation.
If creating custom squad, implement same auto-activation steps.
```

### For All Agents (Critical Understanding)
```
🚨 MANDATORY MINDSET SHIFT:

OLD (WRONG):
  "Squad created. Next step: manually activate it."
  User experience: Create → Wait → Activate → Use

NEW (CORRECT):
  "Squad created and activated. Ready to use immediately."
  User experience: Create → Use (activation is transparent)

Activation must be part of creation workflow, NOT separate.
User should NEVER see "activation pending" message.
Agents should NEVER say "you can now activate..."

Instead, agents should say: "Ready to use: @agent-name"
```

---

## 🔍 Verification: Is Squad Ready?

After creation, verify AUTOMATICALLY:

```
Test 1: Can I invoke the agent?
  @content-strategist *help
  → Should work (not "command not found")

Test 2: Is command registered?
  /content-strategist
  → Should be available

Test 3: Is squad in system?
  @squad-creator *list-squads
  → Should show "social-media-squad: ACTIVE"

If ANY test fails:
  → Squad is NOT ready
  → Registration incomplete
  → Do NOT report as ready

If ALL tests pass:
  → Squad is ready
  → Report as ready
  → User can use immediately
```

---

## 📊 Before vs After

### BEFORE (Wrong Process)
```
User: Create squad
  ↓
squadcreator: "Squad created! Run activation command next"
  ↓
User: Wait, I have to activate it?
  ↓
User: @squad-creator *activate-squad "name"
  ↓
squadcreator: "Squad activated"
  ↓
User: Finally can use it...
  ↓
@content-strategist *help
  ↓
Works (after 2 steps)
```

### AFTER (Correct Process - This Procedure)
```
User: Create squad
  ↓
squadcreator: [Create] [Validate] [Register] [Activate] [Verify]
  ↓
squadcreator: "Squad ready to use: @content-strategist"
  ↓
@content-strategist *help
  ↓
Works immediately (1 step)
```

---

## 🚀 Implementation Roadmap

### Phase 1: Update squad-creator (Claude AIOS)
```
File: .aios-core/development/agents/squad-creator.md
Action: Add auto-activation to create-squad workflow
Status: [ ] TO-DO
```

### Phase 2: Update squadcreator-aider (Aider AIOS)
```
File: .aios-core/squads/squadcreator-aider/agents/expansion-creator-aider.md
Action: Add post-creation activation steps
Status: [ ] TO-DO
```

### Phase 3: Create Activation Procedure Doc
```
File: .aios-core/procedures/squad-creation-activation-procedure.md
Action: This document (reference for all agents)
Status: [ ] TO-DO
```

### Phase 4: Update Constitution (Optional but Recommended)
```
File: .aios-core/constitution.md
Action: Add principle about auto-activation
Status: [ ] TO-DO
```

### Phase 5: Train All Agents
```
Ensure all agents understand: Activation = part of creation
NOT: Separate step after creation
```

---

## 📞 Verification Commands

After squad creation, verify with:

```bash
# Test 1: Is squad active?
@squad-creator *status "social-media-squad"
# Expected: "Status: ACTIVE"

# Test 2: Can I use the agent?
@content-strategist *help
# Expected: Help output (not error)

# Test 3: Are commands registered?
@squad-creator *list-commands "social-media-squad"
# Expected: List of commands

# If all pass → Squad is ready
# If any fail → Something wrong with activation
```

---

## ✅ Success Criteria

Activation procedure is successful when:

```
✓ Squad created
✓ Files exist and are valid
✓ Agents are registered in system
✓ Commands are registered (@-mentions and /)
✓ Squad status is ACTIVE
✓ Agents are immediately invokable
✓ Report says "ready to use" (not "ready to activate")
✓ User can use @agent-name without additional setup
✓ No manual activation step required
```

---

## 🎓 Philosophy

**Creation includes activation. They are not separate.**

- Old model: Create → Then activate (two steps)
- New model: Create (which includes activation) (one step)
- Result: User experience is seamless

---

*Squad Creation & Activation Procedure | Mandatory | Both AIOS Claude & Aider | Auto-Activation Required*
