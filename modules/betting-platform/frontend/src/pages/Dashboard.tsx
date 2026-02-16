import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, ResponsiveContainer as PieResponsiveContainer } from "recharts";
import { useStrategyQuery, useBacktestQuery } from "@/hooks/queries";

export default function Dashboard() {
  const { data: strategies } = useStrategyQuery();
  const { data: backtests } = useBacktestQuery();

  const totalStrategies = strategies?.length || 0;
  const activeBets = backtests?.filter(bt => bt.status === "active").length || 0;
  const winRate = backtests?.reduce((acc, bt) => acc + (bt.win ? 1 : 0), 0) || 0;
  const totalProfit = backtests?.reduce((acc, bt) => acc + bt.profit, 0) || 0;

  const chartData = [
    { month: "Jan", profit: 2400 },
    { month: "Fev", profit: 1398 },
    { month: "Mar", profit: 9800 },
    { month: "Abr", profit: 3908 },
    { month: "Mai", profit: 4800 },
    { month: "Jun", profit: 3800 },
    { month: "Jul", profit: 4300 },
  ];

  const pieData = [
    { name: "Win", value: winRate },
    { name: "Loss", value: backtests?.length - winRate || 0 },
  ];

  const COLORS = ["#0EA5E9", "#F59E0B"];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Strategies</CardTitle>
            <CardDescription>{totalStrategies}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Bets</CardTitle>
            <CardDescription>{activeBets}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
            <CardDescription>{((winRate / (backtests?.length || 1)) * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
            <CardDescription>${totalProfit.toFixed(2)}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Line Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#0EA5E9" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Pie Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <PieResponsiveContainer width="100%" height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}