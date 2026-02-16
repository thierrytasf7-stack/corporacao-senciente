# 🔐 Solução: Erro "denied denied" no Portainer

## ❌ Problema

```
Failed to deploy a stack: compose up operation failed: 
Error response from daemon: error from registry: denied denied
```

**Causa**: O Portainer não está autenticado no GitHub Container Registry para fazer pull da imagem.

## ✅ Soluções

### Solução 1: Tornar a Imagem Pública (Mais Rápida)

1. Acesse: https://github.com/thierrytasf7-stack?tab=packages
2. Encontre o pacote `diana-corporacao-senciente-maestro`
3. Clique em **Package settings**
4. Role até **Danger Zone**
5. Clique em **Change visibility** > **Make public**

Depois disso, o Portainer conseguirá fazer pull sem autenticação.

### Solução 2: Configurar Autenticação no Portainer

#### Opção A: Via Interface do Portainer

1. No Portainer, vá em **Registries** > **Add registry**
2. Selecione **Custom**
3. Preencha:
   - **Name**: `ghcr.io`
   - **Registry URL**: `ghcr.io`
   - **Authentication**: ✅ Enabled
   - **Username**: `thierrytasf7-stack`
   - **Password**: `SEU_GITHUB_PERSONAL_ACCESS_TOKEN`
4. Salve

**Obter Token**:
- Acesse: https://github.com/settings/tokens
- Crie um novo token (classic)
- Permissões: `read:packages`
- Copie o token

#### Opção B: Via Docker Login no Servidor

Se você tem acesso SSH ao servidor Google Cloud:

```bash
# SSH no servidor
ssh user@<IP_GOOGLE_CLOUD>

# Login no Docker
echo "SEU_GITHUB_TOKEN" | docker login ghcr.io -u thierrytasf7-stack --password-stdin

# O Portainer usará as credenciais do Docker
```

### Solução 3: Usar Token do env.local

Se o `GIT_TOKEN` do env.local tem permissão `read:packages`, você pode usá-lo:

1. No Portainer: **Registries** > **Add registry**
2. Configure com o token do env.local

## 🎯 Recomendação

**Use a Solução 1** (Tornar imagem pública):
- ✅ Mais rápida (1 minuto)
- ✅ Não precisa configurar autenticação
- ✅ Funciona imediatamente
- ⚠️ Imagem fica pública (mas não é um problema para este caso)

## 📝 Passo a Passo Rápido

### Tornar Imagem Pública:

1. Acesse: https://github.com/thierrytasf7-stack?tab=packages
2. Clique no pacote `diana-corporacao-senciente-maestro`
3. **Package settings** (lateral direita)
4. **Danger Zone** > **Change visibility**
5. **Make public**
6. Confirme

### Depois, no Portainer:

1. Vá em **Stacks** > **Add Stack**
2. Cole o `docker-compose.production.yml`
3. Deploy

## 🔍 Verificar se Funcionou

Após tornar pública ou configurar auth, teste:

```bash
# No servidor ou localmente
docker pull ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

Se funcionar, o Portainer também conseguirá fazer pull.

---

**Última atualização**: 22/01/2026
