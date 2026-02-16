#!/usr/bin/env node
/**
 * Kelly Criterion Calculator
 * Calcula stake ótimo baseado em probabilidade e odds
 *
 * Formula: f* = (bp - q) / b
 * onde:
 *   f* = fração do bankroll a apostar
 *   b = odds decimais - 1
 *   p = probabilidade de ganhar
 *   q = probabilidade de perder (1-p)
 */

class KellyCalculator {
  /**
   * @param {number} kellyFraction - Fração de Kelly a usar (0.25 = Quarter Kelly, conservador)
   */
  constructor(kellyFraction = 0.25) {
    this.kellyFraction = kellyFraction;
  }

  /**
   * Calcula stake ótimo usando Kelly Criterion
   * @param {number} odds - Odds decimais (ex: 2.5)
   * @param {number} probability - Probabilidade estimada de vitória (0-1)
   * @param {number} bankroll - Bankroll atual
   * @param {number} maxStakePercent - Máximo stake como % do bankroll (default: 5%)
   * @returns {Object} { stake, kellyPercent, recommendation }
   */
  calculateStake(odds, probability, bankroll, maxStakePercent = 5) {
    // Validações
    if (odds <= 1) throw new Error('Odds must be > 1');
    if (probability <= 0 || probability >= 1) throw new Error('Probability must be between 0 and 1');
    if (bankroll <= 0) throw new Error('Bankroll must be > 0');

    const b = odds - 1; // Net odds
    const p = probability;
    const q = 1 - p;

    // Full Kelly
    const fullKelly = (b * p - q) / b;

    // Fractional Kelly (mais conservador)
    const fractionalKelly = fullKelly * this.kellyFraction;

    // Stake como % do bankroll
    let kellyPercent = fractionalKelly * 100;

    // Aplicar limite máximo
    kellyPercent = Math.min(kellyPercent, maxStakePercent);

    // Stake em valor absoluto
    const stake = (kellyPercent / 100) * bankroll;

    // Recomendação
    let recommendation = 'BET';
    if (fullKelly <= 0) {
      recommendation = 'NO BET - Negative edge';
      kellyPercent = 0;
    } else if (kellyPercent < 0.5) {
      recommendation = 'SKIP - Edge too small';
    } else if (kellyPercent >= maxStakePercent) {
      recommendation = `MAX STAKE - Capped at ${maxStakePercent}%`;
    }

    return {
      stake: Math.round(stake * 100) / 100,
      kellyPercent: Math.round(kellyPercent * 100) / 100,
      fullKellyPercent: Math.round(fullKelly * 100 * 100) / 100,
      recommendation,
      edge: Math.round((p * odds - 1) * 100 * 100) / 100, // Expected value %
      roi: Math.round(((p * (odds - 1) - q) / 1) * 100 * 100) / 100 // ROI %
    };
  }

  /**
   * Calcula probabilidade implícita das odds
   * @param {number} odds - Odds decimais
   * @returns {number} Probabilidade implícita (0-1)
   */
  impliedProbability(odds) {
    return 1 / odds;
  }

  /**
   * Detecta value bet (quando sua probabilidade > probabilidade implícita)
   * @param {number} odds - Odds oferecidas
   * @param {number} trueProbability - Sua estimativa de probabilidade
   * @returns {Object} { isValue, edge }
   */
  detectValueBet(odds, trueProbability) {
    const impliedProb = this.impliedProbability(odds);
    const edge = trueProbability - impliedProb;

    return {
      isValue: edge > 0,
      edge: Math.round(edge * 100 * 100) / 100,
      impliedProbability: Math.round(impliedProb * 100 * 100) / 100,
      trueProbability: Math.round(trueProbability * 100 * 100) / 100,
      valuePercent: Math.round((edge / impliedProb) * 100 * 100) / 100
    };
  }
}

// CLI usage
if (require.main === module) {
  const calculator = new KellyCalculator(0.25); // Quarter Kelly

  const command = process.argv[2];

  switch(command) {
    case 'stake':
      const odds = parseFloat(process.argv[3]);
      const probability = parseFloat(process.argv[4]);
      const bankroll = parseFloat(process.argv[5] || 10000);
      const maxStake = parseFloat(process.argv[6] || 5);

      const result = calculator.calculateStake(odds, probability, bankroll, maxStake);

      console.log('\n=== KELLY CRITERION CALCULATOR ===');
      console.log(`Odds: ${odds}`);
      console.log(`True Probability: ${(probability * 100).toFixed(2)}%`);
      console.log(`Bankroll: $${bankroll}`);
      console.log(`Max Stake: ${maxStake}%`);
      console.log(`\nFull Kelly: ${result.fullKellyPercent}%`);
      console.log(`Fractional Kelly (0.25): ${result.kellyPercent}%`);
      console.log(`Stake: $${result.stake}`);
      console.log(`Edge: ${result.edge}%`);
      console.log(`Expected ROI: ${result.roi}%`);
      console.log(`\nRecommendation: ${result.recommendation}\n`);
      break;

    case 'value':
      const oddsValue = parseFloat(process.argv[3]);
      const trueProb = parseFloat(process.argv[4]);

      const valueBet = calculator.detectValueBet(oddsValue, trueProb);

      console.log('\n=== VALUE BET DETECTOR ===');
      console.log(`Offered Odds: ${oddsValue}`);
      console.log(`Implied Probability: ${valueBet.impliedProbability}%`);
      console.log(`True Probability: ${valueBet.trueProbability}%`);
      console.log(`Edge: ${valueBet.edge}%`);
      console.log(`Value: ${valueBet.valuePercent}%`);
      console.log(`\nIs Value Bet? ${valueBet.isValue ? 'YES ✓' : 'NO ✗'}\n`);
      break;

    default:
      console.log(`
Usage: node kelly-calculator.js <command> [args]

Commands:
  stake <odds> <probability> [bankroll] [maxStake%]
    Calculate optimal stake using Kelly Criterion

  value <odds> <trueProbability>
    Detect if odds offer value

Examples:
  node kelly-calculator.js stake 2.5 0.50 10000 5
    (odds=2.5, 50% chance, $10k bankroll, max 5% stake)

  node kelly-calculator.js value 2.2 0.55
    (odds=2.2, you estimate 55% chance)
      `);
  }
}

module.exports = KellyCalculator;
