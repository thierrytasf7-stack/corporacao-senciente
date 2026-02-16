import { NextResponse } from 'next/server';
import { withAuth } from './middleware/auth';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    name: 'Diana AIOS Dashboard API',
  });
}
