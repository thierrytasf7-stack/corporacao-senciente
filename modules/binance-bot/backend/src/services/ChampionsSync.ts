/**
 * ChampionsSync - Sincroniza campeões da DNA Arena para Futures Testnet
 * 
 * Fluxo:
 * 1. DNA Arena identifica campeões (maior fitness)
 * 2. Extrai parâmetros ótimos (TP, SL, Trailing, Leverage)
 * 3. Aplica nas Futures Strategies
 * 4. Valida em Testnet
 * 5. Feedback para DNA Arena
 */

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export interface ChampionParams {
    botId: string;
    fitness: number;
    generation: number;
    tpMultiplier: number;      // Take Profit multiplier (ATR-based)
    slMultiplier: number;      // Stop Loss multiplier (ATR-based)
    trailingMultiplier: number; // Trailing Stop multiplier (ATR-based)
    leverage: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
}

export interface FuturesStrategyConfig {
    id: string;
    name: string;
    isActive: boolean;
    tpMultiplier: number;
    slMultiplier: number;
    trailingMultiplier: number;
    leverage: number;
    maxPositions: number;
    riskPerTrade: number;
}

export class ChampionsSync {
    private readonly DNA_ARENA_STATE_FILE = 'data/dna-arena-state.json';
    private readonly FUTURES_CONFIG_FILE = 'data/futures-strategies.json';
    private readonly SYNC_LOG_FILE = 'logs/champions-sync.jsonl';
    
    private syncHistory: Array<{
        timestamp: string;
        champion: ChampionParams;
        applied: boolean;
        error?: string;
    }> = [];

    /**
     * Identifica campeões da DNA Arena
     */
    async identifyChampions(): Promise<ChampionParams[]> {
        try {
            const statePath = join(process.cwd(), this.DNA_ARENA_STATE_FILE);
            const stateContent = await readFile(statePath, 'utf-8');
            const state = JSON.parse(stateContent);
            
            // Extrai bots com maior fitness
            const bots = state.bots || [];
            const sorted = bots.sort((a: any, b: any) => b.fitness - a.fitness);
            
            // Top 5 campeões
            const champions: ChampionParams[] = sorted.slice(0, 5).map((bot: any) => ({
                botId: bot.genome.id,
                fitness: bot.fitness,
                generation: bot.genome.generation,
                tpMultiplier: bot.genome.risk.atrMultiplierTP,
                slMultiplier: bot.genome.risk.atrMultiplierSL,
                trailingMultiplier: bot.genome.risk.trailingStopATR,
                leverage: bot.genome.risk.leverage,
                winRate: bot.totalTrades > 0 ? bot.wins / bot.totalTrades : 0,
                sharpeRatio: this.calculateSharpe(bot),
                maxDrawdown: bot.maxDrawdown
            }));
            
            console.log(`🏆 ${champions.length} campeões identificados da DNA Arena`);
            
            return champions;
        } catch (error) {
            console.error('❌ Erro ao identificar campeões:', error);
            return [];
        }
    }

    /**
     * Aplica campeões nas Futures Strategies
     */
    async applyChampions(champions: ChampionParams[]): Promise<void> {
        try {
            const configPath = join(process.cwd(), this.FUTURES_CONFIG_FILE);
            let config: FuturesStrategyConfig[] = [];
            
            // Carrega config existente ou cria nova
            try {
                const content = await readFile(configPath, 'utf-8');
                config = JSON.parse(content);
            } catch {
                // Cria config padrão
                config = this.createDefaultFuturesConfig();
            }
            
            // Atualiza estratégias com parâmetros dos campeões
            for (let i = 0; i < Math.min(champions.length, config.length); i++) {
                const champion = champions[i];
                const strategy = config[i];
                
                strategy.tpMultiplier = champion.tpMultiplier;
                strategy.slMultiplier = champion.slMultiplier;
                strategy.trailingMultiplier = champion.trailingMultiplier;
                strategy.leverage = champion.leverage;
                
                console.log(`✅ Estratégia ${strategy.name} atualizada com campeão ${champion.botId}`);
                console.log(`   TP: ${champion.tpMultiplier}xATR | SL: ${champion.slMultiplier}xATR | Lev: ${champion.leverage}x`);
            }
            
            // Salva config atualizada
            await writeFile(configPath, JSON.stringify(config, null, 2));
            
            // Log de sync
            await this.logSync(champions, true);
            
            console.log(`🎯 ${champions.length} campeões aplicados nas Futures Strategies`);
        } catch (error) {
            console.error('❌ Erro ao aplicar campeões:', error);
            await this.logSync(champions, false, error.message);
        }
    }

    /**
     * Cria config padrão de Futures Strategies
     */
    private createDefaultFuturesConfig(): FuturesStrategyConfig[] {
        return [
            {
                id: 'futures_conservative_001',
                name: 'Futures Conservative',
                isActive: true,
                tpMultiplier: 3.0,
                slMultiplier: 1.5,
                trailingMultiplier: 2.0,
                leverage: 20,
                maxPositions: 5,
                riskPerTrade: 1.0
            },
            {
                id: 'futures_moderate_002',
                name: 'Futures Moderate',
                isActive: true,
                tpMultiplier: 2.5,
                slMultiplier: 1.2,
                trailingMultiplier: 1.5,
                leverage: 30,
                maxPositions: 7,
                riskPerTrade: 1.5
            },
            {
                id: 'futures_aggressive_003',
                name: 'Futures Aggressive',
                isActive: true,
                tpMultiplier: 2.0,
                slMultiplier: 1.0,
                trailingMultiplier: 1.0,
                leverage: 50,
                maxPositions: 10,
                riskPerTrade: 2.0
            }
        ];
    }

    /**
     * Calcula Sharpe Ratio do bot
     */
    private calculateSharpe(bot: any): number {
        if (!bot.pnlHistory || bot.pnlHistory.length === 0) return 0;
        
        const avgPnl = bot.pnlHistory.reduce((a: number, b: number) => a + b, 0) / bot.pnlHistory.length;
        const variance = bot.pnlHistory.reduce((a: number, b: number) => a + Math.pow(b - avgPnl, 2), 0) / bot.pnlHistory.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev > 0 ? avgPnl / stdDev : 0;
    }

    /**
     * Log de sincronização
     */
    private async logSync(champions: ChampionParams[], success: boolean, error?: string): Promise<void> {
        const logEntry = {
            timestamp: new Date().toISOString(),
            champions: champions.map(c => c.botId),
            applied: success,
            error
        };
        
        const logPath = join(process.cwd(), this.SYNC_LOG_FILE);
        await writeFile(logPath, JSON.stringify(logEntry) + '\n', { flag: 'a' });
    }

    /**
     * Executa sync completo
     */
    async executeSync(): Promise<void> {
        console.log('🔄 ChampionsSync: Iniciando sincronização...');
        
        // 1. Identifica campeões
        const champions = await this.identifyChampions();
        
        if (champions.length === 0) {
            console.log('⚠️ Nenhum campeão encontrado para sincronizar');
            return;
        }
        
        // 2. Aplica campeões
        await this.applyChampions(champions);
        
        console.log('✅ ChampionsSync: Sincronização concluída!');
    }

    /**
     * Status do sync
     */
    async getStatus(): Promise<any> {
        return {
            lastSync: this.syncHistory.length > 0 ? this.syncHistory[this.syncHistory.length - 1] : null,
            totalSyncs: this.syncHistory.length,
            successfulSyncs: this.syncHistory.filter(s => s.applied).length,
            failedSyncs: this.syncHistory.filter(s => !s.applied).length
        };
    }
}

// Singleton instance
export const championsSync = new ChampionsSync();
