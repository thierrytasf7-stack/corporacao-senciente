import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/../src/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/../src/contexts/$1',
    '^@/types/(.*)$': '<rootDir>/../src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/../src/utils/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/tests/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/components/**/*.tsx',
    'src/contexts/**/*.ts',
    'src/utils/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;