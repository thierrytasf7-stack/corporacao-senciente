import { OddsPollingService } from './odds-polling.service';
import { createOddsPollingJob } from './odds-polling.job';

export class OddsModule {
  private oddsService: OddsPollingService;
  private oddsJob: OddsPollingJob;

  constructor(config: {
    prisma: any;
    betfairService: any;
    pinnacleService: any;
    eventIds: string[];
  }) {
    this.oddsService = new OddsPollingService({
      prisma: config.prisma,
      betfairService: config.betfairService,
      pinnacleService: config.pinnacleService
    });

    this.oddsJob = createOddsPollingJob(this.oddsService, config.eventIds);
  }

  async initialize(): Promise<void> {
    await this.oddsService.initialize();
    this.oddsJob.start();
  }

  getOddsService(): OddsPollingService {
    return this.oddsService;
  }

  getOddsJob(): OddsPollingJob {
    return this.oddsJob;
  }

  async shutdown(): Promise<void> {
    this.oddsJob.stop();
    await this.oddsService.shutdown();
  }
}

export const createOddsModule = (config: {
  prisma: any;
  betfairService: any;
  pinnacleService: any;
  eventIds: string[];
}): OddsModule => {
  return new OddsModule(config);
};