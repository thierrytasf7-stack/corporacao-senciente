# Evolution Tracking Checklist

## Version Field
- [ ] `version` presente no squad.yaml
- [ ] Formato semver X.Y.Z
- [ ] Version nao e 0.0.0

## Evolution Header
- [ ] Bloco `evolution:` presente no squad.yaml (apos audit)
- [ ] `current_version` match com version field
- [ ] `quality_score` presente (0-100)
- [ ] `rating` presente (S/A/B/C/D/F)
- [ ] `last_audit` presente com data ISO
- [ ] `auditor` identificado

## Lineage
- [ ] Array `lineage` presente
- [ ] Cada entry tem: version, score, rating, date
- [ ] Lineage e cronologico (datas crescentes)
- [ ] Scores sao monotonicamente crescentes (zero regression)

## Changelog
- [ ] Arquivo changelog existe em `data/changelogs/{squad}.changelog.md`
- [ ] Cada version tem entry no changelog
- [ ] Entries tem: Quality Score before/after, Rating, Changes, Dimension Breakdown
- [ ] Changelog e append-only (entries antigas nao modificadas)

## Zero Regression
- [ ] Score atual >= score de todas versoes anteriores
- [ ] Nenhuma dimensao individual regrediu sem compensacao
- [ ] Se regressao detectada, esta documentada com justificativa

---
*Squad Audit Checklist - Evolution Tracking Validation*
