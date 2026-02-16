import { rest } from 'msw';

export const handlers = [
  rest.get('/api/strategies', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', type: 'Strategy 1', enabled: true, minProfitThreshold: 10, maxStakePercent: 5 },
        { id: '2', type: 'Strategy 2', enabled: false, minProfitThreshold: 15, maxStakePercent: 7 }
      ])
    );
  }),
  
  rest.post('/api/strategies/execute', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: 'Strategy executed successfully' })
    );
  }),
  
  rest.get('/api/metrics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalBets: 100,
        winRate: 0.65,
        roi: 0.25,
        profit: 1500.75
      })
    );
  }),
  
  rest.get('/api/strategies/:id', (req, res, ctx) => {
    const strategies = {
      '1': { id: '1', type: 'Strategy 1', enabled: true, minProfitThreshold: 10, maxStakePercent: 5 },
      '2': { id: '2', type: 'Strategy 2', enabled: false, minProfitThreshold: 15, maxStakePercent: 7 }
    };
    
    return res(
      ctx.status(200),
      ctx.json(strategies[req.params.id] || null)
    );
  })
];