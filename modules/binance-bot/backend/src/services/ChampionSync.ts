/**
 * ChampionSync - Sincroniza estratégias campeãs da DNA Arena para Futures Testnet
 * 
 * Fluxo:
 * 1. DNA Arena evolui estratégias (simulação)
 * 2. Identifica campeões (maior fitness)
 * 3. Extrai parâmetros ótimos (TP/SL/Trailing)
 * 4. Aplica nas Futures Strategies (Testnet)
 * 5. Valida performance real
 * 6. Feedback para próxima evolução
 */

import * as fs from 'fs';
import * as path from 'path';

const FUTURES_STRATEGIES_FILE = path.join(__dirname, '../../data/futures-strategies/strategies.json');
const DNA_ARENA_FILE = path.join(__dirname, '../../data/dna-arena/champions.json');
const SYNC_INTERVAL_MS = 600000; // 10 minutos (ajustado de 5min para reduzir overhead)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export interface ChampionConfig {
    botName: string;
    fitness: number;
    tpMultiplier: number;
    slMultiplier: number;
    trailingMultiplier: number;
    leverage: number;
    generation: number;
    winRate: number;
    totalTrades: number;
    groupId?: string;
    bankroll?: number;
    syncedAt?: string;
}

export interface FuturesStrategy {
    id: string;
    name: string;
    isActive: boolean;
    tradingType: 'FUTURES';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    tpMultiplier: number;
    slMultiplier: number;
    trailingMultiplier: number;
    leverage: number;
    sourceBot?: string;
    syncedAt?: string;
}

export class ChampionSync {
    private syncInterval: NodeJS.Timeout | null = null;
    private lastSyncTime: number = 0;
    private syncCount: number = 0;

    /**
     * Inicia sincronização automática
     */
    start(): void {
        console.log('🔄 ChampionSync iniciado - sincronização a cada 5min');
        
        // Sync imediato
        this.synchronize();
        
        // Sync periódico
        this.syncInterval = setInterval(() => {
            this.synchronize();
        }, SYNC_INTERVAL_MS);
    }

    /**
     * Para sincronização
     */
    stop(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('🛑 ChampionSync parado');
    }

    /**
     * Sincroniza campeões da DNA Arena para Futures Strategies
     */
    synchronize(): void {
        let retryCount = 0;
        
        while (retryCount < MAX_RETRIES) {
            try {
                console.log(`🔄 [ChampionSync] Iniciando sincronização (tentativa ${retryCount + 1}/${MAX_RETRIES})...`);
                
                // 1. Carrega campeões da DNA Arena com validação
                const champions = this.loadChampions();
                if (!champions || champions.length === 0) {
                    console.log('⚠️ [ChampionSync] Nenhum campeão encontrado');
                    return;
                }

                // Valida dados dos campeões
                const validation = this.validateChampions(champions);
                if (!validation.isValid) {
                    throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
                }

                // 2. Identifica top 5 campeões
                const topChampions = champions
                    .sort((a, b) => b.fitness - a.fitness)
                    .slice(0, 5);

                console.log(`🏆 [ChampionSync] Top ${topChampions.length} campeões identificados`);

                // 3. Carrega Futures Strategies atuais
                const currentStrategies = this.loadFuturesStrategies();

                // 4. Atualiza estratégias com parâmetros dos campeões
                const updatedStrategies = this.applyChampionConfigs(currentStrategies, topChampions);

                // 5. Salva estratégias atualizadas (atomic write)
                this.saveFuturesStrategiesAtomic(updatedStrategies);

                // 6. Log de sincronização
                this.logSync(topChampions);

                this.lastSyncTime = Date.now();
                this.syncCount++;

                console.log(`✅ [ChampionSync] Sincronização concluída (${this.syncCount} total)`);
                return; // Sucesso, sai do loop

            } catch (error) {
                retryCount++;
                console.error(`❌ [ChampionSync] Erro na sincronização (tentativa ${retryCount}/${MAX_RETRIES}):`, error);
                
                if (retryCount >= MAX_RETRIES) {
                    console.error('❌ [ChampionSync] Máximo de tentativas atingido. Sincronização falhou.');
                } else {
                    console.log(`⏳ [ChampionSync] Aguardando ${RETRY_DELAY_MS / 1000}s para próxima tentativa...`);
                    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                    // Em ambiente síncrono, usamos setTimeout assíncrono
                    setTimeout(() => {}, RETRY_DELAY_MS);
                }
            }
        }
    }

    /**
     * Carrega campeões da DNA Arena
     */
    private loadChampions(): ChampionConfig[] {
        try {
            if (!fs.existsSync(DNA_ARENA_FILE)) {
                // Cria arquivo vazio se não existir
                this.ensureDirectoryExists(DNA_ARENA_FILE);
                fs.writeFileSync(DNA_ARENA_FILE, JSON.stringify([], null, 2));
                return [];
            }

            const data = fs.readFileSync(DNA_ARENA_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ [ChampionSync] Erro ao carregar campeões:', error);
            return [];
        }
    }

    /**
     * Carrega Futures Strategies
     */
    private loadFuturesStrategies(): FuturesStrategy[] {
        try {
            if (!fs.existsSync(FUTURES_STRATEGIES_FILE)) {
                // Cria estratégias padrão se não existirem
                const defaultStrategies = this.createDefaultFuturesStrategies();
                this.ensureDirectoryExists(FUTURES_STRATEGIES_FILE);
                fs.writeFileSync(FUTURES_STRATEGIES_FILE, JSON.stringify(defaultStrategies, null, 2));
                return defaultStrategies;
            }

            const data = fs.readFileSync(FUTURES_STRATEGIES_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ [ChampionSync] Erro ao carregar futures strategies:', error);
            return this.createDefaultFuturesStrategies();
        }
    }

    /**
     * Cria Futures Strategies padrão
     */
    private createDefaultFuturesStrategies(): FuturesStrategy[] {
        const strategies: FuturesStrategy[] = [
            {
                id: 'futures_champion_001',
                name: 'DNA Champion #1',
                isActive: true,
                tradingType: 'FUTURES',
                riskLevel: 'MEDIUM',
                tpMultiplier: 2.0,
                slMultiplier: 1.0,
                trailingMultiplier: 1.5,
                leverage: 20
            },
            {
                id: 'futures_champion_002',
                name: 'DNA Champion #2',
                isActive: true,
                tradingType: 'FUTURES',
                riskLevel: 'MEDIUM',
                tpMultiplier: 2.5,
                slMultiplier: 1.2,
                trailingMultiplier: 1.8,
                leverage: 25
            },
            {
                id: 'futures_champion_003',
                name: 'DNA Champion #3',
                isActive: true,
                tradingType: 'FUTURES',
                riskLevel: 'HIGH',
                tpMultiplier: 3.0,
                slMultiplier: 1.5,
                trailingMultiplier: 2.0,
                leverage: 30
            },
            {
                id: 'futures_champion_004',
                name: 'DNA Champion #4',
                isActive: true,
                tradingType: 'FUTURES',
                riskLevel: 'LOW',
                tpMultiplier: 2.0,
                slMultiplier: 0.8,
                trailingMultiplier: 1.0,
                leverage: 15
            },
            {
                id: 'futures_champion_005',
                name: 'DNA Champion #5',
                isActive: true,
                tradingType: 'FUTURES',
                riskLevel: 'MEDIUM',
                tpMultiplier: 3.5,
                slMultiplier: 1.8,
                trailingMultiplier: 2.5,
                leverage: 35
            }
        ];

        return strategies;
    }

    /**
     * Aplica configurações dos campeões nas estratégias
     */
    private applyChampionConfigs(
        strategies: FuturesStrategy[],
        champions: ChampionConfig[]
    ): FuturesStrategy[] {
        // Aplica top 5 campeões nas 5 estratégias
        for (let i = 0; i < Math.min(strategies.length, champions.length); i++) {
            const champion = champions[i];
            const strategy = strategies[i];

            // Atualiza parâmetros
            strategy.tpMultiplier = champion.tpMultiplier;
            strategy.slMultiplier = champion.slMultiplier;
            strategy.trailingMultiplier = champion.trailingMultiplier;
            strategy.leverage = champion.leverage;
            strategy.sourceBot = champion.botName;
            strategy.syncedAt = new Date().toISOString();

            console.log(`  📊 [ChampionSync] ${strategy.name}:`);
            console.log(`     └─ Bot: ${champion.botName} (Gen ${champion.generation})`);
            console.log(`     └─ Fitness: ${champion.fitness.toFixed(1)}`);
            console.log(`     └─ TP: ${champion.tpMultiplier}xATR`);
            console.log(`     └─ SL: ${champion.slMultiplier}xATR`);
            console.log(`     └─ Trailing: ${champion.trailingMultiplier}xATR`);
            console.log(`     └─ Leverage: ${champion.leverage}x`);
            console.log(`     └─ Win Rate: ${(champion.winRate * 100).toFixed(1)}%`);
        }

        return strategies;
    }

    /**
     * Valida dados dos campeões
     */
    private validateChampions(champions: ChampionConfig[]): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        for (let i = 0; i < champions.length; i++) {
            const champ = champions[i];
            
            // Campos obrigatórios
            if (!champ.botName) errors.push(`Campeão ${i}: botName ausente`);
            
            // Fitness pode ser 0 (bots novos sem trades)
            if (champ.fitness < 0) errors.push(`Campeão ${i}: fitness negativo (${champ.fitness})`);
            
            // Multiplicadores devem ser positivos
            if (!champ.tpMultiplier || champ.tpMultiplier <= 0) errors.push(`Campeão ${i}: tpMultiplier inválido`);
            if (!champ.slMultiplier || champ.slMultiplier <= 0) errors.push(`Campeão ${i}: slMultiplier inválido`);
            if (champ.trailingMultiplier < 0) errors.push(`Campeão ${i}: trailingMultiplier negativo`);
            if (!champ.leverage || champ.leverage <= 0) errors.push(`Campeão ${i}: leverage inválido`);
            
            // Valida ranges razoáveis
            if (champ.tpMultiplier > 10) errors.push(`Campeão ${i}: tpMultiplier muito alto (${champ.tpMultiplier})`);
            if (champ.slMultiplier > 5) errors.push(`Campeão ${i}: slMultiplier muito alto (${champ.slMultiplier})`);
            if (champ.leverage > 125) errors.push(`Campeão ${i}: leverage muito alto (${champ.leverage})`);
            if (champ.winRate < 0 || champ.winRate > 1) errors.push(`Campeão ${i}: winRate fora de range (${champ.winRate})`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Salva Futures Strategies com atomic write (previne race conditions)
     */
    private saveFuturesStrategiesAtomic(strategies: FuturesStrategy[]): void {
        const tempFile = FUTURES_STRATEGIES_FILE + '.tmp';
        const backupFile = FUTURES_STRATEGIES_FILE + '.bak';
        
        try {
            // 1. Cria backup do arquivo atual
            if (fs.existsSync(FUTURES_STRATEGIES_FILE)) {
                fs.copyFileSync(FUTURES_STRATEGIES_FILE, backupFile);
            }
            
            // 2. Escreve em arquivo temporário
            fs.writeFileSync(tempFile, JSON.stringify(strategies, null, 2), 'utf-8');
            
            // 3. Rename atômico (atomic operation)
            fs.renameSync(tempFile, FUTURES_STRATEGIES_FILE);
            
            // 4. Remove backup após sucesso
            if (fs.existsSync(backupFile)) {
                fs.unlinkSync(backupFile);
            }
            
            console.log('💾 [ChampionSync] Estratégias salvas com sucesso (atomic write)');
            
        } catch (error) {
            console.error('❌ [ChampionSync] Erro ao salvar estratégias:', error);
            
            // 5. Rollback: restaura backup se existir
            if (fs.existsSync(backupFile)) {
                fs.copyFileSync(backupFile, FUTURES_STRATEGIES_FILE);
                console.log('🔄 [ChampionSync] Rollback realizado com sucesso');
            }
            
            // 6. Limpa arquivo temporário se existir
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            
            throw error;
        }
    }

    /**
     * Salva Futures Strategies atualizadas (legacy - usar saveFuturesStrategiesAtomic)
     */
    private saveFuturesStrategies(strategies: FuturesStrategy[]): void {
        this.saveFuturesStrategiesAtomic(strategies);
    }

    /**
     * Garante que diretório existe
     */
    private ensureDirectoryExists(filePath: string): void {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * Log de sincronização
     */
    private logSync(champions: ChampionConfig[]): void {
        const logFile = path.join(__dirname, '../logs/champion-sync.log');
        this.ensureDirectoryExists(logFile);

        const logEntry = {
            timestamp: new Date().toISOString(),
            syncCount: this.syncCount,
            championsCount: champions.length,
            topChampion: champions[0],
            avgFitness: champions.reduce((sum, c) => sum + c.fitness, 0) / champions.length
        };

        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }

    /**
     * Obtém status da sincronização
     */
    getStatus(): any {
        return {
            isRunning: this.syncInterval !== null,
            lastSyncTime: this.lastSyncTime,
            syncCount: this.syncCount,
            nextSyncIn: this.syncInterval ? SYNC_INTERVAL_MS / 1000 : 0
        };
    }
}

// Singleton instance
export const championSync = new ChampionSync();
