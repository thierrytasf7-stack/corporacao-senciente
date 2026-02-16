import { setupMetricsEndpoint } from './metrics-endpoint';
import express from 'express'';

const app = express();

// Setup metrics endpoint
if (process.env.NODE_ENV === 'development') {
  setupMetricsEndpoint(app);
}

const PORT = process.env.PORT || 21300;

app.listen(PORT, () => {
  console.log(`Betting platform API running on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Metrics endpoint available at http://localhost:${PORT}/metrics`);
  }
});