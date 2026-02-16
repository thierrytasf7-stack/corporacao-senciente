# Changelog: {{agent_name}} ({{agent_id}})

> Evolution history tracked by Helix (Agent Evolver)
> Quality scores are monotonically increasing (zero regression policy)

---

## v{{version}} ({{date}})

**Quality Score:** {{prev_score}} -> {{new_score}} (+{{delta}})
**Auditor:** Helix (Agent Evolver)
**Bump Type:** {{bump_type}}

### Changes
{{#each changes}}
- [{{category}}] {{description}} (+{{pts}}pts)
{{/each}}

### Dimension Scores
| Dimension | Before | After | Delta |
|-----------|--------|-------|-------|
{{#each dimensions}}
| {{name}} | {{before}} | {{after}} | {{delta}} |
{{/each}}

### Regressions
{{regressions}}

---

*Tracked by Agent Audit Squad v1.0.0*
