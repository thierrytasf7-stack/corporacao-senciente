# Diana Startup Guide

## 🚀 Iniciar Diana

```cmd
# 1. Inicia PM2 + serviços
Start-Diana-Native.bat

# 2. Abre Windows Terminal com 6 abas
powershell scripts\Launch-Diana-Terminal.ps1
```

**6 Abas criadas** (cada com split horizontal):
1. **SERVERS** - PM2 services (dashboard, backend, binance, whatsapp)
2. **SENTINELA** - Genesis watcher (top) + Claude CEO-ZERO (bottom)
3. **ESCRIVAO** - Implementation watcher (top) + Claude CEO-ZERO (bottom)
4. **REVISADOR** - Review watcher (top) + Claude CEO-ZERO (bottom)
5. **ALEX** - WhatsApp sentinel (top) + Worker (bottom)
6. **CORP** - Corp sentinel (top) + Claude (bottom)

## 🛑 Parar Diana (SHUTDOWN TOTAL)

```cmd
Stop-Diana.bat
```

**O que faz:**
- ✅ Mata PM2 e todos processos gerenciados
- ✅ Mata Guardian Hive (que fica em background)
- ✅ Mata todos Node.js (dashboard, backend, binance)
- ✅ Mata todos Python (sentinelas)
- ✅ Mata todos Claude CLI (workers)
- ✅ Fecha todos Windows Terminal
- ✅ Libera portas 21300-21399
- ✅ Limpa arquivos de lock/trigger/session

## ⚠️ IMPORTANTE

**Sempre use `Stop-Diana.bat` para fechar**, não apenas feche as janelas!

O Guardian Hive e outros processos ficam em background e precisam ser mortos explicitamente.

## 🔧 Troubleshooting

**Algo ainda rodando após Stop-Diana?**
```powershell
# Verificar processos rodando
Get-Process node*, python*, claude* -ErrorAction SilentlyContinue

# Matar manualmente
Stop-Process -Name node, python, claude -Force
```

**Porta ainda ocupada?**
```powershell
# Ver o que está usando a porta 21300 (por exemplo)
Get-NetTCPConnection -LocalPort 21300 -State Listen

# Matar processo na porta
$pid = (Get-NetTCPConnection -LocalPort 21300).OwningProcess
Stop-Process -Id $pid -Force
```

**PM2 não responde?**
```cmd
npx pm2 kill
npx pm2 resurrect
```

## 📊 Monitoramento

**Ver logs PM2:**
```cmd
npx pm2 logs
npx pm2 status
```

**Heartbeat dos workers:**
```cmd
dir C:\AIOS\workers
type C:\AIOS\workers\sentinela.json
```

**Sessões Claude:**
```cmd
dir %USERPROFILE%\.claude\projects\C--Users-User-Desktop-Diana-Corporacao-Senciente
```

## 🎯 Workers Focus

- **SENTINELA**: Gera stories da ETAPA_002 senciência (30 tasks)
- **ESCRIVAO**: Implementa stories (prioriza senciência)
- **REVISADOR**: Revisa stories completadas

Pipeline: Genesis → Escrivão → Revisador → Loop
