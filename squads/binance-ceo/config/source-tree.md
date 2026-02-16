# Source Tree - BINANCE-CEO Squad

## Codebase Map

```
modules/binance-bot/
├── frontend/                          # React Dashboard (port 21340)
│   └── src/
│       ├── components/
│       │   ├── dashboard/             # Main dashboard panels
│       │   ├── strategies/            # Strategy builder/editor
│       │   ├── analysis/              # Market analysis tabs
│       │   ├── backtest/              # Backtesting interface
│       │   ├── history/               # Trade history/reports
│       │   ├── positions/             # Position monitoring
│       │   ├── markets/               # Market data/symbols
│       │   └── layout/                # App shell
│       ├── store/slices/              # Redux state
│       ├── services/                  # API & WebSocket services
│       └── hooks/                     # React hooks
│
├── backend/                           # Express API (port 21341)
│   └── src/
│       ├── controllers/               # Route handlers
│       ├── routes/                    # API endpoints
│       ├── services/                  # Business logic
│       ├── trading/
│       │   ├── strategies/            # Strategy implementations
│       │   └── indicators/            # Technical indicators
│       ├── monitoring/                # Health, alerts, metrics
│       ├── database/                  # PostgreSQL models
│       ├── middleware/                # Auth, rate limit, security
│       ├── config/                    # Configuration loader
│       ├── trigger-*.ts               # Trigger system
│       └── scripts/                   # Setup scripts
│   └── data/
│       ├── trading-strategies.json    # Strategy configs
│       ├── math_strategies.json       # Math strategies
│       ├── spot-strategies/           # Spot configs
│       ├── strategy-risk-configs.json # Risk profiles
│       ├── triggers.json              # Trigger configs
│       ├── emitted-signals.json       # Signal history
│       ├── LOGS-CICLOS-SPOT/          # Spot cycle logs
│       └── LOGS-EXECUCOES-SPOT/       # Execution logs
│
└── scripts/                           # PowerShell/Python automation
```

## Key Entry Points

| Purpose | File |
|---------|------|
| Backend server | `backend/src/real-server.ts` |
| Frontend app | `frontend/src/App.tsx` |
| Trigger monitor | `backend/src/trigger-monitor.ts` |
| Strategy base | `backend/src/trading/strategies/BaseStrategy.ts` |
| Indicators | `backend/src/trading/indicators/TechnicalIndicators.ts` |
