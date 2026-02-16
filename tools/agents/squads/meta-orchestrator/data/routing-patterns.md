# Routing Patterns Knowledge Base

## Overview

This document contains learned patterns for optimal task routing in the Meta-Orchestrator system.

## Domain → Squad Mappings

### Technology & Development

| Domain Pattern | Recommended Squad | Confidence |
|---------------|-------------------|------------|
| Code implementation | dev-squad / @dev | 95% |
| Testing & QA | qa-squad / @qa | 95% |
| Architecture design | @architect | 90% |
| Database design | @data-engineer | 90% |
| DevOps & CI/CD | @devops | 90% |
| Frontend UI/UX | @ux-design-expert | 85% |

### Content & Creative

| Domain Pattern | Recommended Squad | Confidence |
|---------------|-------------------|------------|
| Content creation | squad-creator → create | Variable |
| Research & analysis | @analyst | 85% |
| Documentation | @dev / @analyst | 80% |

### Data Processing

| Domain Pattern | Recommended Squad | Confidence |
|---------------|-------------------|------------|
| Blog/content collection | etl-squad | 90% |
| Web scraping | etl-squad | 85% |
| Data transformation | etl-squad | 85% |

## Complexity-Based Routing

### Simple Tasks (Single Agent)
- Clear, well-defined scope
- Single domain
- No dependencies
- Route: Direct to best-match agent

### Medium Tasks (Squad Coordination)
- Multiple steps
- May span 2-3 domains
- Some dependencies
- Route: Squad with workflow

### Complex Tasks (Multi-Squad)
- Large scope
- Multiple domains
- Heavy dependencies
- Route: Nexus coordinates multiple squads

## Creation Triggers

### When to Create New Squad

1. **No Match Found**
   - Best match score < 0.5
   - Domain not covered by existing squads

2. **Repeated Requests**
   - Same domain requested 3+ times
   - No existing squad coverage

3. **Specialized Need**
   - Unique expertise required
   - Existing squads too generic

### Squad Architecture Patterns

**Specialist Squad** (2-3 agents)
- For focused domains
- Deep expertise
- Example: legal-squad

**Generalist Squad** (4-5 agents)
- For broad domains
- Multiple capabilities
- Example: meta-orchestrator

**Hybrid Squad** (3-4 agents)
- Mix of specialist and generalist
- Flexible routing
- Example: dev-squad with specialists

## Anti-Patterns

### Avoid These Routing Decisions

1. **Over-delegation**
   - Sending simple tasks to complex squads
   - Creates unnecessary overhead

2. **Under-creation**
   - Forcing tasks to ill-fitting squads
   - Better to create specialized squad

3. **Fragmentation**
   - Creating too many tiny squads
   - Consolidate related domains

4. **Circular Routing**
   - Task bouncing between squads
   - Nexus should make definitive decision

## Learning Updates

This section is updated by Cortex as new patterns are discovered.

### Recent Learnings

```
[Auto-updated by @cortex]

Last updated: {timestamp}
Patterns added: {count}
Accuracy improvement: {percentage}
```

---

_Knowledge Base Version: 1.0_
_Maintained by: @cortex_
