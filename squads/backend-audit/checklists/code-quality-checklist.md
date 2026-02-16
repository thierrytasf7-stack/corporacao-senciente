# Code Quality Checklist

## Complexity
- [ ] Complexidade ciclomatica < 10 por funcao
- [ ] Funcoes < 50 linhas
- [ ] Arquivos < 300 linhas
- [ ] Nesting depth < 4 niveis
- [ ] Parametros por funcao < 5

## Dead Code
- [ ] Sem funcoes/exports nao utilizados
- [ ] Sem codigo commented-out
- [ ] Sem branches impossíveis
- [ ] Sem imports nao utilizados
- [ ] Sem variaveis nao lidas

## DRY (Don't Repeat Yourself)
- [ ] Sem blocos duplicados (> 5 linhas identicas)
- [ ] Logic reusavel extraida em funcoes/modules
- [ ] Patterns repetidos abstraídos

## Naming
- [ ] Nomes descritivos (sem a, b, x, temp, data)
- [ ] Convencao consistente em todo projeto
- [ ] Booleans com prefixo is/has/can/should
- [ ] Funcoes descrevem acao (verbo + substantivo)

## Type Safety
- [ ] Sem uso de `any` (TypeScript)
- [ ] Strict equality (`===`) em vez de (`==`)
- [ ] Null checks em dados potencialmente nulos
- [ ] Tipos explícitos em funcoes publicas

## Configuration
- [ ] Zero magic numbers/strings
- [ ] Configuracao via env vars
- [ ] Constantes nomeadas para valores fixos
- [ ] Zero secrets hardcoded

## Documentation
- [ ] Public APIs documentadas
- [ ] Complex logic comentada
- [ ] README atualizado
- [ ] TODO/FIXME com issue tracking
