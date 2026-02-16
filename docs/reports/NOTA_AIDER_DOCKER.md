# 🐳 Nota Aider Docker

O Aider está rodando via Docker para evitar problemas de compatibilidade no Windows.
O script `scripts_cli/launch_aider_docker.ps1` facilita o lançamento.

### Monitorando:
- `backend/`
- `frontend/src/`

### Modelo:
- Principal: DeepSeek R1 (via OpenRouter)
- Editor: DeepSeek R1 (via OpenRouter)

### Comandos Docker úteis:

**Ver logs:**
```powershell
docker logs <container_id>
```

**Parar container:**
```powershell
docker stop <container_id>
```

**Atualizar imagem:**
```powershell
docker pull paulgauthier/aider
```
