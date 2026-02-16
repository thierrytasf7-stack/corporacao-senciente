/**
 * Auth utilities stub
 * TODO: Implement real authentication when needed
 */

export async function verifyToken(_token: string): Promise<boolean> {
  return false;
}

export async function decodeToken(_token: string): Promise<{ id: number; username: string; email: string; isActive: boolean; emailVerified: boolean }> {
  throw new Error('Auth not implemented');
}
