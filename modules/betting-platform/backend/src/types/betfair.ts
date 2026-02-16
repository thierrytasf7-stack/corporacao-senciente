export interface BetfairCredentials {
  appKey: string;
  username: string;
  password: string;
  certFile: string;
  keyFile: string;
}

export interface BetfairToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface Market {
  marketId: string;
  marketName: string;
  marketType: string;
  marketStartTime: string;
  runners: Runner[];
  totalMatched: number;
}

export interface Runner {
  selectionId: number;
  runnerName: string;
  status: string;
  lastPriceTraded?: number;
  ex: ExchangePrices;
}

export interface ExchangePrices {
  availableToBack: PriceSize[];
  availableToLay: PriceSize[];
  tradedVolume: PriceSize[];
}

export interface PriceSize {
  price: number;
  size: number;
}

export interface Odds {
  marketId: string;
  selectionId: number;
  runnerName: string;
  backPrice: number;
  backSize: number;
  layPrice: number;
  laySize: number;
  lastTradedPrice?: number;
}

export interface Event {
  eventId: string;
  eventName: string;
  competition: string;
  startTime: string;
  markets: Market[];
}

export interface BetfairError {
  error: string;
  requestUUID: string;
  statusCode: number;
}

export interface PlaceBetRequest {
  marketId: string;
  selectionId: number;
  side: 'BACK' | 'LAY';
  price: number;
  size: number;
}

export interface CancelBetRequest {
  marketId: string;
  betId?: string;
}

export interface MarketFilter {
  eventTypeIds?: string[];
  competitionIds?: string[];
  eventIds?: string[];
  marketIds?: string[];
  venues?: string[];
  bspOnly?: boolean;
  inPlayOnly?: boolean;
  marketBettingTypes?: string[];
  marketCountries?: string[];
  marketTypeCodes?: string[];
  marketStartTime?: TimeRange;
  withOrders?: string[];
}

export interface TimeRange {
  from: string;
  to: string;
}

export interface PriceProjection {
  priceData?: string[];
  virtualise?: boolean;
  rolloverStakes?: boolean;
}

export interface OrderProjection {
  orderProjection?: string;
}

export interface MatchProjection {
  matchProjection?: string;
}

export interface Order {
  betId: string;
  orderId: string;
  customerOrderRef: string;
  customerStrategyRef: string;
  status: string;
  persistenceType: string;
  side: string;
  orderType: string;
  price: number;
  size: number;
  bspLiability: number;
  placedDate: string;
  avgPriceMatched: number;
  sizeMatched: number;
  sizeRemaining: number;
  sizeLapsed: number;
  sizeCancelled: number;
  sizeVoided: number;
  regulatorCode: string;
  regulatoryAuthCode: string;
  strategyRef: string;
}

export interface AccountDetails {
  currencyCode: string;
  firstName: string;
  lastName: string;
  localeCode: string;
  region: string;
  timezone: string;
  discountRate: number;
  pointsBalance: number;
  countryCode: string;
}

export interface AccountFunds {
  availableToBetBalance: number;
  exposure: number;
  retainedCommission: number;
  exposureLimit: number;
  discountRate: number;
  pointsBalance: number;
  wallet: string;
  currencyCode: string;
  fundsTimestamp: string;
  balance: number;
}