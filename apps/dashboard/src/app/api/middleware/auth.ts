import { NextResponse } from 'next/server';
import { verifyToken, decodeToken } from '@/lib/auth';
import type { NextRequest } from 'next/server';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    emailVerified: boolean;
  };
}

export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Token de autenticação ausente ou malformado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);

    try {
      // Verifica se o token é válido
      const isValid = await verifyToken(token);
      
      if (!isValid) {
        return new NextResponse(
          JSON.stringify({ error: 'Token inválido ou expirado' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Decodifica o token para extrair as claims
      const decoded = await decodeToken(token);

      // Cria uma nova request com o usuário injetado
      const authenticatedRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      (authenticatedRequest as AuthenticatedRequest).user = decoded;

      // Prossegue para o próximo middleware/rota
      return await handler(authenticatedRequest as AuthenticatedRequest);
    } catch (error) {
      console.error('[Auth Middleware] Erro na validação do token:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Erro interno na autenticação' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}
