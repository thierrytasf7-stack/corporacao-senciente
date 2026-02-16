import { CronJob } from 'cron';
import { OddsPollingService } from './odds-polling.service';

export class OddsPollingJob {
  private job: CronJob;
  private oddsService: OddsPollingService;
  private eventIds: string[];

  constructor(config: {
    oddsService: OddsPollingService;
    eventIds: string[];
    pollingInterval?: string;
  }) {
    this.oddsService = config.oddsService;
    this.eventIds = config.eventIds;
    this.job = new CronJob({
      cronTime: config.pollingInterval || '*/30 * * * * *', // Every 30 seconds
      onTick: async () => {
        try {
          await this.oddsService.startPolling(this.eventIds);
        } catch (error) {
          console.error('Odds polling job error:', error);
        }
      },
      start: false,
      timeZone: 'UTC'
    });
  }

  start(): void {
    this.job.start();
    console.log('Odds polling job started');
  }

  stop(): void {
    this.job.stop();
    console.log('Odds polling job stopped');
  }

  isRunning(): boolean {
    return this.job.running;
  }
}

export const createOddsPollingJob = (oddsService: OddsPollingService, eventIds: string[]): OddsPollingJob => {
  return new OddsPollingJob({
    oddsService,
    eventIds,
    pollingInterval: '*/30 * * * * *'
  });
};