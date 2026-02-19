/**
 * ChampionSync Multi-Ambiente
 * Sincroniza campeões da DNA Arena para todos os ambientes
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

// Arquivos de campeões por ambiente
const CHAMPIONS_FILES = {
    'testnet-futures': 'testnet-futures-champions.json',
    'testnet-spot': 'testnet-spot-champions.json',
    'mainnet-futures': 'mainnet-futures-champions.json',
    'mainnet-spot': 'mainnet-spot-champions.json'
};

// DNA Arena V1 (fonte dos campeões)
const DNA_ARENA_FILE = path.join(DATA_DIR, 'DNA-ARENA', 'champions.json');

// Futures Strategies (legado)
const FUTURES_STRATEGIES_FILE = path.join(DATA_DIR, 'futures-strategies', 'strategies.json');

export interface ChampionData {
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
}

export interface EnvironmentChampion {
    id: string;
    name: string;
    environment: string;
    isActive: boolean;
    tradingType: 'FUTURES' | 'SPOT';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    tpMultiplier?: number;
    slMultiplier?: number;
    trailingMultiplier?: number;
    tpPercent?: number;
    slPercent?: number;
    leverage: number;
    sourceBot: string;
    sourceGeneration: number;
    fitness: number;
    winRate: number;
    totalTrades: number;
    validationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    syncedAt: string;
}

export class MultiEnvironmentChampionSync {
    private syncInterval: NodeJS.Timeout | null = null;
    private environments = Object.keys(CHAMPIONS_FILES);

    /**
     * Inicia sincronização para todos os ambientes
     */
    start(syncIntervalMs = 600000): void {
        console.log('🔄 Multi-Environment ChampionSync iniciado');
        console.log(`📊 Ambientes: ${this.environments.join(', ')}`);
        console.log(`⏱️  Sync interval: ${syncIntervalMs / 60000}min`);

        // Sync imediato
        this.synchronizeAll();

        // Sync periódico
        this.syncInterval = setInterval(() => {
            this.synchronizeAll();
        }, syncIntervalMs);
    }

    /**
     * Para sincronização
     */
    stop(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('🛑 Multi-Environment ChampionSync parado');
    }

    /**
     * Sincroniza todos os ambientes
     */
    synchronizeAll(): void {
        console.log('\n🔄 [MultiSync] Iniciando sincronização de todos os ambientes...');

        for (const env of this.environments) {
            try {
                this.synchronizeEnvironment(env);
            } catch (error) {
                console.error(`❌ [MultiSync] Erro em ${env}:`, error);
            }
        }

        console.log('✅ [MultiSync] Sincronização completa!\n');
    }

    /**
     * Sincroniza um ambiente específico
     */
    synchronizeEnvironment(environment: string): void {
        console.log(`\n📡 [${environment}] Sincronizando...`);

        // 1. Carrega campeões da DNA Arena
        const dnaChampions = this.loadDNAChampions();
        if (!dnaChampions || dnaChampions.length === 0) {
            console.warn(`⚠️ [${environment}] Nenhum campeão na DNA Arena`);
            return;
        }

        // 2. Seleciona campeões para este ambiente
        const selectedChampions = this.selectChampionsForEnvironment(dnaChampions, environment);

        // 3. Converte para formato do ambiente
        const convertedChampions = this.convertChampions(selectedChampions, environment);

        // 4. Salva no arquivo do ambiente
        this.saveChampions(convertedChampions, environment);

        console.log(`✅ [${environment}] ${convertedChampions.length} campeões sincronizados`);
    }

    /**
     * Carrega campeões da DNA Arena V1
     */
    private loadDNAChampions(): ChampionData[] | null {
        try {
            if (!fs.existsSync(DNA_ARENA_FILE)) {
                console.warn(`⚠️ DNA Arena file not found: ${DNA_ARENA_FILE}`);
                return null;
            }

            const content = fs.readFileSync(DNA_ARENA_FILE, 'utf8');
            const champions = JSON.parse(content);

            console.log(`📊 DNA Arena: ${champions.length} campeões encontrados`);
            return champions;
        } catch (error) {
            console.error('❌ Erro ao carregar DNA Champions:', error);
            return null;
        }
    }

    /**
     * Seleciona campeões baseados nos critérios do ambiente
     */
    private selectChampionsForEnvironment(champions: ChampionData[], environment: string): ChampionData[] {
        let filtered = [...champions];

        // Ordena por fitness
        filtered.sort((a, b) => b.fitness - a.fitness);

        // Critérios por ambiente
        switch (environment) {
            case 'testnet-futures':
                // Testnet: aceita todos os campeões (até 5)
                return filtered.slice(0, 5);

            case 'testnet-spot':
                // Testnet Spot: apenas WR > 50%
                filtered = filtered.filter(c => c.winRate >= 0.50);
                return filtered.slice(0, 5);

            case 'mainnet-futures':
                // Mainnet Futures: WR > 60%, Trades > 10, Leverage reduzido
                filtered = filtered.filter(c => c.winRate >= 0.60 && c.totalTrades >= 10);
                return filtered.slice(0, 4);

            case 'mainnet-spot':
                // Mainnet Spot: WR > 55%, Trades > 10
                filtered = filtered.filter(c => c.winRate >= 0.55 && c.totalTrades >= 10);
                return filtered.slice(0, 4);

            default:
                return filtered.slice(0, 5);
        }
    }

    /**
     * Converte campeões para formato do ambiente
     */
    private convertChampions(champions: ChampionData[], environment: string): EnvironmentChampion[] {
        const isSpot = environment.includes('spot');
        const isMainnet = environment.includes('mainnet');

        return champions.map((champ, index) => {
            const champion: EnvironmentChampion = {
                id: `${environment}-champion-${String(index + 1).padStart(3, '0')}`,
                name: `DNA Champion #${index + 1} - ${champ.botName}${isSpot ? ' (Spot)' : ''}`,
                environment: environment.toUpperCase(),
                isActive: true,
                tradingType: isSpot ? 'SPOT' : 'FUTURES',
                riskLevel: this.calculateRiskLevel(champ, environment),
                leverage: this.calculateLeverage(champ, environment),
                sourceBot: champ.botName,
                sourceGeneration: champ.generation,
                fitness: champ.fitness,
                winRate: champ.winRate,
                totalTrades: champ.totalTrades,
                syncedAt: new Date().toISOString()
            };

            // Adiciona parâmetros específicos
            if (isSpot) {
                champion.tpPercent = this.calculateSpotTP(champ);
                champion.slPercent = this.calculateSpotSL(champ);
            } else {
                champion.tpMultiplier = champ.tpMultiplier;
                champion.slMultiplier = champ.slMultiplier;
                champion.trailingMultiplier = champ.trailingMultiplier;
            }

            // Validação para Mainnet
            if (isMainnet) {
                champion.validationStatus = this.validateForMainnet(champ) ? 'APPROVED' : 'PENDING';
            }

            return champion;
        });
    }

    /**
     * Calcula nível de risco
     */
    private calculateRiskLevel(champ: ChampionData, environment: string): 'LOW' | 'MEDIUM' | 'HIGH' {
        if (champ.winRate >= 0.75 && champ.totalTrades >= 15) return 'LOW';
        if (champ.winRate >= 0.60 && champ.totalTrades >= 10) return 'MEDIUM';
        return 'HIGH';
    }

    /**
     * Calcula leverage baseado no ambiente
     */
    private calculateLeverage(champ: ChampionData, environment: string): number {
        const isMainnet = environment.includes('mainnet');

        // Mainnet: leverage conservador
        if (isMainnet) {
            if (champ.winRate >= 0.80 && champ.totalTrades >= 50) return 10;
            if (champ.winRate >= 0.70 && champ.totalTrades >= 20) return 5;
            return 3;
        }

        // Testnet: permite leverage original (com limite)
        return Math.min(champ.leverage, 75);
    }

    /**
     * Calcula TP para Spot (percentual maior que Futures)
     */
    private calculateSpotTP(champ: ChampionData): number {
        // Spot: TP = TP Futures * 2 (aproximadamente)
        return Math.round(champ.tpMultiplier * 2 * 10) / 10;
    }

    /**
     * Calcula SL para Spot (percentual maior que Futures)
     */
    private calculateSpotSL(champ: ChampionData): number {
        // Spot: SL = SL Futures * 2.5 (aproximadamente)
        return Math.round(champ.slMultiplier * 2.5 * 10) / 10;
    }

    /**
     * Valida campeão para Mainnet
     */
    private validateForMainnet(champ: ChampionData): boolean {
        // Critérios rigorosos para Mainnet
        return champ.winRate >= 0.60 && champ.totalTrades >= 10 && champ.fitness >= 40;
    }

    /**
     * Salva campeões no arquivo do ambiente
     */
    private saveChampions(champions: EnvironmentChampion[], environment: string): void {
        const fileName = CHAMPIONS_FILES[environment as keyof typeof CHAMPIONS_FILES];
        const filePath = path.join(DATA_DIR, fileName);

        try {
            fs.writeFileSync(filePath, JSON.stringify(champions, null, 2));
            console.log(`💾 [${environment}] Salvos em ${fileName}`);
        } catch (error) {
            console.error(`❌ [${environment}] Erro ao salvar:`, error);
        }
    }

    /**
     * Retorna status de todos os ambientes
     */
    getStatus(): Record<string, any> {
        const status: Record<string, any> = {};

        for (const env of this.environments) {
            try {
                const fileName = CHAMPIONS_FILES[env as keyof typeof CHAMPIONS_FILES];
                const filePath = path.join(DATA_DIR, fileName);

                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const champions = JSON.parse(content);

                    status[env] = {
                        active: champions.filter((c: any) => c.isActive).length,
                        total: champions.length,
                        avgWinRate: (champions.reduce((sum: number, c: any) => sum + c.winRate, 0) / champions.length * 100).toFixed(1) + '%',
                        lastSync: champions[0]?.syncedAt || 'N/A'
                    };
                } else {
                    status[env] = { active: 0, total: 0, error: 'File not found' };
                }
            } catch (error) {
                status[env] = { error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }

        return status;
    }
}

// Export singleton
export const multiChampionSync = new MultiEnvironmentChampionSync();

// CLI para execução manual
if (require.main === module) {
    console.log('🚀 Multi-Environment ChampionSync CLI\n');

    const sync = new MultiEnvironmentChampionSync();
    sync.synchronizeAll();

    console.log('\n📊 Status:');
    console.log(JSON.stringify(sync.getStatus(), null, 2));

    process.exit(0);
}
