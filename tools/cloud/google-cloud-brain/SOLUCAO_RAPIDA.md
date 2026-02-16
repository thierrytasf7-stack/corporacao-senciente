# ⚡ Solução Rápida - Erro "denied denied"

## ❌ Erro

```
Failed to deploy a stack: compose up operation failed: 
Error response from daemon: error from registry: denied denied
```

## ✅ Solução Mais Rápida (2 minutos)

### Opção 1: Tornar Imagem Pública (Recomendada)

1. **Acesse**: https://github.com/thierrytasf7-stack?tab=packages
2. **Encontre** o pacote: `diana-corporacao-senciente-maestro`
3. **Clique** no pacote
4. **Package settings** (menu lateral direito)
5. Role até **Danger Zone**
6. **Change visibility** > **Make public**
7. Confirme

**Pronto!** Agora o Portainer consegue fazer pull sem autenticação.

### Opção 2: Configurar Registry no Portainer

Se preferir manter a imagem privada:

1. No Portainer, vá em **Registries** > **Add registry**
2. Selecione **Custom**
3. Preencha:
   - **Name**: `ghcr.io`
   - **Registry URL**: `ghcr.io`
   - **Authentication**: ✅ Enabled
   - **Username**: `thierrytasf7-stack`
   - **Password**: `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` (seu GIT_TOKEN)
4. Salve

**Nota**: O GIT_TOKEN do env.local pode não ter permissão `read:packages`. Se não funcionar, crie um novo token em https://github.com/settings/tokens com permissão `read:packages`.

## 🎯 Depois de Resolver

1. No Portainer, vá em **Stacks**
2. Crie nova stack ou edite a existente
3. Use o `docker-compose.production.yml`
4. Deploy

## ✅ Validar

Após resolver, teste:

```bash
docker pull ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

Se funcionar, o Portainer também conseguirá.

---

**Recomendação**: Use a Opção 1 (tornar pública) - é mais rápida e não há problema de segurança para este caso.
