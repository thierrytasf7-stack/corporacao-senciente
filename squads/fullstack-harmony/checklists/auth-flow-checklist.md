# Auth Flow Checklist

## Login
- [ ] Credentials enviadas para endpoint correto
- [ ] Token recebido e armazenado
- [ ] Authorization header configurado para requests futuras
- [ ] Redirect para dashboard/home apos login
- [ ] Error messages para credenciais invalidas

## Token Management
- [ ] Token enviado em toda request protegida
- [ ] 401 interceptado automaticamente
- [ ] Token refresh funcional (se implementado)
- [ ] Sem loop infinito de refresh
- [ ] Requests paralelas durante refresh enfileiradas

## Logout
- [ ] Token removido de todos os storages
- [ ] State limpo (stores, caches)
- [ ] Backend notificado (invalidate session)
- [ ] Redirect para login
- [ ] Rotas protegidas bloqueiam acesso apos logout

## Route Protection
- [ ] Frontend tem guards em rotas protegidas
- [ ] Backend tem middleware em endpoints protegidos
- [ ] Listas de rotas protegidas sao consistentes
- [ ] Role-based access funciona em ambas camadas

## Registration (se aplicavel)
- [ ] Signup flow completo E2E
- [ ] Email confirmation (se existe)
- [ ] Auto-login apos registro
