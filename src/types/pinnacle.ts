export interface PinnacleCredentials {
  apiKey: string;
  username: string;
  password: string;
}

export interface Sport {
  id: number;
  name: string;
  hasLines: boolean;
  leagueSpecialsCount: number;
  sportGroup: number;
  details: string;
  feedContents: {
    name: string;
    marketCount: number;
  };
}

export interface Odds {
  sportId: number;
  last: number;
  league: {
    id: number;
    name: string;
  };
  events: Array<{
    id: number;
    starts: string;
    home: string;
    away: string;
    rotNum: string;
    liveStatus: number;
    status: string;
    parlayRestriction: number;
    homePitcher: string | null;
    awayPitcher: string | null;
    periods: Array<{
      number: number;
      cutoff: string;
      maxMoneyline: number;
      maxSpread: number;
      maxTotal: number;
      moneyline: {
        home: number;
        away: number;
        draw: number | null;
      };
      spreads: Array<{
        hdp: number;
        home: number;
        away: number;
      }>;
      totals: Array<{
        points: number;
        over: number;
        under: number;
      }>;
    }>;
  }>;
}

export interface Line {
  sportId: number;
  leagueId: number;
  eventId: number;
  periodNumber: number;
  lineId: number;
  hdps: Array<{
    away: number;
    home: number;
    awayChg: number;
    homeChg: number;
  }>;
  totals: Array<{
    over: number;
    under: number;
    overChg: number;
    underChg: number;
    points: number;
  }>;
}

export interface BetResponse {
  ticketId: string;
  status: string;
  stake: number;
  win: number;
  winLoss: number | null;
  odds: number;
  placedAt: string;
  settledAt: string | null;
}

export interface Balance {
  available: number;
  outstanding: number;
}

export interface FeedStatus {
  status: string;
  lastUpdate: string;
}

export interface BetRequest {
  sportId: number;
  eventId: number;
  periodNumber: number;
  betType: 'moneyline' | 'spread' | 'total';
  stake: number;
  odds: number;
  team?: string;
  hdcp?: number;
  overUnder?: 'over' | 'under';
}