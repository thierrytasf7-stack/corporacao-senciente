# ✅ Pronto para Deploy no Portainer

A imagem do Maestro foi construída e está pronta para push.

## 📦 Informações da Imagem

- **Imagem**: `ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest`
- **Status**: Build concluído localmente

## 🚀 Próximos Passos

### 1. Push para GitHub Container Registry

Execute (você precisará de um GitHub Personal Access Token):

```powershell
# Login no GitHub Container Registry
echo "SEU_GITHUB_TOKEN" | docker login ghcr.io -u thierrytasf7-stack --password-stdin

# Push da imagem
docker push ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

**Obter Token**: https://github.com/settings/tokens
- Permissões necessárias: `write:packages`

### 2. Deploy no Portainer

1. Acesse o Portainer via Tailscale: `https://<IP_TAILSCALE>:9443`
2. Vá em **Stacks** > **Add Stack**
3. Nome: `senciente-brain`
4. Cole o conteúdo de `docker-compose.production.yml`
5. Configure variáveis de ambiente:
   ```
   TAILSCALE_IP=100.78.145.65
   TELEGRAM_BOT_TOKEN= (opcional)
   DISCORD_WEBHOOK_URL= (opcional)
   ```
6. Deploy

### 3. Validar

```bash
curl http://<IP_TAILSCALE>:8080/health
```

## 📝 Arquivo docker-compose.production.yml

O arquivo já está configurado com a imagem correta:
```yaml
maestro:
  image: ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

---

**Última atualização**: 22/01/2026
