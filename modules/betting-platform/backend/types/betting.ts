export interface BetfairCredentials {
  username: string;
  password: string;
  certificatePath: string;
  keyPath: string;
  apiUrl?: string;
  authUrl?: string;
  rateLimit?: number;
  timeoutMs?: number;
}

export interface BetfairMarket {
  marketId: string;
  marketName: string;
  marketStartTime: string;
  runners: BetfairRunner[];
}

export interface BetfairRunner {
  selectionId: number;
  runnerName: string;
}

export interface BetfairOdds {
  marketId: string;
  runners: BetfairRunnerOdds[];
}

export interface BetfairRunnerOdds {
  selectionId: number;
  ex: {
    availableToBack: BetfairPriceSize[];
    availableToLay: BetfairPriceSize[];
    tradedVolume: BetfairPriceSize[];
  };
}

export interface BetfairPriceSize {
  price: number;
  size: number;
}

export interface BetfairEvent {
  eventId: string;
  eventName: string;
  openDate: string;
  eventTypeId: string;
  venue: string;
  countryCode: string;
}

export interface BetfairBet {
  marketId: string;
  selectionId: number;
  side: 'BACK' | 'LAY';
  size: number;
  price: number;
}

export interface BetfairError extends Error {
  code: string;
}