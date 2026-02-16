/**
 * Tests para HealthCollector
 */
const fs = require('fs');
const path = require('path');
const { HealthCollector } = require('../lib/health-collector');

// Mock do filesystem
jest.mock('fs');

describe('HealthCollector', () => {
  let collector;
  const testConfig = {};
  const mockHealthPath = path.resolve(__dirname, '..', 'data', 'health.json');

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.readFileSync.mockImplementation(() => '{}');

    collector = new HealthCollector(testConfig);
  });

  describe('Inicialização', () => {
    it('deve inicializar com métricas zeradas', () => {
      const status = collector.getStatus();
      expect(status.tasks_processed).toBe(0);
      expect(status.tasks_failed).toBe(0);
      expect(status.avg_latency_ms).toBe(0);
      expect(status.active_model).toBe('unknown');
    });

    it('deve criar diretório data se não existir', () => {
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('deve tentar carregar health.json existente', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        tasks_processed: 42,
        tasks_failed: 1
      }));

      const newCollector = new HealthCollector(testConfig);
      const status = newCollector.getStatus();
      expect(status.tasks_processed).toBe(42);
      expect(status.tasks_failed).toBe(1);
    });
  });

  describe('Registro de sucesso', () => {
    it('deve incrementar tasks_processed', () => {
      collector.recordSuccess({ model: 'test-model', elapsed_ms: 100 });
      const status = collector.getStatus();
      expect(status.tasks_processed).toBe(1);
    });

    it('deve atualizar modelo ativo', () => {
      collector.recordSuccess({ model: 'gpt-4', elapsed_ms: 50 });
      const status = collector.getStatus();
      expect(status.active_model).toBe('gpt-4');
      expect(status.models_used['gpt-4']).toBe(1);
    });

    it('deve calcular latência média', () => {
      collector.recordSuccess({ model: 'test', elapsed_ms: 100 });
      collector.recordSuccess({ model: 'test', elapsed_ms: 200 });
      collector.recordSuccess({ model: 'test', elapsed_ms: 300 });

      const status = collector.getStatus();
      expect(status.avg_latency_ms).toBe(200);
    });

    it('deve somar tokens', () => {
      collector.recordSuccess({ model: 'test', tokens_in: 100, tokens_out: 50 });
      collector.recordSuccess({ model: 'test', tokens_in: 150, tokens_out: 75 });

      const status = collector.getStatus();
      expect(status.total_tokens_in).toBe(250);
      expect(status.total_tokens_out).toBe(125);
      expect(status.total_tokens).toBe(375);
    });

    it('deve limpar last_error', () => {
      collector.recordError(new Error('Test error'));
      collector.recordSuccess({ model: 'test', elapsed_ms: 50 });

      const status = collector.getStatus();
      expect(status.last_error).toBeNull();
    });

    it('deve manter últimas 100 latências', () => {
      for (let i = 0; i < 150; i++) {
        collector.recordSuccess({ model: 'test', elapsed_ms: i * 10 });
      }

      const status = collector.getStatus();
      // Média das 100 últimas: 50..150 → média = 100
      expect(status.avg_latency_ms).toBeLessThanOrEqual(1500);
      expect(status.avg_latency_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Registro de erro', () => {
    it('deve incrementar tasks_failed', () => {
      collector.recordError(new Error('Test error'));
      const status = collector.getStatus();
      expect(status.tasks_failed).toBe(1);
    });

    it('deve registrar mensagem de erro', () => {
      const error = new Error('Connection timeout');
      collector.recordError(error);

      const status = collector.getStatus();
      expect(status.last_error).not.toBeNull();
      expect(status.last_error.message).toBe('Connection timeout');
    });

    it('deve registrar timestamp do erro', () => {
      collector.recordError(new Error('Test'));
      const status = collector.getStatus();

      expect(status.last_error.timestamp).toBeDefined();
      const errTime = new Date(status.last_error.timestamp);
      expect(errTime).toBeInstanceOf(Date);
    });

    it('deve registrar contexto do erro', () => {
      collector.recordError(new Error('API failure'), { model: 'gpt-4', endpoint: '/chat' });
      const status = collector.getStatus();

      expect(status.last_error.context).toEqual({
        model: 'gpt-4',
        endpoint: '/chat'
      });
    });

    it('deve aceitar string como erro', () => {
      collector.recordError('String error');
      const status = collector.getStatus();
      expect(status.last_error.message).toBe('String error');
    });
  });

  describe('Rate limits', () => {
    it('deve contar rate limits por API key', () => {
      collector.recordRateLimit('key_1');
      collector.recordRateLimit('key_1');
      collector.recordRateLimit('key_2');

      const status = collector.getStatus();
      expect(status.rate_limits_hit['key_1']).toBe(2);
      expect(status.rate_limits_hit['key_2']).toBe(1);
    });

    it('deve inicializar contador em 0', () => {
      collector.recordRateLimit('new_key');
      const status = collector.getStatus();
      expect(status.rate_limits_hit['new_key']).toBe(1);
    });
  });

  describe('Status de API keys', () => {
    it('deve registrar status de keys', () => {
      collector.recordApiKeyStatus(0, 'ok');
      collector.recordApiKeyStatus(1, 'rate_limited');
      collector.recordApiKeyStatus(2, 'error');

      const status = collector.getStatus();
      expect(status.api_keys_status['key_0']).toBe('ok');
      expect(status.api_keys_status['key_1']).toBe('rate_limited');
      expect(status.api_keys_status['key_2']).toBe('error');
    });
  });

  describe('Uptime', () => {
    it('deve calcular uptime corretamente', () => {
      const status = collector.getStatus();
      expect(status.uptime_ms).toBeGreaterThanOrEqual(0);
      expect(status.uptime_seconds).toBeGreaterThanOrEqual(0);
    });

    it('deve ter timestamp no status', () => {
      const status = collector.getStatus();
      expect(status.timestamp).toBeDefined();
      const ts = new Date(status.timestamp);
      expect(ts).toBeInstanceOf(Date);
    });

    it('deve registrar started_at', () => {
      const status = collector.getStatus();
      expect(status.started_at).toBeDefined();
      const started = new Date(status.started_at);
      expect(started).toBeInstanceOf(Date);
    });
  });

  describe('Taxa de sucesso', () => {
    it('deve calcular taxa de sucesso', () => {
      collector.recordSuccess({ model: 'test', elapsed_ms: 50 });
      collector.recordSuccess({ model: 'test', elapsed_ms: 50 });
      collector.recordError(new Error('Test'));

      const status = collector.getStatus();
      expect(status.success_rate).toBe('66.7%');
    });

    it('deve retornar N/A quando nenhuma task foi processada', () => {
      const status = collector.getStatus();
      expect(status.success_rate).toBe('N/A');
    });
  });

  describe('Persistência', () => {
    it('deve chamar writeFileSync ao recordSuccess', () => {
      collector.recordSuccess({ model: 'test', elapsed_ms: 50 });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve chamar writeFileSync ao recordError', () => {
      collector.recordError(new Error('Test'));
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve chamar writeFileSync ao recordRateLimit', () => {
      collector.recordRateLimit('key_1');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('deve escrever JSON válido', () => {
      collector.recordSuccess({ model: 'test', elapsed_ms: 50 });

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = writeCall[1];
      const parsed = JSON.parse(writtenContent);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('tasks_processed');
      expect(parsed).toHaveProperty('uptime_ms');
    });
  });
});
