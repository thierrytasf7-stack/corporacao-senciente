# 🚀 Deploy WhatsApp Bridge no Google Cloud

## Status Atual
- ✅ VM e2-micro rodando (IP: 100.78.145.65)
- ✅ Portainer instalado
- ✅ Redis e Maestro Backend operacionais
- ⏳ WhatsApp Bridge (aguardando validação local)

## Preparação Automática

### 1. Conectar na VM
```bash
# Via Tailscale
ssh user@100.78.145.65
```

### 2. Executar Script de Preparação
```bash
# Fazer upload do script
scp google-cloud-brain/scripts/prepare_gcloud_whatsapp.sh user@100.78.145.65:~/

# Conectar e executar
ssh user@100.78.145.65
chmod +x prepare_gcloud_whatsapp.sh
./prepare_gcloud_whatsapp.sh
```

**O que o script faz:**
- ✅ Ativa 2GB de SWAP (proteção contra OOM)
- ✅ Instala Chromium e dependências
- ✅ Configura timezone São Paulo
- ✅ Cria diretórios necessários
- ✅ Verifica/instala Docker

## Deploy do WhatsApp Bridge

### 3. Upload do Código
```bash
# Opção A: Via Git (recomendado)
ssh user@100.78.145.65
cd ~
git clone <seu-repo> maestro-whatsapp
cd maestro-whatsapp/backend/integrations/whatsapp

# Opção B: Via SCP
scp -r backend/integrations/whatsapp user@100.78.145.65:~/maestro-whatsapp/
```

### 4. Configurar Variáveis
```bash
# Criar .env
cat > .env << EOF
AUTHORIZED_NUMBERS=5545998211665
BACKEND_URL=http://host.docker.internal:8080
PAIRING_NUMBER=5545998211665
NODE_ENV=production
TZ=America/Sao_Paulo
EOF
```

### 5. Subir Container
```bash
docker-compose up -d
```

### 6. Parear WhatsApp
```bash
# Ver logs e QR Code
docker logs -f maestro_whatsapp

# Ou acessar via navegador
# http://100.78.145.65:3005
```

## Monitoramento

### Verificar Status
```bash
docker ps
docker logs maestro_whatsapp
```

### Verificar Recursos
```bash
free -h  # Ver uso de memória + SWAP
htop     # Monitoramento em tempo real
```

## Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker logs maestro_whatsapp --tail 100

# Verificar memória
free -h
```

### Sessão perde conexão
```bash
# Limpar auth e reparear
docker-compose down
rm -rf auth_info/*
docker-compose up -d
```

## Recursos da VM

**e2-micro atual:**
- CPU: 2 vCPUs compartilhadas
- RAM: 1GB
- SWAP: +2GB (após script)
- **Total disponível: ~3GB**

**Consumo esperado:**
- Redis: ~50MB
- Maestro Backend: ~200MB
- WhatsApp Bridge: ~400MB
- Sistema: ~200MB
- **Total: ~850MB (dentro do limite)**

## Próximos Passos

1. ✅ Validar comandos localmente
2. ⏳ Executar `prepare_gcloud_whatsapp.sh` na VM
3. ⏳ Deploy do código
4. ⏳ Parear WhatsApp
5. ⏳ Testar comandos remotos
