# PRD: Testnet Bet Ecosystem & Bot DNA Evolution

## 1. Visão do Produto
Criar um ambiente de simulação profissional e evolutivo para apostas esportivas ("Testnet"), onde múltiplos bots autônomos com diferentes "DNAs" (combinações de estratégias matemáticas e de betting) competem em tempo real usando dados reais de mercado, mas com capital fictício. O objetivo é identificar, através de seleção natural e análise de dados granular, as combinações mais lucrativas e robustas para operação futura com capital real.

## 2. Objetivos Principais
- **Simulação Realista:** Ambiente que replica condições reais de mercado (liquidez, odds dinâmicas, settlement).
- **Gestão Multi-Estratégia:** Suporte nativo para N estratégias de gestão de banca (Matemática) x M estratégias de seleção (Betting).
- **Evolução de Bots:** Sistema de "DNA" configurável que permite mutação e competição entre 50+ instâncias.
- **Observabilidade Total:** Logs separados e cruzados para análise detalhada de performance.

## 3. Core Features

### 3.1. Engine de Simulação (The Arena)
- **Clock Sincronizado:** Processamento de eventos em tempo real ou acelerado (para backtest).
- **Market Feed:** Ingestão de odds reais via API (Betfair/Pinnacle).
- **Order Matching:** Simulação de execução de ordens com slippage e latência configuráveis.
- **Settlement:** Liquidação automática de apostas com base em resultados reais.

### 3.2. Bot Factory & DNA
- **Estrutura de DNA:** Arquivo de configuração JSON/YAML único por bot.
  - `math_gene`: Kelly Criterion, Flat Stake, Fibonacci, Martingale, etc.
  - `bet_gene`: Over 2.5, Underdog, Momentum, Value Bet, etc.
  - `risk_gene`: Stop loss, Max exposure, Drawdown tolerance.
- **Population Manager:** Criar, clonar e mutar bots automaticamente.

### 3.3. Sistema de Contabilidade (The Bank)
- **Carteiras Isoladas:** Cada bot tem seu próprio `wallet_id` e saldo inicial fictício.
- **Ledger Imutável:** Registro de todas as transações (Aposta, Resultado, Ajuste).
- **Métricas em Tempo Real:** ROI, Yield, Sharpe Ratio, Max Drawdown por bot.

### 3.4. Analytics & Logging
- **Log Matricial:** `Strategy_A` x `Math_B`.
- **Rastreabilidade:** Cada aposta tem link para o "DNA" que a gerou e o "Estado do Mercado" no momento.
- **Leaderboard:** Ranking em tempo real dos melhores bots.

## 4. Requisitos Não-Funcionais
- **Escalabilidade:** Suportar 50+ bots rodando simultaneamente sem degradação.
- **Isolamento:** Falha em um bot não pode derrubar a Arena.
- **Persistência:** Estado dos bots deve sobreviver a reinícios do sistema.

## 5. User Stories (High Level)
- Como estrategista, quero definir um "DNA Base" e gerar 50 variações dele para testar sensibilidade a parâmetros.
- Como analista, quero ver o gráfico de P&L comparativo entre a estratégia "Flat Stake" e "Kelly" para os mesmos picks.
- Como operador, quero que o sistema pause um bot automaticamente se ele atingir 50% de drawdown.
