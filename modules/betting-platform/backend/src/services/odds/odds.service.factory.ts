import { PrismaClient } from '@prisma/client';
import { OddsModule } from './odds.module';
import { BetfairService } from '../betfair/service';
import { PinnacleService } from '../pinnacle/service';

export class OddsServiceFactory {
  static create(config: {
    prisma: PrismaClient;
    betfairConfig: any;
    pinnacleConfig: any;
    eventIds: string[];
  }): OddsModule {
    const betfairService = new BetfairService(config.betfairConfig);
    const pinnacleService = new PinnacleService(config.pinnacleConfig);

    return new OddsModule({
      prisma: config.prisma,
      betfairService,
      pinnacleService,
      eventIds: config.eventIds
    });
  }
}

export class OddsServiceManager {
  private static instance: OddsServiceManager;
  private oddsModule: OddsModule | null = null;

  static getInstance(): OddsServiceManager {
    if (!OddsServiceManager.instance) {
      OddsServiceManager.instance = new OddsServiceManager();
    }
    return OddsServiceManager.instance;
  }

  async initialize(config: {
    prisma: PrismaClient;
    betfairConfig: any;
    pinnacleConfig: any;
    eventIds: string[];
  }): Promise<void> {
    if (this.oddsModule) {
      await this.shutdown();
    }

    this.oddsModule = OddsServiceFactory.create(config);
    await this.oddsModule.initialize();
  }

  getOddsService(): OddsModule | null {
    return this.oddsModule;
  }

  async shutdown(): Promise<void> {
    if (this.oddsModule) {
      await this.oddsModule.shutdown();
      this.oddsModule = null;
    }
  }
}

export const initializeOddsService = async (config: {
  prisma: PrismaClient;
  betfairConfig: any;
  pinnacleConfig: any;
  eventIds: string[];
}): Promise<OddsModule> => {
  const manager = OddsServiceManager.getInstance();
  await manager.initialize(config);
  return manager.getOddsService()!;
};

export const getOddsService = (): OddsModule | null => {
  const manager = OddsServiceManager.getInstance();
  return manager.getOddsService();
};

export const shutdownOddsService = async (): Promise<void> => {
  const manager = OddsServiceManager.getInstance();
  await manager.shutdown();
};