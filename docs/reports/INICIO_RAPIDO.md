# 🚀 Início Rápido - Orquestra de CLIs + WhatsApp

## ⚡ Setup Rápido (5 minutos)

### 1. Configurar WhatsApp

```bash
cd backend/integrations/whatsapp

# Editar .env e adicionar seu número
# AUTHORIZED_NUMBERS=5511999999999

npm start
```

**Escaneie o QR Code** que aparecerá no terminal.

### 2. Testar via WhatsApp

Envie para o número conectado:

```
/help
```

Você receberá:
```
🤖 Corporação Senciente - Comandos

/aider <comando> - Maestro (arquitetura)
/qwen <comando> - Escriba (documentação)
/status - Status da Orquestra
```

### 3. Executar Primeiro Comando

```
/qwen documentar backend/core/services/cli_orchestrator.py
```

---

## 📋 Comandos Úteis

### Via WhatsApp

| Comando | O que faz |
|---------|-----------|
| `/aider criar módulo de trading` | Cria novo módulo via Aider |
| `/qwen documentar arquivo.py` | Gera documentação via Qwen |
| `/status` | Ver status da Orquestra |

### Via API (curl)

```bash
# Executar via orquestrador (auto-roteia)
curl -X POST http://localhost:3001/api/cli/orchestrator/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "criar módulo de trading"}'

# Status
curl http://localhost:3001/api/cli/status
```

---

## 🔧 Troubleshooting

### Aider não instalado

```bash
pip install aider-chat --user
```

Se falhar, tente:
```bash
python -m pip install aider-chat --user
```

### WhatsApp desconectou

```bash
cd backend/integrations/whatsapp
rm -rf auth_info
npm start
```

Escaneie QR Code novamente.

### Backend não responde

Verifique se está rodando:
```bash
cd backend
python main.py
```

---

## 📚 Documentação Completa

- [Walkthrough Completo](file:///C:/Users/User/.gemini/antigravity/brain/32f3ad00-a861-462c-9788-332c918331d3/walkthrough.md)
- [Task List](file:///C:/Users/User/.gemini/antigravity/brain/32f3ad00-a861-462c-9788-332c918331d3/task.md)
- [Protocolos de Convivência](file:///c:/Users/User/Desktop/Sencient-Coorporation/Diana-Corporacao-Senciente/.sentient_protocols.md)
- [WhatsApp Bridge README](file:///c:/Users/User/Desktop/Sencient-Coorporation/Diana-Corporacao-Senciente/backend/integrations/whatsapp/README.md)

---

**Boa noite! A Corporação está pronta para trabalhar enquanto você dorme. 🌙**
