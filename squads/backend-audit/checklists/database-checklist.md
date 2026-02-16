# Database Checklist

## Schema Design
- [ ] Tipos de dados corretos e precisos
- [ ] NOT NULL em colunas obrigatorias
- [ ] UNIQUE constraints onde necessario
- [ ] CHECK constraints para valores validos
- [ ] Foreign keys com integridade referencial
- [ ] Naming consistente (snake_case)
- [ ] Timestamps com timezone (timestamptz)

## Indexes
- [ ] Index em colunas de WHERE frequentes
- [ ] Index em colunas de JOIN
- [ ] Index em colunas de ORDER BY
- [ ] Compound indexes para queries multi-coluna
- [ ] Sem indexes duplicados ou redundantes
- [ ] Index coverage adequado para queries criticas

## Queries
- [ ] Todas queries parametrizadas
- [ ] Sem SELECT * (projection explicita)
- [ ] Zero N+1 queries
- [ ] Queries com LIMIT/pagination
- [ ] Sem full table scans em tabelas grandes
- [ ] Transactions para operacoes multi-step

## Connections
- [ ] Connection pool configurado (min/max/idle)
- [ ] Connections retornadas ao pool (try/finally)
- [ ] Connection timeout configurado
- [ ] Pool monitoring ativo

## Migrations
- [ ] Schema versionado com migrations
- [ ] Migrations reversiveis (up/down)
- [ ] Sem data loss em migrations
- [ ] Migrations testadas antes de deploy

## Data Integrity
- [ ] Soft delete onde necessario
- [ ] Audit trail para dados criticos
- [ ] Backup strategy definida
- [ ] Data retention policy definida
