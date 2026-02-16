---
task: Create Squad
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - name: Nome do squad (kebab-case, obrigatorio)
  - team: Equipe à qual o squad pertence (obrigatório - ver team_registry)
  - description: Descricao (opcional, elicitacao)
  - author: Autor (opcional, default: git config user.name)
  - license: Licenca (opcional, default: MIT)
  - template: Template base (basic | etl | agent-only)
  - config_mode: extend | override | none
Saida: |
  - squad_path: Caminho do squad criado
  - command_path: Caminho do comando registrado em .claude/commands/{team}/
  - manifest: Conteudo do squad.yaml gerado
  - next_steps: Instrucoes para proximos passos
Checklist:
  - "[ ] Validar nome (kebab-case, nao existe)"
  - "[ ] OBRIGATÓRIO: Determinar team assignment (ver team_registry no agent)"
  - "[ ] Coletar informacoes via elicitacao"
  - "[ ] Gerar estrutura de diretorios"
  - "[ ] Gerar squad.yaml (com campo team:)"
  - "[ ] Gerar arquivos de config (coding-standards, etc.)"
  - "[ ] Gerar exemplo de agent"
  - "[ ] Gerar exemplo de task"
  - "[ ] Registrar comando em .claude/commands/{team}/ (NAO em Squads/)"
  - "[ ] Executar validacao inicial"
  - "[ ] Exibir proximos passos"
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
| `--team` | string | - | Team assignment (REQUIRED - see team_registry) |
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

? A qual equipe este squad pertence?
  (Determina onde o comando sera registrado em .claude/commands/{team}/)

  1. CEOs          → Orquestradores que gerenciam equipes inteiras
  2. Desenvolvimento → Time de dev do Prometheus (Dev, QA, Perf, etc)
  3. Planejamento   → Time de planejamento da Athena (PM, PO, Arch, etc)
  4. Entrega-Manutencao → Deploy, CI/CD, infra
  5. Operacoes      → Framework AIOS e ferramentas operacionais
  6. Audit          → Auditoria e análise de qualidade
  7. Evolucao       → Evolução e auto-melhoria do sistema
  8. Docs           → Documentação e referências
  9. Aider          → Aider agents (custo $0)
  10. Squads        → Produto/domínio standalone (Games, Marketing, etc)

  > [selection]

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

## CRITICAL: Team Assignment Rules

**NUNCA** colocar comandos genericamente em `Squads/`. Cada squad DEVE ser associado a uma equipe:

| Se o squad... | Team |
|---------------|------|
| Orquestra outros agentes/squads como CEO | `CEOs` |
| Implementa, testa, otimiza código | `Desenvolvimento` |
| Planeja, analisa requisitos, projeta | `Planejamento` |
| Faz deploy, CI/CD, infra | `Entrega-Manutencao` |
| Gerencia o framework AIOS | `Operacoes` |
| Audita qualidade de código/squads | `Audit` |
| Evolui o sistema autonomamente | `Evolucao` |
| Gera/gerencia documentação | `Docs` |
| Usa Aider models ($0) | `Aider` |
| É produto/domínio standalone | `Squads` |

O campo `team` é adicionado ao `squad.yaml` e o comando é registrado em `.claude/commands/{team}/`.

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
team: Desenvolvimento                              # REQUIRED - determina .claude/commands/{team}/
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

3. OBRIGATÓRIO: Determine team assignment
   ├── If --team provided → validate against team_registry
   ├── If interactive → elicit team (10 options)
   └── If --yes flag → ERROR (team MUST be explicit, no default)

4. Collect remaining configuration
   ├── If --yes flag → use defaults for non-team options
   └── If interactive → elicit each option

5. Generate squad structure
   ├── Create directories
   ├── Generate squad.yaml from template (com campo team:)
   ├── Generate config files
   ├── Generate example agent (if requested)
   ├── Generate example task (if requested)
   └── Add .gitkeep to empty directories

6. Register command in .claude/commands/{team}/
   ├── Determine folder from team_registry[team].folder
   ├── Generate {SquadName}-AIOS.md command file
   └── Place in .claude/commands/{team_folder}/

7. Run initial validation
   ├── If --skip-validation → skip
   └── If validation → run squad-validator

8. Display success message
   └── Show next steps (including team-based command path)
```

## Output de Sucesso

```
✅ Squad created successfully!

📁 Location: ./squads/meu-dominio-squad/
🏷️ Team: Desenvolvimento
📂 Command: .claude/commands/Desenvolvimento/MeuDominio-AIOS.md
   → Ativação: /Desenvolvimento:MeuDominio-AIOS

📋 Next steps:
   1. cd squads/meu-dominio-squad
   2. Customize squad.yaml with your details
   3. Create your agents in agents/
   4. Create tasks in tasks/ (task-first!)
   5. Validate: @squad-creator *validate-squad meu-dominio-squad

📚 Documentation:
   - Squad Guide: docs/guides/squads-guide.md
   - Task Format: .aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md

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
| `MISSING_TEAM` | Team not specified | Use --team or select interactively |
| `INVALID_TEAM` | Team not in team_registry | Choose valid team from registry |
| `PERMISSION_DENIED` | Can't write to squads/ | Check directory permissions |
| `VALIDATION_FAILED` | Generated squad invalid | Check error details, fix manually |

## Implementation

```javascript
const { SquadGenerator } = require('./.aios-core/development/scripts/squad');
const { SquadValidator } = require('./.aios-core/development/scripts/squad');

async function createSquad(options) {
  const {
    name,
    team,        // REQUIRED - team from team_registry
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

  // Validate team (REQUIRED)
  if (!team) {
    throw new Error('MISSING_TEAM: Team assignment is required. Use --team or select interactively.');
  }
  const validTeams = ['CEOs','Desenvolvimento','Planejamento','Entrega-Manutencao','Operacoes','Audit','Evolucao','Docs','Aider','Squads'];
  if (!validTeams.includes(team)) {
    throw new Error(`INVALID_TEAM: "${team}" is not valid. Choose from: ${validTeams.join(', ')}`);
  }

  // Generate squad (with team field in squad.yaml)
  const generator = new SquadGenerator();
  const result = await generator.generate({
    name,
    team,
    description,
    author,
    license,
    template,
    configMode,
    includeAgent,
    includeTask,
    aiosMinVersion
  });

  // Register command in .claude/commands/{team}/
  const commandFolder = `.claude/commands/${team}`;
  const commandName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('') + '-AIOS.md';
  const commandPath = `${commandFolder}/${commandName}`;
  // → Generate command file referencing the squad agent

  // Validate (unless skipped)
  if (!skipValidation) {
    const validator = new SquadValidator();
    const validation = await validator.validate(result.path);
    if (!validation.valid) {
      console.warn('Warning: Generated squad has validation issues');
      console.warn(validator.formatResult(validation, result.path));
    }
  }

  // Display success
  console.log(`\n✅ Squad created successfully!\n`);
  console.log(`📁 Location: ${result.path}/`);
  console.log(`🏷️ Team: ${team}`);
  console.log(`📂 Command: ${commandPath}\n`);
  displayNextSteps(name);

  return result;
}
```

## Related

- **Agent:** @squad-creator (Craft)
- **Script:** squad-generator.js
- **Validator:** squad-validator.js (SQS-3)
- **Loader:** squad-loader.js (SQS-2)
