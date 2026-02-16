# 🔐 Configuração de Credenciais da Binance Testnet

## ⚠️ IMPORTANTE: Dados REAIS da Binance Testnet

O Sistema AURA está configurado para usar **DADOS REAIS** da Binance Testnet. Para funcionar completamente, você precisa configurar credenciais válidas.

## 📋 Passo a Passo para Configurar Credenciais

### 1. Criar Conta na Binance Testnet

1. Acesse: https://testnet.binance.vision/
2. Clique em "Create Account" ou "Sign Up"
3. Preencha os dados necessários
4. Confirme o email

### 2. Gerar API Keys

1. Faça login na Binance Testnet
2. Vá para "API Management" ou "API Keys"
3. Clique em "Create API Key"
4. Dê um nome para a API Key (ex: "AURA Trading Bot")
5. **IMPORTANTE**: Marque as permissões necessárias:
   - ✅ **Enable Reading** (obrigatório)
   - ✅ **Enable Spot & Margin Trading** (se quiser fazer trades)
   - ❌ **Enable Withdrawals** (NÃO marque por segurança)

### 3. Configurar no Sistema

1. Abra o arquivo `backend/.env`
2. Substitua as credenciais:

```env
# Configurações da Binance Testnet - DADOS REAIS
BINANCE_API_KEY=sua_api_key_aqui
BINANCE_SECRET_KEY=sua_secret_key_aqui
BINANCE_USE_TESTNET=true
BINANCE_API_URL=https://testnet.binance.vision
BINANCE_WS_URL=wss://testnet.binance.vision/ws
```

### 4. Testar Conexão

Execute o comando para testar:

```bash
cd backend
node test-binance-connection.js
```

## 🚨 Problemas Comuns

### Erro: "API-key format invalid"
- **Causa**: API Key não está no formato correto
- **Solução**: Verifique se copiou a API Key completa (64 caracteres)

### Erro: "Invalid signature"
- **Causa**: Secret Key está incorreta
- **Solução**: Verifique se copiou a Secret Key completa

### Erro: "IP not in whitelist"
- **Causa**: IP não está na whitelist da API
- **Solução**: Adicione seu IP na whitelist ou remova a restrição de IP

## 🔒 Segurança

- **NUNCA** compartilhe suas credenciais
- **NUNCA** commite o arquivo `.env` no Git
- Use apenas na **Testnet** (não na Binance real)
- Revogue as API Keys se não usar mais

## 📊 Funcionalidades Disponíveis

Com credenciais válidas, você terá acesso a:

- ✅ Saldos reais da conta
- ✅ Posições ativas reais
- ✅ Histórico de trades real
- ✅ Preços em tempo real
- ✅ Portfolio real
- ✅ Dados de performance reais

## 🎯 Modo Demonstração

Se não quiser configurar credenciais agora, o sistema funcionará em modo demonstração com dados simulados, mas **NÃO será dados reais da Binance**.

---

**⚠️ Lembrete**: O Sistema AURA foi projetado para usar **DADOS REAIS** da Binance Testnet. Configure as credenciais para ter a experiência completa.
