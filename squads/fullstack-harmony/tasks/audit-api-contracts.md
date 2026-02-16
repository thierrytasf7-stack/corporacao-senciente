---
task: API Contracts Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - backend_endpoints: Lista completa de endpoints do backend
  - frontend_calls: Lista completa de chamadas do frontend
  - mismatches: Dessintonias encontradas
Checklist:
  - "[ ] Mapear todos os endpoints do backend (path, method, params)"
  - "[ ] Mapear todas as chamadas API do frontend (URL, method, body)"
  - "[ ] Cruzar: frontend chama endpoint que nao existe no backend?"
  - "[ ] Cruzar: backend tem endpoint que nenhum frontend consome?"
  - "[ ] Verificar HTTP methods corretos (GET vs POST mismatch)"
  - "[ ] Verificar URL patterns consistentes (/api prefix, trailing slash)"
  - "[ ] Verificar query params enviados vs esperados"
  - "[ ] Verificar request body schema vs o que backend valida"
  - "[ ] Verificar response fields consumidos vs o que backend retorna"
  - "[ ] Verificar Content-Type alignment (JSON, form-data, multipart)"
---

# *audit-contracts

Validacao de contratos de API entre backend e frontend.

## Procedimento

### 1. Mapear Backend Endpoints

Procurar patterns de definicao de rotas:

**Express/Node.js:**
```javascript
app.get('/api/users', ...)
app.post('/api/users', ...)
router.put('/api/users/:id', ...)
router.delete('/api/users/:id', ...)
```

**NestJS:**
```typescript
@Get('users') / @Post('users') / @Put('users/:id')
```

**FastAPI/Python:**
```python
@app.get("/api/users")
@app.post("/api/users")
```

**Extrair para cada endpoint:**
- Path (ex: `/api/users/:id`)
- Method (GET, POST, PUT, DELETE, PATCH)
- Path params (`:id`, `:slug`)
- Query params esperados
- Body schema (validation schema se existir)
- Response format
- Auth required (middleware presente)

### 2. Mapear Frontend Calls

Procurar patterns de chamada:

**fetch:**
```javascript
fetch('/api/users', { method: 'POST', body: JSON.stringify(data) })
fetch(`/api/users/${id}`)
```

**axios:**
```javascript
axios.get('/api/users')
axios.post('/api/users', data)
axios.put(`/api/users/${id}`, data)
```

**SWR/React Query:**
```javascript
useSWR('/api/users')
useQuery(['users', id], () => fetch(`/api/users/${id}`))
```

**Extrair para cada chamada:**
- URL (completa com base)
- Method
- Body (quais campos envia)
- Headers (auth, content-type)
- Response fields consumidos (destructuring)

### 3. Cruzamento

```
BACKEND ENDPOINTS          FRONTEND CALLS
GET /api/users      <---->  fetch('/api/users')           ✅ Match
POST /api/users     <---->  axios.post('/api/users')      ✅ Match
GET /api/users/:id  <---->  fetch(`/api/users/${id}`)     ✅ Match
PUT /api/users/:id  <---->  (nenhuma chamada)             ⚠️ Dead endpoint
DELETE /api/orders  <---->  (nenhuma chamada)             ⚠️ Dead endpoint
(nenhum endpoint)   <---->  fetch('/api/settings')        ❌ BROKEN - 404 garantido
```

## Formato de Finding

```markdown
### [CONTRACT-001] Frontend chama GET /api/settings que nao existe no backend
- **Severidade:** CRITICAL
- **Frontend:** src/hooks/useSettings.ts:12
  ```typescript
  const { data } = useSWR('/api/settings');
  ```
- **Backend:** Nenhum endpoint `/api/settings` definido
- **Impacto:** 404 em producao, feature de settings completamente quebrada
- **Fix Backend:** Criar endpoint `GET /api/settings` em routes/settings.js
- **Fix Alternativo:** Remover chamada do frontend se feature nao existe
```

```markdown
### [CONTRACT-002] Method mismatch - Frontend envia POST, Backend espera PUT
- **Severidade:** HIGH
- **Frontend:** src/services/user-api.ts:34
  ```typescript
  axios.post(`/api/users/${id}`, userData);
  ```
- **Backend:** src/routes/users.js:28
  ```javascript
  router.put('/api/users/:id', updateUser);
  ```
- **Impacto:** Frontend recebe 404 ou 405 Method Not Allowed
- **Fix:** Mudar frontend para `axios.put()` ou backend para aceitar POST
```
