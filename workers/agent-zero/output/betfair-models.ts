import { z } from "zod";

// Betfair API Data Models
export const EventTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  marketCount: z.number(),
  competitionCount: z.number(),
  eventCount: z.number(),
});

export type EventType = z.infer<typeof EventTypeSchema>;

export const CompetitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string().optional(),
  marketCount: z.number(),
  eventCount: z.number(),
});

export type Competition = z.infer<typeof CompetitionSchema>;

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  openDate: z.string(),
  timezone: z.string(),
  venue: z.string().optional(),
  countryCode: z.string().optional(),
  marketCount: z.number(),
  competition: CompetitionSchema,
});

export type Event = z.infer<typeof EventSchema>;

export const MarketSchema = z.object({
  id: z.string(),
  name: z.string(),
  marketType: z.string(),
  marketStartTime: z.string(),
  description: z.string().optional(),
  runners: z.array(z.string()),
  totalMatched: z.number(),
  status: z.string(),
});

export type Market = z.infer<typeof MarketSchema>;

export const RunnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  sortPriority: z.number(),
  metadata: z.record(z.string()),
});

export type Runner = z.infer<typeof RunnerSchema>;

export const MarketBookSchema = z.object({
  marketId: z.string(),
  isMarketDataDelayed: z.boolean(),
  status: z.string(),
  betDelay: z.number(),
  bspReconciled: z.boolean(),
  complete: z.boolean(),
  inplay: z.boolean(),
  numberOfWinners: z.number(),
  numberOfRunners: z.number(),
  numberOfActiveRunners: z.number(),
  lastMatchTime: z.string().optional(),
  totalMatched: z.number(),
  totalAvailable: z.number(),
  runners: z.array(z.object({
    selectionId: z.number(),
    runnerName: z.string(),
    handicap: z.number(),
    status: z.string(),
    adjustmentFactor: z.number().optional(),
    lastPriceTraded: z.number().optional(),
    totalMatched: z.number().optional(),
    removalDate: z.string().optional(),
    ex: z.object({
      availableToBack: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })),
      availableToLay: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })),
      tradedVolume: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })),
    }).optional(),
  })),
});

export type MarketBook = z.infer<typeof MarketBookSchema>;

export const RunnerBookSchema = z.object({
  selectionId: z.number(),
  runnerName: z.string(),
  handicap: z.number(),
  status: z.string(),
  lastPriceTraded: z.number().optional(),
  totalMatched: z.number().optional(),
  ex: z.object({
    availableToBack: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })),
    availableToLay: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })),
    tradedVolume: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })),
  }),
});

export type RunnerBook = z.infer<typeof RunnerBookSchema>;

export const OrderSchema = z.object({
  betId: z.string(),
  marketId: z.string(),
  selectionId: z.number(),
  handicap: z.number(),
  priceSize: z.object({
    price: z.number(),
    size: z.number(),
  }),
  bspLiability: z.number().optional(),
  side: z.string(),
  status: z.string(),
  persistenceType: z.string(),
  orderType: z.string(),
  placedDate: z.string(),
  matchedDate: z.string().optional(),
  averagePriceMatched: z.number().optional(),
  sizeMatched: z.number().optional(),
  sizeRemaining: z.number().optional(),
  sizeLapsed: z.number().optional(),
  sizeCancelled: z.number().optional(),
  sizeVoided: z.number().optional(),
  regulatorAuthCode: z.string().optional(),
  regulatorCode: z.string().optional(),
  customerOrderRef: z.string().optional(),
  customerStrategyRef: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  product: z.string(),
  status: z.string(),
  error: z.string().optional(),
  tokenValidUntil: z.string(),
  loginStatus: z.string(),
  session: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const KeepAliveResponseSchema = z.object({
  token: z.string(),
  product: z.string(),
  status: z.string(),
  error: z.string().optional(),
  tokenValidUntil: z.string(),
  loginStatus: z.string(),
});

export type KeepAliveResponse = z.infer<typeof KeepAliveResponseSchema>;

export const LogoutResponseSchema = z.object({
  token: z.string(),
  product: z.string(),
  status: z.string(),
  error: z.string().optional(),
  tokenValidUntil: z.string(),
  loginStatus: z.string(),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export const APIResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.string(),
  result: z.any(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.any(),
  }).optional(),
});

export type APIResponse = z.infer<typeof APIResponseSchema>;

export const ErrorResponseSchema = z.object({
  exceptionname: z.string(),
  errorDetails: z.string(),
  requestUUID: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const BetfairCredentialsSchema = z.object({
  appKey: z.string(),
  username: z.string(),
  password: z.string(),
  certPath: z.string().optional(),
  isProduction: z.boolean().default(false),
});

export type BetfairCredentials = z.infer<typeof BetfairCredentialsSchema>;

export const PlaceOrderRequestSchema = z.object({
  marketId: z.string(),
  selectionId: z.number(),
  side: z.enum(["BACK", "LAY"]),
  orderType: z.enum(["LIMIT", "LIMIT_ON_CLOSE", "MARKET_ON_CLOSE"]),
  price: z.number(),
  size: z.number(),
  persistenceType: z.enum(["PERSIST", "LAPSE", "MARKET_ON_CLOSE"]),
  timeInForce: z.enum(["IMMEDIATE_OR_CANCEL", "FILL_OR_KILL", "IMMEDIATE_OR_CANCEL_WITH_STAKE"], { optional: true }),
  minFillSize: z.number().optional(),
  betId: z.string().optional(),
  handicap: z.number().optional(),
  betInstructions: z.array(z.object({
    orderType: z.enum(["LIMIT", "LIMIT_ON_CLOSE", "MARKET_ON_CLOSE"]),
    selectionId: z.number(),
    handicap: z.number().optional(),
    side: z.enum(["BACK", "LAY"]),
    limitOrder: z.object({
      size: z.number(),
      price: z.number(),
      persistenceType: z.enum(["PERSIST", "LAPSE", "MARKET_ON_CLOSE"]),
    }).optional(),
    limitOnCloseOrder: z.object({
      handicap: z.number().optional(),
      price: z.number(),
      persistenceType: z.enum(["PERSIST", "LAPSE", "MARKET_ON_CLOSE"]),
    }).optional(),
    marketOnCloseOrder: z.object({
      handicap: z.number().optional(),
      liability: z.number(),
    }).optional(),
  })),
});

export type PlaceOrderRequest = z.infer<typeof PlaceOrderRequestSchema>;

export const CancelOrderRequestSchema = z.object({
  marketId: z.string(),
  betIds: z.array(z.string()),
  sizeReduction: z.number().optional(),
});

export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;

export const CurrentOrdersRequestSchema = z.object({
  betIds: z.array(z.string()).optional(),
  marketIds: z.array(z.string()).optional(),
  orderStatus: z.enum(["EXECUTION_COMPLETE", "PENDING"]),
  placedDateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  orderBy: z.enum(["BY_BET", "BY_MARKET", "BY_MATCH_TIME", "BY_PLACE_TIME", "BY_SETTLED_TIME", "BY_VOID_TIME"]),
  sortDir: z.enum(["EARLIEST_TO_LATEST", "LATEST_TO_EARLIEST"]),
  fromRecord: z.number(),
  recordCount: z.number(),
});

export type CurrentOrdersRequest = z.infer<typeof CurrentOrdersRequestSchema>;

export const BetfairConfigSchema = z.object({
  pollingInterval: z.number().default(30000),
  maxRetries: z.number().default(3),
  retryDelay: z.number().default(1000),
  timeout: z.number().default(10000),
  sandbox: z.boolean().default(true),
});

export type BetfairConfig = z.infer<typeof BetfairConfigSchema>;