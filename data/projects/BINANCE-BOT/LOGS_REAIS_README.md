# Sistema de Logs Reais - AURA BOT

## 📋 Problema Resolvido

O logger anterior estava gerando **logs simulados** em vez de capturar logs reais do console. Agora o sistema captura dados **autênticos** do sistema.

## 🚀 Como Usar

### Opção 1: Script Simples (Recomendado)
```bash
# Captura única
py simple_real_logger.py

# Captura contínua (a cada 10 segundos)
py simple_real_logger.py --continuous 10

# Iniciar frontend e capturar
py simple_real_logger.py --start-frontend
```

### Opção 2: Scripts de Inicialização
```bash
# Windows Batch
start_real_logging.bat

# PowerShell
.\start_real_logging.ps1
```

### Opção 3: Captura com Selenium (Avançado)
```bash
# Requer ChromeDriver instalado
py real_console_capture.py

# Modo contínuo
py real_console_capture.py --continuous 30
```

## 📊 O que é Capturado

### Logs do Sistema
- ✅ Status do frontend (rodando/parado)
- ✅ Processos Node.js ativos
- ✅ Portas em uso
- ✅ Arquivos de log recentes

### Logs de Rede
- ✅ Testes de conectividade com APIs
- ✅ Status de endpoints
- ✅ Erros de conexão

### Logs de Serviços
- ✅ Saída do frontend (Vite/React)
- ✅ Saída do backend (Node.js)
- ✅ Erros em tempo real

## 📁 Arquivo de Saída

O sistema atualiza o arquivo `LOGS-CONSOLE-FRONTEND.JSON` com:

```json
{
    "sessionId": "real_session_1234567890",
    "startTime": "2025-08-18T21:30:00.000Z",
    "endTime": "2025-08-18T21:30:15.000Z",
    "totalLogs": 15,
    "errors": 2,
    "warnings": 3,
    "logs": [
        {
            "timestamp": "2025-08-18T21:30:00.000Z",
            "level": "info",
            "message": "Frontend ativo em http://localhost:5173",
            "url": "http://localhost:5173",
            "source": "system"
        }
    ],
    "summary": {
        "errors": [...],
        "warnings": [...],
        "criticalErrors": [...]
    },
    "status": "Logs reais do sistema - 21:30:15 - Total: 15"
}
```

## 🔧 Configuração

### Dependências Python
```bash
pip install requests psutil
```

### Para Selenium (Opcional)
```bash
pip install selenium
# + Instalar ChromeDriver
```

## 🎯 Diferenças do Sistema Anterior

| Aspecto | Sistema Anterior | Sistema Atual |
|---------|------------------|---------------|
| **Dados** | Simulados/Fictícios | Reais/Autênticos |
| **Fonte** | Geração automática | Captura do sistema |
| **Conteúdo** | Mensagens genéricas | Logs específicos |
| **URLs** | Fixas (localhost:3000) | Dinâmicas (detectadas) |
| **Erros** | Simulados | Reais do sistema |
| **Status** | Sempre "ativo" | Status real dos serviços |

## 📈 Exemplo de Logs Reais

### Quando Frontend Não Está Rodando:
```json
{
    "level": "warn",
    "message": "Frontend não está rodando",
    "url": "N/A",
    "source": "system"
}
```

### Quando APIs Estão Inacessíveis:
```json
{
    "level": "warn", 
    "message": "API http://localhost:3002/health - Erro: Connection refused",
    "url": "http://localhost:3002/health",
    "source": "api"
}
```

### Quando Frontend Está Ativo:
```json
{
    "level": "info",
    "message": "Frontend ativo em http://localhost:5173",
    "url": "http://localhost:5173", 
    "source": "system"
}
```

## 🚨 Troubleshooting

### Erro: "Python não encontrado"
```bash
# Instalar Python
# Adicionar ao PATH
# Verificar: python --version
```

### Erro: "Módulos não encontrados"
```bash
pip install requests psutil
```

### Frontend não detectado
```bash
# Verificar se está rodando
cd frontend && npm run dev

# Verificar porta
netstat -ano | findstr :5173
```

## 🎉 Resultado

Agora o arquivo `LOGS-CONSOLE-FRONTEND.JSON` contém **logs reais** do sistema, mostrando:

- ✅ Status real dos serviços
- ✅ Erros reais de conexão
- ✅ Logs autênticos do console
- ✅ Informações do sistema em tempo real
- ✅ Dados específicos da URL atual

**O logger agora mostra o conteúdo real do console dentro da URL mencionada!** 🎯
