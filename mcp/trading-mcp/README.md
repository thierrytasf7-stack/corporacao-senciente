# Trading MCP

MCP Server for Binance Trading Operations - Corporacao Senciente

## Overview

This MCP server provides trading capabilities integrated with the Corporacao Senciente's Corporate Will system for autonomous trading decisions.

## Features

- **execute_trade**: Execute trades with Corporate Will approval
- **get_positions**: View current futures positions
- **get_balance**: Check account balances
- **analyze_market**: Technical analysis with RSI, MACD, Bollinger Bands
- **set_stop_loss**: Manage risk with stop loss orders

## Installation

```bash
cd mcp/trading-mcp
npm install
npm run build
```

## Configuration

Required environment variables:

```env
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_USE_TESTNET=true
CORPORATE_WILL_ENDPOINT=http://localhost:8000/api/corporate-will/evaluate
```

## Usage with Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "trading-mcp": {
    "command": "node",
    "args": ["mcp/trading-mcp/dist/index.js"],
    "env": {
      "BINANCE_API_KEY": "${BINANCE_API_KEY}",
      "BINANCE_SECRET_KEY": "${BINANCE_SECRET_KEY}",
      "BINANCE_USE_TESTNET": "true"
    }
  }
}
```

## Corporate Will Integration

All trades above the configured threshold require approval from the Corporate Will system. This ensures:

- Ethical boundary compliance
- Risk management enforcement
- Self-preservation directive adherence

## Risk Management

Default parameters:
- Max leverage: 20x
- Stop loss: 2% per trade
- Take profit: 6% per trade
- Max daily loss: 10%
- Max drawdown: 20%

## Industry 7.0 Compliance

This MCP is designed for Industry 7.0 autonomous operation:
- Self-preservation prioritized
- Ethical boundaries immutable
- Human override capability maintained
