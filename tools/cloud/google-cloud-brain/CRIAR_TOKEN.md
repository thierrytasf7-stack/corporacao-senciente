# 🔑 Criar Token GitHub com Permissão write:packages

## ⚠️ Problema Atual

O `GIT_TOKEN` do `env.local` não tem permissão `write:packages`, necessário para fazer push de imagens Docker.

## ✅ Solução: Criar Novo Token

### Passo 1: Criar Token

1. **Acesse**: https://github.com/settings/tokens/new?scopes=write:packages
   - Esta URL já pré-seleciona a permissão `write:packages`

2. **Configure**:
   - **Note**: `GitHub Container Registry - Maestro`
   - **Expiration**: Escolha (recomendo 90 dias ou No expiration)
   - **Scopes**: Marque `write:packages`
   - ⚠️ **IMPORTANTE**: Desmarque `repo` se aparecer selecionado (não é necessário)

3. **Generate token**
4. **Copie o token** (você só verá uma vez!)

### Passo 2: Usar o Token

**Opção A: Atualizar env.local** (temporário para push)

```powershell
# Adicionar ao env.local (ou criar variável temporária)
$env:GITHUB_TOKEN = "SEU_NOVO_TOKEN_AQUI"
```

**Opção B: Usar diretamente no comando**

```powershell
# Login
echo "SEU_NOVO_TOKEN" | docker login ghcr.io -u thierrytasf7-stack --password-stdin

# Push
docker push ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

### Passo 3: Tornar Imagem Pública

Após push bem-sucedido:

1. Acesse: https://github.com/thierrytasf7-stack?tab=packages
2. Clique em **Containers** (se não aparecer automaticamente)
3. Encontre: `diana-corporacao-senciente-maestro`
4. Clique no pacote
5. **Package settings** > **Danger Zone** > **Change visibility** > **Make public**

## 🎯 Comando Completo (Depois de Criar Token)

```powershell
# 1. Login
$newToken = "SEU_NOVO_TOKEN"
$newToken | docker login ghcr.io -u thierrytasf7-stack --password-stdin

# 2. Push
docker push ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest

# 3. Tornar pública (via API)
$headers = @{
    "Authorization" = "Bearer $newToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}
$body = @{ visibility = "public" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.github.com/user/packages/container/diana-corporacao-senciente-maestro" -Method Patch -Headers $headers -Body $body -ContentType "application/json"
```

---

**Tempo estimado**: 2 minutos
