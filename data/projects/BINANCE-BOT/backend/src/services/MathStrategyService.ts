import { StrategyStorageService } from './StrategyStorageService';

export interface MathStrategy {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    betAmount: number;
    type: 'SIMPLE' | 'ADVANCED';
    leverage?: number;
    tradingType?: 'SPOT' | 'FUTURES';
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    takeProfitPercentage?: number;
    stopLossPercentage?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMathStrategyRequest {
    name: string;
    description: string;
    betAmount: number;
    type: 'SIMPLE' | 'ADVANCED';
}

export class MathStrategyService {
    private storageService: StrategyStorageService;
    private readonly STORAGE_KEY = 'math_strategies';

    constructor() {
        this.storageService = new StrategyStorageService();
    }

    async getAllStrategies(): Promise<MathStrategy[]> {
        try {
            const strategies = await this.storageService.getData<MathStrategy[]>(this.STORAGE_KEY) || [];
            return strategies.sort((a: MathStrategy, b: MathStrategy) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error) {
            console.error('Erro ao buscar estratégias matemáticas:', error);
            return [];
        }
    }

    async createStrategy(data: CreateMathStrategyRequest): Promise<MathStrategy> {
        try {
            const strategies = await this.getAllStrategies();

            const newStrategy: MathStrategy = {
                id: this.generateId(),
                ...data,
                isActive: false, // Nova estratégia sempre inativa
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            strategies.push(newStrategy);
            await this.storageService.saveData(this.STORAGE_KEY, strategies);

            console.log(`✅ Estratégia matemática criada: ${newStrategy.name}`);
            return newStrategy;
        } catch (error) {
            console.error('Erro ao criar estratégia matemática:', error);
            throw new Error('Falha ao criar estratégia matemática');
        }
    }

    async toggleStrategy(strategyId: string): Promise<MathStrategy> {
        try {
            const strategies = await this.getAllStrategies();
            const strategyIndex = strategies.findIndex(s => s.id === strategyId);

            if (strategyIndex === -1) {
                throw new Error('Estratégia não encontrada');
            }

            const strategy = strategies[strategyIndex];

            // Se a estratégia já está ativa, desativa
            if (strategy.isActive) {
                strategy.isActive = false;
                strategy.updatedAt = new Date().toISOString();
                console.log(`🔴 Estratégia matemática desativada: ${strategy.name}`);
            } else {
                // Desativa todas as outras estratégias primeiro
                strategies.forEach(s => {
                    s.isActive = false;
                    s.updatedAt = new Date().toISOString();
                });

                // Ativa a estratégia selecionada
                strategy.isActive = true;
                strategy.updatedAt = new Date().toISOString();
                console.log(`🟢 Estratégia matemática ativada: ${strategy.name}`);
            }

            await this.storageService.saveData(this.STORAGE_KEY, strategies);
            return strategy;
        } catch (error) {
            console.error('Erro ao alternar estratégia matemática:', error);
            throw new Error('Falha ao alternar estratégia matemática');
        }
    }

    async getActiveStrategy(): Promise<MathStrategy | null> {
        try {
            const strategies = await this.getAllStrategies();
            return strategies.find(s => s.isActive) || null;
        } catch (error) {
            console.error('Erro ao buscar estratégia ativa:', error);
            return null;
        }
    }

    async getActiveStrategyBetAmount(): Promise<number> {
        try {
            const activeStrategy = await this.getActiveStrategy();
            return activeStrategy?.betAmount || 5.0; // Valor padrão de $5 (mínimo para Binance)
        } catch (error) {
            console.error('Erro ao buscar valor da aposta:', error);
            return 5.0;
        }
    }

    async initializeDefaultStrategy(): Promise<MathStrategy> {
        try {
            const strategies = await this.getAllStrategies();

            // Se já existe uma estratégia padrão, retorna ela
            const defaultStrategy = strategies.find(s => s.name === 'Estratégia Padrão $5');
            if (defaultStrategy) {
                return defaultStrategy;
            }

            // Cria a estratégia padrão
            const newDefaultStrategy: MathStrategy = {
                id: this.generateId(),
                name: 'Estratégia Padrão $5',
                description: 'Estratégia matemática padrão com aposta mínima de $5.00 (valor mínimo da Binance)',
                betAmount: 5.0,
                type: 'SIMPLE',
                isActive: true, // Estratégia padrão sempre ativa
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            strategies.push(newDefaultStrategy);
            await this.storageService.saveData(this.STORAGE_KEY, strategies);

            console.log(`✅ Estratégia matemática padrão criada: ${newDefaultStrategy.name} com aposta de $${newDefaultStrategy.betAmount}`);
            return newDefaultStrategy;
        } catch (error) {
            console.error('Erro ao criar estratégia matemática padrão:', error);
            throw new Error('Falha ao criar estratégia matemática padrão');
        }
    }

    private generateId(): string {
        return `math_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export default MathStrategyService;
