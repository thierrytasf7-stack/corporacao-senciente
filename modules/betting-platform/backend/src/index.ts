import express from 'express';
import PerformanceMonitor from './services/PerformanceMonitor';

const app = express();
const PORT = process.env.PORT || 21370;

// Initialize performance monitor
PerformanceMonitor.initialize();

// Middleware to track response times
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    PerformanceMonitor.trackResponse(req.path, duration, res.statusCode);
  });
  
  next();
});

// Example endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', PerformanceMonitor.getMetrics().contentType);
  res.send(PerformanceMonitor.getMetrics().content);
});

app.listen(PORT, () => {
  console.log(`Betting platform backend running on port ${PORT}`);
});