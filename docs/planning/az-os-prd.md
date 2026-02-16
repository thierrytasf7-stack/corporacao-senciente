# 📋 PRD: AZ-OS (Agent Zero Operating System)

**Version:** 1.0.0
**Date:** 2026-02-15
**Owner:** Morgan (PM) - Diana Corporação Senciente
**Status:** Approved for Architecture Phase

---

## 📌 EXECUTIVE SUMMARY

**Project:** AZ-OS (Agent Zero Operating System)
**Vision:** Sistema Operacional de Inteligência que serve como córtex frontal do Agent Zero, garantindo autonomia 100%, performance máxima e soberania técnica completa.

**Key Innovation:** Primeiro CLI que combina autonomia Level 10 + 60 FPS TUI + cost optimization (90% economia) + integração nativa Agent Zero.

**Timeline:** 4 sprints (8-12 semanas)
**ROI Expected:** 90% redução de custo LLM + soberania técnica completa

---

## 🎯 GOALS & OKRS

### Objective 1: Alcançar Autonomia Level 10
- KR1: ReAct loop completo (Reasoning → Action → Observation → Self-correction)
- KR2: Self-healing: 90% das falhas resolvidas sem intervenção humana
- KR3: Long-running tasks: suporte a tasks de 7+ dias com checkpoints automáticos

### Objective 2: Otimizar Custo LLM em 90%
- KR1: LiteLLM routing implementado (Claude/Gemini/DeepSeek)
- KR2: Cost tracking real-time no TUI dashboard
- KR3: Custo médio/task: baseline $0.025 → target $0.002

### Objective 3: Entregar UX Premium (CLI-First)
- KR1: Command latency <100ms
- KR2: TUI 60 FPS (Textual rendering)
- KR3: Onboarding <5 min

### Objective 4: Garantir Soberania Técnica
- KR1: Zero dependência de CLIs terceiras
- KR2: 100% open-source stack
- KR3: Agent Zero original INTOCÁVEL (isolation completo)

---

## 🚀 TECH STACK (from @analyst research)

**Tier 1: Core**
- CLI: Typer 0.12+ (type-hint based, modern)
- TUI: Textual 0.82+ + Rich 13.9+ (60 FPS, CSS-like styling)
- LLM: LiteLLM 1.x (multi-model routing, cost tracking)
- Protocol: MCP 2026 (tool calling standard)

**Data:**
- Structured: SQLite 3.45+ (tasks, logs, state)
- Semantic: ChromaDB 0.5+ (RAG, vector search)
- Schemas: Pydantic 2.9+ (type-safe contracts)

**Tooling:**
- Git: GitPython 3.1+ (auto-commit checkpoints)
- Config: Dynaconf 3.2+ (environment-aware)
- Logging: Rich (beautiful formatting)

---

## 📊 EPIC BREAKDOWN (RICE Prioritized)

### Epic 1: Foundation - CLI Kernel & Core Infrastructure
**Priority:** P0 | **Sprint:** 1 | **Effort:** 13 points | **RICE:** 6.92

**Features:**
1. CLI Framework (Typer) - command routing, auto-completion
2. Persistence Layer (SQLite) - tasks, logs, state snapshots
3. LLM Orchestration (LiteLLM) - multi-model, cost tracking, fallback
4. MCP Client Básico - filesystem, shell tools integration

**Acceptance Criteria:**
- `az task run "criar função isPrime"` executa em <2s
- Cost tracking salvo em SQLite após cada task
- LiteLLM routing: free models para tasks <500 tokens
- MCP tools expostos via `az tools list`

---

### Epic 2: Intelligence - TUI Dashboard & Real-Time Monitoring
**Priority:** P0 | **Sprint:** 2 | **Effort:** 8 points | **RICE:** 8.00

**Features:**
1. Textual TUI Framework - 60 FPS, CSS-like styling
2. Rich Logging - color-coded, syntax highlighting, progress bars
3. Real-Time Metrics - cost tracker, performance, health

**Acceptance Criteria:**
- `az dashboard` abre TUI em <500ms
- 60 FPS sustentado com 100+ tasks ativas
- Cost atualizado real-time (<1s lag)

---

### Epic 3: Memory - RAG & Semantic Search (ChromaDB)
**Priority:** P1 | **Sprint:** 3 | **Effort:** 5 points | **RICE:** 10.08

**Features:**
1. ChromaDB Integration - embedding automático de docs
2. RAG Pipeline - query → embedding → search → inject
3. Semantic Commands - `az search "query"`

**Acceptance Criteria:**
- AIOS docs indexados (<1 min startup)
- Semantic search retorna Top-3 em <500ms
- RAG injection melhora accuracy em 15%+

---

### Epic 4: Resilience - Git-Aware Checkpointing
**Priority:** P1 | **Sprint:** 3 | **Effort:** 5 points | **RICE:** 9.60

**Features:**
1. GitPython Integration - auto-commit após milestones
2. State Snapshots - checkpoint a cada N minutos
3. Resume Support - `az task resume {id}`

**Acceptance Criteria:**
- Auto-commit a cada 10 min ou milestone
- Rollback em <5s após detectar erro
- Resume funciona em 95% dos casos

---

### Epic 5: Autonomy - ReAct Loop & Task Scheduler
**Priority:** P0 | **Sprint:** 4 | **Effort:** 13 points | **RICE:** 5.38

**Features:**
1. ReAct Loop Engine - Reasoning → Action → Observation → Self-Correction
2. Task Scheduler - priority queue, background execution, cron-like
3. Sampling Bidirectional (MCP 2026) - LLM pode solicitar input
4. Self-Healing - auto-retry, decompose failed tasks

**Acceptance Criteria:**
- ReAct loop completo: executa multi-step sem intervenção
- Self-correction: 90% das falhas resolvidas em <3 retries
- Scheduler: executa 5+ tasks em background sem crash

---

### Epic 6: Optimization - Multi-Model Smart Routing
**Priority:** P0 | **Sprint:** 4 | **Effort:** 3 points | **RICE:** 27.00 ⭐

**Features:**
1. LiteLLM Smart Routing - rule-based, complexity detection, fallback chain
2. Cost Control - budget limits, alerts, auto-throttle
3. Performance Monitoring - track latency, accuracy, auto-switch

**Acceptance Criteria:**
- 90% das tasks simples usam free models
- Budget alerts funcionam (email/notification)
- Cost/task cai de $0.025 para $0.002 (92% economia)

---

## 📈 SUCCESS METRICS

**North Star:** % tasks executadas com autonomia completa (zero intervenção)
- Baseline: 10%
- Target Sprint 4: 90%

**KPIs:**
- Performance: <100ms latency, 60 FPS TUI
- Cost: $0.002/task (92% economia)
- Autonomy: 90% tasks auto-resolved
- Reliability: 99.9% uptime (long-running)

---

## 🗓️ ROADMAP

**Sprint 1 (Semanas 1-2):** Foundation
- Typer CLI + SQLite + LiteLLM + MCP client

**Sprint 2 (Semanas 3-4):** Intelligence & UX
- Textual TUI + Rich logging + Cost optimization

**Sprint 3 (Semanas 5-6):** Memory & Resilience
- ChromaDB RAG + Git checkpointing

**Sprint 4 (Semanas 7-8):** Autonomy Level 10
- ReAct loop + Task scheduler + Self-healing

---

## 💰 BUSINESS CASE

**Investment:** $32,000 (1 dev × 8-12 semanas)
**Annual ROI:** $79,956/ano (savings + productivity)
**Payback Period:** 4.8 meses
**ROI Year 1:** 150%

**Strategic Value:**
- Soberania técnica (zero lock-in)
- Scalability (10x growth sem rewrite)
- IP ownership (100% proprietary)

---

## ⚠️ CONSTRAINTS NON-NEGOTIABLE

1. Agent Zero original INTOCÁVEL (zero modificações)
2. Isolamento total (pasta `/az-os/`)
3. Comunicação via MCP/API only
4. CLI First architecture
5. Performance suprema (async, 60 FPS)
6. Autonomia Level 10 target

---

**Status:** ✅ APPROVED - Ready for Architecture Phase
**Next:** @architect design técnico detalhado

*PRD criado por Morgan (PM) - Diana Corporação Senciente*
