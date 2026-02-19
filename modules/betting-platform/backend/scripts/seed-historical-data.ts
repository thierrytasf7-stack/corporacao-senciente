import { HistoricalDataLoader } from '../services/HistoricalDataLoader';
import { Pool } from 'pg';

interface HistoricalMatch {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: Date;
  odds: {
    homeWin: number;
    draw?: number;
    awayWin: number;
    timestamp: Date;
  }[];
  result: {
    homeScore: number;
    awayScore: number;
    outcome: 'home' | 'draw' | 'away';
  };
}

const SPORTS = ['Football', 'Tennis', 'Basketball'];
const LEAGUES = {
  Football: ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'],
  Tennis: ['ATP Tour', 'WTA Tour', 'Grand Slam', 'Davis Cup'],
  Basketball: ['NBA', 'EuroLeague', 'EuroCup', 'ACB', 'VTB United League']
};

const TEAMS = {
  Football: [
    ['Manchester United', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City', 'Tottenham'],
    ['Barcelona', 'Real Madrid', 'Atletico Madrid', 'Sevilla', 'Valencia', 'Villarreal'],
    ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Schalke 04', 'Wolfsburg'],
    ['Juventus', 'Inter Milan', 'AC Milan', 'Roma', 'Napoli', 'Lazio'],
    ['Paris Saint-Germain', 'Marseille', 'Lyon', 'Monaco', 'Rennes', 'Nice']
  ],
  Tennis: [
    ['Novak Djokovic', 'Rafael Nadal', 'Roger Federer', 'Daniil Medvedev', 'Stefanos Tsitsipas', 'Alexander Zverev'],
    ['Ashleigh Barty', 'Naomi Osaka', 'Serena Williams', 'Simona Halep', 'Sofia Kenin', 'Bianca Andreescu']
  ],
  Basketball: [
    ['Los Angeles Lakers', 'Brooklyn Nets', 'Golden State Warriors', 'Milwaukee Bucks', 'Phoenix Suns', 'Chicago Bulls'],
    ['Real Madrid', 'Barcelona', 'CSKA Moscow', 'Anadolu Efes', 'Fenerbahce', 'Olympiacos']
  ]
};

function generateRandomDate(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

function generateRealisticOdds(): { homeWin: number; draw?: number; awayWin: number; timestamp: Date } {
  const homeWin = parseFloat((Math.random() * 4 + 1.2).toFixed(2));
  const draw = Math.random() > 0.3 ? parseFloat((Math.random() * 3.5 + 2.5).toFixed(2)) : undefined;
  const awayWin = parseFloat((Math.random() * 4 + 1.2).toFixed(2));
  
  return {
    homeWin,
    draw,
    awayWin,
    timestamp: new Date()
  };
}

function generateMatchResult(): { homeScore: number; awayScore: number; outcome: 'home' | 'draw' | 'away' } {
  const homeScore = Math.floor(Math.random() * 5);
  const awayScore = Math.floor(Math.random() * 5);
  
  if (homeScore > awayScore) return { homeScore, awayScore, outcome: 'home' };
  if (awayScore > homeScore) return { homeScore, awayScore, outcome: 'away' };
  return { homeScore, awayScore, outcome: 'draw' };
}

function generateHistoricalMatch(index: number, sport: string, league: string, date: Date): HistoricalMatch {
  const teams = TEAMS[sport as keyof typeof TEAMS];
  const leagueIndex = Math.floor(Math.random() * teams.length);
  const homeTeam = teams[leagueIndex][Math.floor(Math.random() * teams[leagueIndex].length)];
  let awayTeam = teams[leagueIndex][Math.floor(Math.random() * teams[leagueIndex].length)];

  while (homeTeam === awayTeam) {
    awayTeam = teams[leagueIndex][Math.floor(Math.random() * teams[leagueIndex].length)];
  }
  
  const odds = [];
  const numOdds = Math.floor(Math.random() * 5) + 1;
  
  for (let i = 0; i < numOdds; i++) {
    odds.push(generateRealisticOdds());
  }
  
  const result = generateMatchResult();
  
  return {
    id: `match_${index}`,
    sport,
    league,
    homeTeam,
    awayTeam,
    date,
    odds,
    result
  };
}

async function seedHistoricalData(): Promise<void> {
  console.log('Starting to seed historical data...');

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const endDate = new Date();

  const historicalMatches: HistoricalMatch[] = [];

  for (let i = 0; i < 100; i++) {
    const sport = SPORTS[Math.floor(Math.random() * SPORTS.length)];
    const league = LEAGUES[sport as keyof typeof LEAGUES][Math.floor(Math.random() * LEAGUES[sport as keyof typeof LEAGUES].length)];
    const date = generateRandomDate(startDate, endDate);

    const match = generateHistoricalMatch(i, sport, league, date);
    historicalMatches.push(match);
  }

  console.log(`Generated ${historicalMatches.length} historical matches`);

  // Save to JSON file
  const fs = require('fs');
  const path = require('path');

  const dataDir = path.join(__dirname, '../data/historical');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, 'historical-matches.json');
  fs.writeFileSync(filePath, JSON.stringify(historicalMatches, null, 2));

  console.log(`✅ Saved ${historicalMatches.length} matches to ${filePath}`);
  console.log('Historical data seeding completed successfully!');
}

if (require.main === module) {
  seedHistoricalData().catch(console.error);
}