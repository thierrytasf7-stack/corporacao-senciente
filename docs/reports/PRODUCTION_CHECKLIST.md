# Software Inc + AIOS - Production Deployment Checklist

## ✅ Pre-Deployment

- [ ] Código revisado e testado
- [ ] Testes passam: `npm test`
- [ ] Lint clean: `npm run lint`
- [ ] Typecheck ok: `npm run typecheck`
- [ ] Build compila: `dotnet build -c Release`
- [ ] DLL gerada: `AIOS_Bridge.dll` (~5-10 KB)
- [ ] Documentação atualizada

## ✅ Deployment Steps

### 1. Compilação
```bash
cd build/AIOSBridge
dotnet build -c Release
```

### 2. Instalação no Jogo
```bash
# Copiar DLL para Software Inc Mods
cp bin/Release/net9.0/AIOS_Bridge.dll "C:/Program Files (x86)/Steam/steamapps/common/Software Inc/Mods/"
```

### 3. Ativação Squad
```bash
# No AIOS CLI
@squad-creator activate software-inc-squad

# Ou via script
./activate-squad.sh software-inc-squad
```

### 4. Testes Iniciais
```bash
# Verificar mod carregado
watch -n 1 "tail -f ~/.aios/logs/game-bridge.log | grep AIOS"

# Monitorar status
watch -n 1 "cat C:/AIOS/agent_status.json | jq"
```

### 5. Validação
- [ ] Console mostra: "[AIOS Bridge] Mod loaded successfully"
- [ ] agent_status.json sendo atualizado
- [ ] Employees sincronizando com agents
- [ ] Animations funcionando
- [ ] Sem erros em logs

## ✅ Production Monitoring

### Metricas a Monitorar
- CPU Usage: < 1%
- Memory: < 100 MB
- Update Latency: < 100 ms
- Error Rate: < 0.1%
- Uptime: > 99.9%

### Logs Importantes
- `~/.aios/logs/game-bridge.log` - Integration logs
- `Software Inc/output_log.txt` - Game console
- `C:/AIOS/agent_status.json` - Current state

## ✅ Rollback Plan

Se algo der errado:
1. Deletar `AIOS_Bridge.dll` de Mods
2. Reiniciar Software Inc
3. Desativar squad: `@squad-creator deactivate software-inc-squad`
4. Restaurar backup anterior

## ✅ Success Criteria

- ✅ Mod carrega sem erros
- ✅ Status sincroniza <5s
- ✅ Animações funcionam
- ✅ Agents respondem
- ✅ CPU < 1%
- ✅ Sem memory leaks
- ✅ Logs clean

