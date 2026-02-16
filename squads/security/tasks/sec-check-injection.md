---
task: Injection Vulnerability Check
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*injection"
Entrada: |
  - target: Diretorio(s) alvo (default: src/, apps/)
  - types: Tipos de injection (sql, xss, command, all) default: all
Saida: |
  - findings: Lista de vulnerabilidades de injection
  - summary: Contadores por tipo
Checklist:
  - "[ ] Scan SQL injection patterns"
  - "[ ] Scan XSS patterns"
  - "[ ] Scan command injection patterns"
  - "[ ] Scan path traversal patterns"
  - "[ ] Scan template injection patterns"
  - "[ ] Verificar uso correto de sanitization"
  - "[ ] Classificar e reportar"
---

# *injection - Injection Vulnerability Check

Verificacao focada em vulnerabilidades de injection (OWASP A03).

## Tipos Verificados

### SQL Injection
```
DANGEROUS:
  query("SELECT * FROM users WHERE id = " + userId)
  query(`SELECT * FROM users WHERE id = ${userId}`)

SAFE:
  query("SELECT * FROM users WHERE id = $1", [userId])
  query({ text: "SELECT * FROM users WHERE id = $1", values: [userId] })
```

### Cross-Site Scripting (XSS)
```
DANGEROUS:
  element.innerHTML = userInput
  dangerouslySetInnerHTML={{ __html: userInput }}
  document.write(userInput)

SAFE:
  element.textContent = userInput
  DOMPurify.sanitize(userInput)
  React auto-escaping (JSX {variable})
```

### Command Injection
```
DANGEROUS:
  exec("ls " + userInput)
  exec(`rm -rf ${userPath}`)
  spawn("sh", ["-c", userInput])

SAFE:
  execFile("ls", [sanitizedPath])
  spawn("ls", ["-la", safePath(userInput)])
```

### Path Traversal
```
DANGEROUS:
  readFile("./data/" + filename)
  readFile(path.join(base, userInput))  // still vulnerable!

SAFE:
  const safe = safePath(base, filename)  // from security-utils.js
  validatePath(userInput)                // from security-utils.js
```

## Flow

```
1. Scan for SQL injection
   ├── String concatenation in queries
   ├── Template literals in queries
   ├── Missing parameterized queries
   └── ORM raw query usage

2. Scan for XSS
   ├── innerHTML assignments
   ├── dangerouslySetInnerHTML usage
   ├── document.write
   ├── Unescaped output in templates
   └── URL protocol validation (javascript:)

3. Scan for command injection
   ├── exec/execSync with string args
   ├── spawn with shell=true
   ├── User input in command strings
   └── Missing input sanitization

4. Scan for path traversal
   ├── fs operations with user input
   ├── Missing validatePath() calls
   ├── path.join with unvalidated input
   └── File download/upload paths

5. Verify sanitization usage
   ├── Is sanitizeInput() used at boundaries?
   ├── Is validatePath() used for file ops?
   ├── Is isSafeString() used for shell args?
   └── Are parameterized queries used for DB?

6. Report with context
   ├── Each finding: file:line, pattern, risk, fix
   ├── Code context (3 lines around finding)
   └── Prioritize by exploitability
```
