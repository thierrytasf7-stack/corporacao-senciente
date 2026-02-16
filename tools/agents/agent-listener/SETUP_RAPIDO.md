# ⚡ Setup Rápido - Agent Listener

## 🎯 Objetivo
Conectar seu PC local ao Maestro rodando no Google Cloud Brain.

---

## ✅ Pré-requisitos

- [ ] Python 3.12+ instalado
- [ ] Tailscale instalado e conectado
- [ ] Mesma conta Tailscale do Google Cloud Brain

---

## 🚀 Setup em 3 Passos (5 minutos)

### Passo 1: Instalar Tailscale

**Windows:**
1. Baixe: https://tailscale.com/download/windows
2. Instale e faça login
3. Verifique conectividade:
   ```powershell
   ping 100.78.145.65
   ```

**Linux/MacOS:**
```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Conectar
sudo tailscale up

# Verificar
ping 100.78.145.65
```

### Passo 2: Configurar Agent Listener

**Windows:**
```powershell
cd agent-listener
.\setup.ps1
```

**Linux/MacOS:**
```bash
cd agent-listener
chmod +x setup.sh
./setup.sh
```

### Passo 3: Configurar .env

Crie/edite o arquivo `.env` na pasta `agent-listener/`:

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

**Dica**: Para múltiplos PCs, use IDs diferentes:
- `AGENT_ID=pc-principal`
- `AGENT_ID=pc-trading`
- `AGENT_ID=pc-gpu`

---

## ▶️ Executar

```bash
# Ativar ambiente virtual
.\venv\Scripts\Activate.ps1  # Windows
# ou
source venv/bin/activate  # Linux/MacOS

# Executar listener
python listener.py
```

**Saída esperada:**
```
{"event": "agent_listener_starting", "agent_id": "pc-principal", "maestro_url": "http://100.78.145.65:8080"}
{"event": "connected_to_maestro", "url": "http://100.78.145.65:8080"}
{"event": "agent_registered", "result": {...}}
{"event": "heartbeat_sent", "agent_id": "pc-principal"}
```

---

## ✅ Verificar Conexão

### 1. Verificar Logs do Listener
Deve aparecer:
- ✅ `connected_to_maestro`
- ✅ `agent_registered`
- ✅ `heartbeat_sent` (a cada 10 segundos)

### 2. Verificar no Portainer
1. Acesse: https://100.78.145.65:9443
2. **Containers** → `senciente-maestro` → **Logs**
3. Deve aparecer: `agent_registered` com seu `agent_id`

### 3. Testar Health Check
```bash
curl http://100.78.145.65:8080/health
```

---

## 🔧 Troubleshooting

### Erro: "Connection refused"
- ✅ Verifique se Tailscale está conectado: `tailscale status`
- ✅ Teste ping: `ping 100.78.145.65`
- ✅ Verifique se Maestro está rodando no Portainer

### Erro: "Module not found"
- ✅ Ative o ambiente virtual: `.\venv\Scripts\Activate.ps1`
- ✅ Reinstale dependências: `pip install -r requirements.txt`

### Heartbeat não funciona
- ✅ Verifique `HEARTBEAT_INTERVAL` no `.env`
- ✅ Verifique logs do Maestro no Portainer
- ✅ Verifique se Redis está rodando

---

## 🔄 Executar como Serviço (Opcional)

### Windows (Task Scheduler)
1. Abra Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
   - Program: `python`
   - Arguments: `C:\caminho\para\listener.py`
   - Start in: `C:\caminho\para\agent-listener`

### Linux (systemd)
```bash
sudo cp agent-listener.service /etc/systemd/system/
sudo nano /etc/systemd/system/agent-listener.service  # Editar caminhos
sudo systemctl enable agent-listener
sudo systemctl start agent-listener
```

---

## 📊 Status Esperado

Após setup bem-sucedido:

- ✅ Listener conectado ao Maestro
- ✅ Heartbeat funcionando (a cada 10s)
- ✅ Agente registrado no Maestro
- ✅ Pronto para receber comandos remotos

---

**Tempo estimado**: 5 minutos  
**Dificuldade**: Fácil
