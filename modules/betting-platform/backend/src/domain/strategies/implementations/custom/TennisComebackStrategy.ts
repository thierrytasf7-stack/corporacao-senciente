import { BetStrategy, BetStrategyConfig } from '../../BetStrategy';

export interface TennisComebackConfig extends BetStrategyConfig {
  maxFavoritePreOdds: number; // Pre-game odds must be lower than this (e.g. 1.50)
  minLiveOdds: number; // Live odds must be higher than this (e.g. 1.80)
  targetScore: string; // The score trigger (e.g. "0-30", "0-40")
}

export class TennisComebackStrategy extends BetStrategy {
  shouldBet(marketData: any): boolean {
    const { 
      sport, 
      isLive, 
      preGameOdds, 
      odd, 
      currentScore, 
      server 
    } = marketData;
    
    const { maxFavoritePreOdds, minLiveOdds, targetScore } = this.config as TennisComebackConfig;

    // 1. Must be Tennis
    if (sport !== 'Tennis') return false;

    // 2. Must be Live
    if (!isLive) return false;

    // 3. Favorite Check (Pre-game odds)
    if (!preGameOdds || preGameOdds > maxFavoritePreOdds) return false;

    // 4. Value Check (Live odds must have drifted enough)
    if (odd < minLiveOdds) return false;

    // 5. Score Trigger Check (e.g. Favorit is serving and losing 0-30)
    // Assuming we are betting on the Server to win the game
    if (server === 'Favorite' && currentScore === targetScore) {
        return true;
    }

    return false;
  }
}
