import { z } from 'zod';

export const EventTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  marketCount: z.number().int(),
  competition: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  eventType: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type EventType = z.infer<typeof EventTypeSchema>;

export const CompetitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  competition: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type Competition = z.infer<typeof CompetitionSchema>;

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  countryCode: z.string().optional(),
  timezone: z.string().optional(),
  openDate: z.string(),
  marketCount: z.number().int(),
  eventType: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  competition: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type Event = z.infer<typeof EventSchema>;

export const MarketSchema = z.object({
  id: z.string(),
  name: z.string(),
  marketType: z.string(),
  marketBettingType: z.string(),
  totalMatched: z.number(),
  runners: z.array(z.object({
    selectionId: z.string(),
    runnerName: z.string(),
    handicap: z.number().optional(),
    status: z.string(),
    adjustmentFactor: z.number().optional(),
    lastPriceTraded: z.number().optional(),
    totalMatched: z.number().optional(),
  })).optional(),
});

export type Market = z.infer<typeof MarketSchema>;

export const RunnerSchema = z.object({
  selectionId: z.string(),
  runnerName: z.string(),
  handicap: z.number().optional(),
  status: z.string(),
  adjustmentFactor: z.number().optional(),
  lastPriceTraded: z.number().optional(),
  totalMatched: z.number().optional(),
});

export type Runner = z.infer<typeof RunnerSchema>;

export const MarketBookSchema = z.object({
  marketId: z.string(),
  isMarketDataDelayed: z.boolean(),
  status: z.string(),
  betDelay: z.number().int(),
  bspReconciled: z.boolean(),
  complete: z.boolean(),
  inplay: z.boolean(),
  numberOfWinners: z.number().int(),
  numberOfRunners: z.number().int(),
  numberOfActiveRunners: z.number().int(),
  lastMatchTime: z.string().optional(),
  totalMatched: z.number(),
  totalAvailable: z.number().optional(),
  crossMatching: z.boolean(),
  runnersVoidable: z.boolean(),
  version: z.number().int(),
  runners: z.array(z.object({
    selectionId: z.string(),
    handicap: z.number(),
    status: z.string(),
    adjustmentFactor: z.number().optional(),
    lastPriceTraded: z.number().optional(),
    totalMatched: z.number().optional(),
    removalDate: z.string().optional(),
    sp: z.object({
      nearPrice: z.number().optional(),
      farPrice: z.number().optional(),
      backStakeTaken: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })).optional(),
      layLiabilityTaken: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })).optional(),
      actualSP: z.number().optional(),
    }).optional(),
    ex: z.object({
      availableToBack: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })).optional(),
      availableToLay: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })).optional(),
      tradedVolume: z.array(z.object({
        price: z.number(),
        size: z.number(),
      })).optional(),
    }).optional(),
  })).optional(),
});

export type MarketBook = z.infer<typeof MarketBookSchema>;

export const RunnerBookSchema = z.object({
  marketId: z.string(),
  selectionId: z.string(),
  handicap: z.number(),
  status: z.string(),
  adjustmentFactor: z.number().optional(),
  lastPriceTraded: z.number().optional(),
  totalMatched: z.number().optional(),
  removalDate: z.string().optional(),
  sp: z.object({
    nearPrice: z.number().optional(),
    farPrice: z.number().optional(),
    backStakeTaken: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })).optional(),
    layLiabilityTaken: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })).optional(),
    actualSP: z.number().optional(),
  }).optional(),
  ex: z.object({
    availableToBack: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })).optional(),
    availableToLay: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })).optional(),
    tradedVolume: z.array(z.object({
      price: z.number(),
      size: z.number(),
    })).optional(),
  }).optional(),
});

export type RunnerBook = z.infer<typeof RunnerBookSchema>;

export const OrderSchema = z.object({
  betId: z.string(),
  marketId: z.string(),
  selectionId: z.string(),
  betStatus: z.string(),
  persistenceType: z.string(),
  orderType: z.string(),
  side: z.string(),
  price: z.number(),
  size: z.number(),
  bspLiability: z.number().optional(),
  placedDate: z.string(),
  matchedDate: z.string().optional(),
  cancelledDate: z.string().optional(),
  settledDate: z.string().optional(),
  profitAndLoss: z.number().optional(),
  sizeMatched: z.number(),
  sizeRemaining: z.number(),
  sizeCancelled: z.number(),
  averagePriceMatched: z.number().optional(),
  priceMatched: z.number().optional(),
  redCardCount: z.number().int().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  product: z.string(),
  status: z.string(),
  error: z.string().optional(),
  kernelVersion: z.string().optional(),
  loginTime: z.string(),
  session: z.object({
    token: z.string(),
    product: z.string(),
    status: z.string(),
    error: z.string().optional(),
    kernelVersion: z.string().optional(),
    loginTime: z.string(),
  }).optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const KeepAliveResponseSchema = z.object({
  header: z.object({
    session: z.string(),
    protocol: z.string(),
    msgType: z.string(),
    invocationNr: z.number().int(),
    timestamp: z.string(),
    returnCode: z.number().int(),
    correlationId: z.string().optional(),
  }),
  body: z.object({
    kernelVersion: z.string(),
    loginTime: z.string(),
  }).optional(),
});

export type KeepAliveResponse = z.infer<typeof KeepAliveResponseSchema>;

export const LogoutResponseSchema = z.object({
  header: z.object({
    session: z.string(),
    protocol: z.string(),
    msgType: z.string(),
    invocationNr: z.number().int(),
    timestamp: z.string(),
    returnCode: z.number().int(),
    correlationId: z.string().optional(),
  }),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export const AccountFundsResponseSchema = z.object({
  availableToBetBalance: z.number(),
  exposure: z.number(),
  retainedCommission: z.number(),
  exposureLimit: z.number(),
  discountRate: z.number(),
  pointsBalance: z.number(),
  wallet: z.string(),
  currencyCode: z.string(),
  fundsTimestamp: z.string(),
  balance: z.number(),
});

export type AccountFundsResponse = z.infer<typeof AccountFundsResponseSchema>;

export const PlaceExecutionReportSchema = z.object({
  customerRef: z.string().optional(),
  status: z.string(),
  marketId: z.string(),
  instructionReports: z.array(z.object({
    status: z.string(),
    errorCode: z.string().optional(),
    instruction: z.object({
      selectionId: z.string(),
      handicap: z.number().optional(),
      side: z.string(),
      orderType: z.string(),
      limitOrder: z.object({
        size: z.number(),
        price: z.number(),
        persistenceType: z.string(),
      }).optional(),
      limitOnCloseOrder: z.object({
        liability: z.number(),
        price: z.number(),
      }).optional(),
      marketOnCloseOrder: z.object({
        liability: z.number(),
      }).optional(),
      customerOrderRef: z.string().optional(),
      customerStrategyRef: z.string().optional(),
    }).optional(),
    orderStatus: z.string(),
    marketId: z.string(),
    selectionId: z.string(),
    handicap: z.number().optional(),
    instructionReportErrorCode: z.string().optional(),
    instructionReportStatus: z.string(),
    orderStatus: z.string(),
    placedDate: z.string().optional(),
    averagePriceMatched: z.number().optional(),
    sizeMatched: z.number(),
    sizeRemaining: z.number(),
    sizeLapsed: z.number(),
    sizeCancelled: z.number(),
    sizeVoided: z.number(),
  })).optional(),
  errorCode: z.string().optional(),
  marketVersion: z.number().optional(),
  instructionReports: z.array(z.object({
    status: z.string(),
    errorCode: z.string().optional(),
    instruction: z.object({
      selectionId: z.string(),
      handicap: z.number().optional(),
      side: z.string(),
      orderType: z.string(),
      limitOrder: z.object({
        size: z.number(),
        price: z.number(),
        persistenceType: z.string(),
      }).optional(),
      limitOnCloseOrder: z.object({
        liability: z.number(),
        price: z.number(),
      }).optional(),
      marketOnCloseOrder: z.object({
        liability: z.number(),
      }).optional(),
      customerOrderRef: z.string().optional(),
      customerStrategyRef: z.string().optional(),
    }).optional(),
    orderStatus: z.string(),
    marketId: z.string(),
    selectionId: z.string(),
    handicap: z.number().optional(),
    instructionReportErrorCode: z.string().optional(),
    instructionReportStatus: z.string(),
    orderStatus: z.string(),
    placedDate: z.string().optional(),
    averagePriceMatched: z.number().optional(),
    sizeMatched: z.number(),
    sizeRemaining: z.number(),
    sizeLapsed: z.number(),
    sizeCancelled: z.number(),
    sizeVoided: z.number(),
  })).optional(),
});

export type PlaceExecutionReport = z.infer<typeof PlaceExecutionReportSchema>;

export const CancelExecutionReportSchema = z.object({
  customerRef: z.string().optional(),
  status: z.string(),
  marketId: z.string(),
  instructionReports: z.array(z.object({
    status: z.string(),
    errorCode: z.string().optional(),
    instruction: z.object({
      betId: z.string(),
      sizeReduction: z.number().optional(),
      cancelledDate: z.string().optional(),
      customerOrderRef: z.string().optional(),
      customerStrategyRef: z.string().optional(),
    }).optional(),
    sizeCancelled: z.number(),
    cancelledDate: z.string().optional(),
    instructionReportErrorCode: z.string().optional(),
    instructionReportStatus: z.string(),
  })).optional(),
  errorCode: z.string().optional(),
});

export type CancelExecutionReport = z.infer<typeof CancelExecutionReportSchema>;

export const CurrentOrderSummarySchema = z.object({
  betId: z.string(),
  marketId: z.string(),
  selectionId: z.string(),
  handicap: z.number().optional(),
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
  cancelledDate: z.string().optional(),
  settledDate: z.string().optional(),
  customerOrderRef: z.string().optional(),
  customerStrategyRef: z.string().optional(),
  averagePriceMatched: z.number().optional(),
  sizeMatched: z.number(),
  sizeRemaining: z.number(),
  sizeLapsed: z.number(),
  sizeCancelled: z.number(),
  sizeVoided: z.number(),
  regulatorCode: z.string().optional(),
  regulatorCode: z.string().optional(),
  commissionRate: z.string().optional(),
  discountAllowed: z.boolean().optional(),
  betCount: z.number().int().optional(),
  commission: z.number().optional(),
  redCardCount: z.number().int().optional(),
});

export type CurrentOrderSummary = z.infer<typeof CurrentOrderSummarySchema>;

export const CurrentOrderSummaryReportSchema = z.object({
  currentOrders: z.array(CurrentOrderSummarySchema),
  moreAvailable: z.boolean(),
});

export type CurrentOrderSummaryReport = z.infer<typeof CurrentOrderSummaryReportSchema>;

export const BetfairErrorSchema = z.object({
  error: z.string(),
  exceptionname: z.string().optional(),
  errorDetails: z.string().optional(),
});

export type BetfairError = z.infer<typeof BetfairErrorSchema>;