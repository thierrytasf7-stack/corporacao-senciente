---
task: Architecture Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Issues de arquitetura
  - dependency_graph: Grafo de dependencias entre modulos
  - metrics: Metricas de coupling/cohesion
Checklist:
  - "[ ] Mapear estrutura de diretórios e camadas"
  - "[ ] Identificar architectural pattern (MVC, Clean, Hexagonal, etc)"
  - "[ ] Analisar coupling entre modulos"
  - "[ ] Analisar cohesion dos modulos"
  - "[ ] Verificar SOLID principles"
  - "[ ] Identificar god objects/modules"
  - "[ ] Verificar separation of concerns"
  - "[ ] Verificar dependency injection"
  - "[ ] Detectar circular dependencies"
  - "[ ] Verificar layer violations"
  - "[ ] Analisar business logic placement"
  - "[ ] Verificar abstractions/interfaces"
---

# *audit-arch

Auditoria de arquitetura e design do backend.

## Layered Architecture Expected

```
Routes/Controllers  →  Services/Use Cases  →  Repositories/DAOs  →  Database
       ↓                      ↓                       ↓
   Middlewares           Domain Logic            Data Models
       ↓                      ↓                       ↓
   Validation           Business Rules          Query Building
```

### Layer Violations (Anti-Patterns)
```javascript
// RUIM - Business logic no controller/route
app.post('/api/orders', async (req, res) => {
  const items = req.body.items;
  let total = 0;
  for (const item of items) {
    const product = await db.query('SELECT price FROM products WHERE id = $1', [item.id]);
    if (product.stock < item.qty) return res.status(400).json({ error: 'Out of stock' });
    total += product.price * item.qty;
  }
  if (total > 1000) total *= 0.9; // Desconto
  await db.query('INSERT INTO orders ...', [total]);
  res.json({ total });
});

// BOM - Separacao de responsabilidades
app.post('/api/orders', validate(orderSchema), async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user);
  res.status(201).json({ data: order });
});
```

## SOLID Principles

### S - Single Responsibility
- Cada modulo/classe tem UMA razao para mudar
- **Red flag:** Arquivo com mix de HTTP handling, business logic, database queries, email sending

### O - Open/Closed
- Extensível sem modificar codigo existente
- **Red flag:** Switch/case gigante que precisa ser editado para cada novo tipo

### L - Liskov Substitution
- Subtipos devem ser substituíveis pelos tipos base
- **Red flag:** `instanceof` checks ou type guards frequentes

### I - Interface Segregation
- Interfaces pequenas e focadas
- **Red flag:** Interface com 20+ metodos onde consumers usam 2-3

### D - Dependency Inversion
- Depender de abstrações, não de implementações concretas
- **Red flag:** `new DatabaseClient()` direto no service (deveria ser injetado)

## Coupling/Cohesion Analysis

### High Coupling (ruim)
```javascript
// Modulo A importa diretamente o modulo B, C, D, E, F
import { UserService } from '../users/service';
import { EmailService } from '../email/service';
import { PaymentService } from '../payments/service';
import { NotificationService } from '../notifications/service';
import { AnalyticsService } from '../analytics/service';
import { AuditService } from '../audit/service';
```

### Low Cohesion (ruim)
```javascript
// utils.js - Faz TUDO (god module)
export const formatDate = ...
export const hashPassword = ...
export const sendEmail = ...
export const calculateTax = ...
export const validateCPF = ...
export const compressImage = ...
export const generatePDF = ...
```

### Circular Dependencies
```
ModuleA imports ModuleB
ModuleB imports ModuleC
ModuleC imports ModuleA  // CIRCULAR!
```

## God Objects Detection

**Sinais de God Object:**
- Arquivo com > 500 linhas
- Classe/modulo com > 15 methods
- Importado por > 10 outros modulos
- Faz coisas de dominios diferentes (user + payment + notification)
- Nome generico (Manager, Handler, Processor, Utils, Helper)

## Formato de Finding

```markdown
### [ARCH-001] Business logic em route handlers
- **Severidade:** MEDIUM
- **Arquivo:** src/routes/orders.js (inteiro)
- **Impacto:** 450 linhas de business logic no route file, impossivel testar unitariamente
- **Pattern Atual:** Routes -> Database (direto)
- **Pattern Recomendado:** Routes -> Service -> Repository -> Database
- **Fix:** Extrair para:
  - `src/services/order-service.js` (business logic)
  - `src/repositories/order-repository.js` (data access)
- **Estimativa:** 4h para refactoring
```
