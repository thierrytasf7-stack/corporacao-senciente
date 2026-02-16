import * as fs from 'fs';
import * as path from 'path';

export interface StrategyConfig {
  id: string;
  name: string;
  isActive: boolean;
  buyThreshold: number;
  sellThreshold: number;
  stopLoss: number;
  takeProfit: number;
  description: string;
  strategyType: 'SCALPING' | 'SWING' | 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'BREAKOUT';
  timeframes: string[];
  indicators: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  leverage: number; // 1x = Spot, >1x = Futures
  tradingType: 'SPOT' | 'FUTURES'; // Tipo de trading
  betValue: number; // Valor da aposta em USD
  createdAt: Date;
  updatedAt: Date;
}

// Usar interface unificada do TechnicalAnalysisService
import { TradingSignal } from './TechnicalAnalysisService';
export { TradingSignal };

export interface Position {
  id: string;
  strategyId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  openTime: Date;
  stopLoss: number;
  takeProfit: number;
  currentPrice: number;
  unrealizedPnl: number;
  status: 'OPEN' | 'CLOSED' | 'PARTIALLY_CLOSED';
  closePrice?: number;
  closeTime?: Date;
  realizedPnl?: number;
  closeReason?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL' | 'SIGNAL';
}

export class StrategyStorageService {
  private dataDir: string;
  private strategiesFile: string;
  private signalsFile: string;
  private positionsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.strategiesFile = path.join(this.dataDir, 'strategies.json');
    this.signalsFile = path.join(this.dataDir, 'signals.json');
    this.positionsFile = path.join(this.dataDir, 'positions.json');

    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Métodos genéricos para armazenamento
  async getData<T>(key: string): Promise<T | null> {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      return this.readJsonFile<T>(filePath, null as T);
    } catch (error) {
      console.error(`❌ Erro ao ler dados para chave ${key}:`, error);
      return null;
    }
  }

  async saveData<T>(key: string, data: T): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      this.writeJsonFile(filePath, data);
    } catch (error) {
      console.error(`❌ Erro ao salvar dados para chave ${key}:`, error);
      throw error;
    }
  }

  async loadData<T>(key: string): Promise<T | null> {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Erro ao carregar dados para chave ${key}:`, error);
      return null;
    }
  }

  loadDataSync<T>(key: string): T | null {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Erro ao carregar dados para chave ${key}:`, error);
      return null;
    }
  }

  private readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        return defaultValue;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Erro ao ler arquivo ${filePath}:`, error);
      return defaultValue;
    }
  }

  private writeJsonFile<T>(filePath: string, data: T): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`❌ Erro ao escrever arquivo ${filePath}:`, error);
      throw error;
    }
  }

  // Estratégias
  getStrategies(): StrategyConfig[] {
    return this.readJsonFile<StrategyConfig[]>(this.strategiesFile, []);
  }

  saveStrategy(strategy: StrategyConfig): void {
    const strategies = this.getStrategies();
    const existingIndex = strategies.findIndex(s => s.id === strategy.id);

    if (existingIndex >= 0) {
      strategies[existingIndex] = { ...strategy, updatedAt: new Date() };
    } else {
      strategies.push({ ...strategy, createdAt: new Date(), updatedAt: new Date() });
    }

    this.writeJsonFile(this.strategiesFile, strategies);
  }

  deleteStrategy(strategyId: string): boolean {
    const strategies = this.getStrategies();
    const filtered = strategies.filter(s => s.id !== strategyId);

    if (filtered.length < strategies.length) {
      this.writeJsonFile(this.strategiesFile, filtered);
      return true;
    }
    return false;
  }

  // Sinais
  getSignals(): TradingSignal[] {
    return this.readJsonFile<TradingSignal[]>(this.signalsFile, []);
  }

  saveSignal(signal: TradingSignal): void {
    const signals = this.getSignals();
    signals.push(signal);
    this.writeJsonFile(this.signalsFile, signals);
  }

  updateSignal(signalId: string, updates: Partial<TradingSignal>): boolean {
    const signals = this.getSignals();
    const index = signals.findIndex(s => s.id === signalId);

    if (index >= 0) {
      signals[index] = { ...signals[index], ...updates };
      this.writeJsonFile(this.signalsFile, signals);
      return true;
    }
    return false;
  }

  getSignalsByStrategy(strategyId: string): TradingSignal[] {
    return this.getSignals().filter(s => s.strategyId === strategyId);
  }

  // Posições
  getPositions(): Position[] {
    return this.readJsonFile<Position[]>(this.positionsFile, []);
  }

  savePosition(position: Position): void {
    const positions = this.getPositions();
    const existingIndex = positions.findIndex(p => p.id === position.id);

    if (existingIndex >= 0) {
      positions[existingIndex] = position;
    } else {
      positions.push(position);
    }

    this.writeJsonFile(this.positionsFile, positions);
  }

  getOpenPositions(): Position[] {
    return this.getPositions().filter(p => p.status === 'OPEN');
  }

  getPositionsByStrategy(strategyId: string): Position[] {
    return this.getPositions().filter(p => p.strategyId === strategyId);
  }

  // Estatísticas
  getStrategyStats(strategyId: string): {
    totalSignals: number;
    executedSignals: number;
    successRate: number;
    totalPnl: number;
    openPositions: number;
    closedPositions: number;
  } {
    const signals = this.getSignalsByStrategy(strategyId);
    const positions = this.getPositionsByStrategy(strategyId);
    const executedSignals = signals.filter(s => s.status === 'EXECUTED');
    const closedPositions = positions.filter(p => p.status === 'CLOSED');

    const totalPnl = closedPositions.reduce((sum, p) => sum + (p.realizedPnl || 0), 0);
    const successRate = closedPositions.length > 0
      ? (closedPositions.filter(p => (p.realizedPnl || 0) > 0).length / closedPositions.length) * 100
      : 0;

    return {
      totalSignals: signals.length,
      executedSignals: executedSignals.length,
      successRate,
      totalPnl,
      openPositions: positions.filter(p => p.status === 'OPEN').length,
      closedPositions: closedPositions.length
    };
  }
}

export default StrategyStorageService;
