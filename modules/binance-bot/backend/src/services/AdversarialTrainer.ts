/**
 * AdversarialTrainer - Treinamento Adversário
 * 
 * Cria cenários adversos para fortalecer bots:
 * - Scenario generator
 * - Decision challenger (advogado do diabo)
 * - Stress tester
 */

export interface AdversarialScenario {
    id: string;
    type: 'FLASH_CRASH' | 'PUMP_DUMP' | 'SIDEWAYS' | 'VOLATILITY_SPIKE' | 'LIQUIDITY_CRISIS';
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    parameters: { [key: string]: number };
    expectedBehavior: string;
}

export interface StressTestResult {
    scenario: string;
    passed: boolean;
    score: number;        // 0-100
    weaknesses: string[];
    recommendations: string[];
    timestamp: number;
}

export interface DecisionChallenge {
    decision: string;
    challenge: string;
    counterArguments: string[];
    confidence: number;
    recommendation: 'PROCEED' | 'RECONSIDER' | 'ABORT';
}

export class AdversarialTrainer {
    // Cenários disponíveis
    private scenarios: AdversarialScenario[] = [
        {
            id: 'flash_crash',
            type: 'FLASH_CRASH',
            description: 'Queda de 10% em 5 minutos',
            severity: 'CRITICAL',
            parameters: { priceDrop: 0.10, timeWindow: 300, volume: 5.0 },
            expectedBehavior: 'Reduzir exposição, ativar circuit breaker'
        },
        {
            id: 'pump_dump',
            type: 'PUMP_DUMP',
            description: 'Alta de 20% seguida de queda de 15%',
            severity: 'HIGH',
            parameters: { priceRise: 0.20, priceDrop: 0.15, timeWindow: 600 },
            expectedBehavior: 'Não perseguir alta, proteger lucros'
        },
        {
            id: 'volatility_spike',
            type: 'VOLATILITY_SPIKE',
            description: 'Volatilidade 3x acima da média',
            severity: 'HIGH',
            parameters: { volatilityMultiplier: 3.0, duration: 1800 },
            expectedBehavior: 'Reduzir tamanho de posição, ampliar stops'
        },
        {
            id: 'liquidity_crisis',
            type: 'LIQUIDITY_CRISIS',
            description: 'Spread 5x acima do normal',
            severity: 'MEDIUM',
            parameters: { spreadMultiplier: 5.0, duration: 3600 },
            expectedBehavior: 'Evitar entries, priorizar exits'
        }
    ];
    
    // Histórico de stress tests
    private stressTestHistory: StressTestResult[] = [];
    
    /**
     * Gera cenário adverso
     */
    generateScenario(type?: AdversarialScenario['type']): AdversarialScenario {
        if (type) {
            return this.scenarios.find(s => s.type === type) || this.scenarios[0];
        }
        
        // Random scenario
        return this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
    }
    
    /**
     * Desafia decisão (advogado do diabo)
     */
    challengeDecision(params: {
        symbol: string;
        direction: 'LONG' | 'SHORT';
        betSize: number;
        reasoning: string;
        confidence: number;
    }): DecisionChallenge {
        const counterArguments: string[] = [];
        let recommendation: 'PROCEED' | 'RECONSIDER' | 'ABORT' = 'PROCEED';
        
        // Challenge 1: E se estiver errado?
        counterArguments.push(`E se a direção estiver incorreta? Qual o plano de saída?`);
        
        // Challenge 2: Tamanho da posição
        if (params.betSize > 3) {
            counterArguments.push(`Posição grande (${params.betSize}%). Considere reduzir para 1-2%.`);
            recommendation = 'RECONSIDER';
        }
        
        // Challenge 3: Confiança baixa
        if (params.confidence < 0.6) {
            counterArguments.push(`Confiança baixa (${(params.confidence * 100).toFixed(0)}%). Por que entrar?`);
            recommendation = 'RECONSIDER';
        }
        
        // Challenge 4: Condições de mercado
        counterArguments.push(`As condições de mercado atuais favorecem esta estratégia?`);
        
        // Challenge 5: Opportunity cost
        counterArguments.push(`Existe oportunidade melhor em outro símbolo?`);
        
        // Determina recomendação final
        if (params.confidence < 0.4 || params.betSize > 5) {
            recommendation = 'ABORT';
        }
        
        return {
            decision: `${params.direction} ${params.symbol}`,
            challenge: 'Advogado do diablo: 5 razões para NÃO entrar',
            counterArguments,
            confidence: params.confidence,
            recommendation
        };
    }
    
    /**
     * Executa stress test
     */
    stressTest(botConfig: any, scenario?: AdversarialScenario): StressTestResult {
        const testScenario = scenario || this.generateScenario();
        
        console.log(`🧪 Stress Test: ${testScenario.description} (${testScenario.severity})`);
        
        // Simula cenário
        const result = this.simulateScenario(botConfig, testScenario);
        
        // Salva histórico
        this.stressTestHistory.push(result);
        
        return result;
    }
    
    /**
     * Simula cenário
     */
    private simulateScenario(botConfig: any, scenario: AdversarialScenario): StressTestResult {
        const weaknesses: string[] = [];
        const recommendations: string[] = [];
        let score = 100;
        
        // Simulação baseada no tipo de cenário
        switch (scenario.type) {
            case 'FLASH_CRASH':
                if (!botConfig.circuitBreaker) {
                    weaknesses.push('Sem circuit breaker para flash crash');
                    score -= 30;
                }
                if (botConfig.stopLoss < 0.05) {
                    weaknesses.push('Stop loss muito apertado para volatilidade extrema');
                    score -= 20;
                }
                recommendations.push('Adicionar circuit breaker de 5%/hora');
                recommendations.push('Ampliar stop loss em cenários de alta volatilidade');
                break;
                
            case 'PUMP_DUMP':
                if (botConfig.chaseMomentum) {
                    weaknesses.push('Tendência a perseguir momentum (risco de pump & dump)');
                    score -= 25;
                }
                recommendations.push('Evitar entries após alta > 10% em 1h');
                recommendations.push('Implementar trailing stop agressivo');
                break;
                
            case 'VOLATILITY_SPIKE':
                if (botConfig.positionSize > 3) {
                    weaknesses.push('Posições muito grandes para alta volatilidade');
                    score -= 20;
                }
                recommendations.push('Reduzir posição em 50% quando volatilidade > 2x');
                break;
                
            case 'LIQUIDITY_CRISIS':
                if (!botConfig.spreadProtection) {
                    weaknesses.push('Sem proteção contra spread alto');
                    score -= 15;
                }
                recommendations.push('Evitar entries quando spread > 3x média');
                break;
        }
        
        const passed = score >= 70;
        
        return {
            scenario: scenario.id,
            passed,
            score: Math.max(0, score),
            weaknesses,
            recommendations,
            timestamp: Date.now()
        };
    }
    
    /**
     * Obtém histórico de stress tests
     */
    getStressTestHistory(limit: number = 10): StressTestResult[] {
        return this.stressTestHistory.slice(-limit);
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        const totalTests = this.stressTestHistory.length;
        const passedTests = this.stressTestHistory.filter(t => t.passed).length;
        const avgScore = totalTests > 0
            ? this.stressTestHistory.reduce((sum, t) => sum + t.score, 0) / totalTests
            : 0;
        
        return {
            totalScenarios: this.scenarios.length,
            totalTests,
            passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) / 100 : 0,
            avgScore: Math.round(avgScore * 100) / 100,
            recentTests: this.getStressTestHistory(5)
        };
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.stressTestHistory = [];
        console.log('⚔️ Adversarial Trainer resetado');
    }
}

// Singleton instance
export const adversarialTrainer = new AdversarialTrainer();
