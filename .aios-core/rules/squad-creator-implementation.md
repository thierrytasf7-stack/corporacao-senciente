# Squad Creator Implementation Guide - Sector Model

**Version:** 1.0.0
**Applies To:** @squad-creator (Claude AIOS), squadcreator-aider (Aider AIOS)
**Principle:** Create squads following the Sector Model with Dual AIOS ecosystem

---

## Overview

Squad creators must implement the **Sector Model** when creating squads:

- **One command per squad** (not individual agent commands)
- **Sector represents a complete domain** with multiple agents working together
- **Dual execution** (Claude AIOS native + Aider AIOS delegation)
- **Auto-activation** (no manual steps)
- **Mirror squads** in both AIOS frameworks

Reference: `.aios-core/rules/squad-creation-standards.md`

---

## Implementation For @squad-creator (Claude AIOS)

### File: `.aios-core/development/agents/squad-creator.md`

#### Add to core_principles:
```yaml
core_principles:
  - CRITICAL: All squads follow SECTOR MODEL (not individual agent commands)
  - CRITICAL: Each squad creates dual commands: /AIOS:agents:SquadName and /Aider:agents:SquadName
  - CRITICAL: Squad creation includes automatic registration of both commands
  - CRITICAL: Both AIOS frameworks have mirror squad structures
```

#### Update *create-squad command description:
```yaml
- name: create-squad
  description: |
    Create new squad following SECTOR MODEL.
    Creates unified domain with multiple coordinated agents.

    Automatically creates:
    - Squad structure in squads/{name}/
    - /AIOS:agents:SquadName (Claude execution)
    - /Aider:agents:SquadName (Aider delegation)
    - Mirror squad in Aider AIOS
    - Both commands auto-activated

    Example: *create-squad legal-squad "Legal Services" "5 agents"
```

---

### File: `.aios-core/development/tasks/squad-creator-create.md`

This task defines HOW a squad is created. Update it to follow sector model:

#### Update Checklist:
```markdown
Checklist:
  - "[ ] Validate sector name (kebab-case, unique)"
  - "[ ] Elicit sector details (domain, agents, workflows)"
  - "[ ] Create squad structure in squads/{name}/"
  - "[ ] Create 3-5 specialized agents with frameworks"
  - "[ ] Create workflows showing agent coordination"
  - "[ ] Create templates and knowledge bases"
  - "[ ] CREATE /AIOS:agents/SquadName.md (sector command)"
  - "[ ] CREATE /Aider:agents/SquadName.md (delegation bridge)"
  - "[ ] Trigger squadcreator-aider to mirror in Aider AIOS"
  - "[ ] AUTO-ACTIVATE both commands"
  - "[ ] Verify both commands work"
  - "[ ] REPORT ready (not 'ready to activate')"
```

#### Update Flow Section:
```markdown
## Flow - Sector Model Creation

1. COLLECT SECTOR REQUIREMENTS
   ├── Sector name and title
   ├── Domain (e.g., "Social Media Management")
   ├── Number of agents (typically 3-5)
   ├── Agent roles and frameworks
   └── Key workflows

2. CREATE SQUAD STRUCTURE
   ├── Create squads/{sector-name}/ directory
   ├── Create agents/ with 3-5 specialized agents
   ├── Create workflows/ showing agent coordination
   ├── Create tasks/, templates/, data/, checklists/
   └── Create config.yaml with sector metadata

3. CREATE SECTOR COMMAND
   ├── File: .claude/commands/AIOS/agents/{SquadName}.md
   ├── Define unified sector interface
   ├── List all agents and their roles
   ├── Document all workflows
   ├── Show integration points
   └── Explain dual execution

4. CREATE AIDER DELEGATION BRIDGE
   ├── File: .claude/commands/Aider/agents/{SquadName}.md
   ├── Route to Aider AIOS squad
   ├── Show cost comparison (Claude vs $0 Aider)
   ├── Explain parallel execution
   └── Provide routing documentation

5. MIRROR TO AIDER AIOS
   ├── Trigger squadcreator-aider to create
   ├── Same squad structure in Aider AIOS
   ├── Same agents, workflows, templates
   ├── Register in Aider squad registry
   └── Verify both registries synchronized

6. AUTO-ACTIVATION
   ├── Register /AIOS:agents:SquadName command
   ├── Register /Aider:agents:SquadName command
   ├── Mark both: ACTIVE
   ├── Verify both work in terminal
   └── Update CLI command index

7. VALIDATION
   ├── Test: /AIOS:agents:SquadName *help → works
   ├── Test: /Aider:agents:SquadName *help → works
   ├── Verify all agents accessible
   ├── Verify all workflows available
   └── Check both AIOS have squad

8. REPORT READY
   ├── NOT: "Squad created, ready to activate"
   ├── BUT: "SquadName created and activated"
   ├── SHOW: Both execution options
   ├── SHOW: Available commands
   └── EMPHASIZE: Ready to use immediately
```

#### Update Implementation Section:

```javascript
// POST CREATE-SQUAD WORKFLOW

async function createSquad(options) {
  const { name, title, agents, workflows } = options;

  // 1. Create squad structure
  await generateSquadStructure(name, agents, workflows);

  // 2. Create sector command file
  const claudeCommand = generateSectorCommand(name, title, agents, workflows);
  await fs.writeFile(`.claude/commands/AIOS/agents/${toPascalCase(name)}.md`, claudeCommand);
  console.log(`✓ Created: /AIOS:agents:${toPascalCase(name)}`);

  // 3. Create Aider delegation bridge
  const aiderBridge = generateAiderBridge(name, title, agents);
  await fs.writeFile(`.claude/commands/Aider/agents/${toPascalCase(name)}.md`, aiderBridge);
  console.log(`✓ Created: /Aider:agents:${toPascalCase(name)}`);

  // 4. Trigger squadcreator-aider to mirror
  await triggerAiderSquadCreation(name, agents, workflows);
  console.log(`✓ Aider AIOS squad created (mirrored)`);

  // 5. Auto-activate both commands
  await registerCommand(`/AIOS:agents:${toPascalCase(name)}`);
  await registerCommand(`/Aider:agents:${toPascalCase(name)}`);
  await updateCommandIndex();
  console.log(`✓ Both commands activated`);

  // 6. Verify both work
  const claudeVerify = await verifyCommand(`/AIOS:agents:${toPascalCase(name)}`);
  const aiderVerify = await verifyCommand(`/Aider:agents:${toPascalCase(name)}`);

  if (!claudeVerify || !aiderVerify) {
    throw new Error('Command verification failed');
  }
  console.log(`✓ Both commands verified`);

  // 7. Report ready
  console.log(`\n✅ ${title} created and activated!\n`);
  console.log(`Use via Claude AIOS (integrated):`);
  console.log(`  /AIOS:agents:${toPascalCase(name)} *help\n`);
  console.log(`Use via Aider AIOS ($0, parallel):`);
  console.log(`  /Aider:agents:${toPascalCase(name)} *help\n`);
  console.log(`Ready for use immediately!`);

  return { success: true, squadName: name };
}
```

---

## Implementation For squadcreator-aider (Aider AIOS)

### File: `squads/squadcreator-aider/agents/expansion-creator-aider.md`

#### Update core_principles with Sector Model:
```yaml
- |
  PRINCIPLE 7: SECTOR MODEL CREATION
  All squads created follow sector model:
  - One command per squad (/aider-squad:name)
  - Multiple agents coordinated via workflows
  - Triggers mirror in Claude AIOS
  - Claude automatically creates /AIOS:agents and /Aider:agents
  - Both AIOS have complete ecosystem
```

#### Update Squad Creation Flow:

```yaml
squad_creation_flow:
  step_1: |
    RESEARCH & REQUIREMENTS
    - Research domain (e.g., legal, finance, marketing)
    - Identify 3-5 specialized agent roles
    - Document frameworks for each agent
    - Plan workflows showing coordination

  step_2: |
    CREATE SQUAD STRUCTURE (Aider)
    - Create squads/{squad-name}/ in Aider AIOS
    - Create agents/ with 3-5 agents (Aider-generated)
    - Create workflows/ showing agent coordination
    - Create tasks/, templates/, data/, checklists/

  step_3: |
    REGISTER IN AIDER
    - Add to Aider squad registry
    - Mark: CREATED
    - Register agents
    - Register workflows

  step_4: |
    TRIGGER CLAUDE MIRROR
    - Call Claude AIOS squad-creator
    - "Mirror this squad to Claude AIOS"
    - Include: agents, workflows, templates, config
    - Claude creates: squads/{squad-name}/

  step_5: |
    CLAUDE CREATES SECTOR COMMANDS
    (Claude @squad-creator automatically):
    - Creates .claude/commands/AIOS/agents/{SquadName}.md
    - Creates .claude/commands/Aider/agents/{SquadName}.md
    - Registers both in CLI
    - AUTO-ACTIVATES both

  step_6: |
    CROSS-AIOS ACTIVATION
    - Verify: Claude has /AIOS:agents:SquadName
    - Verify: Claude has /Aider:agents:SquadName
    - Verify: Aider has /aider-squad:squad-name
    - Mark both: ACTIVE

  step_7: |
    VALIDATION
    - Test Claude command works
    - Test Aider delegation works
    - Verify both AIOS have squad
    - Check workflows execute

  step_8: |
    AUTO-ACTIVATION COMPLETE
    - Both AIOS ready
    - Both command paths activated
    - No manual steps required
    - Ready for use immediately
```

---

## Integration: How Both Squad-Creators Work Together

### Scenario 1: Create Squad from Claude AIOS

```
User: @squad-creator *create-squad "legal-squad"
      ↓
@squad-creator:
  1. Creates squad in squads/legal-squad/
  2. Creates /AIOS:agents/LegalSquad.md
  3. Creates /Aider:agents/LegalSquad.md
  4. Calls squadcreator-aider: "Mirror to Aider AIOS"
      ↓
squadcreator-aider (in Aider AIOS):
  1. Creates squads/legal-squad/ in Aider
  2. Registers in Aider registry
  3. Confirms creation back to Claude
      ↓
Back to @squad-creator:
  5. Registers both Claude commands
  6. AUTO-ACTIVATES both
  7. Reports: "LegalSquad created and activated"
      ↓
Result:
  ✓ /AIOS:agents:LegalSquad (Claude execution)
  ✓ /Aider:agents:LegalSquad (Aider $0 delegation)
  ✓ Squad in both AIOS frameworks
  ✓ All commands working immediately
```

### Scenario 2: Create Squad from Aider AIOS

```
User: /aider-squad:squadcreator-aider *create "finance-squad"
      ↓
squadcreator-aider (in Aider AIOS):
  1. Creates squads/finance-squad/ in Aider
  2. Registers in Aider registry
  3. Calls Claude AIOS: "Mirror to Claude AIOS"
      ↓
@squad-creator (in Claude AIOS):
  1. Creates squads/finance-squad/ in Claude
  2. Creates /AIOS:agents/FinanceSquad.md
  3. Creates /Aider:agents/FinanceSquad.md
  4. Registers both commands
  5. AUTO-ACTIVATES both
  6. Confirms back to Aider
      ↓
Back to squadcreator-aider:
  4. Verifies Claude has commands
  5. Reports: "FinanceSquad synced and activated"
      ↓
Result:
  ✓ Squad in both AIOS frameworks
  ✓ /AIOS:agents:FinanceSquad (Claude)
  ✓ /Aider:agents:FinanceSquad (Aider $0)
  ✓ All commands working immediately
```

---

## What Each Squad-Creator Must Do

### @squad-creator (Claude) Responsibilities:

1. **Create squad files** in `squads/{name}/`
2. **Create sector command** at `.claude/commands/AIOS/agents/{Name}.md`
3. **Create delegation bridge** at `.claude/commands/Aider/agents/{Name}.md`
4. **Trigger Aider to mirror** (or accept mirror from Aider)
5. **Auto-activate both commands** (no manual steps)
6. **Report ready** - "X created and activated, use /AIOS:agents:X or /Aider:agents:X"

### squadcreator-aider (Aider) Responsibilities:

1. **Create squad files** in `squads/{name}/` (Aider AIOS)
2. **Register in Aider registry**
3. **Trigger Claude to mirror** (or respond to mirror request)
4. **Verify Claude commands created**
5. **Confirm creation** - "X synced to both AIOS"

---

## Files to Create/Update

### Create New:
- `.aios-core/rules/squad-creator-implementation.md` ← You are reading this

### Update Existing:
1. `.aios-core/development/agents/squad-creator.md`
   - Add sector model principles
   - Update *create-squad description
   - Reference standards document

2. `.aios-core/development/tasks/squad-creator-create.md`
   - Update checklist with sector steps
   - Update flow with 8-step process
   - Update implementation code

3. `squads/squadcreator-aider/agents/expansion-creator-aider.md`
   - Add sector model principle
   - Update squad creation flow
   - Add mirror/sync steps

---

## Verification Commands

After squad creation:

```bash
# Test Claude execution
/AIOS:agents:LegalSquad *help
→ Should show unified sector interface

# Test Aider delegation
/Aider:agents:LegalSquad *help
→ Should route to Aider AIOS

# Check status in Claude AIOS
@squad-creator *list-squads
→ Should show: legal-squad ACTIVE (registered)

# Check status in Aider AIOS
/aider-squad:squadcreator-aider *list-squads
→ Should show: legal-squad ACTIVE (registered)
```

---

## Success Criteria

Squad creation is successful when:

```markdown
✅ Command: /AIOS:agents:SquadName works
✅ Command: /Aider:agents:SquadName works
✅ Both routing correctly
✅ All agents available via both paths
✅ All workflows executable
✅ Squad status: ACTIVE (both registries)
✅ No manual activation steps required
✅ Report says "ready to use immediately"
```

---

## Status

- ✅ Standards document created: `.aios-core/rules/squad-creation-standards.md`
- ✅ SocialMediaSquad implemented correctly as example
- ✅ This implementation guide: `.aios-core/rules/squad-creator-implementation.md`
- ⏳ **NEXT: Update squad-creator files** (manual work)
  - Update @squad-creator agent definition
  - Update squad-creator-create task
  - Update squadcreator-aider agent definition

---

*Squad Creator Implementation Guide | Sector Model | Dual AIOS Ecosystem*
