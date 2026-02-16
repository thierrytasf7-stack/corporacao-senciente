import { SpotStrategy } from '../types/SpotStrategy';
import { SpotStrategyStorageService } from './SpotStrategyStorageService';

export class SpotStrategyService {
    private static instance: SpotStrategyService;
    private strategies: Map<string, SpotStrategy> = new Map();
    private storageService: SpotStrategyStorageService;

    private constructor() {
        this.storageService = new SpotStrategyStorageService();

        // Carregar estratégias salvas primeiro
        this.loadStrategiesSync();

        // Se não há estratégias salvas, inicializar com padrões
        if (this.strategies.size === 0) {
            console.log(`📝 [SPOT STRATEGIES] Nenhuma estratégia salva encontrada, inicializando padrões...`);
            this.initializeDefaultStrategies();
            console.log(`✅ [SPOT STRATEGIES] ${this.strategies.size} estratégias padrão inicializadas`);
        } else {
            console.log(`✅ [SPOT STRATEGIES] ${this.strategies.size} estratégias carregadas do storage`);
        }
    }

    public static getInstance(): SpotStrategyService {
        if (!SpotStrategyService.instance) {
            SpotStrategyService.instance = new SpotStrategyService();
        }
        return SpotStrategyService.instance;
    }

    // Método para garantir que as estratégias estejam carregadas
    public ensureStrategiesLoaded(): void {
        if (this.strategies.size === 0) {
            console.log('🔄 [SPOT STRATEGIES] Estratégias não carregadas, reinicializando...');
            this.initializeDefaultStrategies();
        }
    }

    public async loadStrategies(): Promise<void> {
        try {
            const savedStrategies = await this.storageService.loadStrategies();
            if (savedStrategies && Array.isArray(savedStrategies)) {
                console.log(`📝 [SPOT STRATEGIES] Carregando ${savedStrategies.length} estratégias salvas...`);
                // Só sobrescrever se não há estratégias na memória
                if (this.strategies.size === 0) {
                    savedStrategies.forEach((strategy: SpotStrategy) => {
                        this.strategies.set(strategy.id, strategy);
                    });
                    console.log(`✅ [SPOT STRATEGIES] ${savedStrategies.length} estratégias carregadas com sucesso!`);
                } else {
                    // Atualizar apenas estratégias existentes com dados salvos
                    savedStrategies.forEach((strategy: SpotStrategy) => {
                        if (this.strategies.has(strategy.id)) {
                            this.strategies.set(strategy.id, strategy);
                        }
                    });
                    console.log(`📝 [SPOT STRATEGIES] Estratégias existentes atualizadas com dados salvos`);
                }
            } else {
                console.log(`📝 [SPOT STRATEGIES] Nenhuma estratégia salva encontrada, usando padrões...`);
            }
        } catch (error) {
            console.error(`❌ [SPOT STRATEGIES] Erro ao carregar estratégias:`, error);
            console.log(`📝 [SPOT STRATEGIES] Usando estratégias padrão...`);
        }
    }

    private loadStrategiesSync(): void {
        try {
            const savedStrategies = this.storageService.loadStrategiesSync();
            if (savedStrategies && Array.isArray(savedStrategies)) {
                console.log(`📝 [SPOT STRATEGIES] Carregando ${savedStrategies.length} estratégias salvas...`);
                // Sempre carregar estratégias salvas (sobrescrever padrões)
                this.strategies.clear();
                savedStrategies.forEach((strategy: SpotStrategy) => {
                    this.strategies.set(strategy.id, strategy);
                });
                console.log(`✅ [SPOT STRATEGIES] ${savedStrategies.length} estratégias carregadas com sucesso!`);
            } else {
                console.log(`📝 [SPOT STRATEGIES] Nenhuma estratégia salva encontrada, usando padrões...`);
            }
        } catch (error) {
            console.error(`❌ [SPOT STRATEGIES] Erro ao carregar estratégias:`, error);
            console.log(`📝 [SPOT STRATEGIES] Usando estratégias padrão...`);
        }
    }

    private async saveStrategies(): Promise<void> {
        try {
            const strategiesArray = Array.from(this.strategies.values());
            await this.storageService.saveStrategies(strategiesArray);
            console.log(`💾 [SPOT STRATEGIES] ${strategiesArray.length} estratégias salvas com sucesso!`);
        } catch (error) {
            console.error(`❌ [SPOT STRATEGIES] Erro ao salvar estratégias:`, error);
        }
    }

    private initializeDefaultStrategies(): void {
        const now = new Date().toISOString();

        // Estratégia 1: RSI Momentum (30min)
        const rsiMomentum: SpotStrategy = {
            id: 'spot_rsi_momentum_001',
            name: 'RSI Momentum 30min',
            description: `📋 Detalhamento da Lógica de Força do RSI Momentum 1min

🎯 CONCEITO CENTRAL:
A estratégia RSI Momentum combina reversão de sobrevenda com aceleração de momentum. Identifica pontos onde o preço estava muito baixo (RSI < 30) e agora está acelerando para cima.

🔍 ANÁLISE TÉCNICA DETALHADA:
• RSI(14): Indicador de momentum relativo (0-100)
• Sobrevenda: RSI < 30 (preço muito baixo)
• Reversão: RSI cruza acima de 30
• Momentum: Aceleração do RSI em direção a 50+
• Confirmação: RSI > 50 com tendência crescente

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: RSI > 70 (sobrecompra) → Aguardar correção
• 21-40%: RSI 50-70 (neutro-alto) → Monitorar
• 41-60%: RSI 30-50 (recuperação) → Preparar entrada
• 61-80%: RSI < 30 + cruzamento → Sinal forte
• 81-95%: RSI < 30 + momentum crescente → Sinal muito forte
• 96-100%: RSI < 30 + aceleração + confirmação → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. RSI(14) < 30 (zona de sobrevenda)
2. RSI cruza acima de 30 (reversão)
3. Momentum crescente (ROC > 0)
4. Confirmação com RSI > 50 em 3 velas
5. Volume crescente (confirmação)
6. Stop Loss: Último swing low
7. Take Profit: R:R ≥ 1.5

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'CONSERVATIVE',
            tradingType: 'SPOT',
            riskLevel: 'LOW',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 2: Bollinger Squeeze (30min)
        const bollingerSqueeze: SpotStrategy = {
            id: 'spot_bollinger_squeeze_002',
            name: 'Bollinger Squeeze 1min',
            description: `📋 Detalhamento da Lógica de Força do Bollinger Squeeze 1min

🎯 CONCEITO CENTRAL:
A estratégia Bollinger Squeeze identifica períodos de baixa volatilidade (compressão das bandas) seguidos de breakouts explosivos. Baseada no princípio de que após consolidação, o preço tende a se mover significativamente.

🔍 ANÁLISE TÉCNICA DETALHADA:
• Bandas de Bollinger (20, 2): SMA de 20 períodos ± 2 desvios padrão
• Compressão: Largura das bandas < 70% da média histórica
• Posição do Preço: Localização dentro das bandas (0-100%)
• Breakout: Rompimento da banda superior com confirmação de volume

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: Bandas normais, preço no meio → Aguardar compressão
• 21-40%: Compressão leve (1.5-2.0x), preço central → Monitorar
• 41-60%: Compressão moderada (2.0-2.5x), preço baixo → Preparar entrada
• 61-80%: Compressão forte (2.5-3.0x), preço < 30% → Sinal forte
• 81-95%: Compressão extrema (3.0x+), preço < 20% → Sinal muito forte
• 96-100%: Breakout confirmado com volume → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. Compressão das bandas ≥ 2.0x (bandas muito próximas)
2. Preço na parte inferior < 30% das bandas
3. Volume atual ≥ 1.5x do volume médio (20 períodos)
4. Confirmação de breakout da banda superior
5. RSI(14) < 70 (evitar sobrecompra)
6. Stop Loss: Banda inferior
7. Take Profit: R:R ≥ 2.0 (risco:retorno)

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'MODERATE',
            tradingType: 'SPOT',
            riskLevel: 'MEDIUM',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 3: MACD Crossover (30min)
        const macdCrossover: SpotStrategy = {
            id: 'spot_macd_crossover_003',
            name: 'MACD Crossover 1min',
            description: `📋 Detalhamento da Lógica de Força do MACD Crossover 1min

🎯 CONCEITO CENTRAL:
A estratégia MACD Crossover identifica cruzamentos bullish entre a linha MACD e a linha de sinal, especialmente quando acompanhados de momentum crescente e posição acima da linha zero.

🔍 ANÁLISE TÉCNICA DETALHADA:
• MACD(12, 26, 9): Diferença entre EMA rápida e lenta
• Linha de Sinal: EMA(9) da linha MACD
• Histograma: Diferença entre MACD e Signal
• Cruzamento Bullish: MACD cruza acima da Signal
• Confirmação: Posição acima de zero + histograma crescente

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: MACD < Signal, abaixo de zero → Aguardar reversão
• 21-40%: MACD < Signal, acima de zero → Monitorar
• 41-60%: MACD > Signal, abaixo de zero → Preparar entrada
• 61-80%: MACD > Signal, acima de zero → Sinal forte
• 81-95%: Cruzamento + acima de zero + histograma crescente → Sinal muito forte
• 96-100%: Cruzamento perfeito + confirmação → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. MACD cruza acima da Signal (cruzamento bullish)
2. MACD > 0 (acima da linha zero)
3. Histograma crescente (momentum positivo)
4. Confirmação com volume crescente
5. RSI(14) < 70 (evitar sobrecompra)
6. Stop Loss: Último swing low
7. Take Profit: R:R ≥ 1.8

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'MODERATE',
            tradingType: 'SPOT',
            riskLevel: 'MEDIUM',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 4: Volume Breakout (30min)
        const volumeBreakout: SpotStrategy = {
            id: 'spot_volume_breakout_004',
            name: 'Volume Breakout 1min',
            description: `📋 Detalhamento da Lógica de Força do Volume Breakout 1min

🎯 CONCEITO CENTRAL:
A estratégia Volume Breakout identifica movimentos de preço acompanhados por volume anormalmente alto, indicando forte interesse de compra e potencial continuação da tendência.

🔍 ANÁLISE TÉCNICA DETALHADA:
• Volume Atual vs Volume Médio (20 períodos)
• Breakout de Preço: Rompimento de máximas recentes
• Fator de Volume: Volume atual / Volume médio
• Confirmação: Preço + Volume + Momentum

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: Volume baixo (< 1.0x) → Aguardar atividade
• 21-40%: Volume normal (1.0-1.5x) → Monitorar
• 41-60%: Volume alto (1.5-2.0x) → Preparar entrada
• 61-80%: Volume muito alto (2.0-3.0x) → Sinal forte
• 81-95%: Volume extremo (3.0x+) → Sinal muito forte
• 96-100%: Breakout + volume extremo → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. Volume atual ≥ 2.0x do volume médio (20 períodos)
2. Preço rompe máxima dos últimos 20 períodos
3. Confirmação com momentum crescente
4. RSI(14) < 70 (evitar sobrecompra)
5. Volume crescente em 3 velas consecutivas
6. Stop Loss: Suporte recente
7. Take Profit: R:R ≥ 2.2

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'AGGRESSIVE',
            tradingType: 'SPOT',
            riskLevel: 'HIGH',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 5: Stochastic Oscillator (30min)
        const stochasticOscillator: SpotStrategy = {
            id: 'spot_stochastic_005',
            name: 'Stochastic Oscillator 1min',
            description: `📋 Detalhamento da Lógica de Força do Stochastic Oscillator 1min

🎯 CONCEITO CENTRAL:
A estratégia Stochastic Oscillator identifica cruzamentos bullish em zona de sobrevenda, combinando reversão de momentum com aceleração de preço.

🔍 ANÁLISE TÉCNICA DETALHADA:
• %K(14): Indicador de momentum rápido
• %D(3): Média móvel do %K (suavização)
• Cruzamento Bullish: %K cruza acima de %D
• Zona de Sobrevenda: %K < 20
• Confirmação: %K > %D + momentum crescente

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: %K > %D, zona normal → Aguardar sobrevenda
• 21-40%: %K < %D, zona normal → Monitorar
• 41-60%: %K > %D, zona normal → Preparar entrada
• 61-80%: %K > %D, zona de sobrevenda → Sinal forte
• 81-95%: Cruzamento + sobrevenda + momentum → Sinal muito forte
• 96-100%: Cruzamento perfeito + confirmação → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. %K cruza acima de %D (cruzamento bullish)
2. %K < 20 (zona de sobrevenda)
3. Momentum crescente (%K acelerando)
4. Confirmação com volume crescente
5. RSI(14) < 70 (evitar sobrecompra)
6. Stop Loss: Último swing low
7. Take Profit: R:R ≥ 1.6

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'MODERATE',
            tradingType: 'SPOT',
            riskLevel: 'MEDIUM',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 6: EMA Trend (30min)
        const emaTrend: SpotStrategy = {
            id: 'spot_ema_trend_006',
            name: 'EMA Trend 1min',
            description: `📋 Detalhamento da Lógica de Força do EMA Trend 1min

🎯 CONCEITO CENTRAL:
A estratégia EMA Trend identifica alinhamentos bullish de múltiplas médias móveis exponenciais, indicando forte tendência de alta com momentum crescente.

🔍 ANÁLISE TÉCNICA DETALHADA:
• EMA(8): Tendência de curto prazo
• EMA(21): Tendência de médio prazo
• EMA(50): Tendência de longo prazo
• Alinhamento Bullish: EMA(8) > EMA(21) > EMA(50)
• Confirmação: Preço acima de todas as EMAs

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: EMAs desalinhadas → Aguardar alinhamento
• 21-40%: EMA(8) > EMA(21) → Monitorar
• 41-60%: EMA(8) > EMA(21) > EMA(50) → Preparar entrada
• 61-80%: Alinhamento + preço acima → Sinal forte
• 81-95%: Alinhamento perfeito + momentum → Sinal muito forte
• 96-100%: Alinhamento + confirmação → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. EMA(8) > EMA(21) > EMA(50) (alinhamento bullish)
2. Preço acima de todas as EMAs
3. EMA(8) com inclinação positiva
4. Confirmação com volume crescente
5. RSI(14) < 70 (evitar sobrecompra)
6. Stop Loss: EMA(21)
7. Take Profit: R:R ≥ 1.7

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'CONSERVATIVE',
            tradingType: 'SPOT',
            riskLevel: 'LOW',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 7: Williams %R (30min)
        const williamsR: SpotStrategy = {
            id: 'spot_williams_r_007',
            name: 'Williams %R 1min',
            description: `📋 Detalhamento da Lógica de Força do Williams %R 1min

🎯 CONCEITO CENTRAL:
A estratégia Williams %R identifica reversões de sobrevenda com momentum crescente, similar ao RSI mas com foco em posição relativa dentro do range de preços.

🔍 ANÁLISE TÉCNICA DETALHADA:
• Williams %R(14): Posição relativa no range (0 a -100)
• Sobrevenda: %R < -80 (preço muito baixo)
• Reversão: %R cruza acima de -80
• Momentum: %R acelerando em direção a -50
• Confirmação: %R > -50 com tendência crescente

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: %R > -20 (sobrecompra) → Aguardar correção
• 21-40%: %R -20 a -50 (neutro) → Monitorar
• 41-60%: %R -50 a -80 (recuperação) → Preparar entrada
• 61-80%: %R < -80 + cruzamento → Sinal forte
• 81-95%: %R < -80 + momentum crescente → Sinal muito forte
• 96-100%: %R < -80 + aceleração + confirmação → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. Williams %R(14) < -80 (zona de sobrevenda)
2. %R cruza acima de -80 (reversão)
3. Momentum crescente (%R acelerando)
4. Confirmação com %R > -50
5. Volume crescente (confirmação)
6. Stop Loss: Último swing low
7. Take Profit: R:R ≥ 1.4

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'CONSERVATIVE',
            tradingType: 'SPOT',
            riskLevel: 'LOW',
            createdAt: now,
            updatedAt: now
        };

        // Estratégia 8: CCI Cyclical (30min)
        const cciCyclical: SpotStrategy = {
            id: 'spot_cci_cyclical_008',
            name: 'CCI Cyclical 1min',
            description: `📋 Detalhamento da Lógica de Força do CCI Cyclical 1min

🎯 CONCEITO CENTRAL:
A estratégia CCI Cyclical identifica reversões de sobrevenda com momentum crescente, usando o Commodity Channel Index para detectar desvios significativos da média.

🔍 ANÁLISE TÉCNICA DETALHADA:
• CCI(14): Desvio da média em desvios padrão
• Sobrevenda: CCI < -100 (desvio significativo)
• Reversão: CCI cruza acima de -100
• Momentum: CCI acelerando em direção a 0
• Confirmação: CCI > 0 com tendência crescente

📊 ESCALA DE FORÇA (0-100%):
• 0-20%: CCI > 100 (sobrecompra) → Aguardar correção
• 21-40%: CCI 0 a 100 (neutro-alto) → Monitorar
• 41-60%: CCI -100 a 0 (recuperação) → Preparar entrada
• 61-80%: CCI < -100 + cruzamento → Sinal forte
• 81-95%: CCI < -100 + momentum crescente → Sinal muito forte
• 96-100%: CCI < -100 + aceleração + confirmação → Execução imediata

🎯 CONDIÇÕES DE COMPRA ESPECÍFICAS:
1. CCI(14) < -100 (zona de sobrevenda)
2. CCI cruza acima de -100 (reversão)
3. Momentum crescente (CCI acelerando)
4. Confirmação com CCI > 0
5. Volume crescente (confirmação)
6. Stop Loss: Último swing low
7. Take Profit: R:R ≥ 1.3

⚡ GATILHOS DE EXECUÇÃO:
• Sinal ≥ 90%: Execução automática imediata
• Sinal 80-89%: Execução com confirmação adicional
• Sinal < 80%: Aguardar melhores condições

🔄 GESTÃO DE RISCO:
• Cooldown: 15 minutos por moeda
• Apenas mercados favoritos
• Verificação de histórico recente
• Progressão lógica baseada em condições de mercado`,
            isActive: true,
            isFavorite: false,
            type: 'CONSERVATIVE',
            tradingType: 'SPOT',
            riskLevel: 'LOW',
            createdAt: now,
            updatedAt: now
        };

        // Adicionar todas as estratégias
        this.strategies.set(rsiMomentum.id, rsiMomentum);
        this.strategies.set(bollingerSqueeze.id, bollingerSqueeze);
        this.strategies.set(macdCrossover.id, macdCrossover);
        this.strategies.set(volumeBreakout.id, volumeBreakout);
        this.strategies.set(stochasticOscillator.id, stochasticOscillator);
        this.strategies.set(emaTrend.id, emaTrend);
        this.strategies.set(williamsR.id, williamsR);
        this.strategies.set(cciCyclical.id, cciCyclical);

        console.log(`✅ [SPOT STRATEGIES] ${this.strategies.size} estratégias inicializadas com sucesso!`);
    }

    public getAllStrategies(): SpotStrategy[] {
        return Array.from(this.strategies.values());
    }

    public getStrategyById(id: string): SpotStrategy | undefined {
        return this.strategies.get(id);
    }

    public async toggleFavorite(id: string): Promise<boolean> {
        console.log(`🔍 [SPOT STRATEGIES] Toggle favorite chamado para ID: ${id}`);
        console.log(`📊 [SPOT STRATEGIES] Estratégias na memória: ${this.strategies.size}`);

        // Sempre garantir que as estratégias estejam carregadas
        if (this.strategies.size === 0) {
            console.log('🔄 [SPOT STRATEGIES] Estratégias não carregadas, inicializando padrões...');
            this.initializeDefaultStrategies();
        }

        const strategy = this.strategies.get(id);
        if (!strategy) {
            console.error(`❌ [SPOT STRATEGIES] Estratégia ${id} não encontrada`);
            console.log(`📋 [SPOT STRATEGIES] IDs disponíveis:`, Array.from(this.strategies.keys()));
            console.log(`📋 [SPOT STRATEGIES] Total de estratégias:`, this.strategies.size);
            return false;
        }

        const previousState = strategy.isFavorite;
        strategy.isFavorite = !strategy.isFavorite;
        strategy.updatedAt = new Date().toISOString();

        console.log(`⭐ [SPOT STRATEGIES] Estratégia ${strategy.name} ${strategy.isFavorite ? 'adicionada aos' : 'removida dos'} favoritos (era: ${previousState})`);

        // Salvar de forma síncrona para garantir persistência
        try {
            await this.saveStrategies();
            console.log(`💾 [SPOT STRATEGIES] Estado salvo com sucesso`);
        } catch (error) {
            console.error(`❌ [SPOT STRATEGIES] Erro ao salvar estratégias:`, error);
        }

        return strategy.isFavorite;
    }

    public getFavoriteStrategies(): SpotStrategy[] {
        return Array.from(this.strategies.values()).filter(strategy => strategy.isFavorite);
    }

    public async updateStrategy(strategy: SpotStrategy): Promise<boolean> {
        try {
            this.strategies.set(strategy.id, strategy);
            await this.saveStrategies();
            console.log(`✅ [SPOT STRATEGIES] Estratégia ${strategy.name} atualizada com sucesso!`);
            return true;
        } catch (error) {
            console.error(`❌ [SPOT STRATEGIES] Erro ao atualizar estratégia:`, error);
            return false;
        }
    }
}