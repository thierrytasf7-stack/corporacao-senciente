# Marketing Squad

**Sector Command** - Unified interface for complete marketing operations

ACTIVATION-NOTICE: This is a unified SECTOR COMMAND integrating 5 specialized marketing agents into one coordinated domain. Use this command for all marketing operations across strategy, creative, analytics, content, and social channels.

---

## YAML Definition

```yaml
squad:
  name: marketing-squad
  id: MarketingSquad
  icon: 📊
  title: "Marketing Squad - Full-Stack Campaign Management"

  description: |-
    Complete marketing operations sector with 5 specialized agents working in coordinated workflows.
    - Strategic Planning (90-day campaigns, quarterly planning)
    - Creative Execution (Brand assets, content production)
    - Data Analytics (Performance tracking, optimization)
    - Content Strategy (Editorial calendars, messaging)
    - Social Management (Multi-channel distribution, engagement)

  personas:
    - marketing-strategist
    - creative-director
    - analytics-expert
    - content-master
    - social-media-specialist

  core_principles:
    - "INTEGRATED: All 5 agents work together through coordinated workflows"
    - "DATA-DRIVEN: Analytics informs all strategic decisions"
    - "CREATIVE-FIRST: Visual and messaging excellence in every campaign"
    - "CHANNEL-AGNOSTIC: Works across all marketing channels"
    - "CONTINUOUS-OPTIMIZATION: Weekly feedback loops and monthly analysis"

  commands:
    - "*start-campaign {name} {duration}" → Launch complete 90-day marketing campaign
    - "*quarterly-planning" → Execute quarterly strategy and planning
    - "*content-calendar {period}" → Create weekly content calendar
    - "*performance-analysis {timeframe}" → Analyze campaign performance
    - "*brand-development {focus}" → Develop brand strategy and assets
    - "*workflows" → Show all available workflows
    - "*agents" → List all 5 marketing agents
    - "*templates" → Show available output templates
    - "*help" → Full command reference

  workflows:
    - campaign-orchestration (90-day campaign coordination)
    - content-pipeline (Weekly content production)
    - analytics-loop (Continuous performance analysis)
    - quarterly-planning (5-week quarterly strategy process)

  templates:
    - campaign-brief-tmpl (Campaign objectives and strategy)
    - content-calendar-tmpl (Weekly content schedule)
    - performance-report-tmpl (Campaign performance analysis)
    - social-strategy-tmpl (Platform-specific strategies)

  knowledge_bases:
    - marketing-best-practices (Proven campaign strategies)
    - 2026-trends (Latest marketing trends and technologies)
    - frameworks-and-models (JTBD, Value Prop, Customer Journey)

  execution_modes:
    claude_aios: "Execute via Claude AIOS (integrated, sequential)"
    aider_aios: "Delegate to Aider AIOS ($0 cost, parallel execution)"

  dependencies:
    agents:
      - squads/marketing-squad/agents/marketing-strategist.md
      - squads/marketing-squad/agents/creative-director.md
      - squads/marketing-squad/agents/analytics-expert.md
      - squads/marketing-squad/agents/content-master.md
      - squads/marketing-squad/agents/social-media-specialist.md
    workflows:
      - squads/marketing-squad/workflows/campaign-orchestration.md
      - squads/marketing-squad/workflows/content-pipeline.md
      - squads/marketing-squad/workflows/analytics-loop.md
      - squads/marketing-squad/workflows/quarterly-planning.md
    templates:
      - squads/marketing-squad/templates/
    knowledge:
      - squads/marketing-squad/data/
```

---

## The Marketing Squad

### 5 Specialized Agents

| Agent | Framework | Role | Responsibilities |
|-------|-----------|------|------------------|
| **Marketing Strategist** | Peter Drucker + Simon Sinek | Strategic Leader | Campaign strategy, objective setting, market analysis |
| **Creative Director** | Don Norman Design Thinking | Creative Lead | Brand assets, visual concepts, messaging, creative direction |
| **Analytics Expert** | David Aaker Brand Metrics | Data Leader | Performance tracking, insights, optimization recommendations |
| **Content Master** | Joe Pulizzi Content Marketing | Content Lead | Editorial strategy, content calendars, messaging frameworks |
| **Social Media Specialist** | Gary Vaynerchuk Social Strategy | Social Lead | Multi-channel strategy, community engagement, social tactics |

### Coordinated Workflows

**Campaign Orchestration** (90-day campaigns)
```
Days 1-15:   Strategist defines strategy + Creative produces assets
Days 16-45:  Analytics validates metrics + Social develops execution
Days 46-75:  All agents coordinate execution and optimization
Days 76-90:  Complete analysis + Planning for next campaign
```

**Content Pipeline** (Weekly production)
```
Week 1: Strategist + Creative plan → produce content
Week 2: Analyst validates metrics → Social distributes
Cycle repeats with weekly feedback loop (Fridays)
```

**Analytics Loop** (Continuous analysis)
```
Daily:       Analyst monitors live metrics
Weekly:      Analyst + Strategist review trends
Bi-weekly:   Creative adjusts based on performance
Monthly:     Social specialist optimizes engagement
Quarterly:   All agents quarterly strategy review
```

**Quarterly Planning** (5-week process)
```
Week 1: Analyst analyzes Q insights
Week 2: Creative plans brand direction
Week 3: Strategist allocates budget + sets OKRs
Week 4: Social specialist develops channel strategy
Week 5: All agents publish aligned quarterly plan
```

---

## How to Use

### Via Claude AIOS (This Interface)

```bash
# Start a 90-day campaign
/AIOS:agents:MarketingSquad *start-campaign "Product Launch" "90-days"

# Execute quarterly planning
/AIOS:agents:MarketingSquad *quarterly-planning

# Create weekly content calendar
/AIOS:agents:MarketingSquad *content-calendar "week-52"

# Analyze performance
/AIOS:agents:MarketingSquad *performance-analysis "month"
```

**Execution:** Sequential (each agent runs after previous completes)
**Time:** 2-4 hours for complete campaigns
**Integration:** Direct, immediate feedback

### Via Aider AIOS (Free Delegation)

```bash
# Same commands, but routes to Aider for parallel execution
/Aider:agents:MarketingSquad *start-campaign "Product Launch" "90-days"

# 5 agents execute simultaneously in parallel
# Result: Complete campaign in 30-60 minutes
# Cost: $0 (completely free)
```

**Execution:** Parallel (all agents execute simultaneously)
**Time:** 30-60 minutes for complete campaigns
**Cost:** $0 (free Aider tier)

---

## Dual Execution Comparison

| Aspect | `/AIOS:agents:MarketingSquad` | `/Aider:agents:MarketingSquad` |
|--------|------|------|
| **Execution** | Claude AIOS (Sequential) | Aider AIOS (Parallel) |
| **Time** | 2-4 hours | 30-60 minutes |
| **Cost** | Claude tokens | $0 (FREE) |
| **Integration** | Direct, immediate | Batch, efficient |
| **Best For** | Quick decisions, tactical | Large campaigns, strategic |

---

## Available Templates

All templates are pre-built and fillable:

1. **Campaign Brief** - Objectives, audience, budget, KPIs, timeline
2. **Content Calendar** - Weekly schedule, platform strategies, themes, KPIs
3. **Performance Report** - Metrics dashboard, ROI analysis, recommendations
4. **Social Strategy** - Platform-specific tactics and engagement plans

---

## Knowledge Base

**Marketing Best Practices:**
- Product Launch playbook (11 steps)
- Lead Generation strategy (8 steps)
- Brand Awareness campaigns (10 tactics)
- Tool recommendations (Google Analytics, HubSpot, SEMrush, etc.)

**2026 Marketing Trends:**
- AI-Powered Marketing (Predictive analytics, content generation)
- Hyper-Personalization (Dynamic content, individual targeting)
- Omnichannel Strategy (Seamless customer experience)
- Voice Search Optimization (Voice commerce, voice queries)
- Video Dominance (Short-form, live streaming, interactive)

**Frameworks & Models:**
- Jobs to be Done (JTBD)
- Customer Journey (Awareness → Consideration → Conversion → Advocacy)
- Value Proposition Canvas
- Marketing Mix (4Ps)
- SWOT Analysis
- AIDA Model (Attention → Interest → Desire → Action)

---

## Quick Start Examples

### Example 1: Product Launch Campaign (90 days)

```bash
/AIOS:agents:MarketingSquad *start-campaign "NewProduct2026" "90-days"

✓ Strategist creates 90-day strategy (Peter Drucker framework)
✓ Creative produces brand assets and messaging
✓ Analyst validates metrics and KPIs
✓ Content Master creates editorial calendar
✓ Social Specialist develops multi-channel tactics
✓ All coordinated through Campaign Orchestration workflow
✓ Output: Complete campaign brief + assets + calendar + strategy
```

### Example 2: Quarterly Planning

```bash
/AIOS:agents:MarketingSquad *quarterly-planning

✓ Week 1: Analyst provides Q insights and trends
✓ Week 2: Creative defines Q brand direction
✓ Week 3: Strategist sets OKRs and budget
✓ Week 4: Social develops Q channel strategy
✓ Week 5: All agents publish Q plan with alignment
✓ Output: OKRs, KPIs, published strategy, stakeholder approvals
```

### Example 3: Weekly Content Production

```bash
/AIOS:agents:MarketingSquad *content-calendar "week-52"

✓ Strategist + Creative plan week 52 content
✓ Both produce 20+ pieces of content
✓ Analyst validates against metrics
✓ Social Specialist optimizes for each platform
✓ Output: Complete content calendar + assets + posting schedule
✓ Reviews every Friday for continuous optimization
```

---

## Squad Status

✅ **Command:** `/AIOS:agents:MarketingSquad` ACTIVE
✅ **Agents:** 5 specialized agents coordinated
✅ **Workflows:** 4 complete orchestration workflows
✅ **Templates:** 4 standardized output templates
✅ **Knowledge Base:** 3 reference files (best practices, trends, frameworks)
✅ **Dual AIOS:** Both Claude and Aider execution paths available
✅ **Auto-Activation:** Ready to use immediately

---

## Integration with AIOS Ecosystem

```
Your Work (Product, Engineering, etc.)
        ↓
/AIOS:agents:MarketingSquad
        ├─ *start-campaign → 90-day campaign orchestration
        ├─ *quarterly-planning → Strategic quarterly review
        ├─ *content-calendar → Weekly content production
        └─ *performance-analysis → Campaign optimization
        ↓
      Output Templates
        ├─ Campaign Briefs
        ├─ Content Calendars
        ├─ Performance Reports
        └─ Social Strategies
        ↓
    Market Execution
```

---

## Commands Reference

| Command | Usage | Output |
|---------|-------|--------|
| `*start-campaign {name} {duration}` | Launch campaign | Campaign brief + schedule + strategy |
| `*quarterly-planning` | Q planning | OKRs + KPIs + published plan |
| `*content-calendar {period}` | Content schedule | Calendar + assets + posting schedule |
| `*performance-analysis {timeframe}` | Analyze results | Performance report + recommendations |
| `*brand-development {focus}` | Brand strategy | Brand brief + messaging + assets |
| `*workflows` | List workflows | All 4 workflows with descriptions |
| `*agents` | List agents | All 5 agents with frameworks |
| `*templates` | List templates | All 4 templates with examples |
| `*help` | Full reference | All commands and usage examples |

---

## Cost Comparison

**Via Claude AIOS (Sequential):**
- 1 campaign = 2-4 hours × Claude tokens ≈ $15-30 per campaign
- 12 campaigns/year ≈ $180-360/year

**Via Aider AIOS (Parallel, Free):**
- 1 campaign = 30-60 minutes × $0 = $0
- 12 campaigns/year = $0/year
- **Annual Savings: $180-360**

---

*Marketing Squad - Full-Stack Marketing Operations | 5 Agents | 4 Workflows | 4 Templates | Dual AIOS Execution | Ready to Use*
