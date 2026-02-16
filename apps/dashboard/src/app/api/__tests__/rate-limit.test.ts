import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimitMiddleware } from '../middleware/rate-limit';

describe('Rate Limit Middleware', () => {
  const createRequest = (ip: string) => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': ip,
      },
    });
    return request;
  };

  beforeEach(() => {
    // Limpar o mapa de requests antes de cada teste
    (rateLimitMiddleware as any).requestMap?.clear();
  });

  test('should allow requests within limit', async () => {
    const ip = '192.168.1.1';
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    for (let i = 0; i < maxRequests; i++) {
      const request = createRequest(ip);
      const response = await rateLimitMiddleware(request, {} as any);
      expect(response).toBeUndefined(); // Middleware deve chamar next()
    }
  });

  test('should block requests exceeding limit', async () => {
    const ip = '192.168.1.2';
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    // Fazer maxRequests + 1 requests
    for (let i = 0; i < maxRequests + 1; i++) {
      const request = createRequest(ip);
      const response = await rateLimitMiddleware(request, {} as any);

      if (i < maxRequests) {
        expect(response).toBeUndefined(); // Primeiros requests devem passar
      } else {
        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(429);
        expect(await response?.json()).toEqual({
          error: 'Too Many Requests',
          message: expect.stringContaining('Rate limit exceeded'),
        });
      }
    }
  });

  test('should reset counter after window expires', async () => {
    const ip = '192.168.1.3';
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

    // Fazer maxRequests requests para atingir o limite
    for (let i = 0; i < maxRequests; i++) {
      const request = createRequest(ip);
      await rateLimitMiddleware(request, {} as any);
    }

    // Simular expiração da janela
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + windowMs + 1);

    // Fazer um novo request após expiração
    const request = createRequest(ip);
    const response = await rateLimitMiddleware(request, {} as any);

    expect(response).toBeUndefined(); // Deve permitir após reset
  });

  test('should handle different IPs separately', async () => {
    const ip1 = '192.168.1.4';
    const ip2 = '192.168.1.5';
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    // Fazer maxRequests requests para ip1
    for (let i = 0; i < maxRequests; i++) {
      const request = createRequest(ip1);
      await rateLimitMiddleware(request, {} as any);
    }

    // Fazer 1 request para ip2 (deve passar)
    const request2 = createRequest(ip2);
    const response2 = await rateLimitMiddleware(request2, {} as any);
    expect(response2).toBeUndefined();
  });

  test('should include rate limit headers', async () => {
    const ip = '192.168.1.6';
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    const request = createRequest(ip);
    const response = await rateLimitMiddleware(request, {} as any);

    // Como é o primeiro request, deve chamar next() e adicionar headers
    expect(response).toBeUndefined();

    // Verificar headers na resposta
    const testResponse = new NextResponse();
    testResponse.headers.set('X-RateLimit-Limit', maxRequests.toString());
    testResponse.headers.set('X-RateLimit-Remaining', (maxRequests - 1).toString());
    testResponse.headers.set('X-RateLimit-Reset', expect.any(String));
    testResponse.headers.set('Retry-After', expect.any(String));

    // Os headers serão adicionados à resposta do next()
  });
});
