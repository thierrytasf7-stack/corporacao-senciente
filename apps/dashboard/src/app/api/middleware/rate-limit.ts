import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NextMiddleware } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RequestData {
  count: number;
  resetTime: number;
}

const rateLimitConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minuto
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests
};

const requestMap = new Map<string, RequestData>();

export const rateLimitMiddleware: NextMiddleware = async (request: NextRequest, event: any) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();

  // Limpar entradas expiradas
  requestMap.forEach((data, key) => {
    if (data.resetTime < now) {
      requestMap.delete(key);
    }
  });

  // Verificar se IP está no mapa
  const requestData = requestMap.get(ip);
  if (requestData) {
    // Se janela ainda não expirou
    if (requestData.resetTime > now) {
      // Incrementar contador
      requestData.count++;

      // Verificar se excedeu limite
      if (requestData.count > rateLimitConfig.maxRequests) {
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil((requestData.resetTime - now) / 1000)} seconds.`,
          },
          { status: 429 }
        );
      }
    } else {
      // Janela expirou, resetar contador
      requestData.count = 1;
      requestData.resetTime = now + rateLimitConfig.windowMs;
    }
  } else {
    // Primeiro request do IP
    requestMap.set(ip, {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs,
    });
  }

  // Adicionar headers de rate limiting
  const resetTime = requestMap.get(ip)?.resetTime || now + rateLimitConfig.windowMs;
  const remaining = Math.max(0, rateLimitConfig.maxRequests - (requestMap.get(ip)?.count || 1));
  const retryAfter = Math.ceil((resetTime - now) / 1000);

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.floor(resetTime / 1000).toString());
  response.headers.set('Retry-After', retryAfter.toString());

  return response;
};
