# Delegation Task Template

## Para Agent Zero

```json
{
  "id": "cz-{timestamp}-{hex}",
  "agent": "{dev|qa|po|sm|architect|data-engineer}",
  "task_type": "{implement|test|review|story|docs|format|boilerplate|debug|refactor}",
  "prompt": "{descricao concisa do que fazer - maximo 200 palavras}",
  "acceptance_criteria": [
    "{criterio 1 - verificavel}",
    "{criterio 2 - verificavel}",
    "{criterio 3 - verificavel}"
  ],
  "output_format": "Return ONLY {code|JSON|text|markdown}. No explanations.",
  "max_tokens": "{256|512|1024|2048}",
  "context": "{contexto adicional se necessario - arquivo, funcao, etc}"
}
```

## Regras do Template

1. **prompt**: Maximo 200 palavras. Descrever O QUE, nao COMO.
2. **acceptance_criteria**: Maximo 5. Cada um verificavel por regex/parse.
3. **output_format**: SEMPRE restritivo. "ONLY" keyword obrigatoria.
4. **max_tokens**: Calibrado por tipo (ver tabela no agent).
5. **agent**: Determina qual def AIOS e injetada pelo prompt-builder.
6. **context**: Opcional. Se necessario, incluir path do arquivo ou snippet curto.

## Exemplos

### Implement Simples (Agent Zero)
```json
{
  "agent": "dev",
  "task_type": "implement",
  "prompt": "Crie funcao TypeScript isPalindrome(str: string): boolean. Case insensitive, ignora espacos.",
  "acceptance_criteria": ["Retorna true para 'racecar'", "Retorna false para 'hello'", "Named export"],
  "output_format": "Return ONLY the TypeScript code. No explanations.",
  "max_tokens": 512
}
```

### Test Unitario (Agent Zero)
```json
{
  "agent": "qa",
  "task_type": "test",
  "prompt": "Crie testes Jest para funcao isPalindrome(str): boolean em src/utils/string.ts",
  "acceptance_criteria": ["Minimo 5 test cases", "Cobre edge cases (vazio, 1 char)", "TypeScript"],
  "output_format": "Return ONLY the test file code. No explanations.",
  "max_tokens": 1024
}
```

### Story (Agent Zero)
```json
{
  "agent": "po",
  "task_type": "story",
  "prompt": "Crie story para dark mode toggle no dashboard. Next.js + Tailwind.",
  "acceptance_criteria": ["Titulo claro", "Acceptance criteria verificaveis", "Fibonacci estimate"],
  "output_format": "Return ONLY the story in markdown format.",
  "max_tokens": 1024
}
```
