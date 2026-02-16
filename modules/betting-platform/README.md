# Betting Platform Monorepo

## Overview
Monorepo structure for the betting platform with backend, frontend, and shared modules.

## Structure
```
betting-platform/
├── backend/     # Node.js backend API
├── frontend/   # Web frontend
├── shared/     # Shared types and utilities
└── package.json # Monorepo root config
```

## Development

### Installation
```bash
npm install
```

### Running
```bash
# Development mode (both backend and frontend)
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

## PM2 Configuration
This module is configured in the main ecosystem.config.js with ports:
- Backend: 21370
- Frontend: 21371

## Environment Variables
Create `.env` files in each module as needed for configuration.