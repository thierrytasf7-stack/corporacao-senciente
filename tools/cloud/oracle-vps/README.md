# Oracle VPS - Cerebro Central da Corporacao Senciente

Stack completo para deploy na Oracle Cloud Always Free.

## Componentes

| Servico | Descricao | Porta |
|---------|-----------|-------|
| Traefik | Reverse proxy com SSL | 80, 443 |
| Maestro | WebSocket Hub (FastAPI + Socket.IO) | 8080 |
| Infisical | Gerenciamento de segredos | 8080 |
| Redis | Cache e Pub/Sub | 6379 |
| MongoDB | Database para Infisical | 27017 |
| Netdata | Observabilidade em tempo real | 19999 |

## Requisitos

- Oracle Cloud Always Free (VM.Standard.E2.1.Micro)
- Ubuntu 22.04 ou Debian 12
- Docker + Docker Compose
- Dominio configurado (A record apontando para o IP da VPS)

## Deploy

### 1. Preparar VPS

```bash
# SSH na VPS
ssh ubuntu@<IP_DA_VPS>

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Clonar repositorio
git clone https://github.com/senciente/diana-corporacao-senciente.git
cd diana-corporacao-senciente/oracle-vps
```

### 2. Configurar Ambiente

```bash
# Copiar template
cp env-template.txt .env

# Editar variaveis
nano .env

# Criar arquivo para certificados SSL
touch traefik/acme.json
chmod 600 traefik/acme.json
```

### 3. Deploy

```bash
# Subir stack
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

## Endpoints

Apos deploy, os seguintes endpoints estarao disponiveis:

- `https://api.{DOMAIN}` - Maestro API
- `https://secrets.{DOMAIN}` - Infisical UI
- `https://metrics.{DOMAIN}` - Netdata Dashboard

## Comandos Uteis

```bash
# Restart de um servico
docker compose restart maestro

# Ver logs de um servico
docker compose logs -f maestro

# Atualizar imagens
docker compose pull
docker compose up -d
```

## Seguranca

- Todas as conexoes sao via HTTPS (Let's Encrypt)
- Infisical armazena segredos criptografados
- Netdata requer autenticacao
- Maestro valida tokens de agentes

## Heartbeat System

O Maestro monitora todos os agentes conectados:

1. Agentes enviam heartbeat a cada 10 segundos
2. Se 3 heartbeats forem perdidos, status = CRITICAL
3. Alertas sao enviados para Telegram/Discord

## Conectar Agentes Locais

Ver `../agent-listener/README.md` para instrucoes de conexao.
