#!/usr/bin/env node

/**
 * Testes dos Utilitários
 * Executa testes básicos dos novos módulos
 */

import { logger } from './utils/logger.js';
import { metrics, printMetrics } from './utils/metrics.js';
import { 
  validateCerebroConfig, 
  printValidationResult 
} from './utils/config_validator.js';
import { 
  classifyError, 
  createStructuredError,
  getFriendlyErrorMessage 
} from './utils/error_handler.js';
import {
  sanitizeString,
  validateEmail,
  validateURL,
  validateSafeId,
} from './utils/security_validator.js';

async function runTests() {
  console.log('🧪 Executando Testes dos Utilitários...\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  // Testes de Logger
  console.log('\n=== Logger ===');
  test('Logger deve criar instância', () => {
    if (!logger.info || !logger.error) {
      throw new Error('Logger não possui métodos esperados');
    }
  });

  test('Logger deve logar mensagem', () => {
    logger.info('Teste de log');
  });

  // Testes de Error Handler
  console.log('\n=== Error Handler ===');
  test('Classificar erro de rede', () => {
    const error = { code: 'ECONNREFUSED', message: 'Connection refused' };
    const type = classifyError(error);
    if (type !== 'NETWORK') {
      throw new Error(`Esperado NETWORK, recebido ${type}`);
    }
  });

  test('Criar erro estruturado', () => {
    const error = new Error('Test error');
    const structured = createStructuredError(error);
    if (!structured.type || !structured.message) {
      throw new Error('Erro estruturado incompleto');
    }
  });

  test('Mensagem amigável de erro', () => {
    const error = { code: 'ECONNREFUSED' };
    const message = getFriendlyErrorMessage(error);
    if (!message || message.length === 0) {
      throw new Error('Mensagem amigável vazia');
    }
  });

  // Testes de Security Validator
  console.log('\n=== Security Validator ===');
  test('Sanitizar string com script', () => {
    const input = 'Test <script>alert("xss")</script> content';
    const sanitized = sanitizeString(input);
    if (sanitized.includes('<script>')) {
      throw new Error('Script não foi removido');
    }
  });

  test('Validar email válido', () => {
    const result = validateEmail('test@example.com');
    if (!result.valid) {
      throw new Error('Email válido foi rejeitado');
    }
  });

  test('Validar email inválido', () => {
    const result = validateEmail('invalid-email');
    if (result.valid) {
      throw new Error('Email inválido foi aceito');
    }
  });

  test('Validar URL válida', () => {
    const result = validateURL('https://example.com');
    if (!result.valid) {
      throw new Error('URL válida foi rejeitada');
    }
  });

  test('Validar ID seguro', () => {
    const result = validateSafeId('test-id-123');
    if (!result.valid) {
      throw new Error('ID seguro foi rejeitado');
    }
  });

  test('Rejeitar ID inseguro', () => {
    const result = validateSafeId('test<script>');
    if (result.valid) {
      throw new Error('ID inseguro foi aceito');
    }
  });

  // Testes de Métricas
  console.log('\n=== Metrics ===');
  test('Incrementar métrica', () => {
    metrics.increment('test-counter');
    const m = metrics.getMetrics();
    if (m['test-counter'] !== 1) {
      throw new Error('Métrica não foi incrementada');
    }
  });

  test('Registrar performance', () => {
    metrics.recordPerformance('test-operation', 100);
    const m = metrics.getMetrics();
    if (!m.performance['test-operation']) {
      throw new Error('Performance não foi registrada');
    }
  });

  // Resumo
  console.log('\n=== Resumo ===');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📊 Total: ${passed + failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }

  console.log('✅ Todos os testes passaram!\n');
}

runTests().catch((error) => {
  logger.error('Erro ao executar testes', { error: error.message });
  process.exit(1);
});






























