import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useState } from 'react';

interface LineChartData {
  date: string;
  profit: number;
}

export function Dashboard() {
  const { totalProfitLoss, activePositions, winRate, recentSignals, loading } = useDashboardStore();
  const [lineChartData, setLineChartData] = useState<Array<LineChartData>>([]);

  // Generate mock line chart data
  React.useEffect(() => {
    const data: Array<LineChartData> = [];
    for (let i = 29; i >= 0; i--) {
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        profit: Math.random() * (i % 2 === 0 ? 1 : -1) * 50
      });
    }
    setLineChartData(data);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Profit/Loss Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-sm font-semibold text-slate-300">Total Profit/Loss</CardTitle>
            <CardDescription className="text-xs text-slate-400">Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-300">
                {totalProfitLoss > 0 ? '$+' : '$-'}
                {Math.abs(totalProfitLoss).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">
                {totalProfitLoss > 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="slate-700" />
                  <XAxis dataKey="date" stroke="slate-400" tick={{ fill: 'slate-400' }} />
                  <YAxis stroke="slate-400" tick={{ fill: 'slate-400' }} />
                  <Tooltip wrapperStyle={{ backgroundColor: 'slate-800', border: 'none' }} />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="blue-500" 
                    strokeWidth={2}
                    dot={{ fill: 'blue-500', r: 4 }}
                  />
                </LineChart>
              <ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Positions Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-sm font-semibold text-slate-300">Active Positions</CardTitle>
            <CardDescription className="text-xs text-slate-400">{activePositions.length} open</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {activePositions.length === 0 ? (
              <div className="text-center text-slate-400 text-sm">No active positions</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activePositions.map((position) => (
                  <div 
                    key={position.id} 
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-300">{position.symbol}</div>
                      <div className="text-xs text-slate-400">
                        {position.direction === 'long' ? 'Long' : 'Short'} • 
                        {position.quantity} qty
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-300">
                        ${position.currentPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {position.direction === 'long' 
                          ? 'Buy' 
                          : 'Sell'}
                      </div>
                    </div>
                    <div className="ml-2">
                      <Badge variant={position.direction === 'long' ? 'default' : 'destructive'}>
                        {position.direction === 'long' ? 'Long' : 'Short'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Win Rate Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-sm font-semibold text-slate-300">Win Rate</CardTitle>
            <CardDescription className="text-xs text-slate-400">Success percentage</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-300">
                {winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">
                {winRate > 50 ? 'Above average' : 'Below average'}
              </div>
            </div>
            <div className="mt-6 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart width={400} height={400} data={[{ name: 'Win Rate', value: winRate }]} >
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Win', value: winRate },
                        { name: 'Loss', value: 100 - winRate }
                      ]}
                      cx="center"
                      cy="center"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <defs>
                        <linearGradient id="win" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0.3" stopColor="blue-500" stopOpacity={1} />
                          <stop offset="1" stopColor="blue-600" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="loss" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0.3" stopColor="red-500" stopOpacity={1} />
                          <stop offset="1" stopColor="red-600" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <Cell fill="url(#win)" />
                      <Cell fill="url(#loss)" />
                    </Pie>
                  </PieChart>
                </LineChart>
              <ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Signals Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-sm font-semibold text-slate-300">Recent Signals</CardTitle>
            <CardDescription className="text-xs text-slate-400">Last 10 signals</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="max-h-96 overflow-y-auto">
              <Table className="text-sm">
                <TableHead>
                  <TableRow>
                    <TableCell className="text-slate-400">Symbol</TableCell>
                    <TableCell className="text-slate-400">Direction</TableCell>
                    <TableCell className="text-slate-400">Entry</TableCell>
                    <TableCell className="text-slate-400">Exit</TableCell>
                    <TableCell className="text-slate-400">Profit</TableCell>
                    <TableCell className="text-slate-400">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentSignals.map((signal) => (
                    <TableRow key={signal.id} className="hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium text-slate-300">{signal.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={signal.direction === 'long' ? 'default' : 'destructive'}>
                          {signal.direction === 'long' ? 'Long' : 'Short'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">${signal.entryPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-slate-300">${signal.exitPrice.toFixed(2)}</TableCell>
                      <TableCell className={signal.profit > 0 ? "text-green-400" : "text-red-400"}>
                        {signal.profit > 0 ? '+$' : '-$'}{Math.abs(signal.profit).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                }</TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;

export type { LineChartData };

// Initialize dashboard data on app load
React.startup(() => {
  const { fetchDashboardData } = useDashboardStore.getState();
  fetchDashboardData();
});