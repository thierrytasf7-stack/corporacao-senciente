/**
 * server-executor.ts — Executor Isolado de Trading
 *
 * Servidor MÍNIMO que roda apenas ProductionBot para um ambiente específico.
 * Sem DNA Arena, sem Ecosystem, sem ChampionSync.
 *
 * Variáveis de ambiente:
 *   BINANCE_USE_TESTNET  — 'true' | 'false'
 *   TRADING_TYPE         — 'FUTURES' | 'SPOT'
 *   PORT / DIANA_BINANCE_BACKEND_PORT — porta do health endpoint
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ProductionBot } from './services/ProductionBot';

const PORT = process.env.DIANA_BINANCE_BACKEND_PORT || process.env.PORT || 21342;
const USE_TESTNET = process.env.BINANCE_USE_TESTNET !== 'false';
const TRADING_TYPE = process.env.TRADING_TYPE || 'FUTURES';
const NETWORK = USE_TESTNET ? 'TESTNET' : 'MAINNET';

const bot = new ProductionBot({
  name: `Executor-${TRADING_TYPE}-${NETWORK}`,
  useTestnet: USE_TESTNET
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    executor: `${TRADING_TYPE}-${NETWORK}`,
    testnet: USE_TESTNET,
    tradingType: TRADING_TYPE,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`⚡ [Executor] ${TRADING_TYPE} ${NETWORK} ouvindo em :${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);

  // Inicia bot após servidor estar pronto
  setTimeout(() => {
    bot.start().catch(err => {
      console.error(`❌ [Executor] Erro ao iniciar bot:`, err);
    });
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`🛑 [Executor] SIGTERM recebido — parando bot...`);
  bot.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`🛑 [Executor] SIGINT recebido — parando bot...`);
  bot.stop();
  process.exit(0);
});
