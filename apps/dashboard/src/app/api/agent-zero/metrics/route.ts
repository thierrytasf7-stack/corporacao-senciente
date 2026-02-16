import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.resolve(
  process.cwd(),
  '..',
  '..',
  'workers',
  'agent-zero',
  'data',
  'metrics.json'
);

export async function GET() {
  try {
    if (!fs.existsSync(METRICS_FILE)) {
      return NextResponse.json({
        total_tasks: 0,
        total_savings_usd: 0,
        total_tokens_processed: 0,
      });
    }

    const data = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));

    // Calculate totals from all sessions
    const totals = data.reduce(
      (acc: any, session: any) => ({
        total_tasks: acc.total_tasks + (session.tasks_total || 0),
        total_savings_usd: acc.total_savings_usd + (session.estimated_savings_usd || 0),
        total_tokens_processed: acc.total_tokens_processed +
          (session.tokens_in_total || 0) + (session.tokens_out_total || 0),
      }),
      { total_tasks: 0, total_savings_usd: 0, total_tokens_processed: 0 }
    );

    return NextResponse.json(totals);
  } catch (error) {
    console.error('Failed to read metrics:', error);
    return NextResponse.json(
      { error: 'Failed to read metrics' },
      { status: 500 }
    );
  }
}
