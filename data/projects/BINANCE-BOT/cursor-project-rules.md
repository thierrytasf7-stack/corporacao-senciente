# Sistema AURA - Regras do Projeto

## 🏆 REGRA DE OURO - DADOS REAIS

**NUNCA use dados simulados, fictícios ou mockados no Sistema AURA.**

### ✅ OBRIGATÓRIO:
- **SEMPRE** use dados reais da Binance Testnet
- **SEMPRE** conecte com APIs reais da Binance
- **SEMPRE** valide credenciais reais
- **SEMPRE** mostre status real de conexão
- **SEMPRE** use dados reais de portfolio, saldos e posições

### ❌ PROIBIDO:
- Dados mockados/simulados
- Posições fictícias
- Saldos inventados
- Status de conexão falso
- APIs de teste que não conectam com Binance real

## 📋 Contexto do Projeto

O Sistema AURA é uma plataforma profissional de trading algorítmico de criptomoedas desenvolvida para **desenvolvimento real de estratégias lucrativas** usando a **Binance Testnet**.

### Objetivo Principal:
Desenvolver, testar e validar estratégias de trading automatizadas em ambiente real (mas seguro) antes de implementar na mainnet com capital real.

### Arquitetura:
- **Frontend**: React 18 + TypeScript + Redux Toolkit (Porta 13000)
- **Backend**: Node.js + Express + TypeScript (Porta 13001)
- **Banco**: PostgreSQL + Redis
- **Integração**: Binance Testnet real

### Estratégias Implementadas:
1. **Análise Rotativa**: Múltiplos mercados em tempo real
2. **Estratégias Matemáticas**: Cálculos quantitativos
3. **Gestão de Risco**: Controles automáticos

## 🔧 Regras de Desenvolvimento

### Código:
- Use TypeScript para tipagem forte
- Siga padrões ESLint configurados
- Documente funções complexas
- Use async/await para operações assíncronas
- Trate erros adequadamente

### Frontend:
- Use React 18 com hooks
- Use Redux Toolkit para estado
- Use Tailwind CSS para estilização
- Mantenha componentes reutilizáveis
- Use TypeScript para todos os arquivos

### Backend:
- Use Express.js com TypeScript
- Use middleware para validação
- Implemente logging adequado
- Use variáveis de ambiente para configuração
- Trate CORS corretamente

### Integração Binance:
- Use `BinanceRealService` para todas as operações
- Configure credenciais reais no `.env`
- Teste conexão real com Binance Testnet
- Valide credenciais reais antes de usar
- Mostre erros reais quando houver falhas

## 📊 Exemplos de Implementação

### ✅ CORRETO - Dados reais:
```typescript
const positions = await binanceService.getActivePositions(); // Dados reais da Binance
const balances = await binanceService.getBalances(); // Saldos reais da conta
const portfolio = await binanceService.getPortfolioData(); // Portfolio real
```

### ❌ INCORRETO - Dados simulados:
```typescript
const positions = [{ symbol: 'BTCUSDT', side: 'LONG', ... }]; // Dados fictícios
```

## 🎯 Comandos Importantes

### Desenvolvimento:
```bash
# Frontend
npm run dev:13000

# Backend Real
npm run dev:real

# Docker
docker-compose up -d
```

### Testes:
```bash
# Testar conexão Binance
cd backend && npm run test:binance

# Testes gerais
npm test
```

## 🛡️ Segurança

- Valide todas as entradas
- Use HTTPS em produção
- Implemente rate limiting
- Proteja credenciais sensíveis
- Use JWT para autenticação

## 📁 Estrutura do Projeto

```
frontend/src/
├── components/     # Componentes React
├── services/       # APIs e WebSocket
├── store/          # Redux store
└── utils/          # Utilitários

backend/src/
├── services/       # Serviços de negócio
├── controllers/    # Controladores da API
├── middleware/     # Middlewares Express
└── routes/         # Rotas da API
```

## ⚠️ Lembrete Final

**SEMPRE priorize dados reais da Binance Testnet. O sistema deve ser transparente e confiável, mostrando apenas informações reais e atualizadas.**
