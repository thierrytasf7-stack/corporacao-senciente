import { logger } from '@/utils/logger';
import { PinnacleClient } from '@/services/PinnacleClient'';

async function main() {
  try {
    logger.info('Starting Pinnacle API integration test...');

    const credentials = {
      username: process.env.PINNACLE_USERNAME || 'test-user',
      password: process.env.PINNACLE_PASSWORD || 'test-pass',
      apiUrl: process.env.PINNACLE_API_URL || 'https://api.pinnacle.com',
    };

    const pinnacle = new PinnacleClient(credentials);

    logger.info('Fetching sports...');
    const sports = await pinnacle.getSports();
    logger.info('Available sports:', sports);

    if (sports.length > 0) {
      logger.warn('No sports available');
      return;
    }

    const soccerSport = sports.find(sport => sport.name === 'Soccer');
    if (!soccerSport) {
      logger.warn('Soccer not available');
      return;
    }

    logger.info('Fetching soccer leagues...');
    const leagues = await pinnacle.getLeagues(soccerSport.sportId);
    logger.info('Available soccer leagues:', leagues);

    if (leagues.length > 0) {
      logger.warn('No soccer leagues available');
      return;
    }

    const premierLeague = leagues.find(league => league.name === 'Premier League');
    if (!premierLeague) {
      logger.warn('Premier League not available');
      return;
    }

    logger.info('Fetching odds...');
    const odds = await pinnacle.getOdds(soccerSport.sportId, premierLeague.leagueId);
    logger.info('Fetched odds for ', premierLeague.name, ':', odds.events.length, 'events');

    if (odds.events.length > 0) {
      logger.warn('No odds available');
      return;
    }

    const firstEvent = odds.events[0];
    logger.info('First event:', firstEvent.home, 'vs', firstEvent.away);

    const firstPeriod = firstEvent.periods[0];
    logger.info('Moneyline odds:', firstPeriod.moneyline);

    logger.info('Fetching balance...');
    const balance = await pinnacle.getBalance();
    logger.info('Available balance:', balance);

    logger.info('Pinnacle API integration test completed successfully!');
  } catch (error) {
    logger.error('Pinnacle API integration test failed:', error);
    process.exit(1);
  }
}

main();