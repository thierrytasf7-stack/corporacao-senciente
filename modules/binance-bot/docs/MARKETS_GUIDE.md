# 📊 Guia da Aba de Mercados - Sistema AURA Binance

## 🎯 Visão Geral

A aba de **Mercados** é uma funcionalidade essencial do Sistema AURA Binance que permite gerenciar e configurar os pares de trading disponíveis para operações automatizadas.

## 🚀 Funcionalidades Principais

### 1. **Visualização de Mercados**
- Lista todos os mercados configurados
- Status ativo/inativo de cada mercado
- Informações básicas (símbolo, nome, tipo de trading)
- Configurações de risco (stop loss, take profit)

### 2. **Gerenciamento de Mercados**
- ✅ **Adicionar novos mercados**
- ✅ **Ativar/desativar mercados**
- ✅ **Remover mercados**
- ✅ **Visualizar detalhes completos**
- ✅ **Inicializar mercados padrão**

### 3. **Configurações Avançadas**
- Quantidade de trading por operação
- Stop Loss e Take Profit personalizados
- Limite máximo de posições simultâneas
- Precisão de preços e quantidades

## 📋 Estrutura de um Mercado

```typescript
interface Market {
  id: string;                    // ID único do mercado
  symbol: string;                // Símbolo (ex: BTCUSDT)
  name: string;                  // Nome descritivo (ex: Bitcoin)
  tradingType: 'SPOT' | 'FUTURES' | 'MARGIN';  // Tipo de trading
  isActive: boolean;             // Status ativo/inativo
  quantity: number;              // Quantidade por operação
  stopLoss: number;              // Stop Loss em %
  takeProfit: number;            // Take Profit em %
  maxPositions: number;          // Máximo de posições simultâneas
  description: string;           // Descrição do mercado
  baseAsset: string;             // Ativo base (ex: BTC)
  quoteAsset: string;            // Ativo cotação (ex: USDT)
  minQuantity: number;           // Quantidade mínima
  maxQuantity: number;           // Quantidade máxima
  pricePrecision: number;        // Precisão do preço
  quantityPrecision: number;     // Precisão da quantidade
  createdAt: string;             // Data de criação
  updatedAt: string;             // Data de atualização
}
```

## 🎮 Como Usar

### **Acessando a Aba de Mercados**

1. Abra o Sistema AURA Binance: `http://localhost:13000`
2. No menu lateral, clique em **"Mercados"**
3. A página de gerenciamento de mercados será carregada

### **Inicializando Mercados Padrão**

Se você está usando o sistema pela primeira vez:

1. Clique no botão **"Inicializar Padrões"** (verde)
2. O sistema criará automaticamente:
   - **BTCUSDT** (Bitcoin) - Ativo
   - **ETHUSDT** (Ethereum) - Ativo  
   - **ADAUSDT** (Cardano) - Inativo

### **Adicionando um Novo Mercado**

1. Clique no botão **"Adicionar Mercado"** (azul)
2. Preencha os campos obrigatórios:
   - **Símbolo**: Código do par (ex: SOLUSDT)
   - **Nome**: Nome descritivo (ex: Solana)
   - **Tipo de Trading**: SPOT, FUTURES ou MARGIN
   - **Quantidade**: Quantidade por operação
   - **Stop Loss**: Percentual de stop loss
   - **Take Profit**: Percentual de take profit
   - **Max Posições**: Limite de posições simultâneas
   - **Base Asset**: Ativo base (ex: SOL)
   - **Quote Asset**: Ativo cotação (ex: USDT)

3. Clique em **"Adicionar Mercado"**

### **Gerenciando Mercados Existentes**

#### **Visualizar Detalhes**
- Clique no ícone 👁️ (olho) na linha do mercado
- Um modal será aberto com todas as informações detalhadas

#### **Ativar/Desativar**
- Clique no botão de status na coluna "Status"
- Verde = Ativo, Vermelho = Inativo

#### **Remover Mercado**
- Clique no ícone 🗑️ (lixeira) na linha do mercado
- Confirme a remoção

## 🔧 Configurações Recomendadas

### **Para Mercados SPOT (Recomendado para Iniciantes)**

```json
{
  "tradingType": "SPOT",
  "quantity": 0.001,        // Quantidade pequena para testes
  "stopLoss": 2.0,          // 2% de stop loss
  "takeProfit": 4.0,        // 4% de take profit
  "maxPositions": 2         // Máximo 2 posições simultâneas
}
```

### **Para Mercados FUTURES (Avançado)**

```json
{
  "tradingType": "FUTURES",
  "quantity": 0.01,         // Quantidade maior para futuros
  "stopLoss": 1.5,          // Stop loss mais apertado
  "takeProfit": 3.0,        // Take profit mais conservador
  "maxPositions": 1         // Apenas 1 posição por vez
}
```

## ⚠️ Importante

### **Dados REAIS da Binance Testnet**
- ✅ Todos os mercados usam dados REAIS da Binance Testnet
- ✅ Operações são executadas na conta de teste
- ✅ Nenhum risco financeiro real
- ✅ Ideal para aprendizado e testes

### **Limitações**
- ❌ Apenas mercados disponíveis na Binance Testnet
- ❌ Alguns pares podem ter liquidez limitada
- ❌ Preços podem diferir ligeiramente do mercado real

## 🎯 Melhores Práticas

### **1. Comece com Mercados Padrão**
- Use os mercados padrão fornecidos pelo sistema
- São configurados com parâmetros seguros
- Testados e validados

### **2. Configure Stop Loss e Take Profit**
- Sempre defina stop loss para proteger capital
- Take profit deve ser maior que stop loss
- Use percentuais conservadores inicialmente

### **3. Limite o Número de Posições**
- Comece com máximo 2 posições simultâneas
- Aumente gradualmente conforme experiência
- Monitore o risco total do portfolio

### **4. Teste Antes de Operar**
- Use mercados inativos para testes
- Valide configurações antes de ativar
- Monitore performance regularmente

## 🔍 Solução de Problemas

### **Mercado não aparece na lista**
- Verifique se o símbolo está correto
- Confirme se o par existe na Binance Testnet
- Tente recarregar a página

### **Erro ao adicionar mercado**
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme se o símbolo não já existe
- Verifique a conexão com o backend

### **Mercado não ativa**
- Verifique se as credenciais da Binance estão válidas
- Confirme se o par tem liquidez suficiente
- Verifique os logs do sistema

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do sistema
2. **Teste a conexão** com Binance Testnet
3. **Reinicie o sistema** se necessário
4. **Consulte a documentação** completa

---

## 🎉 Conclusão

A aba de Mercados é fundamental para configurar seu ambiente de trading automatizado. Use as configurações recomendadas e sempre teste antes de operar com valores maiores.

**Lembre-se**: O Sistema AURA Binance usa dados REAIS da Binance Testnet, garantindo um ambiente de aprendizado seguro e confiável! 🚀
