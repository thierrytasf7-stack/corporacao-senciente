# Setup Agent Listeners - Guia Rápido

## Arquivos .env Pré-configurados

Foram criados templates para 3 agentes:

- `.env.pc-principal` - PC Principal
- `.env.pc-trading` - PC Trading  
- `.env.pc-gpu` - Cerebro-Nuvem

## Como Usar

### 1. Obter IP Tailscale do Google Cloud Brain

No servidor Google Cloud, execute:
```bash
tailscale ip -4
```

Anote o IP (ex: `100.78.145.65`).

### 2. Configurar .env

**PowerShell (Windows)**:
```powershell
# Executar script automatizado
.\setup-agents.ps1
# Digite o IP Tailscale quando solicitado

# Ou manualmente, copie o template correspondente
Copy-Item .env.pc-principal .env
# Edite o .env e substitua o IP Tailscale
```

**Bash (Linux/MacOS)**:
```bash
# Copiar template
cp .env.pc-principal .env

# Editar e substituir IP Tailscale
nano .env
# Substitua 100.78.145.65 pelo IP real
```

### 3. Conteúdo do .env

```env
MAESTRO_URL=http://100.78.145.65:8080
AGENT_ID=pc-principal
AGENT_NAME=PC Principal
HEARTBEAT_INTERVAL=10
RECONNECT_DELAY=5
```

**Importante**: Substitua `100.78.145.65` pelo IP Tailscale real do seu Google Cloud Brain.

### 4. Executar Listener

```bash
# Ativar venv
source venv/bin/activate  # Linux/MacOS
.\venv\Scripts\Activate.ps1  # Windows

# Executar
python listener.py
```

## Múltiplos Agentes

Para rodar múltiplos agentes simultaneamente:

1. Crie pastas separadas para cada agente:
```bash
mkdir agent-principal agent-trading agent-gpu
```

2. Copie os arquivos para cada pasta:
```bash
cp -r agent-listener/* agent-principal/
cp -r agent-listener/* agent-trading/
cp -r agent-listener/* agent-gpu/
```

3. Configure .env em cada pasta:
```bash
# agent-principal/.env
cp .env.pc-principal agent-principal/.env

# agent-trading/.env
cp .env.pc-trading agent-trading/.env

# agent-gpu/.env
cp .env.pc-gpu agent-gpu/.env
```

4. Execute cada um em um terminal separado:
```bash
cd agent-principal && python listener.py &
cd agent-trading && python listener.py &
cd agent-gpu && python listener.py &
```
