---
task: Error Propagation Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - error_map: Mapa de erros backend -> frontend handling
  - gaps: Status codes nao tratados no frontend
Checklist:
  - "[ ] Mapear todos os error responses do backend (status + format)"
  - "[ ] Mapear todos os error handlers do frontend (catch, error boundaries)"
  - "[ ] Verificar 400 -> frontend mostra field-level errors"
  - "[ ] Verificar 401 -> frontend redireciona para login"
  - "[ ] Verificar 403 -> frontend mostra permissao negada"
  - "[ ] Verificar 404 -> frontend mostra not found"
  - "[ ] Verificar 409 -> frontend mostra conflito"
  - "[ ] Verificar 422 -> frontend destaca campos com erro"
  - "[ ] Verificar 429 -> frontend mostra rate limit"
  - "[ ] Verificar 500 -> frontend mostra erro generico amigavel"
  - "[ ] Verificar Network Error -> frontend mostra offline"
  - "[ ] Verificar Timeout -> frontend mostra timeout com retry"
---

# *audit-errors

Auditoria de propagacao de erros entre backend e frontend.

## Error Format Alignment

### Backend Error Response (esperado)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

### Frontend Error Handling (esperado)
```typescript
try {
  await api.post('/api/users', data);
} catch (error) {
  if (error.response) {
    switch (error.response.status) {
      case 400:
      case 422:
        setFieldErrors(error.response.data.error.details);
        break;
      case 401:
        redirect('/login');
        break;
      case 403:
        showToast('Voce nao tem permissao');
        break;
      case 409:
        showToast('Este recurso ja existe');
        break;
      case 429:
        showToast('Muitas tentativas, aguarde');
        break;
      default:
        showToast('Erro interno, tente novamente');
    }
  } else {
    showToast('Sem conexao com o servidor');
  }
}
```

## Mapa de Verificacao

| Status | Backend Retorna | Frontend Deve |
|--------|----------------|---------------|
| 400 | Validation errors com details | Mostrar errors por campo |
| 401 | Unauthorized | Redirect para login ou refresh token |
| 403 | Forbidden | Mostrar "sem permissao" |
| 404 | Not found | Mostrar estado "nao encontrado" |
| 409 | Conflict | Mostrar "ja existe" ou merge dialog |
| 422 | Validation com field details | Destacar campos com erro |
| 429 | Rate limited + Retry-After | Mostrar "aguarde" + timer |
| 500 | Generic server error | Mostrar erro amigavel (NAO stack trace) |
| Network | Connection refused | Mostrar "offline" + retry |
| Timeout | Request timeout | Mostrar "timeout" + retry button |

## O Que Procurar

### Backend Side
- Error response format e consistente em todos endpoints?
- Validation errors incluem field-level details?
- 500 errors NAO expoe stack trace em prod?
- Rate limit retorna header Retry-After?

### Frontend Side
- Existe um handler generico (interceptor/error boundary)?
- Cada status code importante e tratado especificamente?
- Field-level errors sao mapeados para campos do form?
- Network errors sao tratados (offline, timeout)?
- User ve feedback amigavel (nao JSON cru, nao stack trace)?

## Formato de Finding

```markdown
### [ERRPROP-001] Frontend nao trata 422 Validation - mostra erro generico
- **Severidade:** HIGH
- **Backend:** src/routes/users.js:30 - Retorna 422 com field details
  ```json
  { "error": { "code": "VALIDATION_ERROR", "details": [{"field": "email", ...}] } }
  ```
- **Frontend:** src/components/UserForm.tsx:55 - Catch generico
  ```typescript
  catch (err) { showToast('Algo deu errado'); } // Perde os field errors!
  ```
- **Impacto:** Usuario nao sabe qual campo esta errado, experiencia frustrante
- **Fix:** Parsear `error.response.data.error.details` e mostrar em cada campo
```
