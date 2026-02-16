# 🚨 REGRAS GERAIS - PROJETO SÉRIO BINANCE BOT

## ⚠️ PROIBIÇÕES ABSOLUTAS

### ❌ DADOS FICTÍCIOS
- **NUNCA** usar dados mock/simulados
- **NUNCA** criar posições fictícias
- **NUNCA** mostrar valores inventados
- **NUNCA** simular trades
- **NUNCA** usar estratégias falsas

### ❌ FALLBACKS SIMULADOS
- **NUNCA** fallback para dados fake
- **NUNCA** "modo demo" com dados inventados
- **NUNCA** simulações sem conexão real

## ✅ OBRIGAÇÕES

### 🔗 CONEXÃO REAL BINANCE
- **SEMPRE** conectar com API real da Binance
- **SEMPRE** usar credenciais reais
- **SEMPRE** dados em tempo real
- **SEMPRE** posições reais da conta

### 🚨 TRATAMENTO DE ERROS
- **ERRO CRÍTICO** se não conseguir conectar
- **ERRO CRÍTICO** se API key inválida
- **ERRO CRÍTICO** se dados não carregam
- **MOSTRAR ERRO** em vez de dados fake

### 📊 DADOS REAIS
- Portfolio real da conta Binance
- Posições ativas reais
- Histórico de trades real
- Performance real
- Saldos reais

## 🎯 IMPLEMENTAÇÃO

### 1. FRONTEND
- Remover TODOS os dados mock
- Conectar com backend real
- Mostrar erros críticos se falhar
- Loading states enquanto carrega

### 2. BACKEND
- Configurar API Binance real
- Validar credenciais
- Retornar dados reais
- Tratar erros adequadamente

### 3. CONFIGURAÇÃO
- API Key Binance real
- Secret Key Binance real
- Testnet/Mainnet configurado
- Variáveis de ambiente corretas

## 🚨 SE FALHAR = ERRO CRÍTICO

**NUNCA** mostrar dados fake. **SEMPRE** mostrar erro crítico para solução.

---

**ESTE É UM PROJETO SÉRIO DE TRADING REAL. NADA DE SIMULAÇÕES!**
