declare module 'node-binance-api' {
  interface BinanceOptions {
    APIKEY?: string;
    APISECRET?: string;
    useServerTime?: boolean;
    test?: boolean;
    recvWindow?: number;
    verbose?: boolean;
    log?: (...args: any[]) => void;
  }

           interface BinanceInstance {
           options(options: BinanceOptions): BinanceInstance;
           account(): Promise<any>;
           balance(): Promise<any>;
           futuresAccount(): Promise<any>;
           futuresPositionRisk(): Promise<any>;
           trades(symbol: string, options?: any): Promise<any>;
           prices(symbol: string): Promise<any>;
           candlesticks(symbol: string, interval: string, options?: any): Promise<any>;
           marketBuy(symbol: string, quantity: string): Promise<any>;
           marketSell(symbol: string, quantity: string): Promise<any>;
         }

  function Binance(): BinanceInstance;
  export = Binance;
}
