const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 21370;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ─── PATHS ───────────────────────────────────────────────────────────────────
const DATA_DIR      = path.join(__dirname, 'data');
const BACKTESTS_DIR = path.join(DATA_DIR, 'backtests');
const LIB_DIR       = path.join(DATA_DIR, 'libraries');
const LEARNING_LOG  = path.join(LIB_DIR, 'learning-log.json');

[BACKTESTS_DIR, LIB_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ─── LIBRARY LOADER ───────────────────────────────────────────────────────────
function loadLib(name) {
  const p = path.join(LIB_DIR, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// ─── SEEDED RNG (xorshift32) ──────────────────────────────────────────────────
function seededRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  if (s === 0) s = 1;
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
}

// ─── POISSON SAMPLE ───────────────────────────────────────────────────────────
function poisson(lambda, rng) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

// ─── MATCH GENERATOR ─────────────────────────────────────────────────────────
function getTeams(sport, leagueId) {
  const catalog = loadLib('sports-catalog.json');
  if (!catalog) return ['Home', 'Away'];
  const s = catalog.sports.find(x => x.id === sport);
  if (!s) return ['Home', 'Away'];
  const l = s.leagues.find(x => x.id === leagueId);
  return (l && l.teams.length >= 4) ? l.teams : s.leagues[0].teams;
}

function generateOdds(sport, rng) {
  if (sport === 'basketball' || sport === 'american-football' || sport === 'hockey') {
    const hp = 0.42 + rng() * 0.22;
    const ap = 1 - hp;
    const m = 1.055;
    return { h: +(m/hp).toFixed(2), d: null, a: +(m/ap).toFixed(2), hp, dp: 0, ap };
  }
  if (sport === 'tennis') {
    const hp = 0.38 + rng() * 0.30;
    const ap = 1 - hp;
    const m = 1.06;
    return { h: +(m/hp).toFixed(2), d: null, a: +(m/ap).toFixed(2), hp, dp: 0, ap };
  }
  // Football
  const hp = 0.35 + rng() * 0.25;
  const dp = 0.20 + rng() * 0.12;
  const ap = Math.max(1 - hp - dp, 0.08);
  const m = 1.08;
  return { h: +(m/hp).toFixed(2), d: +(m/dp).toFixed(2), a: +(m/ap).toFixed(2), hp, dp, ap };
}

function generateMatch(sport, leagueId, date, idx, rng, pool) {
  const shuffled = [...pool].sort(() => rng() - 0.5);
  const i = (idx * 2) % Math.max(pool.length - 1, 2);
  const home = shuffled[i % pool.length];
  const away = shuffled[(i + 1) % pool.length] === home
    ? shuffled[(i + 2) % pool.length]
    : shuffled[(i + 1) % pool.length];

  const o = generateOdds(sport, rng);

  // Outcome
  const r = rng();
  let outcome = r < o.hp ? 'home' : (r < o.hp + o.dp ? 'draw' : 'away');

  // Goals (football/hockey only)
  let homeGoals = 0, awayGoals = 0;
  if (sport === 'football' || sport === 'hockey') {
    homeGoals = poisson(1.1 + o.hp * 0.8, rng);
    awayGoals = poisson(0.8 + o.ap * 0.8, rng);
    // Align goals with outcome
    if (outcome === 'home' && homeGoals <= awayGoals) homeGoals = awayGoals + 1;
    if (outcome === 'away' && awayGoals <= homeGoals) awayGoals = homeGoals + 1;
    if (outcome === 'draw') {
      const g = Math.min(homeGoals, awayGoals);
      homeGoals = g; awayGoals = g;
    }
  }

  // Basketball point scores (realistic NBA range: 95–130 per team)
  let homePoints = 0, awayPoints = 0;
  if (sport === 'basketball') {
    const baseH = 96 + Math.floor(rng() * 30);
    const baseA = 94 + Math.floor(rng() * 30);
    homePoints = baseH + Math.round((rng() - 0.5) * 10);
    awayPoints = baseA + Math.round((rng() - 0.5) * 10);
    if (outcome === 'home' && homePoints <= awayPoints) homePoints = awayPoints + 1 + Math.floor(rng() * 12);
    if (outcome === 'away' && awayPoints <= homePoints) awayPoints = homePoints + 1 + Math.floor(rng() * 12);
  }

  return {
    id: `m-${date.getTime()}-${idx}`,
    sport, leagueId,
    homeTeam: home, awayTeam: away,
    matchDate: new Date(date),
    bookmaker: 'DemoBook',
    odds: { '1': o.h, 'X': o.d, '2': o.a },
    impliedProb: { home: 1/o.h, draw: o.d ? 1/o.d : 0, away: 1/o.a },
    trueProb: { home: o.hp, draw: o.dp, away: o.ap },
    outcome,
    homeGoals, awayGoals,
    totalGoals: homeGoals + awayGoals,
    btts: homeGoals > 0 && awayGoals > 0,
    homePoints, awayPoints
  };
}

function generateHistoricalData(sport, leagueId, startDate, endDate, filters, rng) {
  const minOdds = filters.minOdds || 1.30;
  const maxOdds = filters.maxOdds || 15.0;
  const pool = getTeams(sport, leagueId);

  const matches = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  let idx = 0;

  while (cur < end) {
    const dow = cur.getDay();
    const isMD = (sport === 'football')
      ? (dow === 6 || dow === 0 || dow === 3)
      : (sport === 'basketball' || sport === 'hockey')
        ? (dow !== 1)   // every day except Monday
        : (dow === 0 || dow === 6 || dow === 3 || dow === 2); // default

    if (isMD) {
      const n = sport === 'basketball' ? 4 + Math.floor(rng() * 5) : 2 + Math.floor(rng() * 4);
      for (let i = 0; i < Math.min(n, Math.floor(pool.length / 2)); i++) {
        const m = generateMatch(sport, leagueId, cur, idx++, rng, pool);
        // Apply odds filter
        if (m.odds['1'] >= minOdds && m.odds['2'] >= minOdds &&
            m.odds['1'] <= maxOdds && m.odds['2'] <= maxOdds) {
          matches.push(m);
        }
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return matches;
}

// ─── BETTING STRATEGIES ───────────────────────────────────────────────────────

function stratValueBetting(match, rng, params = {}) {
  const minEdge = params.minEdge || 0.025;
  const noise = () => (rng() - 0.5) * 0.10;
  const mH = Math.max(0.05, match.trueProb.home + noise());
  const mA = Math.max(0.05, match.trueProb.away + noise());
  const eH = mH - match.impliedProb.home;
  const eA = mA - match.impliedProb.away;
  if (eH >= eA && eH >= minEdge) return { sel: '1', odds: match.odds['1'], prob: mH, edge: eH, team: match.homeTeam };
  if (eA >= minEdge)              return { sel: '2', odds: match.odds['2'], prob: mA, edge: eA, team: match.awayTeam };
  return null;
}

function stratBackFavourite(match, _rng, params = {}) {
  const maxOdds = params.maxFavouriteOdds || 1.90;
  const h = match.odds['1'], a = match.odds['2'];
  if (h < a && h <= maxOdds) return { sel: '1', odds: h, prob: match.trueProb.home, edge: 0, team: match.homeTeam };
  if (a < h && a <= maxOdds) return { sel: '2', odds: a, prob: match.trueProb.away, edge: 0, team: match.awayTeam };
  return null;
}

function stratBackUnderdog(match, _rng, params = {}) {
  const minO = params.minUnderdogOdds || 3.00;
  const maxO = params.maxUnderdogOdds || 8.00;
  const h = match.odds['1'], a = match.odds['2'];
  const underdog = h > a ? { sel: '1', odds: h, team: match.homeTeam } : { sel: '2', odds: a, team: match.awayTeam };
  if (underdog.odds >= minO && underdog.odds <= maxO) {
    return { ...underdog, prob: underdog.sel === '1' ? match.trueProb.home : match.trueProb.away, edge: 0 };
  }
  return null;
}

function stratLayDraw(match, _rng, _params = {}) {
  if (!match.odds['X']) return null; // no draw market
  return { sel: 'lay-draw', odds: match.odds['X'], prob: 1 - match.trueProb.draw, edge: 0, team: 'No Draw' };
}

function stratOverUnder25(match, _rng, params = {}) {
  const preferOver = params.preferOver !== false;
  const expGoals = match.homeGoals + match.awayGoals; // actual outcome
  // Model: estimate total goals based on team probabilities
  const estGoals = 1.3 + match.trueProb.home * 0.5 + match.trueProb.away * 0.5;
  if (preferOver && estGoals > 2.5) {
    return { sel: 'over-25', odds: 1.85, prob: 0.52, edge: 0.02, team: 'Over 2.5' };
  }
  if (!preferOver && estGoals < 2.5) {
    return { sel: 'under-25', odds: 2.00, prob: 0.48, edge: -0.02, team: 'Under 2.5' };
  }
  return null;
}

function stratBTTS(match, _rng, params = {}) {
  const direction = params.direction || 'yes';
  if (direction === 'yes') {
    return { sel: 'btts-yes', odds: 1.85, prob: 0.53, edge: 0.02, team: 'BTTS Sim' };
  }
  return { sel: 'btts-no', odds: 2.00, prob: 0.47, edge: -0.01, team: 'BTTS Não' };
}

// ──────────────────────────────────────────────────────────────────────────────
// STAKING STRATEGIES
// ──────────────────────────────────────────────────────────────────────────────

// Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...
function getFibonacciStake(step, baseUnit) {
  if (step <= 0) return baseUnit;
  let a = 1, b = 1;
  for (let i = 1; i < step; i++) {
    [a, b] = [b, a + b];
  }
  return a * baseUnit;
}

// Remove outliers using IQR method
function removeOutliers(values) {
  if (values.length < 4) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  if (iqr === 0) return values;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const clean = values.filter(v => v >= lower && v <= upper);
  return clean.length >= 3 ? clean : values; // never drop below 3 values
}

// ─── LIVE OVER POINTS (Basquete) ─────────────────────────────────────────────
function runLiveOverPointsBacktest(config) {
  const targetTeam   = config.targetTeam || null;
  const thresholdPct = (config.bettingParams && config.bettingParams.thresholdPct) || 0.85;
  const minOdds      = (config.bettingParams && config.bettingParams.minOdds) || 1.70;
  const lookback     = (config.bettingParams && config.bettingParams.lookbackGames) || 10;
  const leagueId     = config.leagueId || 'nba';
  const sport        = config.sport || 'basketball';

  const seed = config.dateRange.start.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
             + (targetTeam || '').length + sport.length;
  const rng = seededRand(seed);

  const allMatches = generateHistoricalData(sport, leagueId, config.dateRange.start, config.dateRange.end, {}, rng);
  const teamMatches = targetTeam
    ? allMatches.filter(m => m.homeTeam === targetTeam || m.awayTeam === targetTeam)
    : allMatches;

  if (teamMatches.length < lookback + 1) throw new Error(`Time "${targetTeam}" precisa de pelo menos ${lookback + 1} jogos no período`);

  const teamHistory = [];
  const opportunities = [];

  for (let i = 0; i < teamMatches.length; i++) {
    const match = teamMatches[i];
    const isHome = match.homeTeam === targetTeam;
    const teamPoints = isHome ? match.homePoints : match.awayPoints;

    if (i < lookback) {
      teamHistory.push(teamPoints);
      continue;
    }

    // Rolling window + outlier removal
    const recent = teamHistory.slice(-lookback);
    const clean  = removeOutliers(recent);
    const cleanAvg   = clean.reduce((a, b) => a + b, 0) / clean.length;
    const threshold  = cleanAvg * thresholdPct;
    const outlierCnt = recent.length - clean.length;

    // Simulate halftime score (~44–52% of final with variance)
    const halfPct    = 0.44 + rng() * 0.08;
    const halfPoints = Math.round(teamPoints * halfPct);
    const halfPace   = Math.round(halfPoints * 2);

    // Opportunity exists when pace is uncertain (within ±22pts of threshold)
    const paceGap = halfPace - threshold;
    if (Math.abs(paceGap) > 22) {
      teamHistory.push(teamPoints);
      continue;
    }

    // Simulated live odds: higher uncertainty → higher odds
    const impliedProb = Math.min(0.88, Math.max(0.42, 0.52 + paceGap / 55));
    const liveOdds    = +(1.05 / impliedProb).toFixed(2);

    if (liveOdds < minOdds) {
      teamHistory.push(teamPoints);
      continue;
    }

    const won = teamPoints >= Math.round(threshold);

    opportunities.push({
      date:            match.matchDate.toISOString().split('T')[0],
      match:           `${match.homeTeam} vs ${match.awayTeam}`,
      team:            targetTeam,
      cleanScores:     clean,
      outliersRemoved: outlierCnt,
      cleanAvg:        +cleanAvg.toFixed(1),
      threshold:       +threshold.toFixed(1),
      halfPoints,
      halfPace,
      finalPoints:     teamPoints,
      liveOdds,
      selection:       `Over ${Math.round(threshold)} pts`,
      result:          won ? 'W' : 'L',
      margin:          +(teamPoints - threshold).toFixed(1)
    });

    teamHistory.push(teamPoints);
  }

  const wins  = opportunities.filter(o => o.result === 'W').length;
  const total = opportunities.length;
  const stakeUnit   = (config.initialBankroll || 1000) * 0.02;
  const totalProfit = opportunities.reduce((s, o) =>
    o.result === 'W' ? s + stakeUnit * (o.liveOdds - 1) : s - stakeUnit, 0);
  const totalStaked = total * stakeUnit;

  return {
    strategyType:       'live-over-points',
    targetTeam,
    lookbackGames:      lookback,
    thresholdPct,
    minOdds,
    totalGamesAnalyzed: teamMatches.length,
    gamesWithHistory:   teamMatches.length - lookback,
    opportunities,
    metrics: {
      totalOpportunities: total,
      wins,
      losses:      total - wins,
      winRate:     total > 0 ? +(wins / total).toFixed(4) : 0,
      roi:         totalStaked > 0 ? +(totalProfit / totalStaked).toFixed(4) : 0,
      totalProfit: +totalProfit.toFixed(2),
      finalBankroll: +((config.initialBankroll || 1000) + totalProfit).toFixed(2),
      avgLiveOdds: total > 0 ? +(opportunities.reduce((s, o) => s + o.liveOdds, 0) / total).toFixed(2) : 0,
      avgThreshold: total > 0 ? +(opportunities.reduce((s, o) => s + o.threshold, 0) / total).toFixed(1) : 0,
      avgFinalPoints: total > 0 ? +(opportunities.reduce((s, o) => s + o.finalPoints, 0) / total).toFixed(1) : 0,
      betCount:    total,
      matchesAnalysed: teamMatches.length
    }
  };
}

const STRATEGIES = {
  'value-betting':    stratValueBetting,
  'back-favourite':   stratBackFavourite,
  'back-underdog':    stratBackUnderdog,
  'lay-draw':         stratLayDraw,
  'over-under-25':    stratOverUnder25,
  'btts':             stratBTTS,
  'money-line-value': stratValueBetting, // reuse value betting for basketball
};

// ─── SETTLE ──────────────────────────────────────────────────────────────────
function settle(bet, match) {
  if (bet.sel === 'lay-draw') return match.outcome !== 'draw' ? 'win' : 'loss';
  if (bet.sel === 'over-25')  return match.totalGoals > 2.5  ? 'win' : 'loss';
  if (bet.sel === 'under-25') return match.totalGoals < 2.5  ? 'win' : 'loss';
  if (bet.sel === 'btts-yes') return match.btts               ? 'win' : 'loss';
  if (bet.sel === 'btts-no')  return !match.btts              ? 'win' : 'loss';
  if (bet.sel === '1') return match.outcome === 'home' ? 'win' : 'loss';
  if (bet.sel === '2') return match.outcome === 'away' ? 'win' : 'loss';
  return 'loss';
}

// ─── STAKING ─────────────────────────────────────────────────────────────────
const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

function initStakingState(strategy, initialBankroll, params = {}) {
  const base = initialBankroll * (params.baseUnit || params.stakePct || 0.01);
  return { level: 1, fibIdx: 0, multiplier: 1, base };
}

function calcStake(strategy, bankroll, bet, state, initialBankroll, params = {}) {
  const MAX_PCT = params.maxStakePct || 0.08;
  const cap = bankroll * MAX_PCT;
  switch (strategy) {
    case 'fixed':
      return Math.min(initialBankroll * (params.stakePct || 0.02), cap);
    case 'percentage':
      return Math.min(bankroll * (params.stakePct || 0.03), cap);
    case 'kelly': {
      const b = bet.odds - 1;
      const p = bet.prob || 0.5;
      const q = 1 - p;
      const k = Math.max(0, (b * p - q) / b);
      return Math.min(bankroll * k * (params.fraction || 0.25), cap);
    }
    case 'dalembert':
      return Math.min(state.base * Math.min(state.level, params.maxLevel || 10), cap);
    case 'fibonacci':
      return Math.min(state.base * FIB[Math.min(state.fibIdx, (params.maxIndex || 8))], cap);
    case 'martingale':
      return Math.min(state.base * Math.min(state.multiplier, params.maxMultiplier || 8), cap);
    default:
      return Math.min(bankroll * 0.02, cap);
  }
}

function updateStakingState(strategy, state, result) {
  if (strategy === 'dalembert') {
    state.level = result === 'win' ? Math.max(1, state.level - 1) : state.level + 1;
  } else if (strategy === 'fibonacci') {
    state.fibIdx = result === 'win' ? Math.max(0, state.fibIdx - 2) : state.fibIdx + 1;
  } else if (strategy === 'martingale') {
    state.multiplier = result === 'win' ? 1 : state.multiplier * 2;
  }
}

// ─── SHARPE RATIO ────────────────────────────────────────────────────────────
function calcSharpe(curve) {
  if (curve.length < 2) return 0;
  const rets = curve.slice(1).map((p, i) => (p.equity - curve[i].equity) / curve[i].equity);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const std  = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length);
  return std > 0 ? +(mean / std * Math.sqrt(252)).toFixed(4) : 0;
}

// ─── MAIN BACKTEST ENGINE ─────────────────────────────────────────────────────
function runBacktest(strategyId, config) {
  // Special handler for live-over-points
  if (strategyId === 'live-over-points' || config.bettingStrategy === 'live-over-points') {
    return runLiveOverPointsBacktest(config);
  }

  const sport       = config.sport       || 'football';
  const leagueId    = config.leagueId    || 'premier-league';
  const bettingStrat = config.bettingStrategy || strategyId;
  const stakingStrat = config.stakingStrategy || 'kelly';
  const betParams    = config.bettingParams  || {};
  const stakeParams  = config.stakingParams  || {};

  const seed = config.dateRange.start.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
             + strategyId.length + sport.length;
  const rng  = seededRand(seed);

  const matches = generateHistoricalData(sport, leagueId, config.dateRange.start, config.dateRange.end, config.filters || {}, rng);
  if (matches.length === 0) throw new Error('Nenhuma partida gerada para o período/filtros especificados');

  const stratFn = STRATEGIES[bettingStrat] || stratValueBetting;
  let bankroll = config.initialBankroll;
  const stakingState = initStakingState(stakingStrat, config.initialBankroll, stakeParams);

  const bets = [];
  const equityCurve = [{ date: config.dateRange.start, equity: bankroll }];
  let maxEquity = bankroll, maxDrawdown = 0;

  for (const match of matches) {
    const bet = stratFn(match, rng, betParams);
    if (!bet) continue;

    const stake = calcStake(stakingStrat, bankroll, bet, stakingState, config.initialBankroll, stakeParams);
    if (stake < 0.01 || stake > bankroll) continue;

    const result = settle(bet, match);
    let profit;
    if (result === 'win') {
      // Lay the Draw: profit = stake (we COLLECT the backer's stake), lose = liability = stake*(odds-1)
      profit = bettingStrat === 'lay-draw'
        ? +stake.toFixed(2)
        : +(stake * (bet.odds - 1)).toFixed(2);
    } else {
      profit = bettingStrat === 'lay-draw'
        ? +(-stake * (bet.odds - 1)).toFixed(2)
        : +(-stake).toFixed(2);
    }

    bankroll = +(bankroll + profit).toFixed(2);
    if (bankroll <= 0) { bankroll = 0; break; } // ruin

    maxEquity   = Math.max(maxEquity, bankroll);
    maxDrawdown = Math.max(maxDrawdown, maxEquity - bankroll);

    updateStakingState(stakingStrat, stakingState, result);

    bets.push({
      id:             `bet-${match.id}`,
      strategyId,
      strategyType:   bettingStrat.toUpperCase().replace(/-/g, '_'),
      timestamp:      match.matchDate.toISOString(),
      homeTeam:       match.homeTeam,
      awayTeam:       match.awayTeam,
      market:         bet.sel.includes('over') || bet.sel.includes('under') || bet.sel.includes('btts') ? bet.sel : 'MATCH_WINNER',
      selection:      bet.team,
      bookmaker:      match.bookmaker,
      odds:           bet.odds,
      edge:           +(bet.edge || 0).toFixed(4),
      stake:          +stake.toFixed(2),
      profit,
      result,
      status:         result === 'win' ? 'WON' : 'LOST',
      settlementDate: match.matchDate.toISOString(),
      score:          (sport === 'football' || sport === 'hockey') ? `${match.homeGoals}–${match.awayGoals}` : null
    });

    equityCurve.push({ date: match.matchDate.toISOString(), equity: bankroll });
  }

  const wins       = bets.filter(b => b.result === 'win').length;
  const totalProfit = +bets.reduce((s, b) => s + b.profit, 0).toFixed(2);
  const totalStake  = +bets.reduce((s, b) => s + b.stake, 0).toFixed(2);
  const avgOdds     = bets.length > 0 ? +(bets.reduce((s, b) => s + b.odds, 0) / bets.length).toFixed(2) : 0;

  return {
    metrics: {
      winRate:          bets.length > 0 ? +(wins / bets.length).toFixed(4) : 0,
      roi:              totalStake > 0  ? +(totalProfit / totalStake).toFixed(4) : 0,
      totalProfit,
      sharpeRatio:      calcSharpe(equityCurve),
      maxDrawdown:      +maxDrawdown.toFixed(2),
      maxDrawdownPct:   config.initialBankroll > 0 ? +(maxDrawdown / config.initialBankroll).toFixed(4) : 0,
      avgOdds,
      betCount:         bets.length,
      matchesAnalysed:  matches.length,
      finalBankroll:    bankroll,
      totalStake
    },
    bets,
    equityCurve
  };
}

// ─── LEARNING LOG ─────────────────────────────────────────────────────────────
function appendToLearningLog(backtestId, config, metrics) {
  try {
    const log = fs.existsSync(LEARNING_LOG)
      ? JSON.parse(fs.readFileSync(LEARNING_LOG, 'utf-8'))
      : { version: '1.0', records: [], insights: { totalBacktests: 0, profitableCount: 0, unprofitableCount: 0 } };

    const record = {
      id: backtestId,
      date: new Date().toISOString().split('T')[0],
      sport: config.sport || 'football',
      leagueId: config.leagueId || 'premier-league',
      period: `${config.dateRange.start} → ${config.dateRange.end}`,
      bettingStrategy: config.bettingStrategy || 'value-betting',
      stakingStrategy: config.stakingStrategy,
      initialBankroll: config.initialBankroll,
      finalBankroll: metrics.finalBankroll,
      roi: metrics.roi,
      roiPct: +(metrics.roi * 100).toFixed(2),
      winRate: metrics.winRate,
      betCount: metrics.betCount,
      sharpeRatio: metrics.sharpeRatio,
      maxDrawdownPct: metrics.maxDrawdownPct,
      verdict: metrics.roi > 0 ? 'LUCRATIVO' : 'NÃO LUCRATIVO'
    };

    log.records.unshift(record); // most recent first
    log.insights.totalBacktests = log.records.length;
    log.insights.profitableCount = log.records.filter(r => r.roi > 0).length;
    log.insights.unprofitableCount = log.records.filter(r => r.roi <= 0).length;

    // Update best/worst
    const profitable = log.records.filter(r => r.roi > 0);
    if (profitable.length > 0) {
      const best = profitable.reduce((a, b) => a.roi > b.roi ? a : b);
      log.insights.bestROI = best.roi;
      log.insights.bestStrategy = best.bettingStrategy;
      log.insights.bestSport = best.sport;
      log.insights.bestStaking = best.stakingStrategy;
    }
    const worst = log.records.reduce((a, b) => a.roi < b.roi ? a : b);
    log.insights.worstROI = worst.roi;

    fs.writeFileSync(LEARNING_LOG, JSON.stringify(log, null, 2));
  } catch (e) {
    console.error('Learning log error:', e.message);
  }
}

// ─── HTTP HANDLERS ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), engine: 'demo-v2' }));

// ── Library endpoints ──
app.get('/api/backtest/library', (req, res) => {
  const sports   = loadLib('sports-catalog.json');
  const betting  = loadLib('betting-strategies.json');
  const staking  = loadLib('staking-strategies.json');
  const learning = loadLib('learning-log.json');
  res.json({ success: true, data: { sports, betting, staking, learning } });
});

app.get('/api/backtest/library/sports', (req, res) => {
  const lib = loadLib('sports-catalog.json');
  if (!lib) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: lib.sports.map(s => ({ id: s.id, label: s.label, leagues: s.leagues.map(l => ({ id: l.id, label: l.label })) })) });
});

app.get('/api/backtest/library/strategies', (req, res) => {
  const lib = loadLib('betting-strategies.json');
  if (!lib) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const { sport } = req.query;
  const list = sport ? lib.strategies.filter(s => s.compatibleSports.includes(sport)) : lib.strategies;
  res.json({ success: true, data: list });
});

app.get('/api/backtest/library/staking', (req, res) => {
  const lib = loadLib('staking-strategies.json');
  if (!lib) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: lib.strategies });
});

app.get('/api/backtest/library/teams/:sport/:league', (req, res) => {
  const lib = loadLib('sports-catalog.json');
  if (!lib) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const s = lib.sports.find(x => x.id === req.params.sport);
  if (!s) return res.status(404).json({ success: false, error: { code: 'SPORT_NOT_FOUND' } });
  const l = s.leagues.find(x => x.id === req.params.league);
  if (!l) return res.status(404).json({ success: false, error: { code: 'LEAGUE_NOT_FOUND' } });
  res.json({ success: true, data: { sport: s.id, league: l.id, label: l.label, teams: l.teams } });
});

app.get('/api/backtest/learning-log', (req, res) => {
  const log = loadLib('learning-log.json');
  if (!log) return res.json({ success: true, data: { records: [], insights: {} } });
  const limit = parseInt(req.query.limit || '20');
  res.json({ success: true, data: { records: log.records.slice(0, limit), insights: log.insights } });
});

// ── Run backtest ──
app.post('/api/backtest/run', async (req, res) => {
  try {
    const { strategyId, config } = req.body;
    if (!strategyId || !config)
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'strategyId and config are required' } });

    const start = new Date(config.dateRange?.start);
    const end   = new Date(config.dateRange?.end);
    if (isNaN(start) || isNaN(end))
      return res.status(400).json({ success: false, error: { code: 'INVALID_DATE', message: 'dateRange.start and dateRange.end must be valid ISO dates' } });
    if (start >= end)
      return res.status(400).json({ success: false, error: { code: 'INVALID_DATE_RANGE', message: 'start must be before end' } });
    if (end > new Date())
      return res.status(400).json({ success: false, error: { code: 'FUTURE_DATE', message: 'end date cannot be in the future' } });
    if (!config.initialBankroll || config.initialBankroll <= 0)
      return res.status(400).json({ success: false, error: { code: 'INVALID_BANKROLL', message: 'initialBankroll must be > 0' } });
    const isLiveOverPoints = strategyId === 'live-over-points' || config.bettingStrategy === 'live-over-points';
    if (!isLiveOverPoints && !['fixed','percentage','kelly','dalembert','fibonacci','martingale'].includes(config.stakingStrategy))
      return res.status(400).json({ success: false, error: { code: 'INVALID_STAKING', message: 'stakingStrategy: fixed|percentage|kelly|dalembert|fibonacci|martingale' } });

    const backtestId = `bt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const raw = runBacktest(strategyId, config);
    // live-over-points returns a flat object with .metrics; others return {metrics, bets, equityCurve}
    const { metrics, bets, equityCurve, opportunities, ...liveExtra } = raw.metrics
      ? raw
      : { ...raw, metrics: raw.metrics };
    const finalMetrics = metrics || raw;

    const result = { id: backtestId, strategyId, config, metrics: finalMetrics, bets: bets || opportunities || [], equityCurve: equityCurve || [], engineVersion: 'demo-v2', createdAt: new Date().toISOString(), ...(isLiveOverPoints ? { opportunities, strategyType: raw.strategyType, targetTeam: raw.targetTeam } : {}) };
    fs.writeFileSync(path.join(BACKTESTS_DIR, `${backtestId}.json`), JSON.stringify(result, null, 2));

    appendToLearningLog(backtestId, config, finalMetrics);

    return res.json({ success: true, data: { backtestId, status: 'completed', summary: finalMetrics, ...(isLiveOverPoints ? { opportunities: result.opportunities, targetTeam: raw.targetTeam } : {}) } });
  } catch (err) {
    console.error('Backtest error:', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── Get result ──
app.get('/api/backtest/:id', async (req, res) => {
  try {
    const fp = path.join(BACKTESTS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(fp))
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Backtest ${req.params.id} not found` } });
    return res.json({ success: true, data: JSON.parse(fs.readFileSync(fp, 'utf-8')) });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── List ──
app.get('/api/backtest', async (req, res) => {
  try {
    const { strategyId, limit = '20' } = req.query;
    const files = fs.readdirSync(BACKTESTS_DIR).filter(f => f.endsWith('.json')).slice(0, parseInt(limit));
    let list = files.map(f => {
      const d = JSON.parse(fs.readFileSync(path.join(BACKTESTS_DIR, f), 'utf-8'));
      return { id: d.id, strategyId: d.strategyId, sport: d.config?.sport, bettingStrategy: d.config?.bettingStrategy, createdAt: d.createdAt, metrics: d.metrics };
    });
    if (strategyId) list = list.filter(b => b.strategyId === strategyId);
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── Compare ──
app.post('/api/backtest/compare', async (req, res) => {
  try {
    const { backtestIds } = req.body;
    if (!Array.isArray(backtestIds) || backtestIds.length < 2)
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Need at least 2 backtestIds' } });
    const comparison = {};
    for (const id of backtestIds) {
      const fp = path.join(BACKTESTS_DIR, `${id}.json`);
      if (fs.existsSync(fp)) {
        const d = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        comparison[id] = { ...d.metrics, strategyId: d.strategyId, sport: d.config?.sport };
      }
    }
    return res.json({ success: true, data: { comparison } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── Delete ──
app.delete('/api/backtest/:id', async (req, res) => {
  try {
    const fp = path.join(BACKTESTS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(fp))
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    fs.unlinkSync(fp);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ─── REAL DATA ENGINE (PostgreSQL) ───────────────────────────────────────────
let pgPool = null;
function getPgPool() {
  if (!pgPool) {
    const { Pool } = require('pg');
    pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: '21057788', database: 'postgres' });
  }
  return pgPool;
}

// Checks if NBA real data is available in PostgreSQL
async function hasRealNbaData() {
  try {
    const res = await getPgPool().query('SELECT COUNT(*) FROM nba_games');
    return parseInt(res.rows[0].count) > 0;
  } catch { return false; }
}

// Real backtest: Live Over Points using actual NBA game data
async function runRealLiveOverPointsBacktest(config) {
  const pool        = getPgPool();
  const targetTeam  = config.targetTeam;
  const thresholdPct= (config.bettingParams && config.bettingParams.thresholdPct) || 0.85;
  const minOdds     = (config.bettingParams && config.bettingParams.minOdds) || 1.70;
  const lookback    = (config.bettingParams && config.bettingParams.lookbackGames) || 10;
  const stakingStrat= config.stakingStrategy || 'fixed'; // fixed, fibonacci
  const initialBankroll = config.initialBankroll || 1000;

  if (!targetTeam) throw new Error('targetTeam obrigatorio para live-over-points com dados reais');

  // Fetch all games for this team in date range, ordered chronologically
  const { rows } = await pool.query(`
    SELECT g.game_date, g.home_team, g.away_team,
           s.final_score, s.half_score, s.is_home, s.has_quarters,
           s.q1, s.q2
    FROM nba_games g
    JOIN nba_game_scores s ON g.game_id = s.game_id
    WHERE s.team_name ILIKE $1
      AND g.game_date BETWEEN $2 AND $3
    ORDER BY g.game_date
  `, [targetTeam, config.dateRange.start, config.dateRange.end]);

  if (rows.length < lookback + 1)
    throw new Error(`Apenas ${rows.length} jogos reais encontrados para "${targetTeam}" no período. Mínimo: ${lookback + 1}. Execute o scraper primeiro.`);

  const history      = [];
  const opportunities = [];
  
  // Staking state
  const baseUnit = initialBankroll * 0.02; // 2% base unit
  let fibStep = 1; // Fibonacci step (starts at 1)
  let currentBankroll = initialBankroll;

  for (let i = 0; i < rows.length; i++) {
    const row        = rows[i];
    const teamPoints = row.final_score;
    const halfPoints = row.half_score; // real Q1+Q2 (or 49% estimate if not scraped yet)
    const hasReal    = row.has_quarters;

    if (i < lookback) { history.push(teamPoints); continue; }

    const recent   = history.slice(-lookback);
    const clean    = removeOutliers(recent);
    const cleanAvg = clean.reduce((a, b) => a + b, 0) / clean.length;
    const threshold= cleanAvg * thresholdPct;
    const halfPace = halfPoints * 2;
    const paceGap  = halfPace - threshold;

    // Real opportunity detection: pace within ±22pts of threshold
    if (Math.abs(paceGap) > 22) { history.push(teamPoints); continue; }

    // Estimate live odds from pace (same logic but now with real half score)
    const impliedProb = Math.min(0.88, Math.max(0.42, 0.52 + paceGap / 55));
    const liveOdds    = +(1.05 / impliedProb).toFixed(2);
    if (liveOdds < minOdds) { history.push(teamPoints); continue; }

    // Calculate stake based on strategy
    let stake;
    if (stakingStrat === 'fibonacci') {
      stake = getFibonacciStake(fibStep, baseUnit);
      // Cap stake at 25% of current bankroll to avoid ruin
      stake = Math.min(stake, currentBankroll * 0.25);
    } else {
      stake = baseUnit; // fixed 2%
    }

    const won = teamPoints >= Math.round(threshold);
    const profit = won ? stake * (liveOdds - 1) : -stake;
    
    // Update bankroll and Fibonacci step
    currentBankroll += profit;
    if (won) {
      fibStep = 1; // Reset to start after win
    } else {
      fibStep++; // Move to next Fibonacci number
    }

    opportunities.push({
      date:            row.game_date,
      match:           `${row.home_team} vs ${row.away_team}`,
      team:            targetTeam,
      dataSource:      hasReal ? 'real-quarters' : 'estimated-half',
      cleanScores:     clean,
      outliersRemoved: recent.length - clean.length,
      cleanAvg:        +cleanAvg.toFixed(1),
      threshold:       +threshold.toFixed(1),
      halfPoints,
      halfPace,
      finalPoints:     teamPoints,
      liveOdds,
      stake:           +stake.toFixed(2),
      fibStep:         stakingStrat === 'fibonacci' ? fibStep : 0,
      selection:       `Over ${Math.round(threshold)} pts`,
      result:          won ? 'W' : 'L',
      profit:          +profit.toFixed(2),
      margin:          +(teamPoints - threshold).toFixed(1),
      bankrollAfter:   +currentBankroll.toFixed(2)
    });

    history.push(teamPoints);
  }

  const wins      = opportunities.filter(o => o.result === 'W').length;
  const total     = opportunities.length;
  const totalProfit = opportunities.reduce((s, o) => s + (o.profit || 0), 0);
  const totalStaked = opportunities.reduce((s, o) => s + (o.stake || 0), 0);

  return {
    dataSource: rows.some(r => r.has_quarters) ? 'real-nba-api' : 'real-final-scores',
    strategyType: 'live-over-points',
    stakingStrategy: stakingStrat,
    targetTeam, lookbackGames: lookback, thresholdPct, minOdds,
    totalGamesAnalyzed: rows.length,
    gamesWithHistory:   rows.length - lookback,
    opportunities,
    metrics: {
      totalOpportunities: total,
      wins, losses: total - wins,
      winRate:      total > 0 ? +(wins / total).toFixed(4) : 0,
      roi:          totalStaked > 0 ? +(totalProfit / totalStaked).toFixed(4) : 0,
      totalProfit:  +totalProfit.toFixed(2),
      finalBankroll: +currentBankroll.toFixed(2),
      avgLiveOdds:  total > 0 ? +(opportunities.reduce((s, o) => s + o.liveOdds, 0) / total).toFixed(2) : 0,
      avgThreshold: total > 0 ? +(opportunities.reduce((s, o) => s + o.threshold, 0) / total).toFixed(1) : 0,
      avgFinalPoints: total > 0 ? +(opportunities.reduce((s, o) => s + o.finalPoints, 0) / total).toFixed(1) : 0,
      avgStake:     total > 0 ? +(opportunities.reduce((s, o) => s + o.stake, 0) / total).toFixed(2) : 0,
      betCount:     total,
      matchesAnalysed: rows.length
    }
  };
}

// POST /api/backtest/real — Backtest com dados reais do PostgreSQL
// config.targetTeam = nome do time OU "ALL" para rodar todos os times
app.post('/api/backtest/real', async (req, res) => {
  try {
    const { strategyId, config } = req.body;
    if (!config || !config.dateRange || !config.dateRange.start || !config.dateRange.end)
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'config.dateRange obrigatorio' } });

    const available = await hasRealNbaData();
    if (!available)
      return res.status(503).json({ success: false, error: { code: 'NO_DATA', message: 'Dados reais NBA nao encontrados. Execute: scripts/run-nba-scraper.bat' } });

    const isAll = !config.targetTeam || config.targetTeam === 'ALL';

    if (isAll) {
      // Busca todos os times distintos no DB
      const pool = getPgPool();
      const teamsRes = await pool.query(
        `SELECT DISTINCT team_name FROM nba_game_scores
         JOIN nba_games ON nba_game_scores.game_id = nba_games.game_id
         WHERE nba_games.game_date BETWEEN $1 AND $2
         ORDER BY team_name`,
        [config.dateRange.start, config.dateRange.end]
      );
      const teams = teamsRes.rows.map(r => r.team_name);

      // Roda backtest para cada time e agrega
      const allBets = [];
      const teamStats = {};
      let totalWins = 0, totalLosses = 0;

      for (const team of teams) {
        try {
          const r = await runRealLiveOverPointsBacktest({ ...config, targetTeam: team });
          // r.opportunities contem os detalhes de cada aposta com stake e profit REAIS
          for (const o of r.opportunities || []) {
            allBets.push({
              date: o.date,
              team: o.team,
              match: o.match,
              odds: o.liveOdds,
              stake: o.stake,
              selection: o.selection,
              result: o.result,
              profit: o.profit,
              bankrollAfter: o.bankrollAfter
            });
          }
          const m = r.metrics;
          teamStats[team] = { 
            wins: m.wins || 0, 
            losses: m.losses || 0, 
            profit: m.totalProfit || 0, 
            betCount: m.betCount || 0,
            avgStake: m.avgStake || 0,
            stakingStrategy: m.stakingStrategy || 'fixed'
          };
          totalWins   += m.wins   || 0;
          totalLosses += m.losses || 0;
        } catch (_) { /* time sem dados suficientes — pula */ }
      }

      const totalBets   = totalWins + totalLosses;
      const winRate     = totalBets > 0 ? totalWins / totalBets : 0;
      const totalProfit = allBets.reduce((s, b) => s + (b.profit || 0), 0);
      const bankroll    = (config.initialBankroll || 1000) + totalProfit;
      const roi         = totalBets > 0 ? totalProfit / ((config.initialBankroll || 1000)) : 0;
      const avgOdds     = totalBets > 0 ? allBets.reduce((s, b) => s + (b.odds || 0), 0) / totalBets : 0;
      const avgStake    = totalBets > 0 ? allBets.reduce((s, b) => s + (b.stake || 0), 0) / totalBets : 0;

      // Calcula maxDrawdown baseado no bankroll apos cada aposta
      let peak = config.initialBankroll || 1000, cur = peak, maxDD = 0;
      for (const b of allBets) { 
        cur = b.bankrollAfter || (cur + (b.profit || 0));
        if (cur > peak) peak = cur; 
        const dd = peak - cur; 
        if (dd > maxDD) maxDD = dd; 
      }

      const metrics = {
        teamsAnalyzed: teams.length, 
        matchesAnalyzed: allBets.length > 0 ? allBets.length : 0,
        betCount: totalBets, 
        wins: totalWins, 
        losses: totalLosses,
        winRate, 
        roi, 
        totalProfit, 
        initialBankroll: config.initialBankroll || 1000,
        finalBankroll: bankroll, 
        avgOdds, 
        avgStake,
        maxDrawdown: maxDD,
        sharpeRatio: totalProfit > 0 ? (roi / (maxDD / (config.initialBankroll || 1000) + 0.01)) : 0,
        stakingStrategy: config.stakingStrategy || 'fixed',
        dataSource: 'real-nba-api-all-teams'
      };

      const backtestId = `real-bt-all-${Date.now()}`;
      const out = { id: backtestId, strategyId: strategyId || 'live-over-points', config, metrics, bets: allBets, teamStats, createdAt: new Date().toISOString() };
      fs.writeFileSync(path.join(BACKTESTS_DIR, `${backtestId}.json`), JSON.stringify(out, null, 2));
      appendToLearningLog(backtestId, config, metrics);
      return res.json({ success: true, data: { backtestId, status: 'completed', metrics, bets: allBets, teamStats } });
    }

    // Time específico
    const result = await runRealLiveOverPointsBacktest(config);
    const backtestId = `real-bt-${Date.now()}`;
    const out = { id: backtestId, strategyId: strategyId || 'live-over-points', config, ...result, createdAt: new Date().toISOString() };
    fs.writeFileSync(path.join(BACKTESTS_DIR, `${backtestId}.json`), JSON.stringify(out, null, 2));
    appendToLearningLog(backtestId, config, result.metrics);

    return res.json({ success: true, data: { backtestId, status: 'completed', dataSource: result.dataSource, summary: result.metrics, opportunities: result.opportunities } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'BACKTEST_ERROR', message: err.message } });
  }
});

// GET /api/backtest/real/status — Verifica se dados reais estão disponíveis
app.get('/api/backtest/real/status', async (req, res) => {
  try {
    const pool = getPgPool();
    const games  = await pool.query('SELECT COUNT(*) FROM nba_games');
    const real   = await pool.query('SELECT COUNT(DISTINCT game_id) FROM nba_game_scores WHERE has_quarters = TRUE');
    const seasons = await pool.query('SELECT season, COUNT(*) cnt FROM nba_games GROUP BY season ORDER BY season');
    return res.json({ success: true, data: {
      totalGames:        parseInt(games.rows[0].count),
      gamesWithQuarters: parseInt(real.rows[0].count),
      seasons:           seasons.rows,
      ready:             parseInt(games.rows[0].count) > 0
    }});
  } catch (err) {
    return res.json({ success: true, data: { totalGames: 0, ready: false, message: 'Execute: scripts/run-nba-scraper.bat' } });
  }
});

// 404
app.use((req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} not found` } }));

// Start
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Betting Platform Backtest API  [demo-v2 | multi-strategy]');
    console.log(`📊 Port: ${PORT}`);
    console.log('');
    console.log('Backtest Endpoints:');
    console.log(`  POST   /api/backtest/run`);
    console.log(`  GET    /api/backtest/:id`);
    console.log(`  GET    /api/backtest`);
    console.log(`  POST   /api/backtest/compare`);
    console.log(`  DELETE /api/backtest/:id`);
    console.log('');
    console.log('Library Endpoints:');
    console.log(`  GET    /api/backtest/library`);
    console.log(`  GET    /api/backtest/library/sports`);
    console.log(`  GET    /api/backtest/library/strategies?sport=football`);
    console.log(`  GET    /api/backtest/library/staking`);
    console.log(`  GET    /api/backtest/library/teams/:sport/:league`);
    console.log(`  GET    /api/backtest/learning-log`);
    console.log('');
  });
}

module.exports = app;
