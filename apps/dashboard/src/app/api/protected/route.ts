import { NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware/auth';

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'Esta é uma rota protegida',
    user: (request as any).user, // Usuário injetado pelo middleware
  });
}

export const runtime = 'edge';
export const config = {
  runtime: 'edge',
  middleware: ['auth'],
};
