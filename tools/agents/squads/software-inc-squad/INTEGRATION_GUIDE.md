# Software Inc + AIOS Squad - Guia de Integração

## 🎮 Pré-requisitos

1. **Software Inc** instalado
2. **AIOS Core** instalado (v2.3.0+)
3. **.NET 9.0** SDK (para compilação)
4. **HarmonyLib** (via NuGet)

## 🔧 Setup

### 1. Compilar AIOS Bridge

```bash
cd build/AIOSBridge
dotnet build -c Release
```

DLL será gerada em: `bin/Release/net9.0/AIOS_Bridge.dll`

### 2. Instalar no Jogo

```
1. Copiar AIOS_Bridge.dll → Software Inc\Mods\
2. Iniciar jogo
3. Verificar console para: "[AIOS Bridge] Mod loaded successfully"
```

### 3. Ativar Squad no AIOS

```bash
@squad-creator activate software-inc-squad
```

## 🧪 Testes

### Test 1: Verificar mod carregado
```
Game Console: [AIOS Bridge] Mod loaded successfully
```

### Test 2: Monitorar agent status
```bash
watch -n 1 "cat C:/AIOS/agent_status.json | jq"
```

### Test 3: Testar integration
```bash
# Enviar comando AIOS
@monitor-agent get_employee_status

# Verificar se resposta vem do jogo
tail -f ~/.aios/logs/integration.log
```

## 📊 Agentes da Squad

### monitor-agent
- **Função**: Rastreia status de employees em tempo real
- **Input**: Game API credentials
- **Output**: Employee status report
- **Frequency**: 5 segundos

### event-agent
- **Função**: Dispara eventos no jogo via AIOS
- **Input**: Event type + parameters
- **Output**: Event execution result
- **Latency**: <2 segundos

### analytics-agent
- **Função**: Analisa métricas de performance
- **Input**: Metric types
- **Output**: Performance insights
- **Frequency**: Real-time + hourly

## 🐛 Troubleshooting

### Problema: DLL não carrega
```
Solução:
1. Verificar HarmonyLib está instalada
2. Verificar Unity version compatibilidade
3. Verificar ModAPI.dll é acessível
```

### Problema: FileSystemWatcher não detecta mudanças
```
Solução:
1. Verificar C:/AIOS/ existe e é writable
2. Verificar permissões de arquivo
3. Reiniciar jogo
```

### Problema: Agents não respondem
```
Solução:
1. Verificar JSON schema em agent_status.json
2. Verificar conexão AIOS ↔ Game
3. Verificar logs: ~/.aios/logs/
```

## 🚀 Deployment em Produção

1. ✅ Testar em dev environment
2. ✅ Rodar suite de testes
3. ✅ Validar performance (<1% CPU)
4. ✅ Backup estado anterior
5. ✅ Deploy no servidor principal
6. ✅ Monitorar por 24h

## 📈 Métricas de Sucesso

- ✅ Mod carrega sem erros
- ✅ FileSystemWatcher detecta mudanças <100ms
- ✅ Employee status sincroniza <5s
- ✅ CPU usage <1%
- ✅ Memory stable <100MB
- ✅ Zero race conditions
- ✅ Todos logs sem erros

