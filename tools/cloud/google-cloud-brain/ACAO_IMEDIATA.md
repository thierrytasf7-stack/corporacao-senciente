# ⚡ Ação Imediata - Resolver "denied denied"

## 🎯 O Que Você Precisa Fazer AGORA

### Passo 1: Verificar se Push Funcionou

O push está rodando em background. Aguarde alguns segundos e verifique:

```powershell
docker images | Select-String "diana-corporacao-senciente-maestro"
```

Se aparecer, o build está OK. Agora precisa verificar se o push para o registry funcionou.

### Passo 2: Tornar Imagem Pública (CRÍTICO)

**Acesse**: https://github.com/thierrytasf7-stack?tab=packages

**Procure por**:
- Qualquer pacote container
- Ou o nome: `diana-corporacao-senciente-maestro`

**Se encontrar o pacote**:
1. Clique nele
2. No menu lateral direito: **Package settings**
3. Role até: **Danger Zone**
4. Clique: **Change visibility**
5. Selecione: **Make public**
6. Confirme

**Se NÃO encontrar o pacote**:
- O push pode ter falhado
- Execute manualmente (veja Passo 3)

### Passo 3: Fazer Push Manual (Se Necessário)

Se o push automático falhou, execute:

```powershell
# Ler token
$token = (Get-Content ".\env.local" | Where-Object { $_ -match "^GIT_TOKEN=" }) -replace "GIT_TOKEN=", ""

# Login
$token | docker login ghcr.io -u thierrytasf7-stack --password-stdin

# Push
docker push ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

**Se falhar**: O GIT_TOKEN pode não ter permissão `write:packages`. 
- Crie novo token: https://github.com/settings/tokens
- Permissões: `write:packages`

### Passo 4: Deploy no Portainer

Após tornar pública:

1. Acesse Portainer: `https://<IP_TAILSCALE>:9443`
2. **Stacks** > **Add Stack** (ou edite a existente)
3. Cole: `docker-compose.production.yml`
4. Configure: `TAILSCALE_IP=100.78.145.65` (seu IP Tailscale)
5. **Deploy**

## ✅ Checklist Rápido

- [ ] Push concluído?
- [ ] Imagem pública no GitHub?
- [ ] Deploy no Portainer tentado novamente?

---

**Tempo estimado**: 3-5 minutos
