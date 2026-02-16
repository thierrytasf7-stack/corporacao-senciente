import React, { useState } from 'react';
import { Card, Select, Table, Badge } from '@/components/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useBacktestStore } from '@/stores/backtestStore';
import { useBacktestQuery } from '@/hooks/useBacktestQuery';
import { PerformanceData, Trade, BacktestMetrics } from '@/types';

export function BacktestResults() {
  const [period, setPeriod] = useState('Last 30 days');
  const backtestStore = useBacktestStore();
  const { data } = useBacktestQuery();

  const performanceData: PerformanceData[] = [
    { date: '2025-01-01', value: 100 },
    { date: '2025-01-02', value: 102.5 },
    { date: '2025-01-03', value: 101.8 },
    { date: '2025-01-04', value: 104.2 },
    { date: '2025-01-05', value: 106.5 },
    { date: '2025-01-06', value: 108.3 },
    { date: '2025-01-07', value: 107.9 },
    { date: '2025-01-08', value: 109.2 },
    { date: '2025-01-09', value: 110.8 },
    { date: '2025-01-10', value: 112.1 },
    { date: '2025-01-11', value: 113.5 },
    { date: '2025-01-12', value: 115.2 },
    { date: '2025-01-13', value: 116.8 },
    { date: '2025-01-14', value: 118.3 },
    { date: '2025-01-15', value: 120.1 },
    { date: '2025-01-16', value: 121.5 },
    { date: '2025-01-17', value: 123.2 },
    { date: '2025-01-18', value: 124.8 },
    { date: '2025-01-19', value: 126.5 },
    { date: '2025-01-20', value: 128.1 },
    { date: '2025-01-21', value: 129.8 },
    { date: '2025-01-22', value: 131.2 },
    { date: '2025-01-23', value: 132.5 },
    { date: '2025-01-24', value: 134.1 },
    { date: '2025-01-25', value: 135.8 },
    { date: '2025-01-26', value: 137.2 },
    { date: '2025-01-27', value: 138.9 },
    { date: '2025-01-28', value: 140.5 },
    { date: '2025-01-29', value: 142.1 },
    { date: '2025-01-30', value: 143.8 },
    { date: '2025-01-31', value: 145.2 },
  ];

  const trades: Trade[] = [
    {
      date: '2025-01-01',
      symbol: 'AAPL',
      type: 'LONG',
      entry: 150.25,
      exit: 155.75,
      pnl: 5.5,
    },
    {
      date: '2025-01-02',
      symbol: 'GOOGL',
      type: 'SHORT',
      entry: 2800.50,
      exit: 2750.25,
      pnl: 2.1,
    },
    {
      date: '2025-01-03',
      symbol: 'MSFT',
      type: 'LONG',
      entry: 300.75,
      exit: 305.50,
      pnl: 1.6,
    },
    {
      date: '2025-01-04',
      symbol: 'TSLA',
      type: 'LONG',
      entry: 180.25,
      exit: 185.75,
      pnl: 3.1,
    },
    {
      date: '2025-01-05',
      symbol: 'AMZN',
      type: 'SHORT',
      entry: 3400.50,
      exit: 3350.25,
      pnl: 1.5,
    },
    {
      date: '2025-01-06',
      symbol: 'NFLX',
      type: 'LONG',
      entry: 450.75,
      exit: 455.50,
      pnl: 1.1,
    },
    {
      date: '2025-01-07',
      symbol: 'META',
      type: 'SHORT',
      entry: 320.50,
      exit: 315.25,
      pnl: 1.6,
    },
    {
      date: '2025-01-08',
      symbol: 'NVDA',
      type: 'LONG',
      entry: 250.25,
      exit: 255.75,
      pnl: 2.2,
    },
    {
      date: '2025-01-09',
      symbol: 'AMD',
      type: 'SHORT',
      entry: 120.50,
      exit: 115.25,
      pnl: 4.3,
    },
    {
      date: '2025-01-10',
      symbol: 'INTC',
      type: 'LONG',
      entry: 45.75,
      exit: 47.50,
      pnl: 3.8,
    },
  ];

  const metrics: BacktestMetrics = {
    totalReturn: 15.2,
    sharpeRatio: 1.85,
    maxDrawdown: -8.5,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Backtest Results</h1>
        <Select
          value={period}
          onValueChange={setPeriod}
          className="w-48"
        >
          <Select.Trigger>
            <Select.Value placeholder="Select period" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="Last 7 days">Last 7 days</Select.Item>
            <Select.Item value="Last 30 days">Last 30 days</Select.Item>
            <Select.Item value="Last 90 days">Last 90 days</Select.Item>
            <Select.Item value="All time">All time</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Performance Chart Section */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Performance Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradient-negative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              fill={performanceData[performanceData.length - 1].value >= 100 ? "url(#gradient)" : "url(#gradient-negative)"}
              strokeWidth={2}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Metrics Grid Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="text-center">
          <div className="text-2xl font-bold" style={{ color: metrics.totalReturn >= 0 ? '#10b981' : '#ef4444' }}>
            {metrics.totalReturn > 0 ? '+' : ''}{metrics.totalReturn}%
          </div>
          <div className="text-sm text-muted-foreground">Total Return</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
          <div className="text-sm text-muted-foreground">Risk-adjusted return</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {metrics.maxDrawdown > 0 ? '+' : ''}{metrics.maxDrawdown}%
          </div>
          <div className="text-sm text-muted-foreground">Max Drawdown</div>
        </Card>
      </div>

      {/* Trade History Table Section */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Trade History</h2>
        <Table className="w-full">
          <Table.Header>
            <Table.Column className="w-32">Date</Table.Column>
            <Table.Column className="w-32">Symbol</Table.Column>
            <Table.Column className="w-24">Type</Table.Column>
            <Table.Column className="w-32">Entry</Table.Column>
            <Table.Column className="w-32">Exit</Table.Column>
            <Table.Column className="w-32">P&L</Table.Column>
          </Table.Header>
          <Table.Body>
            {trades.map((trade, index) => (
              <Table.Row key={index}>
                <Table.Cell>{trade.date}</Table.Cell>
                <Table.Cell>{trade.symbol}</Table.Cell>
                <Table.Cell>
                  <Badge variant={trade.type === 'LONG' ? 'default' : 'destructive'}>
                    {trade.type}
                  </Badge>
                </Table.Cell>
                <Table.Cell>${trade.entry.toFixed(2)}</Table.Cell>
                <Table.Cell>${trade.exit.toFixed(2)}</Table.Cell>
                <Table.Cell style={{ color: trade.pnl >= 0 ? '#10b981' : '#ef4444' }}>
                  {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}