# Agent Listener - Corporação Senciente

Cliente Socket.IO que conecta PCs locais ao Maestro via Tailscale.

## Arquitetura

```
PC Local (Agent Listener)
    |
    | Tailscale Mesh Network
    |
Google Cloud Brain (Maestro)
    |
    | Tailscale Mesh Network
    |
Mission Control (Vercel)
```

## Pré-requisitos

- Python 3.12+
- Tailscale instalado e conectado
- IP Tailscale do Google Cloud Brain conhecido

## Instalação

### Linux/MacOS

```bash
# Executar script de setup
chmod +x setup.sh
./setup.sh

# Ou manualmente
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Windows

```powershell
# Executar script de setup
.\setup.ps1

# Ou manualmente
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Configuração

### 1. Obter IP Tailscale do Google Cloud Brain

No servidor Google Cloud, execute:
```bash
tailscale ip -4
```

Anote o IP (ex: `100.78.145.65`).

### 2. Configurar .env

Crie um arquivo `.env` na pasta `agent-listener/`:

```env
# IP Tailscale do Google Cloud Brain
MAESTRO_URL=http://100.78.145.65:8080

# Identificador único do agente
AGENT_ID=pc-principal

# Nome amigável
AGENT_NAME=PC Principal

# Intervalo de heartbeat (segundos)
HEARTBEAT_INTERVAL=10

# Delay de reconexão (segundos)
RECONNECT_DELAY=5
```

### 3. Verificar Conectividade Tailscale

Antes de rodar o listener, teste a conectividade:

```bash
# Ping no IP Tailscale do Brain
ping 100.78.145.65

# Teste HTTP
curl http://100.78.145.65:8080/health
```

## Execução

### Modo Manual

```bash
# Ativar venv
source venv/bin/activate  # Linux/MacOS
# ou
.\venv\Scripts\Activate.ps1  # Windows

# Rodar listener
python listener.py
```

### Modo Serviço (Linux)

```bash
# Copiar service file
sudo cp agent-listener.service /etc/systemd/system/

# Editar caminhos no service file
sudo nano /etc/systemd/system/agent-listener.service

# Habilitar e iniciar
sudo systemctl enable agent-listener
sudo systemctl start agent-listener

# Verificar status
sudo systemctl status agent-listener

# Ver logs
sudo journalctl -u agent-listener -f
```

## Funcionalidades

- **Heartbeat Automático**: Envia status a cada 10 segundos
- **Comandos Remotos**: Executa comandos recebidos do Maestro
- **Métricas**: Coleta CPU, RAM, Disco via psutil
- **Screenshot**: Captura tela (requer pyautogui)
- **Docker Commands**: Gerencia containers Docker localmente

## Comandos Suportados

| Comando | Descrição |
|---------|-----------|
| `restart` | Reinicia o listener |
| `stop` | Para o listener |
| `screenshot` | Captura screenshot |
| `shell` | Executa comando shell |
| `docker_ps` | Lista containers Docker |
| `docker_restart` | Reinicia container Docker |
| `metrics` | Retorna métricas do sistema |

## Troubleshooting

### Listener não conecta

1. Verifique se Tailscale está conectado:
   ```bash
   tailscale status
   ```

2. Verifique o IP do Maestro:
   ```bash
   curl http://100.78.145.65:8080/health
   ```

3. Verifique firewall (se aplicável)

### Heartbeat não funciona

1. Verifique logs do listener
2. Verifique conectividade Tailscale
3. Verifique se o Maestro está rodando

### Comandos não executam

1. Verifique permissões do usuário
2. Verifique logs do listener
3. Verifique se o comando está na lista de permitidos

## Segurança

- **Zero Trust**: Apenas IPs Tailscale podem acessar
- **Sem Portas Públicas**: Tudo via Tailscale mesh
- **Comandos Bloqueados**: Lista de comandos perigosos bloqueados
- **Timeout**: Comandos shell têm timeout de 30s

## Próximos Passos

1. Configurar listener em todos os PCs
2. Verificar conexão no Mission Control
3. Testar comandos remotos
4. Configurar alertas

---

**Última atualização**: 22/01/2026
