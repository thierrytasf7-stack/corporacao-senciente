---
task: API Validation Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Issues de API design e implementation
  - endpoints: Lista de endpoints auditados
Checklist:
  - "[ ] Mapear todos os endpoints (routes/controllers)"
  - "[ ] Verificar HTTP methods corretos (GET=read, POST=create, PUT=update, DELETE=delete)"
  - "[ ] Verificar status codes corretos"
  - "[ ] Verificar formato de response consistente (envelope pattern)"
  - "[ ] Verificar formato de error response consistente"
  - "[ ] Verificar pagination em list endpoints"
  - "[ ] Verificar input validation/sanitization"
  - "[ ] Verificar rate limiting"
  - "[ ] Verificar CORS configuration"
  - "[ ] Verificar API versioning"
  - "[ ] Verificar idempotency em mutations"
  - "[ ] Verificar content negotiation"
---

# *audit-api

Auditoria de API design e implementation.

## REST Best Practices Checklist

### HTTP Methods
| Method | Uso Correto | Anti-Pattern |
|--------|-------------|--------------|
| GET | Leitura, sem side effects | GET que modifica dados |
| POST | Criação de recurso | POST para tudo |
| PUT | Update completo | PUT parcial (deveria ser PATCH) |
| PATCH | Update parcial | - |
| DELETE | Remoção de recurso | DELETE sem confirmation |

### Status Codes
| Code | Quando Usar | Anti-Pattern |
|------|-------------|--------------|
| 200 | Success com body | 200 para errors |
| 201 | Resource criado | 200 para criação |
| 204 | Success sem body (DELETE) | 200 com body vazio |
| 400 | Input inválido do client | 500 para validation error |
| 401 | Não autenticado | 403 para não autenticado |
| 403 | Não autorizado | 401 para não autorizado |
| 404 | Resource não existe | 200 com null |
| 409 | Conflito (duplicate) | 400 para duplicate |
| 422 | Validation error | 400 genérico |
| 429 | Rate limited | Sem rate limiting |
| 500 | Server error | Expor detalhes internos |

### Response Format (Envelope Pattern)
```json
// SUCCESS
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}

// ERROR
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Must be a valid email address" }
    ]
  }
}
```

### Pagination
Todo list endpoint DEVE ter pagination:
```
GET /api/users?page=1&perPage=20
GET /api/users?cursor=abc123&limit=20
```

**Anti-patterns:**
- Retornar array sem limite
- Missing `total` count em responses paginadas
- Pagination baseada em offset para datasets grandes (preferir cursor)

### Input Validation
```javascript
// RUIM - sem validacao
app.post('/api/users', (req, res) => {
  const user = await User.create(req.body); // Aceita qualquer coisa
});

// BOM - validacao com schema
app.post('/api/users', validate(createUserSchema), (req, res) => {
  const user = await User.create(req.validated);
});
```

### Rate Limiting
- Login: 5 req/min por IP
- API geral: 100 req/min por user
- Signup: 3 req/hora por IP
- Password reset: 3 req/hora por email

### Idempotency
Mutations (POST) devem suportar idempotency key:
```
POST /api/payments
Idempotency-Key: uuid-here
```

## Formato de Finding

```markdown
### [API-001] GET /api/users retorna array sem pagination
- **Severidade:** HIGH
- **Arquivo:** src/routes/users.js:12
- **Impacto:** Retorna todos os 50k users de uma vez, 15MB response
- **Fix:** Adicionar pagination com cursor
  ```javascript
  app.get('/api/users', async (req, res) => {
    const { cursor, limit = 20 } = req.query;
    const users = await User.findAll({ cursor, limit: Math.min(limit, 100) });
    res.json({ data: users, meta: { nextCursor: users.at(-1)?.id } });
  });
  ```
```
