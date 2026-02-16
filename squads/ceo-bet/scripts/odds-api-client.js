#!/usr/bin/env node
/**
 * The Odds API Client
 * Wrapper para acesso à API de odds esportivas
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 */

const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';

class OddsAPIClient {
  constructor(apiKey = API_KEY) {
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not found in environment');
    }
    this.apiKey = apiKey;
    this.baseURL = BASE_URL;
  }

  /**
   * Get available sports
   */
  async getSports() {
    const response = await axios.get(`${this.baseURL}/sports`, {
      params: { apiKey: this.apiKey }
    });
    return response.data;
  }

  /**
   * Get odds for specific sport
   * @param {string} sport - Sport key (e.g., 'soccer_epl', 'basketball_nba')
   * @param {string[]} regions - Regions (e.g., ['us', 'uk', 'eu'])
   * @param {string[]} markets - Markets (e.g., ['h2h', 'spreads', 'totals'])
   */
  async getOdds(sport, regions = ['us', 'uk'], markets = ['h2h']) {
    const response = await axios.get(`${this.baseURL}/sports/${sport}/odds`, {
      params: {
        apiKey: this.apiKey,
        regions: regions.join(','),
        markets: markets.join(','),
        oddsFormat: 'decimal',
        dateFormat: 'iso'
      }
    });
    return response.data;
  }

  /**
   * Get historical odds
   */
  async getHistoricalOdds(sport, date) {
    const response = await axios.get(`${this.baseURL}/historical/sports/${sport}/odds`, {
      params: {
        apiKey: this.apiKey,
        date: date,
        oddsFormat: 'decimal'
      }
    });
    return response.data;
  }

  /**
   * Get remaining API requests quota
   */
  async getQuota() {
    const response = await axios.get(`${this.baseURL}/sports`, {
      params: { apiKey: this.apiKey }
    });
    return {
      remaining: response.headers['x-requests-remaining'],
      used: response.headers['x-requests-used']
    };
  }
}

// CLI usage
if (require.main === module) {
  const client = new OddsAPIClient();

  const command = process.argv[2];

  (async () => {
    try {
      switch(command) {
        case 'sports':
          const sports = await client.getSports();
          console.log(JSON.stringify(sports, null, 2));
          break;

        case 'odds':
          const sport = process.argv[3] || 'soccer_epl';
          const odds = await client.getOdds(sport);
          console.log(JSON.stringify(odds, null, 2));
          break;

        case 'quota':
          const quota = await client.getQuota();
          console.log('API Quota:', quota);
          break;

        default:
          console.log(`
Usage: node odds-api-client.js <command> [args]

Commands:
  sports              List available sports
  odds <sport_key>    Get odds for sport (default: soccer_epl)
  quota               Get remaining API quota

Examples:
  node odds-api-client.js sports
  node odds-api-client.js odds soccer_epl
  node odds-api-client.js odds basketball_nba
  node odds-api-client.js quota
          `);
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
  })();
}

module.exports = OddsAPIClient;
