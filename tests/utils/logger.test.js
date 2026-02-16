/**
 * Testes básicos para logger
 */

import { describe, it, expect } from 'vitest';
import { createLogger } from '../../scripts/utils/logger.js';

describe('Logger', () => {
  it('deve criar logger com configuração padrão', () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('deve criar child logger com contexto', () => {
    const logger = createLogger();
    const childLogger = logger.child({ context: 'test' });
    expect(childLogger).toBeDefined();
  });
});






























