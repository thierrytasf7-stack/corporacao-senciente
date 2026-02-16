// Jest test setup
import 'jest-extended';

// Mock external dependencies
jest.mock('axios');

// Global test setup
beforeAll(() => {
  // Setup test environment
});

afterAll(() => {
  // Cleanup test environment
});

afterEach(() => {
  // Clear mocks after each test
  jest.clearAllMocks();
});