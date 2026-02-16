---
task: Loading States Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
Saida: |
  - states_coverage: Cobertura de loading states por pagina
  - missing: Estados faltantes
Checklist:
  - "[ ] Verificar loading state em CADA fetch/query"
  - "[ ] Verificar empty state quando lista vazia"
  - "[ ] Verificar error state com retry em CADA fetch"
  - "[ ] Verificar skeleton screens para carregamento inicial"
  - "[ ] Verificar disabled buttons durante submit"
  - "[ ] Verificar timeout handling"
  - "[ ] Verificar offline state"
  - "[ ] Verificar partial loading (parte carregou, parte falhou)"
---

# *audit-loading

Auditoria de loading, error e empty states no frontend.

## States Obrigatorios

Cada componente que faz fetch DEVE ter:

### 1. Loading State
```tsx
// RUIM - Nenhum loading indicator
const Users = () => {
  const { data } = useSWR('/api/users');
  return <UserList users={data} />;
  // Renderiza undefined/null enquanto carrega!
};

// BOM - Loading state
const Users = () => {
  const { data, isLoading } = useSWR('/api/users');
  if (isLoading) return <Skeleton />;
  return <UserList users={data} />;
};
```

### 2. Error State
```tsx
// RUIM - Erro silenciado
const Users = () => {
  const { data } = useSWR('/api/users');
  return <UserList users={data || []} />; // Esconde o erro!
};

// BOM - Error com retry
const Users = () => {
  const { data, error, mutate } = useSWR('/api/users');
  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  return <UserList users={data} />;
};
```

### 3. Empty State
```tsx
// RUIM - Lista vazia sem feedback
if (users.length === 0) return null;

// BOM - Empty state informativo
if (users.length === 0) return (
  <EmptyState
    title="Nenhum usuario encontrado"
    description="Comece adicionando um novo usuario"
    action={<Button onClick={openCreateForm}>Adicionar Usuario</Button>}
  />
);
```

### 4. Submit/Mutation Loading
```tsx
// RUIM - Botao clicavel durante submit (double submit)
<Button onClick={handleSubmit}>Salvar</Button>

// BOM - Disabled durante submit
<Button onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
  {isSubmitting ? 'Salvando...' : 'Salvar'}
</Button>
```

## Mapa de Coverage

| Pagina/Componente | Loading | Error | Empty | Submit | Timeout |
|-------------------|---------|-------|-------|--------|---------|
| UserList | ? | ? | ? | N/A | ? |
| UserForm | N/A | ? | N/A | ? | ? |
| Dashboard | ? | ? | ? | N/A | ? |
| OrderDetail | ? | ? | N/A | ? | ? |

Preencher com: ✅ Implementado, ❌ Faltando, ⚠️ Parcial

## Formato de Finding

```markdown
### [LOAD-001] Pagina de pedidos sem loading state - flash de conteudo vazio
- **Severidade:** MEDIUM
- **Arquivo:** src/pages/Orders.tsx:15
  ```tsx
  const { data } = useSWR('/api/orders');
  return <OrderTable orders={data?.data || []} />;
  ```
- **Impacto:** Tabela vazia pisca por 200-500ms antes de carregar dados
- **Fix:** Adicionar loading state
  ```tsx
  const { data, isLoading, error } = useSWR('/api/orders');
  if (isLoading) return <TableSkeleton rows={5} />;
  if (error) return <ErrorState onRetry={() => mutate('/api/orders')} />;
  if (!data?.data?.length) return <EmptyState />;
  return <OrderTable orders={data.data} />;
  ```
```
