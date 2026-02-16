# 🔧 Configuração de Desenvolvimento Real - Sistema AURA

## 🎯 **Objetivo: Desenvolvimento de Estratégias Lucrativas**

Este documento explica como configurar o Sistema AURA para desenvolvimento real de estratégias de trading usando a **Binance Testnet**.

---

## 🚀 **Configuração Inicial**

### **1. Pré-requisitos**
```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Docker (opcional)
docker --version
```

### **2. Instalação**
```bash
# Clonar repositório
git clone <repository-url>
cd BINANCE-BOT

# Instalar dependências
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

## 🔑 **Configuração da Binance Testnet**

### **1. Obter Credenciais**
1. Acesse: https://testnet.binance.vision/
2. Faça login com sua conta Binance
3. Vá em "API Management"
4. Crie uma nova API Key
5. Anote a API Key e Secret Key

### **2. Configurar Arquivo .env**
```bash
# Criar arquivo .env na raiz do projeto
touch .env
```

```bash
# Conteúdo do .env
# ===========================================
# BINANCE TESTNET CONFIGURATION
# ===========================================
BINANCE_API_KEY=sua_api_key_real_da_testnet
BINANCE_SECRET_KEY=sua_secret_key_real_da_testnet
BINANCE_USE_TESTNET=true
BINANCE_API_URL=https://testnet.binance.vision
BINANCE_WS_URL=wss://testnet.binance.vision/ws

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost
DB_PORT=15432
DB_NAME=aura_db
DB_USER=aura_user
DB_PASSWORD=aura_password

# ===========================================
# REDIS CONFIGURATION
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=16379

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=13001
FRONTEND_PORT=13000

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
JWT_SECRET=sua_chave_jwt_super_secreta_32_chars
JWT_REFRESH_SECRET=sua_chave_refresh_jwt_secreta_32_chars
ENCRYPTION_KEY=sua_chave_encriptacao_32_chars

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=debug
LOG_FILE=logs/aura.log
```

---

## 🐳 **Configuração com Docker**

### **1. Docker Compose**
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### **2. Serviços Disponíveis**
- **Frontend**: http://localhost:13000
- **Backend**: http://localhost:13001
- **PostgreSQL**: localhost:15432
- **Redis**: localhost:16379

---

## 🚀 **Execução Manual**

### **1. Backend**
```bash
cd backend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev:real

# Ou executar diretamente
npm run start:real
```

### **2. Frontend**
```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev:13000
```

---

## 🧪 **Testes de Conexão**

### **1. Testar Conexão com Binance**
```bash
cd backend
npm run test:binance
```

### **2. Testar APIs**
```bash
# Health check
curl http://localhost:13001/health

# Teste de conexão Binance
curl http://localhost:13001/api/v1/binance/test-connection

# Informações da conta
curl http://localhost:13001/api/v1/binance/account-info
```

---

## 📊 **Desenvolvimento de Estratégias**

### **1. Estrutura de Estratégias**
```
backend/src/
├── strategies/
│   ├── RotativeAnalysisStrategy.ts
│   ├── MathStrategy.ts
│   └── CustomStrategy.ts
├── services/
│   ├── BinanceApiService.ts
│   ├── StrategyService.ts
│   └── RiskManagementService.ts
└── controllers/
    ├── StrategyController.ts
    └── AnalysisController.ts
```

### **2. Criar Nova Estratégia**
```typescript
// backend/src/strategies/MyCustomStrategy.ts
import { BaseStrategy } from './BaseStrategy';
import { TradingSignal } from '../types/TradingSignal';

export class MyCustomStrategy extends BaseStrategy {
  name = 'My Custom Strategy';
  
  async analyze(symbol: string, data: any[]): Promise<TradingSignal[]> {
    // Implementar lógica da estratégia
    // Usar dados reais da Binance Testnet
    // Retornar sinais de trading
    
    return [];
  }
  
  async validate(signal: TradingSignal): Promise<boolean> {
    // Validar sinal antes da execução
    return true;
  }
}
```

### **3. Configurar Estratégia**
```typescript
// backend/src/config/strategies.ts
export const strategyConfig = {
  activeStrategies: [
    'RotativeAnalysisStrategy',
    'MathStrategy',
    'MyCustomStrategy'
  ],
  parameters: {
    RotativeAnalysisStrategy: {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70
    },
    MathStrategy: {
      shortMA: 20,
      longMA: 50
    }
  }
};
```

---

## 📈 **Monitoramento e Logs**

### **1. Logs do Sistema**
```bash
# Ver logs em tempo real
tail -f logs/aura.log

# Ver logs do Docker
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **2. Métricas de Performance**
- **Dashboard**: http://localhost:13000
- **API Health**: http://localhost:13001/health
- **Binance Status**: http://localhost:13001/api/v1/binance/status

---

## 🔧 **Configurações Avançadas**

### **1. Configuração de Banco de Dados**
```sql
-- Criar banco de dados
CREATE DATABASE aura_db;
CREATE USER aura_user WITH PASSWORD 'aura_password';
GRANT ALL PRIVILEGES ON DATABASE aura_db TO aura_user;
```

### **2. Configuração do Redis**
```bash
# Configurar Redis para persistência
redis-cli
CONFIG SET save "900 1 300 10 60 10000"
```

### **3. Configuração de Logs**
```typescript
// backend/src/config/logging.ts
export const loggingConfig = {
  level: 'debug',
  format: 'combined',
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
};
```

---

## 🛡️ **Segurança**

### **1. Proteção de Credenciais**
```bash
# Nunca commitar credenciais
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore
```

### **2. Configuração de CORS**
```typescript
// backend/src/app.ts
app.use(cors({
  origin: ['http://localhost:13000'],
  credentials: true
}));
```

### **3. Rate Limiting**
```typescript
// backend/src/middleware/rateLimit.ts
export const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas requisições, tente novamente mais tarde'
};
```

---

## 🚨 **Solução de Problemas**

### **1. Erro de Conexão com Binance**
```bash
# Verificar credenciais
curl -H "X-MBX-APIKEY: sua_api_key" \
     "https://testnet.binance.vision/api/v3/account"

# Verificar logs
tail -f logs/aura.log | grep "BINANCE"
```

### **2. Erro de Banco de Dados**
```bash
# Verificar conexão PostgreSQL
psql -h localhost -p 15432 -U aura_user -d aura_db

# Verificar logs do banco
docker-compose logs postgres
```

### **3. Erro de Frontend**
```bash
# Limpar cache
cd frontend
rm -rf node_modules/.vite
npm run dev:clear

# Verificar logs
npm run dev:13000
```

---

## 📋 **Checklist de Configuração**

### **Configuração Inicial:**
- [ ] Node.js 18+ instalado
- [ ] Credenciais da Binance Testnet obtidas
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas
- [ ] Banco de dados configurado

### **Testes:**
- [ ] Conexão com Binance testada
- [ ] APIs funcionando
- [ ] Frontend carregando
- [ ] Logs sendo gerados
- [ ] Estratégias executando

### **Desenvolvimento:**
- [ ] Estratégias criadas
- [ ] Dados reais sendo usados
- [ ] Logs detalhados
- [ ] Monitoramento ativo
- [ ] Backup configurado

---

## 🎯 **Próximos Passos**

### **1. Desenvolvimento Imediato**
1. Configurar credenciais da Binance Testnet
2. Testar conexão com a API
3. Criar primeira estratégia
4. Validar com dados reais
5. Monitorar performance

### **2. Evolução**
1. Implementar mais estratégias
2. Melhorar gestão de risco
3. Adicionar backtesting
4. Otimizar performance
5. Preparar para mainnet

---

**🎯 Lembrete: Configure sempre com dados reais da Binance Testnet para desenvolvimento profissional de estratégias lucrativas.**
