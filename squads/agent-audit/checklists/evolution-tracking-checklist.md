# Evolution Tracking Checklist

## Evolution Header
- [ ] evolution section presente no YAML do agente
- [ ] version no formato MAJOR.MINOR.PATCH
- [ ] quality_score numerico (0-100)
- [ ] last_audit com data ISO
- [ ] total_optimizations counter
- [ ] changelog path correto
- [ ] lineage array com historico

## Changelog File
- [ ] Arquivo existe em data/changelogs/{agent-id}.changelog.md
- [ ] Cada versao documentada com data e bump type
- [ ] Changes listadas com categoria [PERSONA], [CMD], [TASK], etc
- [ ] Dimension scores before/after por versao
- [ ] Regressions section (None ou lista)

## Lineage
- [ ] Array cronologico (mais antigo primeiro)
- [ ] Cada entry: { version, score, date, auditor }
- [ ] Scores monotonicamente crescentes (zero regression)
- [ ] Sem gaps de versao

## Metricas
- [ ] Score tracking ao longo do tempo
- [ ] Delta score por versao
- [ ] Total optimizations count atualizado
- [ ] Last audit date atualizada
