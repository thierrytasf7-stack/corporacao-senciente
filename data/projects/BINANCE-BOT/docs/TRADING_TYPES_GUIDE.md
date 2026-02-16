# Guia dos Tipos de Trading da Binance

## 📊 Visão Geral

A Binance oferece três tipos principais de trading, cada um com características específicas e informações úteis para análise:

---

## 🟢 SPOT Trading (Trading à Vista)

### O que é:
- Compra e venda direta de criptomoedas
- Você possui as moedas fisicamente
- Transações são liquidadas imediatamente

### Informações Úteis para Análise:
- **Preço Atual**: Valor real da moeda no momento
- **Volume 24h**: Liquidez e interesse do mercado
- **Min. USDT**: Valor mínimo para ordens (ex: $5, $10)
- **Qtd. Equivalente**: Quantidade da moeda equivalente à aposta mínima
- **Spread**: Diferença entre bid/ask (liquidez)
- **Market Cap**: Tamanho total do mercado
- **Circulating Supply**: Moedas em circulação

### Vantagens:
- ✅ Simples de entender
- ✅ Sem risco de liquidação
- ✅ Possui as moedas fisicamente
- ✅ Menor volatilidade

### Desvantagens:
- ❌ Lucro limitado ao crescimento da moeda
- ❌ Precisa de capital maior para ganhos significativos

---

## 🔵 FUTURES Trading (Trading de Futuros)

### O que é:
- Contratos de compra/venda futura
- Alavancagem disponível (até 125x)
- Não possui as moedas fisicamente
- Pode fazer short (vender sem ter)

### Informações Úteis para Análise:
- **Preço Atual**: Valor do contrato futuro
- **Funding Rate**: Taxa de financiamento (pode ser positiva ou negativa)
- **Open Interest**: Contratos abertos (interesse do mercado)
- **Liquidation Price**: Preço que causa liquidação
- **Leverage**: Alavancagem disponível
- **Min. USDT**: Valor mínimo para ordens
- **Qtd. Equivalente**: Quantidade do contrato equivalente
- **Basis**: Diferença entre preço spot e futuro

### Vantagens:
- ✅ Alavancagem (mais ganhos com menos capital)
- ✅ Pode fazer short (ganhar na queda)
- ✅ Hedge contra posições spot
- ✅ Maior potencial de lucro

### Desvantagens:
- ❌ Risco de liquidação
- ❌ Mais complexo
- ❌ Perdas podem ser maiores que o capital
- ❌ Funding rate pode comer lucros

---

## 🟣 MARGIN Trading (Trading com Margem)

### O que é:
- Empréstimo de moedas para trading
- Alavancagem moderada (até 10x)
- Possui as moedas fisicamente
- Pode fazer short

### Informações Úteis para Análise:
- **Preço Atual**: Valor da moeda
- **Interest Rate**: Taxa de juros do empréstimo
- **Available Balance**: Saldo disponível para empréstimo
- **Borrowed Amount**: Quantidade emprestada
- **Liquidation Price**: Preço que causa liquidação
- **Min. USDT**: Valor mínimo para ordens
- **Qtd. Equivalente**: Quantidade equivalente
- **Collateral Ratio**: Proporção de garantia

### Vantagens:
- ✅ Alavancagem moderada
- ✅ Possui as moedas fisicamente
- ✅ Pode fazer short
- ✅ Menor risco que futures

### Desvantagens:
- ❌ Taxa de juros sobre empréstimos
- ❌ Risco de liquidação
- ❌ Mais complexo que spot
- ❌ Limite de alavancagem menor

---

## 📈 Informações Específicas por Tipo

### Para SPOT Trading:
```
- Current Price: $45,000 (BTC)
- Min. USDT: $5.00
- Qtd. Equivalente: 0.000111 BTC
- 24h Volume: $2.5B
- Market Cap: $850B
```

### Para FUTURES Trading:
```
- Current Price: $45,100 (BTC)
- Min. USDT: $5.00
- Qtd. Equivalente: 0.000111 BTC
- Funding Rate: 0.01% (8h)
- Open Interest: $15.2B
- Leverage: 1x-125x
```

### Para MARGIN Trading:
```
- Current Price: $45,000 (BTC)
- Min. USDT: $5.00
- Qtd. Equivalente: 0.000111 BTC
- Interest Rate: 0.02% (24h)
- Available Balance: 100 BTC
- Max Leverage: 10x
```

---

## 🎯 Como Escolher o Tipo de Trading

### Escolha SPOT se:
- É iniciante
- Quer simplicidade
- Tem capital suficiente
- Quer possuir as moedas
- Não quer risco de liquidação

### Escolha FUTURES se:
- Tem experiência
- Quer alavancagem alta
- Quer fazer short
- Entende riscos
- Quer hedge

### Escolha MARGIN se:
- Quer alavancagem moderada
- Quer possuir as moedas
- Quer fazer short
- Tem experiência intermediária

---

## ⚠️ Riscos e Considerações

### SPOT:
- Risco: Perda de valor da moeda
- Controle: Total sobre suas moedas

### FUTURES:
- Risco: Liquidação, perda total do capital
- Controle: Precisa monitorar posições constantemente

### MARGIN:
- Risco: Liquidação, juros sobre empréstimos
- Controle: Precisa gerenciar garantias

---

## 🔧 Configuração no Sistema AURA

### Campos Importantes para Cada Tipo:

**SPOT:**
- `currentPrice`: Preço atual
- `minNotional`: Valor mínimo em USDT
- `equivalentAmount`: Quantidade equivalente
- `volume24h`: Volume de 24 horas

**FUTURES:**
- `currentPrice`: Preço do contrato
- `minNotional`: Valor mínimo em USDT
- `equivalentAmount`: Quantidade equivalente
- `fundingRate`: Taxa de financiamento
- `openInterest`: Interesse aberto

**MARGIN:**
- `currentPrice`: Preço atual
- `minNotional`: Valor mínimo em USDT
- `equivalentAmount`: Quantidade equivalente
- `interestRate`: Taxa de juros
- `availableBalance`: Saldo disponível

---

## 📊 Exemplo de Análise

### BTCUSDT (SPOT):
```
Preço: $45,000
Min. USDT: $5.00
Qtd. Equivalente: 0.000111 BTC
Volume 24h: $2.5B
```

### BTCUSDT (FUTURES):
```
Preço: $45,100
Min. USDT: $5.00
Qtd. Equivalente: 0.000111 BTC
Funding Rate: 0.01%
Open Interest: $15.2B
```

### BTCUSDT (MARGIN):
```
Preço: $45,000
Min. USDT: $5.00
Qtd. Equivalente: 0.000111 BTC
Interest Rate: 0.02%
Available: 100 BTC
```

---

## 🎯 Conclusão

Cada tipo de trading tem suas características específicas e informações úteis para análise. O Sistema AURA deve considerar essas diferenças ao:

1. **Exibir informações relevantes** para cada tipo
2. **Calcular riscos** adequadamente
3. **Ajustar estratégias** conforme o tipo
4. **Monitorar métricas** específicas de cada modalidade

A escolha do tipo de trading deve ser baseada na experiência, tolerância ao risco e objetivos de investimento do usuário.
