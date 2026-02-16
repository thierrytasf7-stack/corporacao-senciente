# WhatsApp Bridge - Corporação Senciente

Portal de comando via WhatsApp usando Baileys.

## 🚀 Instalação

```bash
cd backend/integrations/whatsapp
npm install
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
AUTHORIZED_NUMBERS=5511999999999,5511888888888
BACKEND_URL=http://localhost:3001
```

**AUTHORIZED_NUMBERS:** Lista de números autorizados (com código do país, sem +)

## 📱 Uso

### Iniciar Bridge

```bash
npm start
```

### Conectar WhatsApp

1. Execute `npm start`
2. Escaneie o QR Code com WhatsApp
3. Aguarde mensagem de confirmação

## 🤖 Comandos Disponíveis

### Executar via Aider (Maestro)
```
/aider criar módulo de trading
/aider refatorar backend/agents/whatsapp_commander.py
```

### Executar via Qwen (Escriba)
```
/qwen documentar backend/core/services/cli_orchestrator.py
/qwen traduzir componentes de frontend/src/components/ para português
```

### Status
```
/status
```

### Ajuda
```
/help
```

## 🔒 Segurança

- Apenas números em `AUTHORIZED_NUMBERS` podem executar comandos
- Mensagens de números não autorizados são ignoradas
- Todas as operações são logadas

## 📝 Notas

- Sessão WhatsApp salva em `./auth_info`
- Reconexão automática em caso de desconexão
- Mensagem de boas-vindas enviada ao conectar

## 🛠️ Desenvolvimento

```bash
npm run dev  # Com nodemon (auto-reload)
```
