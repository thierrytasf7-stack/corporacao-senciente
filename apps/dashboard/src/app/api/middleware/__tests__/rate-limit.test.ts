import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimitMiddleware } from '../rate-limit';

describe('Rate Limit Middleware', () => {
  const createMockRequest = (ip: string) => {
    return new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': ip,
      },
    });
  };

  beforeEach(() => {
    // Limpar mapa de requests antes de cada teste
    (rateLimitMiddleware as any).requestMap?.clear();
  });

  test('deve permitir requests dentro do limite', async () => {
    const ip = '192.168.1.1';
    const request = createMockRequest(ip);

    // Primeira request
    const response1 = await rateLimitMiddleware(request, {} as any);
    expect(response1.status).toBe(200);

    // Verificar headers de rate limiting
    expect(response1.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(response1.headers.get('X-RateLimit-Remaining')).toBe('99');
  });

  test('deve bloquear requests após exceder limite', async () => {
    const ip = '192.168.1.2';
    const request = createMockRequest(ip);

    // Fazer 100 requests (limite)
    for (let i = 0; i < 100; i++) {
      const response = await rateLimitMiddleware(request, {} as any);
      expect(response.status).toBe(200);
    }

    // 101ª request deve ser bloqueada
    const response = await rateLimitMiddleware(request, {} as any);
    expect(response.status).toBe(429);
    expect(response.json()).resolves.toMatchObject({
      error: 'Too Many Requests',
    });
  });

  test('deve resetar contador após janela expirar', async () => {
    const ip = '192.168.1.3';
    const request = createMockRequest(ip);

    // Mock da data para simular passagem de tempo
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000);

    // Fazer requests dentro da janela
    for (let i = 0; i < 100; i++) {
      const response = await rateLimitMiddleware(request, {} as any);
      expect(response.status).toBe(200);
    }

    // Mock da data para simular expiração da janela
    Date.now = jest.fn(() => 60001); // 1ms após expiração

    // Nova request após expiração deve ser permitida
    const response = await rateLimitMiddleware(request, {} as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('99');

    Date.now = originalDateNow;
  });

  test('deve tratar múltiplos IPs separadamente', async () => {
    const ip1 = '192.168.1.4';
    const ip2 = '192.168.1.5';
    const request1 = createMockRequest(ip1);
    const request2 = createMockRequest(ip2);

    // Fazer requests para ambos IPs
    for (let i = 0; i < 50; i++) {
      const response1 = await rateLimitMiddleware(request1, {} as any);
      const response2 = await rateLimitMiddleware(request2, {} as any);
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    }

    // Verificar que ambos ainda têm limites disponíveis
    const response1 = await rateLimitMiddleware(request1, {} as any);
    const response2 = await rateLimitMiddleware(request2, {} as any);
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response1.headers.get('X-RateLimit-Remaining')).toBe('49');
    expect(response2.headers.get('X-RateLimit-Remaining')).toBe('49');
  });

  test('deve limpar entradas expiradas automaticamente', async () => {
    const ip = '192.168.1.6';
    const request = createMockRequest(ip);

    // Mock da data para simular expiração
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000);

    // Fazer requests para encher o limite
    for (let i = 0; i < 100; i++) {
      const response = await rateLimitMiddleware(request, {} as any);
      expect(response.status).toBe(200);
    }

    // Mock da data para simular expiração da janela
    Date.now = jest.fn(() => 60001);

    // Nova request após expiração
    const response = await rateLimitMiddleware(request, {} as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('99');

    Date.now = originalDateNow;
  });
});
