# GamesSquad

**Sector Command** - Complete Game Development Expansion Pack

ACTIVATION-NOTICE: This is a SECTOR COMMAND providing unified interface for complete game development. 6 specialized agents working in coordinated workflows to design, implement, optimize, and deploy games with full Software Inc modding support.

---

## YAML Definition

```yaml
squad:
  name: games-squad
  id: GamesSquad
  icon: 🎮
  title: "Games-Squad - Game Development Expansion Pack"

  description: |-
    Complete game development expansion pack with 6 specialized agents for designing,
    implementing, and optimizing games with Software Inc integration capability.

  personas:
    - game-architect
    - unity-specialist
    - game-designer
    - graphics-audio-engineer
    - game-modder
    - qa-tester

  core_principles:
    - "GAME-FIRST: All decisions prioritize game quality"
    - "TECHNICAL-EXCELLENCE: Production-ready code optimized"
    - "INTEGRATION-CAPABLE: Full Software Inc modding support"
    - "ARCHITECTURE-DRIVEN: Scalable systems first"
    - "QUALITY-FOCUSED: Comprehensive testing and optimization"
    - "MULTI-GAME: Support for any game type"

  commands:
    - "*request-game {type} {description}" → Request new game
    - "*design-game {name} {genre}" → Create game design
    - "*implement-system {system}" → Implement game system
    - "*create-level {level-name}" → Create level design
    - "*create-mod {mod-name}" → Create mod/DLL
    - "*performance-analysis {game}" → Profile and optimize
    - "*execute-qa-testing {game}" → Complete QA testing
    - "*workflows" → List all workflows
    - "*agents" → List all agents
    - "*help" → Full command reference

  workflows:
    - game-development-pipeline
    - unity-development-cycle
    - modding-integration
    - level-design-workflow
    - game-polishing
    - multi-game-support

  templates:
    - game-design-document-tmpl
    - technical-design-doc-tmpl
    - level-design-doc-tmpl
    - mod-specification-tmpl
    - asset-pipeline-tmpl
    - build-checklist-tmpl
    - performance-report-tmpl
    - game-request-template-tmpl

  knowledge_bases:
    - game-dev-frameworks
    - unity-best-practices
    - software-inc-integration
    - game-architecture-patterns
    - 2026-game-trends
    - game-types-and-genres
    - mod-types-reference
    - software-inc-game-modding

  execution_modes:
    claude_aios: "Sequential execution via Claude (2-4 hours)"
    aider_aios: "Parallel execution via Aider ($0, 1-2 hours)"

  dependencies:
    agents:
      - squads/games-squad/agents/game-architect.md
      - squads/games-squad/agents/unity-specialist.md
      - squads/games-squad/agents/game-designer.md
      - squads/games-squad/agents/graphics-audio-engineer.md
      - squads/games-squad/agents/game-modder.md
      - squads/games-squad/agents/qa-tester.md
```

---

## 6 Specialized Game Development Agents

### 🏗️ Game Architect
**Role:** System design, gameplay mechanics, architecture
- Design game systems and mechanics
- Plan software architecture
- Define gameplay loops
- Establish scalability patterns

### ⚙️ Unity Specialist
**Role:** C# scripting, optimization, DLL integration
- Write production-ready C# code
- Optimize performance
- Integrate external DLLs
- Handle engine optimization

### 🎮 Game Designer
**Role:** Game design, level design, narrative
- Create game design documents
- Design engaging levels
- Develop narrative elements
- Balance mechanics

### 🎨 Graphics & Audio Engineer
**Role:** Visual assets, shaders, audio, animations
- Create visual assets and effects
- Develop custom shaders
- Design animations
- Create audio systems

### 🔧 Game Modder
**Role:** DLL integration, Software Inc modding
- Create and integrate mods
- Handle DLL patching
- Software Inc integration
- Create compatibility layers

### ✅ QA Tester
**Role:** Testing, debugging, performance profiling
- Execute comprehensive testing
- Perform performance profiling
- Identify and document bugs
- Coordinate playtesting

---

## Available Workflows

1. **Game Development Pipeline** - Complete lifecycle
2. **Unity Development Cycle** - C# and engine optimization
3. **Modding & Integration** - DLL creation and Software Inc integration
4. **Level Design Workflow** - Level creation and optimization
5. **Game Polishing** - Performance refinement
6. **Multi-Game Support** - Templates for any game type

---

## Quick Start Examples

### Request a New Game
```bash
/AIOS:agents:GamesSquad *request-game "RPG" "Fantasy adventure with magic systems"
→ Game Architect designs systems
→ Game Designer creates design document
→ Unity Specialist implements code
→ Graphics Engineer creates assets
→ Game Modder handles integration
→ QA Tester validates everything
```

### Design a Game
```bash
/AIOS:agents:GamesSquad *design-game "MyGame" "action-adventure"
→ Complete game design document created
→ All mechanics specified
→ Ready for implementation
```

### Create a Mod
```bash
/AIOS:agents:GamesSquad *create-mod "ModName" "Feature description"
→ DLL creation and integration
→ Software Inc compatibility
→ Complete mod package
```

---

## Dual Execution Modes

### Via Claude AIOS (This Interface)
```bash
/AIOS:agents:GamesSquad *request-game "type" "description"
→ Sequential execution
→ 2-4 hours for complete game
→ Direct integration
```

### Via Aider AIOS (Free Delegation)
```bash
/Aider:agents:GamesSquad *request-game "type" "description"
→ Parallel execution (6 agents simultaneously)
→ 1-2 hours for complete game
→ Cost: $0 (completely free)
```

---

## Supported Game Types

✅ RPG (Role-Playing with progression)
✅ RTS (Real-Time Strategy)
✅ Simulation (Complex systems)
✅ Puzzle (Logic and reasoning)
✅ Action (Combat and reflexes)
✅ Adventure (Exploration)
✅ Strategy (Turn-based tactics)
✅ Casual (Simple gameplay)
✅ Indie (Experimental)
✅ Mods (DLL extensions)

---

## Knowledge Base & Templates

**8 Knowledge Base Files:**
- Game Development Frameworks
- Unity Best Practices
- Software Inc Integration Guide
- Game Architecture Patterns
- 2026 Game Development Trends
- Game Types & Genres
- Mod Types Reference
- Software Inc Game Modding Complete Guide

**8 Production Templates:**
- Game Design Document
- Technical Design Document
- Level Design Document
- Mod Specification
- Asset Pipeline
- Build Checklist
- Performance Report
- Game Request Template

---

## Cost Comparison

| Operation | Claude AIOS | Aider AIOS |
|-----------|---|---|
| Simple game | 2000-3000 tokens | $0 |
| Complete game | 5000-7000 tokens | $0 |
| Mod creation | 1000-2000 tokens | $0 |
| Performance analysis | 2000-3000 tokens | $0 |

---

## Squad Status

✅ **Command:** `/AIOS:agents:GamesSquad` ACTIVE
✅ **Agents:** 6 specialized game developers
✅ **Workflows:** 6 complete pipelines
✅ **Templates:** 8 production templates
✅ **Knowledge Base:** Complete reference
✅ **Dual AIOS:** Both Claude and Aider execution
✅ **Game Types:** All supported
✅ **Modding:** Full Software Inc integration
✅ **Auto-Activation:** Ready to use immediately

---

*Games-Squad v1.0.0 | Complete Game Development Expansion Pack | 6 Agents | 6 Workflows | All Game Types*
