# State Sync Checklist

## Post-Mutation
- [ ] State local atualiza apos toda mutation bem-sucedida
- [ ] Cache invalidado para queries afetadas
- [ ] Listas refetchadas apos create/delete
- [ ] Items atualizados apos edit

## Optimistic Updates
- [ ] Updates otimistas implementados onde apropriado
- [ ] Rollback funcional em caso de erro do backend
- [ ] UI consistente durante rollback

## Revalidation
- [ ] Strategy de revalidation definida (SWR, polling, manual)
- [ ] Revalidation on focus (tab volta ao foco)
- [ ] Revalidation on reconnect (volta online)
- [ ] Stale data detectado e refreshed

## Consistency
- [ ] Frontend state nunca contradiz backend
- [ ] Concurrent edits tratados (conflict resolution)
- [ ] Pagination state consistente com server data
- [ ] Filtros/sort preservados apos mutations
