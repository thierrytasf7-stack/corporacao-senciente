---
task: Static Application Security Testing
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*sast"
Entrada: |
  - target: Diretorio(s) a analisar (default: src/, apps/, modules/)
  - severity_filter: Filtrar por severidade (default: all)
Saida: |
  - findings: Lista de vulnerabilidades com file:line:pattern
  - summary: Contadores por categoria (injection, xss, eval, etc.)
Checklist:
  - "[ ] Identificar diretorios alvo"
  - "[ ] Executar security-checker.js no alvo"
  - "[ ] Verificar patterns OWASP Top 10"
  - "[ ] Executar ESLint security rules (se disponivel)"
  - "[ ] Classificar findings por severidade"
  - "[ ] Apresentar findings com contexto de codigo"
---

# *sast - Static Application Security Testing

Analise estatica de codigo para detectar patterns inseguros.

## Patterns Verificados

### Critical
| Pattern | Risco | Fix |
|---------|-------|-----|
| `eval()` / `new Function()` | Code injection | Usar JSON.parse, vm2, ou logica explicita |
| SQL concatenation | SQL injection | Usar queries parametrizadas |
| `child_process.exec(userInput)` | Command injection | Usar execFile com array de args |
| Deserialization sem validacao | RCE | Validar schema antes de deserializar |

### High
| Pattern | Risco | Fix |
|---------|-------|-----|
| `innerHTML` / `dangerouslySetInnerHTML` | XSS | Usar textContent ou DOMPurify |
| `require(variable)` | Arbitrary file read | Usar imports explicitos |
| `fs.readFile(userInput)` | Path traversal | Usar safePath() de security-utils |
| `crypto.createHash('md5')` | Weak crypto | Usar SHA-256, bcrypt, ou argon2 |

### Medium
| Pattern | Risco | Fix |
|---------|-------|-----|
| `Math.random()` para security | Predictable | Usar crypto.randomBytes() |
| Regex sem limit | ReDoS | Adicionar timeout ou simplificar regex |
| `console.log(error)` em prod | Info disclosure | Usar logger com redacao |
| Cookies sem flags | Session hijacking | Adicionar Secure, HttpOnly, SameSite |

## Flow

```
1. Identify targets
   ├── Default: src/, apps/, modules/, .aios-core/
   ├── Exclude: node_modules/, dist/, .git/, tests/
   └── File types: .js, .ts, .jsx, .tsx, .mjs

2. Run security-checker.js
   ├── Load pattern database
   ├── Scan each file for dangerous patterns
   └── Collect findings with context (3 lines before/after)

3. Run ESLint security (if available)
   ├── Use eslintrc-security.json config
   └── Collect ESLint findings

4. Classify and deduplicate
   ├── Remove false positives (test files, comments)
   ├── Classify by OWASP category
   └── Sort by severity (critical first)

5. Present findings
   ├── Summary table (count by severity)
   ├── Detailed findings with code context
   └── Recommended fix for each finding
```
