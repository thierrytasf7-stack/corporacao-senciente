// Betting Platform Backend - Minimal Server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 21370;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'betting-platform-backend',
    port: PORT
  });
});

// Placeholder routes
app.get('/api/strategies', (req, res) => {
  res.json({ strategies: [] });
});

app.get('/api/bets', (req, res) => {
  res.json({ bets: [] });
});

app.get('/api/odds', (req, res) => {
  res.json({ odds: [] });
});

app.listen(PORT, () => {
  console.log(`✅ Betting Platform Backend listening on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
