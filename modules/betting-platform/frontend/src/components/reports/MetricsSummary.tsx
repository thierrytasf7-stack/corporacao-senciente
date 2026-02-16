import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Chart, ChartBar, ChartLine, ChartPie } from '@/components/ui/chart';

interface MetricsSummaryProps {
  reports: Array<{
    id: string;
    date: string;
    userId: string;
    betAmount: number;
    payout: number;
    status: 'won' | 'lost' | 'pending';
    gameType: string;
  }>;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ reports }) => {
  const totalBets = reports.length;
  const totalBetAmount = reports.reduce((sum, report) => sum + report.betAmount, 0);
  const totalPayout = reports.reduce((sum, report) => sum + report.payout, 0);
  const netProfit = totalPayout - totalBetAmount;

  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gameTypeCounts = reports.reduce((acc, report) => {
    acc[report.gameType] = (acc[report.gameType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = [
    { month: '1', bets: 120, revenue: 15000 },
    { month: '2', bets: 95, revenue: 12000 },
    { month: '3', bets: 150, revenue: 18000 },
    { month: '4', bets: 130, revenue: 16000 },
    { month: '5', bets: 110, revenue: 14000 },
    { month: '6', bets: 140, revenue: 17000 },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">{totalBets.toLocaleString()}</CardTitle>
            <CardDescription>Total Bets</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">${totalBetAmount.toFixed(2)}</CardTitle>
            <CardDescription>Total Bet Amount</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-600">${totalPayout.toFixed(2)}</CardTitle>
            <CardDescription>Total Payout</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <CardTitle className="text-2xl font-bold text-orange-600">${netProfit.toFixed(2)}</CardTitle>
            <CardDescription>Net Profit</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bet Status Distribution</CardTitle>
            <CardDescription>Breakdown of bet outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPie 
              data={[
                { label: 'Won', value: statusCounts.won || 0, color: 'var(--success)' },
                { label: 'Lost', value: statusCounts.lost || 0, color: 'var(--error)' },
                { label: 'Pending', value: statusCounts.pending || 0, color: 'var(--warning)' },
              ]}
              size={200}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Type Popularity</CardTitle>
            <CardDescription>Most popular game types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartBar 
              data={Object.entries(gameTypeCounts).map(([type, count]) => ({ 
                label: type, 
                value: count 
              }))}
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Revenue trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartLine 
            data={monthlyData.map(item => ({
              label: item.month,
              value: item.revenue
            }))}
            height={250}
            curve="smooth"
          />
        </CardContent>
      </Card>
    </div>
  );
};