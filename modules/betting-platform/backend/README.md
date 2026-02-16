# Betting Platform Backend

Backend service for betting platform with monitoring and metrics.

## Development

```bash
npm install
npm run dev
```

## Metrics

Metrics endpoint available at `/metrics`:

```bash
curl http://localhost:21300/metrics
```

## Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 21300)