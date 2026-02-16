/**
 * Testes do Validador de Consistência
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { ConsistencyValidator, InputSource, ViolationSeverity } from './consistency-validator';

describe('ConsistencyValidator', () => {
  let validator: ConsistencyValidator;

  beforeAll(async () => {
    validator = new ConsistencyValidator();
    await validator.initialize();
  });

  describe('AXIOM_01 - Primazia do Criador', () => {
    it('deve aceitar qualquer input do CREATOR', async () => {
      const result = await validator.validate('fazer qualquer coisa', InputSource.CREATOR);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('deve detectar contradição à autoridade do Criador', async () => {
      const result = await validator.validate(
        'mas o criador está errado sobre isso',
        InputSource.AI
      );

      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          axiom: 'AXIOM_01',
          severity: ViolationSeverity.CRITICAL
        })
      );
    });
  });

  describe('AXIOM_02 - Arquitetura Nativa Windows', () => {
    it('deve bloquear proposta de usar Docker', async () => {
      const result = await validator.validate(
        'vamos implementar isso usando Docker Compose',
        InputSource.AI
      );

      expect(result.valid).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          axiom: 'AXIOM_02',
          severity: ViolationSeverity.CRITICAL,
          message: expect.stringContaining('Docker')
        })
      );
    });

    it('deve aceitar proposta nativa Windows', async () => {
      const result = await validator.validate(
        'vamos usar PM2 para gerenciar os processos',
        InputSource.AI
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('AXIOM_03 - CLI First', () => {
    it('deve alertar sobre abordagem UI-first', async () => {
      const result = await validator.validate(
        'vamos começar pelo dashboard e depois fazer a CLI',
        InputSource.AI
      );

      expect(result.violations).toContainEqual(
        expect.objectContaining({
          axiom: 'AXIOM_03',
          severity: ViolationSeverity.WARNING
        })
      );
    });

    it('deve aceitar abordagem CLI-first', async () => {
      const result = await validator.validate(
        'primeiro implementar via CLI, depois adicionar UI',
        InputSource.AI
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('AXIOM_04 - Consciência de Custo', () => {
    it('deve alertar sobre desperdício de recursos', async () => {
      const result = await validator.validate(
        'vamos usar Opus para tudo, não importa o custo',
        InputSource.AI
      );

      expect(result.violations).toContainEqual(
        expect.objectContaining({
          axiom: 'AXIOM_04',
          severity: ViolationSeverity.WARNING,
          suggestion: expect.stringContaining('Agent Zero')
        })
      );
    });
  });

  describe('AXIOM_05 - Story-Driven Development', () => {
    it('deve alertar sobre implementação sem story', async () => {
      const result = await validator.validate(
        'vamos implementar direto no código sem story',
        InputSource.AI
      );

      expect(result.violations).toContainEqual(
        expect.objectContaining({
          axiom: 'AXIOM_05',
          severity: ViolationSeverity.WARNING,
          suggestion: expect.stringContaining('docs/stories/')
        })
      );
    });
  });

  describe('formatResult', () => {
    it('deve formatar resultado com violações', async () => {
      const result = await validator.validate(
        'usar docker para tudo',
        InputSource.AI
      );

      const formatted = validator.formatResult(result);

      expect(formatted).toContain('VALIDAÇÃO DE CONSISTÊNCIA');
      expect(formatted).toContain('Fonte: AI');
      expect(formatted).toContain('✗ INVÁLIDO');
      expect(formatted).toContain('AXIOM_02');
    });

    it('deve formatar resultado válido', async () => {
      const result = await validator.validate(
        'usar PM2 nativo',
        InputSource.AI
      );

      const formatted = validator.formatResult(result);

      expect(formatted).toContain('✓ VÁLIDO');
      expect(formatted).toContain('Nenhuma violação detectada');
    });
  });

  describe('Múltiplas violações', () => {
    it('deve detectar múltiplas violações', async () => {
      const result = await validator.validate(
        'o criador está errado, vamos usar docker e começar pelo UI sem story',
        InputSource.AI
      );

      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(1);
    });

    it('CRITICAL bloqueia mesmo com WARNING', async () => {
      const result = await validator.validate(
        'usar docker (CRITICAL) e começar pelo dashboard (WARNING)',
        InputSource.AI
      );

      expect(result.valid).toBe(false);

      const hasCritical = result.violations.some(
        v => v.severity === ViolationSeverity.CRITICAL
      );
      expect(hasCritical).toBe(true);
    });
  });
});
