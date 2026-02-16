import { getMetrics } from './metrics';
import express from 'express';

export const setupMetricsEndpoint = (app: express.Application) => {
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.end(getMetrics());
  });
};
