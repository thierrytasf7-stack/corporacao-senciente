export enum StrategyType {
  BET = 'BET',
  MATH = 'MATH'
}

export interface StrategyConfig {
  type: StrategyType;
  name: string;
  [key: string]: any;
}

export abstract class Strategy {
  constructor(protected config: StrategyConfig) {}
  
  abstract validate(): boolean;
  
  getType(): StrategyType {
    return this.config.type;
  }
  
  getName(): string {
    return this.config.name;
  }
}
