# ⚡ Quick Start - Google Cloud Brain

Guia rápido para resolver o erro de build no Portainer.

## 🚨 Erro Comum

```
Failed to deploy a stack: compose build operation failed: 
unable to prepare context: path "/data/compose/3/backend" not found
```

## ✅ Solução Rápida (3 Passos)

### Passo 1: Build e Push da Imagem (No seu PC)

**PowerShell**:
```powershell
cd google-cloud-brain
.\build-and-push-maestro.ps1
```

**Bash**:
```bash
cd google-cloud-brain
chmod +x build-and-push-maestro.sh
./build-and-push-maestro.sh
```

Você precisará:
- Usuário do GitHub
- Nome do repositório
- GitHub Personal Access Token (com permissão `write:packages`)

### Passo 2: Deploy Redis (Portainer)

1. Acesse Portainer: `https://<IP_TAILSCALE>:9443`
2. Vá em **Stacks** > **Add Stack**
3. Nome: `senciente-redis`
4. Cole o conteúdo de `docker-compose.redis-only.yml`
5. Deploy

### Passo 3: Deploy Maestro (Portainer)

1. No Portainer, vá em **Stacks** > **Add Stack**
2. Nome: `senciente-maestro`
3. Cole o conteúdo de `docker-compose.production.yml`
4. **IMPORTANTE**: Altere a linha do `image`:
   ```yaml
   maestro:
     image: ghcr.io/SEU_USUARIO/SEU_REPO-maestro:latest
   ```
5. Configure variáveis:
   ```
   TAILSCALE_IP=100.78.145.65
   ```
6. Deploy

## ✅ Validar

```bash
curl http://100.78.145.65:8080/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "agents_connected": 0,
  "tailscale_ip": "100.78.145.65",
  "timestamp": "..."
}
```

## 📚 Documentação Completa

- [PORTAINER_DEPLOY_FIX.md](PORTAINER_DEPLOY_FIX.md) - Soluções detalhadas
- [PORTAINER_DEPLOY.md](PORTAINER_DEPLOY.md) - Guia completo

---

**Tempo estimado**: 5-10 minutos
