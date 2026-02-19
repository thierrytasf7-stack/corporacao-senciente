# 🚀 STARTUP COMPLETO - DIANA CORP

**Atualizado:** 2026-02-19 03:15 UTC

---

## ✅ O QUE RODA AGORA COM O STARTUP

Quando executar `Start-Diana-Native.bat`, tudo inicia automaticamente:

### 📊 PM2 (Ecossistema Principal)
```
✅ Dashboard AIOS      → http://localhost:21300
✅ Backend API         → http://localhost:21301
✅ Monitor WS          → ws://localhost:21302/stream
✅ Corp Frontend       → http://localhost:21303
✅ Binance Front       → http://localhost:21340
✅ Binance Back        → http://localhost:21341
✅ WhatsApp            → http://localhost:21350
✅ Betting Front       → http://localhost:21371
✅ Betting Back        → http://localhost:21370
```

### 🧬 DNA Arena V2 (Janela Dedicada)
```
✅ Evolução Genética
✅ Geração 300+
✅ 5 bots evoluindo
✅ Salvo automaticamente
```

### 💰 Testnet Futures (Janela Dedicada)
```
✅ 5,079 USDT (fictícios)
✅ API Key: NAbFNWA...
✅ Operando automaticamente
```

### 💰 Testnet Spot (Janela Dedicada)
```
✅ 9,835 USDT (fictícios)
✅ API Key: fNvgZQz...
✅ Operando automaticamente
```

---

## 🎯 TOTAL DE SISTEMAS RODANDO

| Tipo | Quantidade | Status |
|------|------------|--------|
| **PM2 Services** | 9 apps | ✅ Auto-start |
| **DNA Arena V2** | 1 janela | ✅ Auto-start |
| **Testnet Futures** | 1 janela | ✅ Auto-start |
| **Testnet Spot** | 1 janela | ✅ Auto-start |
| **TOTAL** | **12 processos** | ✅ **TUDO AUTO** |

---

## 📝 COMO USAR

### Iniciar Tudo
```
1. Execute: Start-Diana-Native.bat (atalho na Desktop)
2. Aguarde todas as janelas abrirem
3. Verifique status nos terminals
```

### Ver Status
```bash
# No terminal principal
pm2 status
pm2 logs

# DNA Arena: Veja a janela "DNA Arena V2"
# Testnets: Veja as janelas "Testnet Futures" e "Testnet Spot"
```

### Parar Tudo
```bash
# PM2 services
pm2 stop all

# Janelas dedicadas: Fechar manualmente ou
taskkill /F /FI "WINDOWTITLE eq DNA Arena*"
taskkill /F /FI "WINDOWTITLE eq Testnet*"
```

---

## 🔧 COMANDOS PM2 ÚTEIS

```bash
pm2 status           # Ver todos os serviços
pm2 logs             # Logs em tempo real
pm2 restart all      # Reiniciar tudo
pm2 stop all         # Parar tudo
pm2 delete all       # Remover todos
pm2 monit            # Monitor gráfico
```

---

## ⚠️ IMPORTANTE

1. **Não feche as janelas** dos testes se quiser que continuem rodando
2. **PM2 mantém** os serviços principais em background
3. **DNA Arena** salva estado automaticamente a cada 30s
4. **Testnets** operam com dinheiro fictício - seguro para testes

---

## 📊 SALDO TOTAL PARA TESTES

| Ambiente | Saldo | Uso |
|----------|-------|-----|
| Testnet Futures | 5,079 USDT | Testes de estratégias futures |
| Testnet Spot | 9,835 USDT | Testes de estratégias spot |
| **TOTAL** | **14,914 USDT** | **Disponível para testes** |

---

## 🎉 RESUMO

**Execute o atalho e tenha TUDO rodando automaticamente!**

- ✅ 9 serviços PM2
- ✅ DNA Arena evoluindo
- ✅ 2 ambientes de teste com ~15k USDT
- ✅ Zero configuração manual

**Só abrir e usar!** 🚀

---

*Documento criado: 2026-02-19 03:15 UTC*
