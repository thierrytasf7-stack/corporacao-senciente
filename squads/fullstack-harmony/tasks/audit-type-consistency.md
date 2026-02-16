---
task: Type Consistency Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - type_map: Mapa de tipos entre camadas
  - mismatches: Inconsistencias de tipo
Checklist:
  - "[ ] Mapear interfaces/types do frontend para API responses"
  - "[ ] Mapear response shapes do backend"
  - "[ ] Cruzar types frontend vs response backend"
  - "[ ] Verificar enum values consistentes"
  - "[ ] Verificar date formats alinhados (ISO 8601)"
  - "[ ] Verificar ID types (string vs number)"
  - "[ ] Verificar nullable/optional fields"
  - "[ ] Verificar nested object shapes"
  - "[ ] Verificar array item types"
  - "[ ] Verificar shared types package (se existe)"
---

# *audit-types

Auditoria de consistencia de tipos entre frontend e backend.

## O Que Verificar

### Interface Alignment
```typescript
// Frontend espera:
interface User {
  id: string;          // Frontend diz string
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;   // ISO date string
  avatar?: string;     // Optional
}

// Backend retorna:
{
  id: 42,              // ❌ Backend retorna number!
  name: "John",
  email: "john@example.com",
  role: "ADMIN",       // ❌ Backend usa UPPERCASE!
  created_at: "2024-01-15", // ❌ snake_case + formato diferente!
  // avatar nao existe  // ⚠️ Frontend espera campo que nao vem
}
```

### Problemas Comuns

**ID Type Mismatch:**
```
Frontend: id: string    Backend: id: number (auto-increment)
Resultado: Comparacoes === falham, lookup em maps/sets falha
```

**Enum Values:**
```
Frontend: status: 'active' | 'inactive'
Backend: status: 'ACTIVE' | 'INACTIVE'  (uppercase)
Resultado: Switch/case nao matcha, UI mostra estado errado
```

**Date Formats:**
```
Frontend espera: "2024-01-15T10:30:00.000Z" (ISO 8601)
Backend retorna: "2024-01-15" (date only) ou "15/01/2024" (locale)
Resultado: Date parsing falha, UI mostra "Invalid Date"
```

**Naming Convention (camelCase vs snake_case):**
```
Frontend: { userName, createdAt, isActive }
Backend: { user_name, created_at, is_active }
Resultado: Campos undefined, UI vazia
```

**Nullable Fields:**
```
Frontend: avatar: string (non-nullable)
Backend: avatar: null (nullable)
Resultado: avatar.url crashes com "Cannot read property of null"
```

### Shared Types (Best Practice)
```
// Se existir packages/shared-types/ ou similar
// Verificar que ambos importam do mesmo lugar
```

## Formato de Finding

```markdown
### [TYPE-001] ID type mismatch - frontend espera string, backend retorna number
- **Severidade:** HIGH
- **Frontend:** src/types/user.ts:2
  ```typescript
  interface User { id: string; ... }
  ```
- **Backend:** src/routes/users.js retorna `{ id: 42, ... }` (number do DB)
- **Impacto:** `users.find(u => u.id === selectedId)` sempre falha (=== strict)
- **Fix Opcao A:** Backend: `{ id: String(user.id), ... }`
- **Fix Opcao B:** Frontend: `interface User { id: number; ... }`
- **Fix Opcao C:** Shared types package com tipo canonico
```
