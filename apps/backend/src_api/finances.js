
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_FILE = path.resolve(__dirname, '../wallet/corp_wallet.enc.json');

/**
 * GET /api/finances/wallet
 */
export async function getWalletInfo(req, res) {
  try {
    if (!fs.existsSync(WALLET_FILE)) {
      return res.status(404).json({ error: 'Wallet not generated yet.' });
    }

    const json = fs.readFileSync(WALLET_FILE, 'utf8');
    const walletData = JSON.parse(json);

    // We only return the address for the dashboard
    const address = '0x' + walletData.address;

    // Mock balances for Horizon 3 demo
    // In a real scenario, we'd use a provider here
    const balances = {
      matic: "145.20",
      usdc: "2,400.00",
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      address: address,
      balances: balances,
      network: 'Polygon Mainnet'
    });
  } catch (err) {
    console.error('❌ Error fetching wallet info:', err);
    res.status(500).json({ error: 'Failed to fetch wallet info' });
  }
}

/**
 * GET /api/finances/stats
 */
export async function getFinancialStats(req, res) {
  // Current financial health metrics
  res.json({
    success: true,
    metrics: {
      roi: "+12.4%",
      burn_rate: "$450/mo",
      runway: "18 months",
      total_equity: "$124,000"
    }
  });
}

/**
 * POST /api/finances/distribute
 */
export async function distributeProfits(req, res) {
  try {
    // Here we would interact with a smart contract or just update our local DB
    // For this horizon demo, we simulate a successful transaction
    res.json({
      success: true,
      transactionHash: '0x' + Math.random().toString(16).slice(2, 66),
      amount: "450.00",
      asset: "USDC",
      destination: "0x574dFf1fDBc6B7fbCb9e47C44CA04420eAa395B8"
    });
  } catch (err) {
    console.error('❌ Error distributing profits:', err);
    res.status(500).json({ error: 'Distribution failed' });
  }
}

/**
 * GET /api/finances
 */
export async function getFinances(req, res) {
  // Legacy support - returns stats as general overview
  return getFinancialStats(req, res);
}
