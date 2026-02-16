# 🔐 CONFIGURAÇÃO BINANCE API - DADOS REAIS

## ⚠️ IMPORTANTE: Configure suas credenciais reais da Binance
**NUNCA use dados fictícios - este é um projeto sério de trading**

## 📋 Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com:

```bash
# API Key da Binance (obtenha em https://www.binance.com/en/my/settings/api-management)
BINANCE_API_KEY=your-real-binance-api-key-here

# Secret Key da Binance (obtenha em https://www.binance.com/en/my/settings/api-management)
BINANCE_SECRET_KEY=your-real-binance-secret-key-here

# Configuração de ambiente
BINANCE_USE_TESTNET=true  # true para testnet, false para mainnet

# URLs da Binance
BINANCE_API_URL=https://api.binance.com
BINANCE_TESTNET_API_URL=https://testnet.binance.vision
BINANCE_WS_URL=wss://stream.binance.com:9443
```

## 🔧 Instruções de Configuração

### 1. Obter Credenciais da Binance
1. Acesse https://www.binance.com/en/my/settings/api-management
2. Crie uma nova API Key
3. Configure as permissões necessárias:
   - ✅ Enable Reading
   - ✅ Enable Spot & Margin Trading (se for fazer trades)
   - ✅ Enable Futures (se for usar futures)
4. Copie a API Key e Secret Key

### 2. Configurar Testnet (Recomendado para Testes)
1. Acesse https://testnet.binance.vision/
2. Faça login com sua conta Binance
3. Crie uma API Key para testnet
4. Use `BINANCE_USE_TESTNET=true`

### 3. Configurar Mainnet (Produção)
1. Use suas credenciais reais da Binance
2. Configure `BINANCE_USE_TESTNET=false`
3. ⚠️ **CUIDADO**: Trades reais serão executados!

## 🚨 Segurança

### ❌ NUNCA faça:
- Compartilhar suas credenciais
- Commitar o arquivo .env no git
- Usar credenciais em código público
- Deixar credenciais em logs

### ✅ SEMPRE faça:
- Usar .env.local para desenvolvimento
- Usar variáveis de ambiente seguras em produção
- Rotacionar credenciais regularmente
- Monitorar uso da API

## 🧪 Teste de Conexão

Após configurar:

1. **Inicie o sistema:**
   ```bash
   docker-compose up
   ```

2. **Acesse o dashboard:**
   ```
   http://localhost:13000
   ```

3. **Verifique o status:**
   - Status de conexão no dashboard
   - Dados reais do portfolio
   - Posições ativas reais

4. **Se houver erro:**
   - Verifique as credenciais
   - Confirme se a API Key tem permissões corretas
   - Teste primeiro no testnet

## 📊 Dados Reais Disponíveis

Com as credenciais configuradas, você terá acesso a:

- ✅ **Portfolio real** da sua conta Binance
- ✅ **Saldos reais** de todos os ativos
- ✅ **Posições ativas** (se houver)
- ✅ **Histórico de trades** real
- ✅ **Performance real** da conta
- ✅ **Dados em tempo real** via WebSocket

## 🔄 Atualizações Automáticas

O sistema atualiza automaticamente:
- Dados do portfolio a cada 30 segundos
- Posições ativas a cada 15 segundos
- Status de conexão a cada minuto

## 🆘 Solução de Problemas

### Erro: "Credenciais inválidas"
- Verifique se a API Key e Secret Key estão corretas
- Confirme se a API Key não foi revogada
- Teste no testnet primeiro

### Erro: "Falha na conexão"
- Verifique sua conexão com a internet
- Confirme se a Binance não está em manutenção
- Teste a API diretamente no site da Binance

### Erro: "Permissões insuficientes"
- Verifique se a API Key tem permissão de leitura
- Confirme se não há restrições de IP configuradas

---

**🎯 Lembre-se: Este é um sistema de trading real. Use com responsabilidade!**
