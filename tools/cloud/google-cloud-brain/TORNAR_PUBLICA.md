# 🔓 Tornar Imagem Pública - Guia Rápido

## ✅ Status Atual

- ✅ Push concluído com sucesso
- ✅ Imagem disponível no GitHub Container Registry
- ⏳ Imagem ainda **privada** (precisa tornar pública)

## 🎯 Solução: Tornar Pública Manualmente

A API do GitHub pode ter delay ou o pacote pode precisar ser tornado público manualmente. Siga estes passos:

### Passo a Passo

1. **Acesse**: https://github.com/thierrytasf7-stack?tab=packages
   - Faça login se necessário

2. **Filtre por Containers**:
   - Clique em **Containers** no menu lateral (se disponível)
   - Ou procure por `diana-corporacao-senciente-maestro`

3. **Abra o Pacote**:
   - Clique no pacote `diana-corporacao-senciente-maestro`

4. **Torne Público**:
   - No menu lateral direito, clique em **Package settings**
   - Role até a seção **Danger Zone**
   - Clique em **Change visibility**
   - Selecione **Make public**
   - Confirme a ação

5. **Verifique**:
   - O status deve mudar para **Public**
   - Agora o Portainer conseguirá fazer pull sem autenticação

## 🚀 Depois de Tornar Pública

### Deploy no Portainer

1. Acesse Portainer via Tailscale IP
2. **Stacks** → **Add Stack**
3. Cole o conteúdo de `docker-compose.production.yml`
4. Configure variáveis de ambiente:
   ```yaml
   TAILSCALE_IP: 100.x.x.x  # IP do Google Cloud no Tailscale
   REDIS_URL: redis://redis:6379
   ```
5. **Deploy**

## 🔍 Verificação

Após tornar pública, teste o pull sem autenticação:

```bash
docker pull ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

Se funcionar sem login, está pública! ✅

---

**Tempo estimado**: 1 minuto
**Dificuldade**: Fácil (apenas cliques na interface)
