/**
 * Trading MCP Server
 * Corporacao Senciente - Industry 7.0
 * 
 * MCP Server for Binance Trading Operations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Binance from 'binance';
import * as dotenv from 'dotenv';

import { executeTrade, executeTradeSchema } from './tools/execute_trade.js';
import { getPositions, getPositionsSchema } from './tools/get_positions.js';
import { getBalance, getBalanceSchema } from './tools/get_balance.js';
import { analyzeMarket, analyzeMarketSchema } from './tools/analyze_market.js';
import { setStopLoss, setStopLossSchema } from './tools/set_stop_loss.js';

dotenv.config();

// Initialize Binance client
const binanceClient = new Binance.USDMClient({
  api_key: process.env.BINANCE_API_KEY || '',
  api_secret: process.env.BINANCE_SECRET_KEY || '',
  beautifyResponses: true,
  // Use testnet if configured
  ...(process.env.BINANCE_USE_TESTNET === 'true' && {
    baseUrl: 'https://testnet.binancefuture.com',
  }),
});

// Corporate Will endpoint for trade approvals
const corporateWillEndpoint = process.env.CORPORATE_WILL_ENDPOINT;

// Create MCP Server
const server = new Server(
  {
    name: 'trading-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_trade',
        description: 'Execute a trade on Binance Futures. Requires Corporate Will approval for trades above threshold.',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Trading pair (e.g., BTCUSDT)' },
            side: { type: 'string', enum: ['BUY', 'SELL'] },
            type: { type: 'string', enum: ['MARKET', 'LIMIT', 'STOP_LOSS_LIMIT'] },
            quantity: { type: 'number', description: 'Trade quantity' },
            price: { type: 'number', description: 'Limit price (optional)' },
            stopPrice: { type: 'number', description: 'Stop price (optional)' },
            leverage: { type: 'number', minimum: 1, maximum: 20, default: 1 },
            requireApproval: { type: 'boolean', default: true },
          },
          required: ['symbol', 'side', 'type', 'quantity'],
        },
      },
      {
        name: 'get_positions',
        description: 'Get current futures positions',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Filter by symbol (optional)' },
            includeEmpty: { type: 'boolean', default: false },
          },
        },
      },
      {
        name: 'get_balance',
        description: 'Get account balance',
        inputSchema: {
          type: 'object',
          properties: {
            asset: { type: 'string', description: 'Filter by asset (optional)' },
            type: { type: 'string', enum: ['spot', 'futures'], default: 'futures' },
          },
        },
      },
      {
        name: 'analyze_market',
        description: 'Analyze market data with technical indicators and generate trading recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Trading pair symbol' },
            includeIndicators: { type: 'boolean', default: true },
          },
          required: ['symbol'],
        },
      },
      {
        name: 'set_stop_loss',
        description: 'Set a stop loss order for an existing position',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Trading pair symbol' },
            side: { type: 'string', enum: ['BUY', 'SELL'] },
            quantity: { type: 'number', description: 'Quantity to close' },
            stopPrice: { type: 'number', description: 'Stop price' },
            price: { type: 'number', description: 'Limit price (optional)' },
            reduceOnly: { type: 'boolean', default: true },
          },
          required: ['symbol', 'side', 'quantity', 'stopPrice'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result: any;
    
    switch (name) {
      case 'execute_trade':
        const tradeInput = executeTradeSchema.parse(args);
        result = await executeTrade(tradeInput, binanceClient, corporateWillEndpoint);
        break;
        
      case 'get_positions':
        const positionsInput = getPositionsSchema.parse(args);
        result = await getPositions(positionsInput, binanceClient);
        break;
        
      case 'get_balance':
        const balanceInput = getBalanceSchema.parse(args);
        result = await getBalance(balanceInput, binanceClient);
        break;
        
      case 'analyze_market':
        const marketInput = analyzeMarketSchema.parse(args);
        result = await analyzeMarket(marketInput, binanceClient);
        break;
        
      case 'set_stop_loss':
        const stopLossInput = setStopLossSchema.parse(args);
        result = await setStopLoss(stopLossInput, binanceClient);
        break;
        
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
    
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
    
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Trading MCP Server started');
}

main().catch(console.error);
