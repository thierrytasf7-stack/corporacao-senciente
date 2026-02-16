# 🚨 Resolver Erro "denied denied" - AGORA

## O Problema

O Portainer não consegue fazer pull da imagem porque ela está **privada** no GitHub Container Registry.

## ✅ Solução em 2 Passos (2 minutos)

### Passo 1: Tornar Imagem Pública

1. **Acesse**: https://github.com/thierrytasf7-stack?tab=packages
2. **Procure** por: `diana-corporacao-senciente-maestro` (ou qualquer pacote container)
3. **Clique** no pacote
4. No menu lateral direito, clique em **Package settings**
5. Role até a seção **Danger Zone**
6. Clique em **Change visibility**
7. Selecione **Make public**
8. Confirme

### Passo 2: Tentar Deploy Novamente no Portainer

1. No Portainer, vá em **Stacks**
2. Se você já criou a stack, clique nela e depois em **Editor**
3. Se não criou, clique em **Add Stack**
4. Cole o conteúdo de `docker-compose.production.yml`
5. Configure variáveis:
   ```
   TAILSCALE_IP=100.78.145.65
   ```
6. **Deploy**

## 🔍 Verificar se Funcionou

Após tornar pública, teste localmente:

```powershell
docker pull ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
```

Se funcionar, o Portainer também conseguirá.

## ⚠️ Se Ainda Não Funcionar

Se mesmo pública ainda der erro, a imagem pode não ter sido pushada ainda. Execute:

```powershell
cd google-cloud-brain
.\push-image.ps1
```

Use o token: `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`

---

**Tempo estimado**: 2 minutos
