# Agent Evolution Report

**Agent:** {{agent_name}} ({{agent_id}})
**Version:** {{version}}
**Quality Score:** {{quality_score}}/100 ({{rating}})
**Last Audit:** {{date}}
**Auditor:** Helix (Agent Evolver)

---

## Score Breakdown

| Dimension | Score | Max | % |
|-----------|-------|-----|---|
| Persona Quality | {{persona_score}} | 15 | {{persona_pct}}% |
| Commands Coverage | {{commands_score}} | 15 | {{commands_pct}}% |
| Task Alignment | {{tasks_score}} | 15 | {{tasks_pct}}% |
| Principles Coherence | {{principles_score}} | 10 | {{principles_pct}}% |
| Greeting/Activation | {{greeting_score}} | 10 | {{greeting_pct}}% |
| Dependencies Integrity | {{deps_score}} | 10 | {{deps_pct}}% |
| Collaboration Map | {{collab_score}} | 5 | {{collab_pct}}% |
| Documentation | {{docs_score}} | 10 | {{docs_pct}}% |
| Evolution Tracking | {{evo_score}} | 10 | {{evo_pct}}% |
| **TOTAL** | **{{quality_score}}** | **100** | **{{total_pct}}%** |

---

## Evolution Graph

```
{{evolution_graph}}
```

---

## Active Findings

### CRITICAL
{{#each critical_findings}}
- [{{id}}] {{title}} ({{dimension}}, -{{impact}}pts)
{{/each}}

### HIGH
{{#each high_findings}}
- [{{id}}] {{title}} ({{dimension}}, -{{impact}}pts)
{{/each}}

### MEDIUM
{{#each medium_findings}}
- [{{id}}] {{title}} ({{dimension}})
{{/each}}

### LOW
{{#each low_findings}}
- [{{id}}] {{title}}
{{/each}}

---

## Optimization Roadmap

### Next Version ({{next_version}})
{{#each next_optimizations}}
- [ ] [+{{pts}}pts] {{description}}
{{/each}}
**Expected Score:** {{expected_score}}/100

---

## Version History

| Version | Score | Delta | Date | Type |
|---------|-------|-------|------|------|
{{#each lineage}}
| {{version}} | {{score}}/100 | {{delta}} | {{date}} | {{bump_type}} |
{{/each}}

---

*Report by Helix (Agent Evolver) - Agent Audit Squad v1.0.0*
*-- Helix, evolucao mensuravel*
