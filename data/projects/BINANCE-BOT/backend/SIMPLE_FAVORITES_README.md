# Simple Favorites Server

## 🎯 Objetivo
Sistema simplificado para gerenciar favoritos de estratégias spot, sem as complexidades do sistema anterior.

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
# Opção 1: Node.js direto
node simple-favorites.js

# Opção 2: Script Windows
start-simple-favorites.bat

# Opção 3: PowerShell
.\start-simple-favorites.ps1
```

### 2. Endpoints Disponíveis

#### Health Check
```bash
GET http://localhost:23232/health
```

#### Toggle Favorite
```bash
POST http://localhost:23232/api/v1/spot-favorites/{strategyId}/toggle
```

#### Listar Favoritos
```bash
GET http://localhost:23232/api/v1/spot-favorites
```

#### Status de Favorito
```bash
GET http://localhost:23232/api/v1/spot-favorites/{strategyId}/status
```

## 📁 Estrutura de Dados

### Arquivo de Favoritos
- **Localização**: `data/spot-favorites.json`
- **Formato**: Array de strings (IDs das estratégias)
- **Exemplo**:
```json
[
  "spot_rsi_momentum_001",
  "spot_bollinger_squeeze_002"
]
```

## 🔧 Funcionalidades

### ✅ Implementadas
- ✅ Toggle de favoritos (adicionar/remover)
- ✅ Listagem de favoritos
- ✅ Verificação de status
- ✅ Persistência em arquivo JSON
- ✅ Logs detalhados
- ✅ Tratamento de erros
- ✅ CORS habilitado

### 🎯 Características
- **Simples**: Sem dependências complexas
- **Confiável**: Funciona consistentemente
- **Rápido**: Resposta imediata
- **Persistente**: Dados salvos automaticamente
- **Logs**: Debug completo

## 🧪 Testes

### Teste Manual
```bash
# 1. Adicionar favorito
curl -X POST http://localhost:23232/api/v1/spot-favorites/spot_rsi_momentum_001/toggle

# 2. Verificar status
curl http://localhost:23232/api/v1/spot-favorites/spot_rsi_momentum_001/status

# 3. Listar todos
curl http://localhost:23232/api/v1/spot-favorites

# 4. Remover favorito
curl -X POST http://localhost:23232/api/v1/spot-favorites/spot_rsi_momentum_001/toggle
```

### Teste PowerShell
```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:23232/health" | Select-Object -ExpandProperty Content

# Toggle favorite
Invoke-WebRequest -Uri "http://localhost:23232/api/v1/spot-favorites/spot_rsi_momentum_001/toggle" -Method POST | Select-Object -ExpandProperty Content

# List favorites
Invoke-WebRequest -Uri "http://localhost:23232/api/v1/spot-favorites" | Select-Object -ExpandProperty Content
```

## 🔄 Integração com Frontend

O frontend foi atualizado para usar este novo endpoint:
- **URL**: `http://localhost:23232/api/v1/spot-favorites/{id}/toggle`
- **Método**: POST
- **Resposta**: JSON com status e informações do favorito

## 📊 Logs

O servidor gera logs detalhados:
- `📝 [FAVORITES]` - Carregamento de dados
- `💾 [FAVORITES]` - Salvamento de dados
- `✅ [FAVORITES]` - Operações bem-sucedidas
- `❌ [FAVORITES]` - Erros
- `🔄 [FAVORITES]` - Operações de toggle

## 🎉 Status

✅ **FUNCIONANDO PERFEITAMENTE!**

O sistema foi testado e está funcionando corretamente:
- Toggle funciona em ambas as direções
- Dados são persistidos corretamente
- Frontend integrado com sucesso
- Sem erros 404 ou problemas de sincronização
