#!/usr/bin/env node
/**
 * Real-Time Odds Monitor
 * Monitors odds changes and alerts on significant movements or value opportunities
 */

const OddsAPIClient = require('./odds-api-client');
const KellyCalculator = require('./kelly-calculator');
const { formatDistanceToNow } = require('date-fns');

class OddsMonitor {
  constructor(config = {}) {
    this.apiClient = new OddsAPIClient(config.apiKey);
    this.kellyCalculator = new KellyCalculator(config.kellyFraction || 0.25);

    this.sports = config.sports || ['soccer_epl', 'basketball_nba'];
    this.regions = config.regions || ['us', 'uk'];
    this.markets = config.markets || ['h2h'];
    this.pollInterval = config.pollInterval || 60000; // 1 minute default

    this.previousOdds = new Map(); // eventId -> odds snapshot
    this.alerts = [];

    this.valueThreshold = config.valueThreshold || 5; // 5% edge minimum
    this.movementThreshold = config.movementThreshold || 10; // 10% odds movement
  }

  /**
   * Start monitoring
   */
  async start() {
    console.log('🔍 Starting Odds Monitor...');
    console.log(`Sports: ${this.sports.join(', ')}`);
    console.log(`Markets: ${this.markets.join(', ')}`);
    console.log(`Poll interval: ${this.pollInterval / 1000}s\n`);

    // Initial fetch
    await this.fetchAndAnalyze();

    // Start polling
    this.intervalId = setInterval(async () => {
      await this.fetchAndAnalyze();
    }, this.pollInterval);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('\n⏹️  Odds Monitor stopped');
    }
  }

  /**
   * Fetch odds and analyze
   */
  async fetchAndAnalyze() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Fetching odds...`);

    try {
      for (const sport of this.sports) {
        const oddsData = await this.apiClient.getOdds(sport, this.regions, this.markets);

        for (const event of oddsData) {
          await this.analyzeEvent(event, sport);
        }
      }

      // Show alerts
      if (this.alerts.length > 0) {
        console.log(`\n🚨 ${this.alerts.length} ALERTS:`);
        this.alerts.forEach(alert => {
          console.log(`  ${alert.type}: ${alert.message}`);
        });
        this.alerts = []; // Clear after showing
      } else {
        console.log('✓ No alerts');
      }

    } catch (error) {
      console.error('Error fetching odds:', error.message);
    }
  }

  /**
   * Analyze single event
   */
  async analyzeEvent(event, sport) {
    const eventKey = `${sport}:${event.id}`;
    const previousSnapshot = this.previousOdds.get(eventKey);

    // Extract best odds for each outcome
    const bestOdds = this.extractBestOdds(event);

    if (!bestOdds) return; // No odds available

    // Check for significant odds movements
    if (previousSnapshot) {
      this.detectOddsMovement(event, bestOdds, previousSnapshot);
    }

    // Detect value bets (requires probability estimation - simplified here)
    this.detectValueBets(event, bestOdds);

    // Save current snapshot
    this.previousOdds.set(eventKey, {
      timestamp: Date.now(),
      odds: bestOdds,
      event: {
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        commenceTime: event.commence_time
      }
    });
  }

  /**
   * Extract best odds from bookmakers
   */
  extractBestOdds(event) {
    if (!event.bookmakers || event.bookmakers.length === 0) {
      return null;
    }

    const market = event.bookmakers[0].markets?.find(m => m.key === 'h2h');
    if (!market) return null;

    // Find best odds for each outcome across all bookmakers
    const bestOdds = {};

    event.bookmakers.forEach(bookmaker => {
      const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
      if (!h2hMarket) return;

      h2hMarket.outcomes.forEach(outcome => {
        const current = bestOdds[outcome.name] || 0;
        if (outcome.price > current) {
          bestOdds[outcome.name] = {
            price: outcome.price,
            bookmaker: bookmaker.title
          };
        }
      });
    });

    return bestOdds;
  }

  /**
   * Detect significant odds movements
   */
  detectOddsMovement(event, currentOdds, previousSnapshot) {
    const prevOdds = previousSnapshot.odds;

    Object.keys(currentOdds).forEach(outcome => {
      if (!prevOdds[outcome]) return;

      const currentPrice = currentOdds[outcome].price;
      const prevPrice = prevOdds[outcome].price;

      const movement = ((currentPrice - prevPrice) / prevPrice) * 100;

      if (Math.abs(movement) >= this.movementThreshold) {
        const direction = movement > 0 ? 'INCREASED' : 'DECREASED';
        const arrow = movement > 0 ? '📈' : '📉';

        this.alerts.push({
          type: 'ODDS_MOVEMENT',
          message: `${arrow} ${event.home_team} vs ${event.away_team} - ${outcome}: ${prevPrice.toFixed(2)} → ${currentPrice.toFixed(2)} (${movement.toFixed(1)}%)`
        });
      }
    });
  }

  /**
   * Detect value bets
   * (Simplified - uses market consensus as baseline)
   */
  detectValueBets(event, bestOdds) {
    // Calculate market average (simple consensus probability)
    const outcomes = Object.keys(bestOdds);
    const totalImpliedProb = outcomes.reduce((sum, outcome) => {
      return sum + (1 / bestOdds[outcome].price);
    }, 0);

    // Normalized probabilities
    const marketProbs = {};
    outcomes.forEach(outcome => {
      const impliedProb = 1 / bestOdds[outcome].price;
      marketProbs[outcome] = impliedProb / totalImpliedProb;
    });

    // Simple value detection: if best odds implies lower prob than consensus
    outcomes.forEach(outcome => {
      const bestOddsImplied = 1 / bestOdds[outcome].price;
      const edge = (marketProbs[outcome] - bestOddsImplied) / bestOddsImplied * 100;

      if (edge >= this.valueThreshold) {
        this.alerts.push({
          type: 'VALUE_BET',
          message: `💰 ${event.home_team} vs ${event.away_team} - ${outcome} @ ${bestOdds[outcome].price} (${bestOdds[outcome].bookmaker}) - Edge: ${edge.toFixed(1)}%`
        });
      }
    });
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      eventsMonitored: this.previousOdds.size,
      sports: this.sports,
      regions: this.regions,
      markets: this.markets,
      pollInterval: this.pollInterval,
      uptime: this.intervalId ? 'Running' : 'Stopped'
    };
  }
}

// CLI usage
if (require.main === module) {
  const config = {
    apiKey: process.env.ODDS_API_KEY,
    sports: (process.env.SPORTS_FOCUS || 'soccer_epl,basketball_nba').split(','),
    regions: ['us', 'uk'],
    markets: ['h2h'],
    pollInterval: 60000, // 1 minute
    kellyFraction: 0.25,
    valueThreshold: 5, // 5% edge
    movementThreshold: 10 // 10% movement
  };

  const monitor = new OddsMonitor(config);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  // Start monitoring
  monitor.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = OddsMonitor;
