import { vi } from 'vitest';

// Mock fetch for API calls
vi.stubGlobal('fetch', vi.fn());

// Mock console methods to avoid spam in test output
vi.stubGlobal('console', {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
});

// Mock Date.now for testing time-based functionality
vi.stubGlobal('Date', {
  now: () => 1000,
});

// Mock setTimeout to make tests run faster
vi.stubGlobal('setTimeout', vi.fn((callback: () => void) => callback()));

// Mock process.env for environment variables
vi.stubGlobal('process', {
  env: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
  },
});