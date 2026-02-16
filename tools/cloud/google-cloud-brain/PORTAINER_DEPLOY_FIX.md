# 🔧 Solução para Erro de Build no Portainer

## ❌ Problema

Erro ao fazer deploy no Portainer:
```
Failed to deploy a stack: compose build operation failed: 
unable to prepare context: path "/data/compose/3/backend" not found
```

**Causa**: O `docker-compose.yml` tenta fazer `build: ./maestro`, mas essa pasta não existe no servidor quando você usa o Editor Web do Portainer.

## ✅ Soluções

### Solução 1: Deploy Apenas Redis (Rápida)

Use este arquivo para subir apenas a infraestrutura primeiro:

**Arquivo**: `docker-compose.redis-only.yml`

1. No Portainer, vá em **Stacks** > **Add Stack**
2. Cole o conteúdo de `docker-compose.redis-only.yml`
3. Deploy

Isso sobe apenas o Redis. Depois você adiciona o Maestro de outra forma.

### Solução 2: Usar Imagem Pré-construída (Recomendada)

#### Passo 1: Build e Push da Imagem (No seu PC)

**PowerShell**:
```powershell
cd google-cloud-brain
.\build-and-push-maestro.ps1
# Digite seu usuário GitHub e repositório
# Digite seu GitHub Personal Access Token
```

**Bash**:
```bash
cd google-cloud-brain
chmod +x build-and-push-maestro.sh
./build-and-push-maestro.sh
# Digite seu usuário GitHub e repositório
# Digite seu GitHub Personal Access Token
```

Isso vai:
1. Fazer build da imagem do Maestro
2. Fazer push para `ghcr.io/SEU_USUARIO/SEU_REPO-maestro:latest`

#### Passo 2: Deploy no Portainer

1. No Portainer, vá em **Stacks** > **Add Stack**
2. Cole o conteúdo de `docker-compose.production.yml`
3. **IMPORTANTE**: Altere a linha do `image` do maestro:
   ```yaml
   maestro:
     image: ghcr.io/SEU_USUARIO/SEU_REPO-maestro:latest
   ```
   Substitua `SEU_USUARIO` e `SEU_REPO` pelos valores reais.

4. Configure variáveis de ambiente:
   ```
   TAILSCALE_IP=100.78.145.65
   TELEGRAM_BOT_TOKEN= (opcional)
   DISCORD_WEBHOOK_URL= (opcional)
   ```

5. Deploy

### Solução 3: Upload de Arquivos via Portainer

Se você tem acesso SSH ao servidor:

1. **Via SSH**, copie os arquivos:
   ```bash
   scp -r google-cloud-brain/ user@server:~/
   ```

2. No Portainer, use **Git Repository** ao invés de **Web Editor**:
   - Vá em **Stacks** > **Add Stack**
   - Selecione **Git Repository**
   - Configure o repositório Git
   - Selecione o arquivo `docker-compose.yml`

### Solução 4: Build Local no Servidor

Se você tem acesso SSH ao servidor:

1. **Via SSH**, clone o repositório:
   ```bash
   ssh user@server
   cd ~
   git clone <seu-repositorio>
   cd google-cloud-brain
   ```

2. No Portainer, use **Git Repository**:
   - Vá em **Stacks** > **Add Stack**
   - Selecione **Git Repository**
   - Configure o repositório Git
   - Selecione o arquivo `docker-compose.yml`

## 🎯 Recomendação

**Use a Solução 2** (Imagem Pré-construída):

1. ✅ Mais rápida
2. ✅ Não precisa de acesso SSH
3. ✅ Funciona via Editor Web do Portainer
4. ✅ Fácil de atualizar (apenas fazer push de nova imagem)

## 📝 Checklist

- [ ] Build e push da imagem do Maestro (no PC local)
- [ ] Deploy do Redis (docker-compose.redis-only.yml)
- [ ] Deploy do Maestro (docker-compose.production.yml com imagem)
- [ ] Validar health check: `curl http://<IP_TAILSCALE>:8080/health`

## 🔍 Verificar Imagem no Registry

Após fazer push, verifique se a imagem está disponível:

```bash
# Listar imagens do seu usuário
docker search ghcr.io/SEU_USUARIO

# Ou acesse: https://github.com/SEU_USUARIO?tab=packages
```

## 🐛 Troubleshooting

### Erro: "unauthorized: authentication required"

Você precisa fazer login no GitHub Container Registry:
```bash
echo "SEU_TOKEN" | docker login ghcr.io -u SEU_USUARIO --password-stdin
```

### Erro: "pull access denied"

A imagem pode ser privada. Torne-a pública em:
`https://github.com/SEU_USUARIO?tab=packages` > Selecione o pacote > Settings > Change visibility

### Imagem não atualiza

Force pull no Portainer:
- Vá em **Containers** > `senciente-maestro` > **Recreate**
- Ou delete e recrie o container

---

**Última atualização**: 22/01/2026
