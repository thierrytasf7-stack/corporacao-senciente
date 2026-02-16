# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Diana Corporacao Senciente** is a cognitive operating system running on **100% native Windows architecture** (no Docker). It uses **Synkra AIOS** (AI Operating System) with 11 specialized AI agents working through structured workflows.

**Architecture:** Native Windows with PM2, PowerShell, Rust workers. See `CONTEXTO-DIANA.md` for unified context.

**Key Innovation:** AIOS uses two-phase planning (Agile Planning + Contextual Development) that eliminates typical AI development problems like inconsistent results and lost context.

---

## Architecture Principle: CLI First

All decisions follow this architectural hierarchy:

```
CLI First → Observability Second → UI Third
```

- **CLI** is the source of truth where all intelligence and automation lives
- **Observability** (dashboard, logs) observes CLI execution but never controls it
- **UI** provides convenience for visualization and settings only
- New features must work 100% via CLI before adding any UI

---

## Port Policy: Unique Ports Only (NON-NEGOTIABLE)

**NEVER use default/common ports** (3000, 3001, 3002, 4000, 5000, 5173, 8000, 8080). These always conflict with other projects running on the same machine.

**Diana exclusive range: 21300-21399**

| Service | Port | Variable |
|---------|------|----------|
| Dashboard (Next.js) | 21300 | `DIANA_DASHBOARD_PORT` |
| Backend API (Express) | 21301 | `DIANA_BACKEND_PORT` |
| Monitor Server (Bun) | 21302 | `DIANA_MONITOR_PORT` |
| Hive Guardian Health | 21310 | `DIANA_HIVE_HEALTH_PORT` |
| Hive Guardian Dashboard | 21311 | `DIANA_HIVE_DASHBOARD_PORT` |
| Hive Guardian Metrics | 21312 | `DIANA_HIVE_METRICS_PORT` |
| WhatsApp Bridge | 21350 | `DIANA_WHATSAPP_PORT` |

**Rules:**
1. All ports are registered in `.env.ports` (single source of truth)
2. New services MUST pick the next available port in the 21300-21399 range
3. Always use the environment variable, never hardcode port numbers
4. Update `scripts/check-ports.ps1` when adding new services
5. Access: `http://localhost:21300` (dashboard), `ws://localhost:21302/stream` (monitor)

---

## Core Architecture: 4 Modules

AIOS uses a **modular architecture** with clear domain-driven separation:

### `.aios-core/` - Framework Core (Portable)

```
.aios-core/
├── core/                      # Framework essentials
│   ├── config/                # Configuration system
│   ├── elicitation/           # Interactive prompting engine
│   ├── execution/             # Workflow execution engine
│   ├── health-check/          # System diagnostics
│   ├── mcp/                   # MCP orchestration
│   ├── memory/                # Persistent learning system
│   ├── migration/             # Version upgrade utilities
│   ├── orchestration/         # Agent coordination
│   ├── permissions/           # Role-based access control
│   ├── quality-gates/         # Validation gates
│   └── registry/              # Service registry
├── cli/                       # CLI commands (install, init, doctor, etc.)
├── development/               # Agent definitions & tasks
│   ├── agents/                # 11 core agents (dev, qa, architect, etc.)
│   ├── tasks/                 # 60+ task workflows
│   └── workflows/             # Multi-step orchestrations
├── infrastructure/            # Tools and scripts
├── data/                      # Knowledge bases
└── core-config.yaml           # Framework configuration
```

### Project Workspace

```
aios-core/
├── apps/                      # Applications
│   ├── dashboard/             # Next.js dashboard (observability)
│   └── monitor-server/        # Event streaming (Bun)
├── packages/                  # Shared packages & workspaces
├── src/                       # Project source code
├── bin/                       # CLI executables
├── docs/                      # Public documentation
├── tests/                     # Test suites
├── .claude/                   # Claude Code configuration
└── squads/                    # Expansion packs (custom agents)
```

---

## The 11 Agents

AIOS provides specialized agents, each with distinct responsibilities:

### Meta Agents
- **aios-master** - Framework orchestrator and coordination
- **aios-orchestrator** - Workflow coordination and scheduling

### Planning Agents (Web UI)
- **analyst** - Business analysis and PRD creation
- **pm** - Product management and prioritization
- **architect** - System design and technical architecture
- **ux-design-expert** - UX/UI design and usability

### Development Agents (IDE)
- **sm** (Scrum Master) - Sprint planning and story writing
- **dev** - Code implementation
- **qa** - Testing and quality assurance
- **po** - Product Owner and backlog management

### Specialized Agents
- **data-engineer** - Database design and data architecture
- **devops** - CI/CD, infrastructure, git operations (exclusive push authority)
- **squad-creator** - Building custom expansion packs

---

## Development Workflow

### Story-Driven Development

All work is organized through **stories** in `docs/stories/`:

```
docs/stories/
├── active/          # Stories in progress
└── completed/       # Completed stories
```

**Story-based workflow:**
1. **@po** creates story with requirements
2. **@sm** breaks story into detailed tasks
3. **@dev** implements following the story checklist
4. **@qa** tests and validates completeness
5. **@devops** pushes to remote (exclusive authority)

### Activate Agents in Claude Code

Use the Skill tool with agent names:
```
/AIOS:agents:dev
/AIOS:agents:qa
/AIOS:agents:architect
```

Agent commands use `*` prefix:
- `*help` - Show available commands
- `*create-story` - Create development story
- `*task {name}` - Execute specific task

---

## Common Development Commands

### Setup & Testing
```bash
npm install                    # Install dependencies (in each app dir)
npm test                       # Run Jest tests (.aios-core framework)
npm test -- --watch            # Watch mode
npm run test:coverage          # Coverage report
npm run test:health-check      # System diagnostics
```

### Native System (PM2)
```bash
pm2 start ecosystem.config.js  # Start all native processes
pm2 status                      # Check process status
pm2 logs                        # View logs
pm2 restart all                 # Restart everything
```

### Code Quality
```bash
npm run lint                   # ESLint check
npm run lint -- --fix          # Auto-fix issues
npm run typecheck              # TypeScript check
npm run format                 # Prettier format
```

### CLI Commands
```bash
npx aios-core init <name>      # Create new project (interactive)
npx aios-core install          # Install/update AIOS
npx aios-core doctor           # System diagnostics
npx aios-core doctor --fix     # Auto-fix problems
npx aios-core info             # System information
npx aios-core --help           # Help
```

### Dashboard Development
```bash
cd apps/dashboard
npm install
npm run dev                    # Development server
npm run build                  # Production build
```

### Monitor Server (Bun)
```bash
cd apps/monitor-server
bun run dev                    # Development with Bun
```

### Run Specific Tests
```bash
npm test -- tests/unit/cli.test.js                    # Single file
npm test -- --testPathPattern="cli"                    # Pattern match
npm test -- --testNamePattern="should validate"        # Test name
npm test -- tests/integration/ --verbose              # Integration tests
```

---

## Test Organization

Tests use **Jest** and are organized by category:

```
tests/
├── unit/                      # Unit tests
├── integration/               # Integration tests
├── e2e/                       # End-to-end tests
├── core/                      # Framework core tests
├── agents/                    # Agent tests
├── health-check/              # System diagnostics tests
├── security/                  # Security tests
├── performance/               # Performance benchmarks
└── [feature]/                 # Feature-specific tests
```

**Key test files:**
- `jest.config.js` - Jest configuration
- `tests/setup.js` - Jest setup/fixtures
- `tests/fixtures/` - Mock data

**Coverage requirements:**
- Global: 25% (lines)
- Core modules (`.aios-core/core/`): 39% (lines)
- Target: 80%+ (future goal)

**Running tests:**
```bash
npm test                       # All tests
npm test -- tests/unit        # Unit tests only
npm run test:coverage          # With coverage
npm test -- --testNamePattern="agent" # By name
```

---

## Code Standards

### TypeScript/JavaScript

**Language Target:** ES2022 (Node.js 18+)

```javascript
// ✅ DO: Modern syntax, arrow functions, destructuring
const processAgent = async (agent) => {
  const { enabled, config } = agent;
  return enabled ? loadAgent(config) : null;
};

// ❌ DON'T: var, function declarations, verbose syntax
var processAgent = function(agent) {
  var enabled = agent.enabled;
  return enabled ? loadAgent(agent) : null;
};
```

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case | `agent-list.js` |
| Classes | PascalCase | `AgentManager.js` |
| Utilities | kebab-case | `config-loader.js` |
| Tests | `.test.js` suffix | `config-loader.test.js` |

### Imports

**Always use absolute imports** with `@synkra` prefix:

```javascript
// ✅ GOOD
import { loadAgent } from '@synkra/aios-core/core/registry';

// ❌ BAD: Relative paths
import { loadAgent } from '../../../core/registry';
```

### TypeScript Configuration

- **strict mode enabled** - No `any` types
- **ES modules with CommonJS fallback** - For npx compatibility
- **Source maps** - For debugging

---

## Quality Gates & Pre-commit

AIOS implements **3-layer validation**:

### Layer 1: Pre-commit (Local - Fast)
```bash
npm run lint                   # ESLint
npm run typecheck              # TypeScript
# Runs automatically via husky
```

### Layer 2: Pre-push (Local - Story Validation)
```bash
node .aios-core/utils/aios-validator.js pre-push
# Validates story checkboxes and metadata
```

### Layer 3: CI/CD (Remote - Full)
- GitHub Actions (`.github/workflows/`)
- All tests, coverage, lint
- Branch protection requires all checks to pass

---

## Git Workflow

### Conventional Commits

Follow conventional commit format:

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
test:     Tests
chore:    Maintenance
refactor: Code refactoring
```

**Format:** `type(scope): description [Story ID]`

```bash
git commit -m "feat(agents): add agent registry loader [Story 1.2]"
git commit -m "fix(cli): handle missing env vars"
```

### Branch Names

- `main` - Production branch
- `feat/*` - Feature branches
- `fix/*` - Bug fix branches
- `docs/*` - Documentation branches

### Push Authority

**ONLY `@devops` agent can push to remote.** Use the agent workflow:

```
@dev → (code changes) → @qa → (review) → @devops → (push)
```

---

## MCP & Integration Tools

**MCP Management:** Exclusively handled by `@devops` agent.

For detailed MCP rules, see `.claude/rules/mcp-usage.md`

### Native Tool Priority

Always prefer Claude Code tools over MCP:

| Task | Use This | Not This |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write`/`Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` tool | docker-gateway |
| Search content | `Grep` tool | docker-gateway |

---

## Project Structure Reference

### Key Directories

```
src/                          # Project source code
.aios-core/core/              # Framework essentials
.aios-core/development/       # Agents (11) and tasks (60+)
.aios-core/cli/               # CLI commands
bin/                          # Entry points (aios.js)
packages/                     # Workspaces (installer, etc.)
docs/                         # Documentation
docs/stories/                 # Development stories
docs/architecture/            # Architecture docs
docs/framework/               # Official coding standards
tests/                        # Test suites
apps/dashboard/               # Next.js dashboard
apps/monitor-server/          # Event streaming server
squads/                       # Expansion packs
```

### Important Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config |
| `tsconfig.json` | TypeScript configuration |
| `jest.config.js` | Test framework config |
| `.claude/CLAUDE.md` | This file (project instructions) |
| `.aios-core/core-config.yaml` | Framework config |
| `docs/stories/` | Development stories |
| `.husky/` | Git hooks |
| `.github/workflows/` | CI/CD pipeline |

---

## Troubleshooting

### Common Issues

**Tests fail with missing modules:**
```bash
npm install
npm run typecheck  # Check for import errors
```

**ESLint cache issues:**
```bash
rm .eslintcache
npm run lint --fix
```

**TypeScript compilation errors:**
```bash
npm run typecheck
# Fix import paths and type issues
```

**Import path issues:**
- Use absolute imports: `@synkra/aios-core/*`
- Check `tsconfig.json` paths configuration
- Verify module exists in `.aios-core/core/`

### System Health

```bash
npx aios-core doctor          # Run diagnostics
npx aios-core doctor --fix    # Auto-fix problems
```

---

## Performance & Optimization

### Build Performance
- ESLint uses cache (`.eslintcache`)
- Jest can run in watch mode for development
- TypeScript uses incremental compilation (`.tsbuildinfo`)

### Test Performance
```bash
npm test -- --maxWorkers=1    # Single worker (slower, more reliable)
npm test -- --maxWorkers=4    # Parallel (faster, default)
```

### Development Speed Tips

1. **Use watch mode during development:**
   ```bash
   npm run lint -- --fix --watch
   npm test -- --watch
   ```

2. **Run specific test suites:**
   ```bash
   npm test -- tests/unit  # Skip integration tests
   ```

3. **Use TypeScript in VS Code:**
   - Enable "Auto Save"
   - ESLint extension for inline errors
   - TypeScript extension for type checking

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Language** | TypeScript 5 | Type-safe development |
| **CLI** | Commander.js | CLI framework |
| **Testing** | Jest 30 | Test framework |
| **Code Quality** | ESLint 9, Prettier | Linting and formatting |
| **Dashboard** | Next.js, React | Web UI (observability) |
| **Server** | Bun | Event streaming |
| **Validation** | AJV | JSON schema validation |
| **Process** | execa | Process execution |

---

## Additional Resources

- **README.md** - Project overview and quick start
- **docs/guides/user-guide.md** - Complete AIOS usage guide
- **docs/architecture/ARCHITECTURE-INDEX.md** - Technical architecture
- **docs/framework/coding-standards.md** - Coding standards
- **docs/framework/source-tree.md** - Project structure reference
- **.claude/rules/mcp-usage.md** - MCP configuration rules
- **CONTRIBUTING.md** - Contribution guidelines

---

## Summary for New Contributors

1. **Understand CLI First principle** - Everything starts in CLI
2. **Work with stories** - Use `docs/stories/` for all development
3. **Activate agents** - Use `/AIOS:agents:*` to work with specialized AI agents
4. **Follow code standards** - TypeScript strict, absolute imports, kebab-case files
5. **Run quality gates** - Lint, typecheck, test before committing
6. **Only push via devops** - Use `@devops` for git operations
7. **Check architecture docs** - Reference `docs/` for technical decisions

---

*Synkra AIOS Framework - CLI First | Observability Second | UI Third*
