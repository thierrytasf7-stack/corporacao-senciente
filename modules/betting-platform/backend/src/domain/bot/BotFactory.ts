import { Bot, BotConfig } from './Bot';
import { StrategyFactory } from '../strategies/StrategyFactory';
import { BetStrategyConfig, MathStrategyConfig } from '../strategies';

export interface BotDNA {
  id?: string;
  name: string;
  initialBankroll: number;
  genes: {
    bet: BetStrategyConfig;
    math: MathStrategyConfig;
  };
}

export class BotFactory {
  /**
   * Creates a Bot instance from a DNA configuration
   */
  static createFromDNA(dna: BotDNA): Bot {
    // 1. Validate Strategies
    StrategyFactory.validateConfig(dna.genes.bet);
    StrategyFactory.validateConfig(dna.genes.math);

    // 2. Instantiate Strategies
    const betStrategy = StrategyFactory.createBetStrategy(dna.genes.bet);
    const mathStrategy = StrategyFactory.createMathStrategy(dna.genes.math);

    // 3. Create Bot Config
    const botConfig: BotConfig = {
      id: dna.id,
      name: dna.name,
      initialBankroll: dna.initialBankroll
    };

    // 4. Assemble Bot
    return new Bot(botConfig, betStrategy, mathStrategy);
  }

  /**
   * Generates a population of bots based on variations
   * (Placeholder for Genetic Algorithm logic)
   */
  static generatePopulation(baseDna: BotDNA, count: number): Bot[] {
    const population: Bot[] = [];
    for (let i = 0; i < count; i++) {
        // Clone and mutate logic would go here
        const clone = JSON.parse(JSON.stringify(baseDna));
        clone.name = `${baseDna.name}_gen1_${i}`;
        population.push(this.createFromDNA(clone));
    }
    return population;
  }
}
