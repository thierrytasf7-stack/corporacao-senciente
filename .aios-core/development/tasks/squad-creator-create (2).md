---
task: Create Squad
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - name: Nome do squad (kebab-case, obrigatorio)
  - description: Descricao (opcional, elicitacao)
  - author: Autor (opcional, default: git config user.name)
  - license: Licenca (opcional, default: MIT)
  - template: Template base (basic | etl | agent-only)
  - config_mode: extend | override | none
Saida: |
  - squad_path: Caminho do squad criado
  - manifest: Conteudo do squad.yaml gerado
  - next_steps: Instrucoes para proximos passos
Checklist:
  - "[ ] Validar nome (kebab-case, nao existe)"
  - "[ ] Coletar informacoes via elicitacao"
  - "[ ] Gerar estrutura de diretorios"
  - "[ ] Gerar squad.yaml"
  - "[ ] Gerar arquivos de config (coding-standards, etc.)"
  - "[ ] Gerar exemplo de agent"
  - "[ ] Gerar exemplo de task"
  - "[ ] Executar validacao inicial"
  - "[ ] REGISTRAR agentes no sistema (AUTOMATIC)"
  - "[ ] GERAR comandos para Gemini CLI (.gemini/commands/agents/)"
  - "[ ] GERAR comandos para Claude AIOS (.claude/commands/AIOS/agents/)"
  - "[ ] GERAR comandos para Aider AIOS (.claude/commands/Aider/agents/)"
  - "[ ] REGISTRAR comandos no CLI (@-mention e /) em todas as plataformas"
  - "[ ] ATIVAR squad (marcar como ACTIVE em todos os registros)"
  - "[ ] VERIFICAR comandos no terminal (Gemini, Claude, Aider)"
  - "[ ] RELATAR pronto para usar em todo o ecossistema"
---

# *create-squad

Cria um novo squad seguindo a arquitetura task-first do AIOS.

## Uso

```
@squad-creator

*create-squad
# → Modo interativo, elicita todas as informacoes

*create-squad meu-squad
# → Usa defaults para o resto

*create-squad meu-squad --template etl --author "Meu Nome"
# → Especifica opcoes diretamente
```

## Parametros

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | - | Squad name (kebab-case, required) |
| `--description` | string | "Custom squad" | Squad description |
| `--author` | string | git user.name | Author name |
| `--license` | string | MIT | License type |
| `--template` | string | basic | Template: basic, etl, agent-only |
| `--config-mode` | string | extend | Config inheritance: extend, override, none |
| `--skip-validation` | flag | false | Skip initial validation |
| `--yes` | flag | false | Skip interactive prompts, use defaults |

## Elicitacao Interativa

```
? Squad name: meu-dominio-squad
? Description: Squad para automacao de processos X
? Author: [git config user.name]
? License: (MIT)
  > MIT
    Apache-2.0
    ISC
    UNLICENSED
? Template:
  > basic (estrutura minima)
    etl (processamento de dados)
    agent-only (apenas agentes)
? Include example agent? (Y/n)
? Include example task? (Y/n)
? Config inheritance:
  > extend (adiciona as regras do core)
    override (substitui regras do core)
    none (sem heranca)
? Minimum AIOS version: (2.1.0)
```

## Templates Disponiveis

| Template | Description | Components |
|----------|-------------|------------|
| `basic` | Estrutura minima | 1 agent, 1 task |
| `etl` | Processamento de dados | 2 agents, 3 tasks, scripts |
| `agent-only` | Apenas agentes | 2 agents, sem tasks |

## Estrutura Gerada

### Com Project Configs (SQS-10)

Quando o projeto tem `docs/framework/` com arquivos de config (CODING-STANDARDS.md, etc.),
o squad referencia esses arquivos ao invés de criar cópias locais:

```
./squads/meu-dominio-squad/
├── squad.yaml                    # Manifest (referencia docs/framework/)
├── README.md                     # Documentacao
├── config/
│   └── .gitkeep                 # Configs em docs/framework/
├── agents/
│   └── example-agent.md         # Agente de exemplo
├── tasks/
│   └── example-agent-task.md    # Task de exemplo
...
```

### Sem Project Configs (Fallback)

Quando o projeto NÃO tem `docs/framework/`, cria arquivos locais:

```
./squads/meu-dominio-squad/
├── squad.yaml                    # Manifest
├── README.md                     # Documentacao
├── config/
│   ├── coding-standards.md      # Extends/override core
│   ├── tech-stack.md            # Tecnologias do squad
│   └── source-tree.md           # Estrutura documentada
├── agents/
│   └── example-agent.md         # Agente de exemplo
├── tasks/
│   └── example-agent-task.md    # Task de exemplo
├── checklists/
│   └── .gitkeep
├── workflows/
│   └── .gitkeep
├── templates/
│   └── .gitkeep
├── tools/
│   └── .gitkeep
├── scripts/
│   └── .gitkeep
└── data/
    └── .gitkeep
```

## squad.yaml Gerado

```yaml
name: meu-dominio-squad
version: 1.0.0
description: Squad para automacao de processos X
author: Meu Nome
license: MIT
slashPrefix: meu-dominio

aios:
  minVersion: "2.1.0"
  type: squad

components:
  tasks:
    - example-agent-task.md
  agents:
    - example-agent.md
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

config:
  extends: extend
  # SQS-10: References project-level files when docs/framework/ exists
  coding-standards: ../../docs/framework/CODING-STANDARDS.md   # or config/coding-standards.md
  tech-stack: ../../docs/framework/TECH-STACK.md               # or config/tech-stack.md
  source-tree: ../../docs/framework/SOURCE-TREE.md             # or config/source-tree.md

dependencies:
  node: []
  python: []
  squads: []

tags:
  - custom
  - automation
```

## Flow

```
1. Parse arguments
   ├── If name provided → validate kebab-case
   └── If no name → prompt for name

2. Check if squad exists
   ├── If exists → error with suggestion
   └── If not exists → continue

3. Collect configuration
   ├── If --yes flag → use all defaults
   └── If interactive → elicit each option

4. Generate squad structure
   ├── Create directories
   ├── Generate squad.yaml from template
   ├── Generate config files
   ├── Generate example agent (if requested)
   ├── Generate example task (if requested)
   └── Add .gitkeep to empty directories

5. Run initial validation
   ├── If --skip-validation → skip
   └── If validation → run squad-validator

6. AUTO-ACTIVATION (MANDATORY - part of workflow)
   ├── Register agents in system
   │   ├── Parse agents/ directory
   │   ├── Extract agent IDs
   │   ├── Add to agent registry
   │   └── Mark agents as REGISTERED
   ├── Generate Command Files (Triple Infrastructure)
   │   ├── Create .gemini/commands/agents/{SquadName}.md
   │   ├── Create .claude/commands/AIOS/agents/{SquadName}.md
   │   └── Create .claude/commands/Aider/agents/{SquadName}.md
   ├── Register commands
   │   ├── Extract command definitions from agents
   │   ├── Register @agent-name commands for Gemini, Claude and Aider
   │   ├── Register /slash-commands
   │   └── Mark commands as AVAILABLE everywhere
   ├── Activate squad in system
   │   ├── Mark squad status: CREATED → ACTIVE (all platforms)
   │   ├── Update squad registries
   │   └── Verify agents available
   └── Verify terminal access
       ├── Test Gemini: /Gemini:agents:SquadName *help
       ├── Test Claude: /AIOS:agents:SquadName *help
       ├── Test Aider: /Aider:agents:SquadName *help
       └── Test: Squad appears in list-squads across all platforms

7. Display success message
   └── Report "ready to use" (NOT "ready to activate")
```

## Output de Sucesso

```
✅ Squad created and activated!

📁 Location: ./squads/meu-dominio-squad/

🚀 TRIPLE AVAILABILITY (Auto-Activation Complete):
   ✓ Available for Gemini CLI: /Gemini:agents:meu-dominio
   ✓ Available for Claude AIOS: /AIOS:agents:meu-dominio
   ✓ Available for Aider AIOS: /Aider:agents:meu-dominio ($0)
   ✓ Agents registered in all systems
   ✓ Ready to use immediately everywhere!

📋 Use your squad RIGHT NOW:
   @example-agent *help
   /meu-dominio help (in any interface)

📚 To customize this squad:
   1. Edit squad.yaml with your details
   2. Modify agents in agents/
   3. Add tasks in tasks/ (task-first!)
   4. Run: @squad-creator *validate-squad meu-dominio-squad

📚 Documentation:
   - Squad Guide: docs/guides/squads-guide.md
   - Task Format: .aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md
   - Auto-Activation Procedure: .aios-core/procedures/squad-creation-activation-procedure.md

🚀 When ready to share:
   - Local only: Keep in ./squads/ (private)
   - Public: @squad-creator *publish-squad meu-dominio-squad
   - API: @squad-creator *sync-squad-synkra meu-dominio-squad
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `INVALID_NAME` | Name not kebab-case | Use lowercase with hyphens |
| `SQUAD_EXISTS` | Squad already exists | Choose different name or delete existing |
| `PERMISSION_DENIED` | Can't write to squads/ | Check directory permissions |
| `VALIDATION_FAILED` | Generated squad invalid | Check error details, fix manually |

## Implementation

```javascript
const { SquadGenerator } = require('./.aios-core/development/scripts/squad');
const { SquadValidator } = require('./.aios-core/development/scripts/squad');

async function createSquad(options) {
  const {
    name,
    description,
    author,
    license,
    template,
    configMode,
    skipValidation,
    includeAgent,
    includeTask,
    aiosMinVersion
  } = options;

  // Validate name
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name)) {
    throw new Error('INVALID_NAME: Squad name must be kebab-case');
  }

  // Generate squad
  const generator = new SquadGenerator();
  const result = await generator.generate({
    name,
    description,
    author,
    license,
    template,
    configMode,
    includeAgent,
    includeTask,
    aiosMinVersion
  });

  // Validate (unless skipped)
  if (!skipValidation) {
    const validator = new SquadValidator();
    const validation = await validator.validate(result.path);
    if (!validation.valid) {
      console.warn('Warning: Generated squad has validation issues');
      console.warn(validator.formatResult(validation, result.path));
    }
  }

  // AUTO-ACTIVATION (Mandatory - Part of Creation Workflow)
  console.log(`\n[ACTIVATION] Registering agents and commands (Gemini, Claude, Aider)...`);

  try {
    // 1. Register agents in system
    const agents = await loadAgentsFromSquad(result.path);
    for (const agent of agents) {
      await registerAgent(name, agent);
      console.log(`  ✓ Agent registered: @${agent.id}`);
    }

    // 2. Register commands across all platforms
    for (const agent of agents) {
      // Register for Gemini CLI
      await registerGeminiCommand(name, agent);
      // Register for Claude AIOS
      await registerClaudeCommand(name, agent);
      // Register for Aider AIOS
      await registerAiderCommand(name, agent);
      
      console.log(`  ✓ Commands registered for @${agent.id} (Triple Platform)`);
    }

    // 3. Activate squad in system
    await activateSquad(name);
    console.log(`  ✓ Squad activated: ${name}`);

    // 4. Verify terminal access (test commands work on all platforms)
    const verification = await verifyTriplePlatformAvailability(name);
    if (verification.success) {
      console.log(`  ✓ Terminal verification passed`);
    } else {
      console.warn(`  ⚠ Verification warnings: ${verification.warnings.join(', ')}`);
    }
  } catch (error) {
    console.error('ERROR: Auto-activation failed');
    console.error(error.message);
    throw error;
  }

  // Display success with activation status
  console.log(`\n✅ Squad created and activated!\n`);
  console.log(`📁 Location: ${result.path}/\n`);
  console.log(`🚀 READY TO USE IMMEDIATELY!`);
  console.log(`   Use: @example-agent *help\n`);
  displayNextSteps(name);

  return result;
}
```

## Related

- **Agent:** @squad-creator (Craft)
- **Script:** squad-generator.js
- **Validator:** squad-validator.js (SQS-3)
- **Loader:** squad-loader.js (SQS-2)
