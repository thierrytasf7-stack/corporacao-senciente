#!/usr/bin/env node
/**
 * Bankroll Management System
 * Gerencia capital, risk exposure, e limites de apostas
 */

class BankrollManager {
  constructor(config = {}) {
    this.initialBankroll = config.initialBankroll || 10000;
    this.currentBankroll = config.currentBankroll || this.initialBankroll;
    this.maxStakePercent = config.maxStakePercent || 5;
    this.maxOpenBets = config.maxOpenBets || 10;
    this.maxDailyRisk = config.maxDailyRisk || 15; // % do bankroll
    this.stopLossDaily = config.stopLossDaily || 10; // % de perda para parar

    this.openBets = [];
    this.dailyRisk = 0;
    this.dailyPnL = 0;
  }

  /**
   * Verifica se pode abrir nova aposta
   */
  canPlaceBet(stakeAmount) {
    // Check 1: Número máximo de apostas abertas
    if (this.openBets.length >= this.maxOpenBets) {
      return {
        allowed: false,
        reason: `Max open bets reached (${this.maxOpenBets})`
      };
    }

    // Check 2: Stake não excede limite
    const stakePercent = (stakeAmount / this.currentBankroll) * 100;
    if (stakePercent > this.maxStakePercent) {
      return {
        allowed: false,
        reason: `Stake ${stakePercent.toFixed(2)}% exceeds max ${this.maxStakePercent}%`
      };
    }

    // Check 3: Risk diário
    const newDailyRisk = this.dailyRisk + stakeAmount;
    const dailyRiskPercent = (newDailyRisk / this.initialBankroll) * 100;
    if (dailyRiskPercent > this.maxDailyRisk) {
      return {
        allowed: false,
        reason: `Daily risk ${dailyRiskPercent.toFixed(2)}% exceeds limit ${this.maxDailyRisk}%`
      };
    }

    // Check 4: Stop loss diário
    const dailyLossPercent = Math.abs(Math.min(0, this.dailyPnL)) / this.initialBankroll * 100;
    if (dailyLossPercent >= this.stopLossDaily) {
      return {
        allowed: false,
        reason: `Daily stop loss hit (${dailyLossPercent.toFixed(2)}%)`
      };
    }

    // Check 5: Bankroll suficiente
    if (stakeAmount > this.currentBankroll) {
      return {
        allowed: false,
        reason: 'Insufficient bankroll'
      };
    }

    return {
      allowed: true,
      reason: 'OK'
    };
  }

  /**
   * Registra nova aposta
   */
  placeBet(bet) {
    const check = this.canPlaceBet(bet.stake);
    if (!check.allowed) {
      throw new Error(check.reason);
    }

    const betRecord = {
      id: bet.id || `BET-${Date.now()}`,
      stake: bet.stake,
      odds: bet.odds,
      market: bet.market,
      event: bet.event,
      timestamp: Date.now(),
      status: 'OPEN'
    };

    this.openBets.push(betRecord);
    this.dailyRisk += bet.stake;
    this.currentBankroll -= bet.stake;

    return betRecord;
  }

  /**
   * Resolve aposta (WIN/LOSS/VOID)
   */
  resolveBet(betId, result) {
    const betIndex = this.openBets.findIndex(b => b.id === betId);
    if (betIndex === -1) {
      throw new Error(`Bet ${betId} not found`);
    }

    const bet = this.openBets[betIndex];
    let pnl = 0;

    switch(result.toUpperCase()) {
      case 'WIN':
        pnl = bet.stake * (bet.odds - 1);
        this.currentBankroll += bet.stake + pnl;
        break;
      case 'LOSS':
        pnl = -bet.stake;
        // Stake já foi deduzido no placeBet
        break;
      case 'VOID':
        pnl = 0;
        this.currentBankroll += bet.stake;
        break;
      default:
        throw new Error(`Invalid result: ${result}`);
    }

    this.dailyPnL += pnl;
    this.openBets.splice(betIndex, 1);

    return {
      betId: bet.id,
      result: result.toUpperCase(),
      pnl,
      newBankroll: this.currentBankroll
    };
  }

  /**
   * Reset diário (call at midnight)
   */
  resetDaily() {
    this.dailyRisk = 0;
    this.dailyPnL = 0;
  }

  /**
   * Estatísticas atuais
   */
  getStats() {
    const totalExposure = this.openBets.reduce((sum, bet) => sum + bet.stake, 0);
    const potentialReturn = this.openBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0);
    const potentialProfit = potentialReturn - totalExposure;

    return {
      currentBankroll: this.currentBankroll,
      initialBankroll: this.initialBankroll,
      roi: ((this.currentBankroll - this.initialBankroll) / this.initialBankroll * 100).toFixed(2),
      openBets: this.openBets.length,
      totalExposure,
      exposurePercent: (totalExposure / this.currentBankroll * 100).toFixed(2),
      potentialProfit,
      dailyPnL: this.dailyPnL,
      dailyPnLPercent: (this.dailyPnL / this.initialBankroll * 100).toFixed(2),
      dailyRiskUsed: this.dailyRisk,
      dailyRiskRemaining: (this.maxDailyRisk / 100 * this.initialBankroll) - this.dailyRisk,
      stopLossDistance: this.stopLossDaily - Math.abs(Math.min(0, this.dailyPnL)) / this.initialBankroll * 100
    };
  }
}

// CLI usage
if (require.main === module) {
  const manager = new BankrollManager({
    initialBankroll: 10000,
    maxStakePercent: 5,
    maxOpenBets: 10,
    maxDailyRisk: 15,
    stopLossDaily: 10
  });

  console.log('\n=== BANKROLL MANAGEMENT SYSTEM ===\n');

  // Simular algumas apostas
  console.log('Testing bet placement...\n');

  try {
    const bet1 = manager.placeBet({
      stake: 250,
      odds: 2.5,
      market: 'H2H',
      event: 'Team A vs Team B'
    });
    console.log('✓ Bet 1 placed:', bet1.id, `$${bet1.stake} @ ${bet1.odds}`);

    const bet2 = manager.placeBet({
      stake: 300,
      odds: 1.8,
      market: 'Over/Under',
      event: 'Team C vs Team D'
    });
    console.log('✓ Bet 2 placed:', bet2.id, `$${bet2.stake} @ ${bet2.odds}`);

    console.log('\nCurrent Stats:');
    console.log(JSON.stringify(manager.getStats(), null, 2));

    console.log('\nResolving bet 1 as WIN...');
    const result1 = manager.resolveBet(bet1.id, 'WIN');
    console.log('✓ Bet 1 won:', `P&L = $${result1.pnl}`);

    console.log('\nResolving bet 2 as LOSS...');
    const result2 = manager.resolveBet(bet2.id, 'LOSS');
    console.log('✗ Bet 2 lost:', `P&L = $${result2.pnl}`);

    console.log('\nFinal Stats:');
    console.log(JSON.stringify(manager.getStats(), null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n');
}

module.exports = BankrollManager;
