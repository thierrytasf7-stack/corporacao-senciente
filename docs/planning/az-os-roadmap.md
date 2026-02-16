# 📊 AZ-OS ROADMAP

**Project:** AZ-OS (Agent Zero Operating System)  
**Timeline:** 4 Sprints (8-12 weeks)  
**Start Date:** 2026-02-17  
**End Date:** 2026-05-11  

---

## 📋 SPRINT OVERVIEW

| Sprint | Weeks | Focus | Key Deliverables | RICE Score |
|--------|-------|-------|------------------|------------|
| **Sprint 1** | 1-2 | Foundation | CLI Framework, SQLite, LiteLLM, MCP | 6.92 |
| **Sprint 2** | 3-4 | Intelligence | TUI Dashboard, Rich Logging, Metrics | 8.00 |
| **Sprint 3** | 5-6 | Memory & Resilience | ChromaDB RAG, Git Checkpointing | 9.60 |
| **Sprint 4** | 7-8 | Autonomy & Optimization | ReAct Loop, Scheduler, Smart Routing | 5.38 |

**Total RICE Score:** 29.90 ⭐
**Total Effort:** 32 points

---

## 📅 GANTT CHART

```
Week 1 (Feb 17-23)    Week 2 (Feb 24-Mar 2)    Week 3 (Mar 3-9)    Week 4 (Mar 10-16)
┌─────────────────────────────────────────────────────────────────────────┐
│                    SPRINT 1: FOUNDATION                    │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║ STORY-001: CLI Framework     ║ STORY-002: SQLite         ║ STORY-003: LiteLLM       ║ STORY-004: MCP Client     ║ │
│  ║ STORY-007: Config           ║ STORY-005: Command Exec   ║ STORY-006: Cost Tracking  ║ STORY-008: Logging        ║ │
└─────────────────────────────────────────────────────────────────────────┘
                                                                 
                                                                 
Week 5 (Mar 17-23)    Week 6 (Mar 24-30)    Week 7 (Mar 31-Apr 6)    Week 8 (Apr 7-13)
┌─────────────────────────────────────────────────────────────────────────┐
│                    SPRINT 2: INTELLIGENCE                    │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║ STORY-009: Textual TUI       ║ STORY-011: Metrics Dash   ║ STORY-026: ReAct Loop     ║ STORY-028: Self-Healing   ║ │
│  ║ STORY-010: Rich Logging     ║ STORY-012: Streaming     ║ STORY-027: Task Scheduler ║ STORY-029: Bidirectional  ║ │
│  ║ STORY-013: TUI Components   ║ STORY-014: Dark Mode      ║ STORY-030: Background     ║ STORY-033: Smart Routing   ║ │
│  ║ STORY-015: Keyboard        │                       │  ║ STORY-031: Priority      ║ STORY-034: Cost Control   ║ │
└─────────────────────────────────────────────────────────────────────────┘
                                                                 
                                                                 
Week 9 (Apr 14-20)    Week 10 (Apr 21-27)   Week 11 (Apr 28-May 4)  Week 12 (May 5-11)
┌─────────────────────────────────────────────────────────────────────────┐
│                    SPRINT 3: MEMORY & RESILIENCE              │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║ STORY-016: ChromaDB         ║ STORY-021: GitPython      ║ STORY-032: Resource       ║ STORY-035: Performance    ║ │
│  ║ STORY-018: Document Index  ║ STORY-022: State Snapshots ║ STORY-036: Cost Analytics  ║ STORY-023: Resume Support  ║ │
│  ║ STORY-020: Context Mgmt    ║ STORY-025: Validation     │                       │  ║ STORY-024: Rollback      ║ │
│  ║ STORY-017: RAG Pipeline    ║ STORY-023: Resume         │                       │                       │
│  ║ STORY-019: Semantic Cmd     ║ STORY-024: Rollback       │                       │                       │
└─────────────────────────────────────────────────────────────────────────┘

---

## 📈 CRITICAL PATH ANALYSIS

### Critical Path: Foundation → Intelligence → Autonomy

**Path 1 (Primary):**
STORY-001 → STORY-002 → STORY-003 → STORY-009 → STORY-011 → STORY-026 → STORY-028
**Duration:** 8 weeks (Sprints 1-4)
**Risk:** High - Any delay impacts entire project

**Path 2 (Secondary):**
STORY-001 → STORY-009 → STORY-013 → STORY-011 → STORY-033 → STORY-034
**Duration:** 6 weeks (Sprints 2-4)
**Risk:** Medium - Optimization depends on Intelligence

---

## 🎯 MILESTONES

### Milestone 1: Foundation Complete (Week 2)
- **Date:** 2026-03-02
- **Criteria:** CLI Framework, SQLite, LiteLLM, MCP working
- **Deliverables:** Basic `az task run` command functional
- **Success Metrics:** <2s execution time, cost tracking working

### Milestone 2: TUI Dashboard Live (Week 4)
- **Date:** 2026-03-16
- **Criteria:** 60 FPS TUI with real-time metrics
- **Deliverables:** `az dashboard` command functional
- **Success Metrics:** <500ms load time, 60 FPS sustained

### Milestone 3: Memory & Resilience (Week 6)
- **Date:** 2026-03-30
- **Criteria:** ChromaDB RAG and Git checkpointing working
- **Deliverables:** Semantic search and task resume functional
- **Success Metrics:** <500ms search, 95% resume success

### Milestone 4: Autonomy Level 10 (Week 8)
- **Date:** 2026-04-13
- **Criteria:** Complete ReAct loop and smart routing
- **Deliverables:** Autonomous task execution with self-healing
- **Success Metrics:** 90% self-healing, 92% cost reduction

---

## 📊 SPRINT DELIVERABLES

### Sprint 1 Deliverables (Week 2)
- [ ] CLI Framework with Typer
- [ ] SQLite database with task persistence
- [ ] LiteLLM integration with cost tracking
- [ ] MCP client for filesystem tools
- [ ] Basic command execution engine

### Sprint 2 Deliverables (Week 4)
- [ ] 60 FPS Textual TUI dashboard
- [ ] Rich logging with color-coding
- [ ] Real-time metrics display
- [ ] Command streaming output
- [ ] TUI components library

### Sprint 3 Deliverables (Week 6)
- [ ] ChromaDB semantic search
- [ ] RAG pipeline implementation
- [ ] Git-based checkpointing
- [ ] Task resume functionality
- [ ] State snapshot system

### Sprint 4 Deliverables (Week 8)
- [ ] Complete ReAct loop engine
- [ ] Intelligent task scheduler
- [ ] Self-healing capabilities
- [ ] Smart model routing
- [ ] Cost control system

---

## ⚠️ RISKS & MITIGATION

### High Risk: Foundation Delays
**Impact:** Project timeline → **Mitigation:** Parallel development of independent stories

### Medium Risk: TUI Performance Issues
**Impact:** User experience → **Mitigation:** Performance testing in Sprint 2.1

### Low Risk: Model Provider Changes
**Impact:** Cost optimization → **Mitigation:** LiteLLM fallback mechanisms

---

**Status:** ✅ Planning Complete  
**Next:** Architecture design by @architect  
**Assigned:** @dev-team for Sprint 1 implementation