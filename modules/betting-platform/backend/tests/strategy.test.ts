import ValueBettingCalculator, { ValueBet, CalculateValueParams } from '../services/ValueBettingCalculator';
import ArbitrageDetector, { ArbitrageOpportunity, Odds } from '../services/ArbitrageDetector';

describe('ValueBettingCalculator', () => {
  let calculator: ValueBettingCalculator;

  beforeEach(() => {
    calculator = new ValueBettingCalculator();
  });

  describe('calculateValue', () => {
    it('should return null for no value bet (valuePct below threshold)', () => {
      const params: CalculateValueParams = {
        bookmakerOdds: 2.0,
        trueProbability: 0.6
      };
      
      const result = calculator.calculateValue(params);
      expect(result).toBeNull();
    });

    it('should return value bet for valid value opportunity', () => {
      const params: CalculateValueParams = {
        bookmakerOdds: 2.5,
        trueProbability: 0.5
      };
      
      const result = calculator.calculateValue(params);
      
      expect(result).not.toBeNull();
      expect(result!.bookmakerOdds).toBe(2.5);
      expect(result!.trueOdds).toBe(2);
      expect(result!.valuePct).toBeGreaterThan(0.2);
      expect(result!.isValueBet).toBe(true);
    });

    it('should handle edge case with minimum threshold', () => {
      calculator.setMinValueThreshold(0.1);
      
      const params: CalculateValueParams = {
        bookmakerOdds: 2.2,
        trueProbability: 0.5
      };
      
      const result = calculator.calculateValue(params);
      expect(result).toBeNull();
    });

    it('should throw error for invalid odds', () => {
      const params: CalculateValueParams = {
        bookmakerOdds: 0.5,
        trueProbability: 0.5
      };
      
      expect(() => calculator.calculateValue(params)).toThrow('Invalid odds or probability');
    });

    it('should throw error for invalid probability', () => {
      const params: CalculateValueParams = {
        bookmakerOdds: 2.0,
        trueProbability: 1.5
      };
      
      expect(() => calculator.calculateValue(params)).toThrow('Invalid odds or probability');
    });
  });

  describe('findValueBets', () => {
    it('should find multiple value bets from opportunities', () => {
      const opportunities = [
        { odds: 2.5, probability: 0.5, market: 'Match Winner', selection: 'Team A' },
        { odds: 3.0, probability: 0.4, market: 'Match Winner', selection: 'Team B' },
        { odds: 1.8, probability: 0.6, market: 'Match Winner', selection: 'Draw' }
      ];
      
      const results = calculator.findValueBets(opportunities);
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(bet => {
        expect(bet.isValueBet).toBe(true);
        expect(bet.market).not.toBe('unknown');
        expect(bet.selection).not.toBe('unknown');
      });
    });

    it('should return empty array when no value bets found', () => {
      const opportunities = [
        { odds: 1.8, probability: 0.6, market: 'Match Winner', selection: 'Team A' },
        { odds: 2.0, probability: 0.5, market: 'Match Winner', selection: 'Team B' }
      ];
      
      const results = calculator.findValueBets(opportunities);
      expect(results.length).toBe(0);
    });
  });

  describe('setMinValueThreshold', () => {
    it('should set threshold correctly', () => {
      calculator.setMinValueThreshold(0.1);
      expect(calculator['minValueThreshold']).toBe(0.1);
    });

    it('should throw error for threshold below 0', () => {
      expect(() => calculator.setMinValueThreshold(-0.1)).toThrow('Threshold must be between 0 and 1');
    });

    it('should throw error for threshold above 1', () => {
      expect(() => calculator.setMinValueThreshold(1.1)).toThrow('Threshold must be between 0 and 1');
    });
  });
});

describe('ArbitrageDetector', () => {
  let detector: ArbitrageDetector;

  beforeEach(() => {
    detector = new ArbitrageDetector();
  });

  describe('detectArbitrage', () => {
    it('should detect arbitrage opportunity', () => {
      const oddsSet: Odds[][] = [
        [
          { bookmaker: 'Bookie1', selection: 'Outcome1', odds: 2.0 },
          { bookmaker: 'Bookie1', selection: 'Outcome2', odds: 2.0 }
        ],
        [
          { bookmaker: 'Bookie2', selection: 'Outcome1', odds: 2.5 },
          { bookmaker: 'Bookie2', selection: 'Outcome2', odds: 1.8 }
        ]
      ];
      
      const result = detector.detectArbitrage(oddsSet);
      
      expect(result).not.toBeNull();
      expect(result!.isArbitrage).toBe(true);
      expect(result!.profitPct).toBeGreaterThan(0);
      expect(result!.bookmakers.length).toBe(2);
    });

    it('should return null when no arbitrage found', () => {
      const oddsSet: Odds[][] = [
        [
          { bookmaker: 'Bookie1', selection: 'Outcome1', odds: 1.8 },
          { bookmaker: 'Bookie1', selection: 'Outcome2', odds: 1.9 }
        ],
        [
          { bookmaker: 'Bookie2', selection: 'Outcome1', odds: 1.9 },
          { bookmaker: 'Bookie2', selection: 'Outcome2', odds: 1.8 }
        ]
      ];
      
      const result = detector.detectArbitrage(oddsSet);
      expect(result).toBeNull();
    });

    it('should return null for single market', () => {
      const oddsSet: Odds[][] = [
        [
          { bookmaker: 'Bookie1', selection: 'Outcome1', odds: 2.0 },
          { bookmaker: 'Bookie1', selection: 'Outcome2', odds: 2.0 }
        ]
      ];
      
      const result = detector.detectArbitrage(oddsSet);
      expect(result).toBeNull();
    });
  });

  describe('scanMarkets', () => {
    it('should scan multiple markets and find arbitrage opportunities', () => {
      const markets = [
        {
          market: 'Match Winner',
          odds: [
            [
              { bookmaker: 'Bookie1', selection: 'Team A', odds: 2.0 },
              { bookmaker: 'Bookie1', selection: 'Team B', odds: 2.0 }
            ],
            [
              { bookmaker: 'Bookie2', selection: 'Team A', odds: 2.5 },
              { bookmaker: 'Bookie2', selection: 'Team B', odds: 1.8 }
            ]
          ]
        },
        {
          market: 'Over/Under',
          odds: [
            [
              { bookmaker: 'Bookie1', selection: 'Over', odds: 1.9 },
              { bookmaker: 'Bookie1', selection: 'Under', odds: 2.1 }
            ],
            [
              { bookmaker: 'Bookie2', selection: 'Over', odds: 2.1 },
              { bookmaker: 'Bookie2', selection: 'Under', odds: 1.9 }
            ]
          ]
        }
      ];
      
      const results = detector.scanMarkets(markets);
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(opportunity => {
        expect(opportunity.market).toBeDefined();
        expect(opportunity.isArbitrage).toBe(true);
      });
    });

    it('should return empty array when no arbitrage in any market', () => {
      const markets = [
        {
          market: 'Match Winner',
          odds: [
            [
              { bookmaker: 'Bookie1', selection: 'Team A', odds: 1.8 },
              { bookmaker: 'Bookie1', selection: 'Team B', odds: 1.9 }
            ],
            [
              { bookmaker: 'Bookie2', selection: 'Team A', odds: 1.9 },
              { bookmaker: 'Bookie2', selection: 'Team B', odds: 1.8 }
            ]
          ]
        }
      ];
      
      const results = detector.scanMarkets(markets);
      expect(results.length).toBe(0);
    });
  });

  describe('setMinProfitThreshold', () => {
    it('should set threshold correctly', () => {
      detector.setMinProfitThreshold(0.05);
      expect(detector['minProfitThreshold']).toBe(0.05);
    });

    it('should throw error for threshold below 0', () => {
      expect(() => detector.setMinProfitThreshold(-0.01)).toThrow('Threshold must be between 0 and 1');
    });

    it('should throw error for threshold above 1', () => {
      expect(() => detector.setMinProfitThreshold(1.01)).toThrow('Threshold must be between 0 and 1');
    });
  });
});