import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/app/api/middleware/rate-limit';

describe('Rate Limit Middleware', () => {
  const mockEvent = {} as any;

  beforeEach(() => {
    // Limpar mapa de requests antes de cada teste
    (rateLimitMiddleware as any).requestMap = new Map();
  });

  test('deve permitir requests dentro do limite', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';

    const request = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    // Fazer 5 requests (limite)
    for (let i = 0; i < 5; i++) {
      const response = await rateLimitMiddleware(request, mockEvent);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.request?.url).toBe('http://localhost/api/test');
    }
  });

  test('deve bloquear requests após exceder o limite', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '3';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';

    const request = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    // Fazer 3 requests (limite)
    for (let i = 0; i < 3; i++) {
      const response = await rateLimitMiddleware(request, mockEvent);
      expect(response).toBeInstanceOf(NextResponse);
    }

    // 4º request deve ser bloqueado
    const blockedResponse = await rateLimitMiddleware(request, mockEvent);
    expect(blockedResponse).toBeInstanceOf(NextResponse);
    expect(blockedResponse?.status).toBe(429);
    expect(blockedResponse?.json()).resolves.toMatchObject({
      error: 'Too Many Requests',
    });
  });

  test('deve resetar contador após janela expirar', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '2';
    process.env.RATE_LIMIT_WINDOW_MS = '1000'; // 1 segundo

    const request = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    // Fazer 2 requests (limite)
    for (let i = 0; i < 2; i++) {
      const response = await rateLimitMiddleware(request, mockEvent);
      expect(response).toBeInstanceOf(NextResponse);
    }

    // Aguardar janela expirar
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fazer novo request após janela expirar
    const newResponse = await rateLimitMiddleware(request, mockEvent);
    expect(newResponse).toBeInstanceOf(NextResponse);
    expect(newResponse?.request?.url).toBe('http://localhost/api/test');
  });

  test('deve aplicar rate limiting por IP', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '2';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';

    const request1 = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const request2 = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.2' },
    });

    // IP 1 faz 2 requests (limite)
    for (let i = 0; i < 2; i++) {
      const response = await rateLimitMiddleware(request1, mockEvent);
      expect(response).toBeInstanceOf(NextResponse);
    }

    // IP 2 faz 2 requests (limite)
    for (let i = 0; i < 2; i++) {
      const response = await rateLimitMiddleware(request2, mockEvent);
      expect(response).toBeInstanceOf(NextResponse);
    }

    // IP 1 faz 3º request (deve ser bloqueado)
    const blockedResponse = await rateLimitMiddleware(request1, mockEvent);
    expect(blockedResponse).toBeInstanceOf(NextResponse);
    expect(blockedResponse?.status).toBe(429);

    // IP 2 faz 3º request (deve ser bloqueado)
    const blockedResponse2 = await rateLimitMiddleware(request2, mockEvent);
    expect(blockedResponse2).toBeInstanceOf(NextResponse);
    expect(blockedResponse2?.status).toBe(429);
  });

  test('deve incluir headers de rate limiting na resposta', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';

    const request = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const response = await rateLimitMiddleware(request, mockEvent);

    expect(response?.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response?.headers.get('X-RateLimit-Remaining')).toBe('4');
    expect(response?.headers.get('Retry-After')).toBeDefined();
  });

  test('deve lidar com requests sem header x-forwarded-for', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';

    const request = new NextRequest('http://localhost/api/test');

    const response = await rateLimitMiddleware(request, mockEvent);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.request?.url).toBe('http://localhost/api/test');
  });
});
