# Benchmark: Aider vs Claude Agent Teams

## Objetivo
Comparar execução paralela de 3 tarefas idênticas usando:
- **Rodada A:** 3 Aiders simultâneos (modelo free via OpenRouter)
- **Rodada B:** 3 Claude Agents simultâneos (via Claude Code Teams)

## Tarefas (idênticas para ambas rodadas)

### Task 1: string-utils.ts
Criar módulo com funções:
- `capitalize(str)` - Capitaliza primeira letra
- `slugify(str)` - Converte para slug (kebab-case)
- `truncate(str, maxLen, suffix?)` - Trunca com sufixo
- `countWords(str)` - Conta palavras
- `reverseWords(str)` - Inverte ordem das palavras
- Exportar todas como named exports
- Incluir JSDoc em cada função
- Incluir testes unitários no mesmo arquivo (seção de test cases comentada)

### Task 2: array-utils.ts
Criar módulo com funções:
- `chunk(arr, size)` - Divide array em chunks
- `unique(arr)` - Remove duplicatas
- `flatten(arr, depth?)` - Achata array aninhado
- `groupBy(arr, keyFn)` - Agrupa por função
- `intersect(a, b)` - Interseção de dois arrays
- Mesmos requisitos de exports, JSDoc e testes

### Task 3: math-utils.ts
Criar módulo com funções:
- `clamp(value, min, max)` - Limita valor no range
- `lerp(start, end, t)` - Interpolação linear
- `roundTo(value, decimals)` - Arredonda com precisão
- `fibonacci(n)` - N-ésimo fibonacci
- `isPrime(n)` - Verifica se é primo
- Mesmos requisitos de exports, JSDoc e testes

## Métricas Coletadas
- Tempo de execução (start/end)
- Tamanho do output (bytes)
- Número de linhas geradas
- Qualidade: compilação TS, corretude das funções
- Token consumption (estimado)

## Resultado
Arquivo `tests/benchmark/metrics/comparison.md`
