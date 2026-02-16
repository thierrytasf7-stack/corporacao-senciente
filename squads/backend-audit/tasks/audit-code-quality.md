---
task: Code Quality Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Code smells e issues de qualidade
  - metrics: Metricas de complexidade e maintainability
Checklist:
  - "[ ] Medir complexidade ciclomatica por funcao"
  - "[ ] Identificar funcoes > 50 linhas"
  - "[ ] Identificar arquivos > 300 linhas"
  - "[ ] Detectar dead code (exports nao usados, unreachable code)"
  - "[ ] Detectar codigo duplicado"
  - "[ ] Verificar naming conventions consistentes"
  - "[ ] Verificar type safety"
  - "[ ] Identificar magic numbers/strings"
  - "[ ] Verificar input validation em boundaries"
  - "[ ] Verificar TODO/FIXME/HACK tracking"
  - "[ ] Avaliar test coverage (se testes existem)"
  - "[ ] Verificar hardcoded configs"
---

# *audit-code

Auditoria de code quality e maintainability.

## Metricas de Qualidade

### Complexidade Ciclomatica
- **Bom:** 1-5 por funcao
- **Aceitavel:** 6-10 por funcao
- **Alto:** 11-15 (refactoring recomendado)
- **Critico:** > 15 (refactoring obrigatorio)

Contar: `if`, `else if`, `for`, `while`, `case`, `catch`, `&&`, `||`, `?.`, ternarios

### Tamanho
| Metrica | Bom | Aceitavel | Ruim |
|---------|-----|-----------|------|
| Linhas por funcao | < 20 | 20-50 | > 50 |
| Linhas por arquivo | < 150 | 150-300 | > 300 |
| Params por funcao | < 3 | 3-5 | > 5 |
| Depth de nesting | < 3 | 3-4 | > 4 |

### O Que Procurar

**Dead Code:**
- Funcoes exportadas mas nunca importadas
- Branches impossíveis (`if (false)`, condições contraditórias)
- Variaveis atribuídas mas nunca lidas
- Imports não utilizados
- Commented-out code blocks

**Duplicacao:**
- Blocos de codigo identicos ou muito similares em arquivos diferentes
- Copy-paste de handlers com variações mínimas
- Logica de validação repetida
- Error handling patterns repetidos sem abstração

**Naming:**
- Variaveis de uma letra (exceto loops)
- Nomes genericos (`data`, `result`, `temp`, `obj`)
- Inconsistencia (camelCase + snake_case no mesmo projeto)
- Funcoes que não descrevem o que fazem
- Boolean variables sem prefixo `is`/`has`/`can`/`should`

**Type Safety:**
- Uso de `any` (TypeScript)
- Type coercion implícita (`==` vs `===`)
- Missing null checks
- Untyped function parameters
- Generic `Object` ou `{}` como tipo

**Magic Values:**
```javascript
// RUIM
if (user.role === 3) { ... }
setTimeout(callback, 86400000);
if (retries > 5) throw new Error();

// BOM
const ROLE_ADMIN = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 5;
```

**Hardcoded Config:**
```javascript
// RUIM
const db = new Pool({ host: '192.168.1.100', port: 5432, password: 'mypass123' });

// BOM
const db = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  password: process.env.DB_PASSWORD
});
```

## Formato de Finding

```markdown
### [CODE-001] Funcao com complexidade ciclomatica 23
- **Severidade:** MEDIUM
- **Arquivo:** src/services/order-processor.js:89
- **Funcao:** `processOrder()`
- **Metricas:** 23 branches, 67 linhas, 8 parametros
- **Impacto:** Difícil de testar, manter e debugar
- **Fix:** Decompor em subfunções:
  - `validateOrder()` - validação de input
  - `calculatePricing()` - lógica de preço
  - `applyDiscounts()` - descontos
  - `persistOrder()` - salvar no DB
- **Estimativa:** 2h para refactoring
```
