import { NextRequest } from 'next/server';
import { withAuth } from '@/app/api/middleware/auth';
import { verifyToken, decodeToken } from '@/lib/auth';

// Mock functions
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
  decodeToken: jest.fn(),
}));

describe('Auth Middleware', () => {
  const mockHandler = jest.fn().mockResolvedValue(
    new Response(JSON.stringify({ success: true }), { status: 200 })
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 when no Authorization header', async () => {
    const request = new NextRequest('http://localhost/api/protected');
    const response = await withAuth(mockHandler)(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Token de autenticação ausente ou malformado' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('should return 401 when Authorization header is malformed', async () => {
    const request = new NextRequest('http://localhost/api/protected', {
      headers: { Authorization: 'InvalidToken' },
    });
    const response = await withAuth(mockHandler)(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Token de autenticação ausente ou malformado' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('should return 401 when token is invalid', async () => {
    (verifyToken as jest.Mock).mockResolvedValue(false);

    const request = new NextRequest('http://localhost/api/protected', {
      headers: { Authorization: 'Bearer invalid.token' },
    });
    const response = await withAuth(mockHandler)(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Token inválido ou expirado' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('should return 500 when token verification throws error', async () => {
    (verifyToken as jest.Mock).mockRejectedValue(new Error('Verification failed'));

    const request = new NextRequest('http://localhost/api/protected', {
      headers: { Authorization: 'Bearer invalid.token' },
    });
    const response = await withAuth(mockHandler)(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro interno na autenticação' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('should call handler with authenticated request when token is valid', async () => {
    (verifyToken as jest.Mock).mockResolvedValue(true);
    (decodeToken as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      isActive: true,
      emailVerified: true,
    });

    const request = new NextRequest('http://localhost/api/protected', {
      headers: { Authorization: 'Bearer valid.token' },
    });
    const response = await withAuth(mockHandler)(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          isActive: true,
          emailVerified: true,
        },
      })
    );
  });
});
