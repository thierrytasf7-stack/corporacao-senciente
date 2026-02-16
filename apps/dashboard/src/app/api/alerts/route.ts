import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    alerts: [],
    count: 0,
    message: 'Nenhum alerta ativo',
  });
}
