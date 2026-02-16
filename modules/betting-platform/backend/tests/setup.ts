import { configure } from 'jest';

// Redis test setup
beforeAll(() => {
  // Ensure Redis is running for tests
  console.log('Starting Redis tests...');
});

afterAll(async () => {
  // Clean up Redis after tests
  console.log('Cleaning up Redis...');
});

// Increase timeout for async operations
jest.setTimeout(10000);