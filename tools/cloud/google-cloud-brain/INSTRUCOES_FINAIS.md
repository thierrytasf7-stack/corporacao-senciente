# ✅ Instruções Finais - Resolver "denied denied"

## 🎯 O Que Fazer Agora

### Opção 1: Tornar Imagem Pública (Mais Rápida - 1 minuto)

1. **Acesse**: https://github.com/thierrytasf7-stack?tab=packages
2. **Procure** o pacote container (pode estar com outro nome se ainda não foi pushado)
3. Se encontrar, clique nele
4. **Package settings** > **Danger Zone** > **Make public**

### Opção 2: Fazer Push Primeiro (Se ainda não fez)

Execute no PowerShell:

```powershell
# Ler token do env.local
$token = (Get-Content ".\env.local" | Where-Object { $_ -match "^GIT_TOKEN=" }) -replace "GIT_TOKEN=", ""

# Login
$token | docker login ghcr.io -u thierrytasf7-stack --password-stdin

# Push
docker push ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

**Nota**: O GIT_TOKEN pode não ter permissão `write:packages`. Se falhar, crie um novo token em https://github.com/settings/tokens com permissão `write:packages`.

### Opção 3: Configurar Registry no Portainer

1. No Portainer: **Registries** > **Add registry**
2. **Custom**:
   - Name: `ghcr.io`
   - URL: `ghcr.io`
   - Username: `thierrytasf7-stack`
   - Password: Seu GitHub Personal Access Token (com `read:packages`)

## 📋 Checklist

- [ ] Imagem foi pushada para GitHub Container Registry?
- [ ] Imagem está pública OU registry configurado no Portainer?
- [ ] Tentar deploy novamente no Portainer

## 🔍 Verificar

Teste se consegue fazer pull:

```powershell
docker pull ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

Se funcionar, o Portainer também conseguirá.

---

**Status Atual**:
- ✅ Build: Concluído (291MB)
- ⏳ Push: Em andamento ou pendente
- ❌ Deploy: Bloqueado por autenticação
