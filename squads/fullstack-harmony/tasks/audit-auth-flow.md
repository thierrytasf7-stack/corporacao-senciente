---
task: Auth Flow Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - auth_flow: Fluxo de auth mapeado
  - gaps: Lacunas encontradas
Checklist:
  - "[ ] Mapear login flow (credentials -> token -> store)"
  - "[ ] Mapear token storage (localStorage, cookie, memory)"
  - "[ ] Mapear token injection (Authorization header, cookie)"
  - "[ ] Mapear token refresh flow (401 -> refresh -> retry)"
  - "[ ] Mapear logout flow (clear token -> redirect -> server invalidate)"
  - "[ ] Verificar protected route guards no frontend"
  - "[ ] Verificar auth middleware no backend"
  - "[ ] Verificar role/permission checks alignment"
  - "[ ] Verificar token expiration handling"
  - "[ ] Verificar registration flow E2E"
---

# *audit-auth

Validacao de fluxo de autenticacao end-to-end.

## Login Flow

```
Frontend                              Backend
1. User enters credentials
2. POST /api/auth/login               3. Validate credentials
   { email, password }                4. Generate JWT/session
                                      5. Return { token, user }
6. Store token (localStorage/cookie)
7. Set Authorization header default
8. Redirect to dashboard
9. Load user data

VERIFICAR:
- Frontend envia para endpoint correto?
- Backend retorna token + user data?
- Frontend armazena token seguramente?
- Frontend configura header para proximas requests?
- Redirect funciona?
```

## Token Refresh Flow

```
Frontend                              Backend
1. API call returns 401
2. Intercept 401 response
3. POST /api/auth/refresh              4. Validate refresh token
   { refreshToken }                    5. Generate new access token
                                       6. Return { accessToken }
7. Update stored token
8. Retry original request with new token

VERIFICAR:
- Frontend intercepta 401 automaticamente (axios interceptor)?
- Refresh endpoint existe no backend?
- Frontend evita loop infinito de refresh?
- Requests em paralelo durante refresh sao enfileiradas?
```

## Logout Flow

```
Frontend                              Backend
1. User clicks logout
2. POST /api/auth/logout              3. Invalidate session/token
   { token }                          4. Return 200
5. Clear stored token
6. Clear user state
7. Redirect to login

VERIFICAR:
- Frontend limpa token de TODOS os locais (localStorage, state, headers)?
- Backend invalida o token server-side?
- Frontend redireciona para login?
- Protected routes bloqueiam acesso apos logout?
```

## Protected Routes

```
Frontend                              Backend
Route Guard:                          Auth Middleware:
- Check if token exists               - Check Authorization header
- Check if token not expired           - Validate token
- Redirect to login if invalid         - Return 401 if invalid
                                       - Attach user to request

VERIFICAR:
- Frontend tem route guard em TODAS as rotas protegidas?
- Backend tem auth middleware em TODOS os endpoints protegidos?
- Lista de rotas protegidas e consistente?
```

## Formato de Finding

```markdown
### [AUTH-001] Token refresh endpoint nao existe no backend
- **Severidade:** CRITICAL
- **Frontend:** src/lib/api-client.ts:23
  ```typescript
  // Axios interceptor tenta refresh
  const response = await axios.post('/api/auth/refresh', { refreshToken });
  ```
- **Backend:** Nenhum endpoint POST /api/auth/refresh definido
- **Impacto:** Apos token expirar, usuario e deslogado sem possibilidade de refresh
- **Fix:** Criar endpoint POST /api/auth/refresh no backend
```

```markdown
### [AUTH-002] Frontend nao intercepta 401 para refresh
- **Severidade:** HIGH
- **Frontend:** src/lib/api-client.ts (nenhum interceptor encontrado)
- **Backend:** Retorna 401 quando token expira (correto)
- **Impacto:** Usuario ve erro generico em vez de ser redirecionado ou ter token refreshed
- **Fix:** Adicionar axios response interceptor para 401
```
