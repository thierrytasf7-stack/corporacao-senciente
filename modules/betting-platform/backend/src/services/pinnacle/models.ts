import { z } from 'zod';

// --- Generic Models (Legacy/Internal) ---

export const SportSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  isActive: z.boolean(),
  hasOfferings: z.boolean(),
  leagueSpecialsCount: z.number().int(),
  eventCount: z.number().int(),
  parlayRestriction: z.number().int(),
});

export type Sport = z.infer<typeof SportSchema>;

export const LeagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  sportId: z.string(),
  sportName: z.string(),
  isActive: z.boolean(),
  isHeadToHead: z.boolean(),
  hasOfferings: z.boolean(),
  eventCount: z.number().int(),
  parlayRestriction: z.number().int(),
  region: z.object({
    id: z.string(),
    name: z.string(),
    isoCode: z.string(),
  }).optional(),
});

export type League = z.infer<typeof LeagueSchema>;

export const FixtureSchema = z.object({
  id: z.string(),
  sportId: z.string(),
  sportName: z.string(),
  leagueId: z.string(),
  leagueName: z.string(),
  homeTeamId: z.string(),
  homeTeamName: z.string(),
  awayTeamId: z.string(),
  awayTeamName: z.string(),
  startTime: z.string(),
  status: z.string(),
  statusType: z.string(),
  isLive: z.boolean(),
  homeTeamScore: z.number().int().optional(),
  awayTeamScore: z.number().int().optional(),
  homeTeamRotationNumber: z.number().int().optional(),
  awayTeamRotationNumber: z.number().int().optional(),
  parlayRestriction: z.number().int(),
  altTeaserSize: z.number().int().optional(),
  isParlayRestricted: z.boolean(),
  isTeaserRestricted: z.boolean(),
});

export type Fixture = z.infer<typeof FixtureSchema>;

export const OddsSchema = z.object({
  fixtureId: z.string(),
  sportId: z.string(),
  leagueId: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  moneyLine: z.object({
    home: z.number().optional(),
    away: z.number().optional(),
    draw: z.number().optional(),
  }).optional(),
  spread: z.object({
    home: z.object({
      points: z.number().optional(),
      odds: z.number().optional(),
    }).optional(),
    away: z.object({
      points: z.number().optional(),
      odds: z.number().optional(),
    }).optional(),
  }).optional(),
  total: z.object({
    points: z.number().optional(),
    over: z.number().optional(),
    under: z.number().optional(),
  }).optional(),
  period: z.object({
    number: z.number().int(),
    length: z.number().int(),
    status: z.string(),
    homeTeamScore: z.number().int().optional(),
    awayTeamScore: z.number().int().optional(),
  }).optional(),
  lastUpdated: z.string(),
});

export type Odds = z.infer<typeof OddsSchema>;

export const LineSchema = z.object({
  fixtureId: z.string(),
  sportId: z.string(),
  leagueId: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  moneyLine: z.object({
    home: z.number().optional(),
    away: z.number().optional(),
    draw: z.number().optional(),
  }).optional(),
  spread: z.object({
    home: z.object({
      points: z.number().optional(),
      odds: z.number().optional(),
    }).optional(),
    away: z.object({
      points: z.number().optional(),
      odds: z.number().optional(),
    }).optional(),
  }).optional(),
  total: z.object({
    points: z.number().optional(),
    over: z.number().optional(),
    under: z.number().optional(),
  }).optional(),
  period: z.object({
    number: z.number().int(),
    length: z.number().int(),
    status: z.string(),
    homeTeamScore: z.number().int().optional(),
    awayTeamScore: z.number().int().optional(),
  }).optional(),
  lastUpdated: z.string(),
});

export type Line = z.infer<typeof LineSchema>;

export const BetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string(),
  fixtureId: z.string(),
  sportId: z.string(),
  leagueId: z.string(),
  betType: z.string(),
  selection: z.object({
    type: z.string(),
    teamId: z.string().optional(),
    points: z.number().optional(),
    odds: z.number(),
  }),
  stake: z.number(),
  potentialReturn: z.number(),
  status: z.string(),
  placedAt: z.string(),
  settledAt: z.string().optional(),
  profitLoss: z.number().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Bet = z.infer<typeof BetSchema>;

export const BetfairErrorSchema = z.object({
  error: z.string(),
  exceptionname: z.string().optional(),
  errorDetails: z.string().optional(),
});

export type BetfairError = z.infer<typeof BetfairErrorSchema>;

// --- Pinnacle Specific Models (from betsapi-oas.yaml) ---

export type OddsFormat = 'AMERICAN' | 'DECIMAL' | 'HONGKONG' | 'INDONESIAN' | 'MALAY';
export type WinRiskStake = 'WIN' | 'RISK';
export type FillType = 'NORMAL' | 'FILLANDKILL' | 'FILLMAXLIMIT';
export type BetType = 'MONEYLINE' | 'TEAM_TOTAL_POINTS' | 'SPREAD' | 'TOTAL_POINTS' | 'SPECIAL' | 'PARLAY' | 'TEASER' | 'MANUAL';
export type TeamType = 'TEAM1' | 'TEAM2' | 'DRAW';
export type SideType = 'OVER' | 'UNDER';
export type BetStatus = 'ACCEPTED' | 'CANCELLED' | 'LOSE' | 'PENDING_ACCEPTANCE' | 'REFUNDED' | 'NOT_ACCEPTED' | 'WON';

export interface PlaceStraightBetRequest {
  oddsFormat: OddsFormat;
  uniqueRequestId: string;
  acceptBetterLine: boolean;
  stake: number;
  winRiskStake: WinRiskStake;
  lineId: number;
  altLineId?: number;
  pitcher1MustStart?: boolean;
  pitcher2MustStart?: boolean;
  fillType: FillType;
  sportId: number;
  eventId: number;
  periodNumber: number;
  betType: BetType;
  team?: TeamType;
  side?: SideType;
}

export interface PlaceBetResponse {
  status: string; // 'ACCEPTED' | 'PENDING_ACCEPTANCE' | 'PROCESSED_WITH_ERROR'
  errorCode?: string;
  uniqueRequestId?: string;
  straightBet?: {
    betId: number;
    betStatus: BetStatus;
    betType: BetType;
    oddsFormat: OddsFormat;
    placedAt: string;
    risk: number;
    win: number;
    price: number;
    sportId: number;
    eventId: number;
    // ... other fields
  };
}

export interface GetBetsRequest {
  betlist?: 'SETTLED' | 'RUNNING' | 'ALL';
  betStatuses?: BetStatus[];
  fromDate?: string; // ISO8601
  toDate?: string;   // ISO8601
  sortDir?: 'ASC' | 'DESC';
  pageSize?: number;
  fromRecord?: number;
  betids?: number[];
  uniqueRequestIds?: string[];
  betType?: BetType[];
}

export interface GetBetsResponse {
  moreAvailable: boolean;
  pageSize: number;
  fromRecord: number;
  toRecord: number;
  straightBets: any[]; // Typed more specifically in real impl
  parlayBets: any[];
  teaserBets: any[];
  specialBets: any[];
  manualBets: any[];
}
