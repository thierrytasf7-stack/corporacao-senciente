---
task: Data Flow Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - flows: Lista de fluxos CRUD mapeados
  - broken_flows: Fluxos quebrados
Checklist:
  - "[ ] Mapear fluxos CREATE (frontend form -> backend persist -> frontend confirm)"
  - "[ ] Mapear fluxos READ (frontend request -> backend query -> frontend render)"
  - "[ ] Mapear fluxos UPDATE (frontend edit -> backend update -> frontend reflect)"
  - "[ ] Mapear fluxos DELETE (frontend action -> backend delete -> frontend refresh)"
  - "[ ] Mapear fluxos LIST (frontend paginate -> backend page -> frontend display)"
  - "[ ] Mapear fluxos SEARCH (frontend filter -> backend filter -> frontend results)"
  - "[ ] Verificar que frontend atualiza UI apos mutations"
  - "[ ] Verificar que backend retorna dados suficientes apos mutations"
  - "[ ] Verificar pagination parameters alignment"
  - "[ ] Verificar sort/filter parameters alignment"
---

# *audit-data

Validacao de data flow CRUD end-to-end.

## O Que Validar

### CREATE Flow
```
Frontend                          Backend
1. User fills form
2. Submit -> POST /api/resource   3. Validate input
   { name, email, ... }          4. Persist to DB
                                  5. Return created resource
6. Receive response
7. Show success feedback
8. Update list/redirect

VERIFICAR:
- Frontend envia todos os campos required?
- Backend retorna o resource criado (com id)?
- Frontend usa o response para atualizar UI?
- Frontend mostra validation errors por campo?
```

### READ Flow
```
Frontend                          Backend
1. Component mounts
2. GET /api/resource/:id          3. Query DB
                                  4. Return resource
5. Receive response
6. Render data fields

VERIFICAR:
- Frontend consome todos os campos retornados que renderiza?
- Backend retorna todos os campos que frontend precisa?
- Frontend trata 404 (resource nao encontrado)?
- Loading state enquanto fetch?
```

### UPDATE Flow
```
Frontend                          Backend
1. Load current data
2. User edits fields
3. PUT/PATCH /api/resource/:id    4. Validate changes
   { changed fields }            5. Update DB
                                  6. Return updated resource
7. Receive response
8. Reflect changes in UI

VERIFICAR:
- Frontend envia PUT (full) ou PATCH (partial)?
- Backend aceita partial update?
- Frontend atualiza UI com response (nao com dados locais)?
- Optimistic update com rollback em erro?
```

### DELETE Flow
```
Frontend                          Backend
1. User clicks delete
2. Confirmation dialog
3. DELETE /api/resource/:id       4. Delete from DB
                                  5. Return 204 ou confirmation
6. Remove from UI list
7. Show success feedback

VERIFICAR:
- Frontend tem confirmation antes de deletar?
- Frontend remove item da lista apos sucesso?
- Frontend trata erro de delete (foreign key, permission)?
```

### LIST + Pagination
```
Frontend                          Backend
1. GET /api/resources             2. Query with pagination
   ?page=1&limit=20              3. Return { data, meta }
4. Render list
5. Show pagination controls

VERIFICAR:
- Params de paginacao alinham? (page/offset, limit/perPage)
- Backend retorna total count?
- Frontend usa total para calcular paginas?
- Navegacao entre paginas funciona?
```

## Formato de Finding

```markdown
### [FLOW-001] CREATE user - backend nao retorna resource criado
- **Severidade:** HIGH
- **Frontend:** src/components/UserForm.tsx:45
  ```typescript
  const newUser = await api.post('/api/users', formData);
  setUsers(prev => [...prev, newUser.data]); // Espera o user criado
  ```
- **Backend:** src/routes/users.js:15
  ```javascript
  res.status(201).json({ success: true }); // Nao retorna o user!
  ```
- **Impacto:** Frontend adiciona `undefined` na lista, UI quebra
- **Fix:** Backend retornar `res.status(201).json({ data: createdUser })`
```
