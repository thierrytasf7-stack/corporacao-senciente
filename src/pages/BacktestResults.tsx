import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useBacktestStore } from '@/stores/backtestStore';
import { BacktestData, Trade } from '@/stores/backtestStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BacktestResultsProps {}

export function BacktestResults(_props: BacktestResultsProps) {
  const [period, setPeriod] = useState('last-month');
  const { data: backtestData } = useQuery({
    queryKey: ['backtest-results', period],
    queryFn: async () => {
      // Mock data for demonstration
      return {
        period: period,
        performance: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-01-02', value: 102 },
          { date: '2024-01-03', value: 105 },
          { date: '2024-01-04', value: 103 },
          { date: '2024-01-05', value: 108 },
        ],
        metrics: {
          totalReturn: 8.5,
          sharpeRatio: 1.2,
          maxDrawdown: -3.2,
        },
        trades: [
          {
            date: '2024-01-01',
            symbol: 'AAPL',
            type: 'long',
            entry: 150,
            exit: 155,
            pnl: 5,
          },
          {
            date: '2024-01-03',
            symbol: 'GOOGL',
            type: 'short',
            entry: 2800,
            exit: 2750,
            pnl: 50,
          },
        ],
      };
    },
  });

  const metrics = backtestData?.metrics;
  const trades = backtestData?.trades || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-white">Backtest Results</div>
            <div className="text-gray-400">Performance analysis and trade history</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Period:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='last-month'>Last Month</SelectItem>
                <SelectItem value='last-3-months'>Last 3 Months</SelectItem>
                <SelectItem value='last-6-months'>Last 6 Months</SelectItem>
                <SelectItem value='last-year'>Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Total Return</CardTitle>
              <CardDescription>Overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {metrics?.totalReturn.toFixed(2)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Sharpe Ratio</CardTitle>
              <CardDescription>Risk-adjusted return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {metrics?.sharpeRatio.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Max Drawdown</CardTitle>
              <CardDescription>Largest loss from peak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {metrics?.maxDrawdown.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
            <CardDescription>Equity curve over time</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {backtestData?.performance ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={backtestData.performance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="0 0'></CartesianGrid>
                  <XAxis dataKey='date' stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip wrapperStyle={{ backgroundColor: '#1f2937', border: '0' }} />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading chart...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>Detailed trade execution records</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-700">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => (
                  <TableRow key={index} className="hover:bg-gray-800">
                    <TableCell>{trade.date}</TableCell>
                    <TableCell>{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.type === 'long' ? 'default' : 'destructive'}>
                        {trade.type}</Badge>
                    </TableCell>
                    <TableCell>${trade.entry}</TableCell>
                    <TableCell>${trade.exit}</TableCell>
                    <TableCell className={trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                      ${trade.pnl}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            <Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}