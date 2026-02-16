---
task: State Sync Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - sync_patterns: Patterns de sincronizacao encontrados
  - issues: Dessintonias de estado
Checklist:
  - "[ ] Verificar que mutations (POST/PUT/DELETE) atualizam state local"
  - "[ ] Verificar optimistic updates tem rollback em erro"
  - "[ ] Verificar cache invalidation apos mutations"
  - "[ ] Verificar revalidation strategy (SWR, React Query, manual)"
  - "[ ] Verificar stale data handling"
  - "[ ] Verificar concurrent edit handling"
  - "[ ] Verificar que list state atualiza apos create/delete"
  - "[ ] Verificar que detail state atualiza apos edit"
  - "[ ] Verificar polling/subscription para dados que mudam externamente"
---

# *audit-state

Auditoria de sincronizacao de estado entre frontend e backend.

## Patterns de Sincronizacao

### After Mutation Update
```typescript
// RUIM - State local fica stale
const createUser = async (data) => {
  await api.post('/api/users', data);
  showToast('Criado!');
  // Lista de users NAO atualiza!
};

// BOM - Invalidar cache / refetch
const createUser = async (data) => {
  await api.post('/api/users', data);
  await queryClient.invalidateQueries(['users']); // React Query
  // OU
  mutate('/api/users'); // SWR
  // OU
  setUsers(prev => [...prev, newUser]); // Manual
};
```

### Optimistic Update
```typescript
// BOM - Update otimista com rollback
const deleteUser = async (id) => {
  const previousUsers = users;
  setUsers(prev => prev.filter(u => u.id !== id)); // Optimistic

  try {
    await api.delete(`/api/users/${id}`);
  } catch (error) {
    setUsers(previousUsers); // Rollback
    showToast('Falha ao deletar');
  }
};
```

### Cache Invalidation
Verificar que apos cada mutation:
- `POST` (create) -> Invalidar lista
- `PUT/PATCH` (update) -> Invalidar item + lista
- `DELETE` -> Invalidar item + lista

### Stale Data
```typescript
// SWR - revalidation automatica
useSWR('/api/users', fetcher, {
  refreshInterval: 30000,       // Revalida a cada 30s
  revalidateOnFocus: true,      // Revalida quando volta na tab
  revalidateOnReconnect: true,  // Revalida quando reconecta
});
```

## O Que Procurar

| Pattern | Status | Descricao |
|---------|--------|-----------|
| Fire and forget | RUIM | Mutation sem update de state |
| Manual refetch | OK | Fetch novamente apos mutation |
| Cache invalidation | BOM | Invalida queries afetadas |
| Optimistic + rollback | MELHOR | Update imediato com safety net |

## Formato de Finding

```markdown
### [SYNC-001] Lista de pedidos nao atualiza apos criar novo pedido
- **Severidade:** HIGH
- **Frontend:** src/pages/orders/CreateOrder.tsx:67
  ```typescript
  await api.post('/api/orders', orderData);
  navigate('/orders'); // Navega mas lista esta stale
  ```
- **Impacto:** Usuario cria pedido mas nao ve na lista, pensa que falhou
- **Fix:** Invalidar cache antes de navegar
  ```typescript
  await api.post('/api/orders', orderData);
  await queryClient.invalidateQueries(['orders']);
  navigate('/orders');
  ```
```
