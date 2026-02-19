import { BetStrategy, BetStrategyConfig } from '../../BetStrategy';

export interface NBAUnderdogQ3Config extends BetStrategyConfig {
  minUnderdogLead: number; // e.g. 10 points
  minQuarterDiff: number; // e.g. 5 points (Favorite wins Q3 by 5+)
  maxUnderdogLiveOdd: number; // Safety check
}

export class NBAUnderdogQ3Strategy extends BetStrategy {
  shouldBet(marketData: any): boolean {
    const { 
      sport, 
      league,
      period, 
      homeTeam, 
      awayTeam, 
      homeScore, 
      awayScore,
      homeQ3Score,
      awayQ3Score,
      preGameFavorite 
    } = marketData;
    
    const { minUnderdogLead, minQuarterDiff } = this.config as NBAUnderdogQ3Config;

    // 1. Must be NBA
    if (sport !== 'Basketball' || (league && !league.includes('NBA'))) return false;

    // 2. Must be end of Q3 or start of Q4
    if (period !== 'Q3_END' && period !== 'Q4_START') return false;

    // 3. Identify Favorite vs Underdog
    let favoriteScore, underdogScore, favoriteQ3, underdogQ3;
    
    if (preGameFavorite === 'Home') {
        favoriteScore = homeScore;
        underdogScore = awayScore;
        favoriteQ3 = homeQ3Score;
        underdogQ3 = awayQ3Score;
    } else {
        favoriteScore = awayScore;
        underdogScore = homeScore;
        favoriteQ3 = awayQ3Score;
        underdogQ3 = homeQ3Score;
    }

    // 4. Trigger: Underdog is winning by X points
    const lead = underdogScore - favoriteScore;
    if (lead < minUnderdogLead) return false;

    // 5. Momentum: Favorite WON Q3 by Y points (Comeback started)
    const q3Diff = favoriteQ3 - underdogQ3;
    if (q3Diff < minQuarterDiff) return false;

    // If conditions met, we bet on the Favorite to win the match (Comeback)
    // or Handicap for Q4 (depending on specific strategy variant)
    // Here we assume Moneyline Comeback
    return true;
  }
}
