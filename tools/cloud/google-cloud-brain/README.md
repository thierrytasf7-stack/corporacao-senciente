# Google Cloud Brain - Corporação Senciente

Stack mínimo para o "Farol" (Brain/Orchestrator) rodando no Google Cloud e2-micro via Tailscale.

## 📋 Estrutura

```
google-cloud-brain/
├── docker-compose.yml      # Stack Redis + Maestro
├── maestro/
│   ├── main.py            # API FastAPI + Socket.IO
│   ├── Dockerfile         # Container otimizado
│   └── requirements.txt   # Dependências Python
├── setup.sh               # Script de setup inicial
├── .env.example            # Template de variáveis
├── PORTAINER_DEPLOY.md     # Guia de deploy no Portainer
└── README.md              # Este arquivo
```

## 🚀 Quick Start

### 1. Setup Inicial

```bash
# No servidor Google Cloud
cd google-cloud-brain
chmod +x setup.sh
./setup.sh
```

### 2. Obter IP Tailscale

```bash
tailscale ip -4
# Anote o IP (ex: 100.78.145.65)
```

### 3. Configurar .env

```bash
cp .env.example .env
nano .env
# Preencha TAILSCALE_IP com o IP obtido acima
```

### 4. Deploy via Portainer

1. Acesse Portainer: `https://<IP_TAILSCALE>:9443`
2. Vá em **Stacks** > **Add Stack**
3. Cole o conteúdo de `docker-compose.yml`
4. Configure variáveis de ambiente
5. Clique em **Deploy**

### 5. Validar

```bash
curl http://<IP_TAILSCALE>:8080/health
```

## 📊 Recursos

- **Redis**: 128MB RAM máximo
- **Maestro**: 256MB RAM máximo
- **Total**: ~400MB (dentro de 1GB disponível)

## 🔗 Links

- [Guia de Deploy](PORTAINER_DEPLOY.md)
- [Arquitetura Completa](../ARQUITETURA_TAILSCALE.md)
- [Agent Listener](../agent-listener/README.md)

---

**Última atualização**: 22/01/2026
