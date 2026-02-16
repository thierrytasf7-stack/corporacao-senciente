/**
 * Testes para config_validator
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  validateEnvVars, 
  validateSupabaseConfig,
  validateAtlassianConfig,
  validateCerebroConfig,
} from '../../scripts/utils/config_validator.js';

describe('Config Validator', () => {
  describe('validateEnvVars', () => {
    it('deve validar variáveis obrigatórias presentes', () => {
      process.env.TEST_VAR = 'test-value';
      const result = validateEnvVars(['TEST_VAR']);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.env.TEST_VAR).toBe('test-value');
    });

    it('deve detectar variáveis ausentes', () => {
      delete process.env.MISSING_VAR;
      const result = validateEnvVars(['MISSING_VAR']);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateSupabaseConfig', () => {
    beforeAll(() => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key-12345678901234567890123456789012345678901234567890';
    });

    it('deve validar configuração válida do Supabase', () => {
      const result = validateSupabaseConfig();
      expect(result.valid).toBe(true);
    });

    it('deve detectar URL inválida', () => {
      process.env.SUPABASE_URL = 'not-a-url';
      const result = validateSupabaseConfig();
      expect(result.valid).toBe(false);
    });
  });
});






























