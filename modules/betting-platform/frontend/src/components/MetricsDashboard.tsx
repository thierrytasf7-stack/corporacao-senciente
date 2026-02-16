import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/utils/reporting-utils";

interface Metrics {
  totalBets: number;
  winRate: number;
  roi: number;
  profit: number;
}

interface MetricsDashboardProps {
  metrics: Metrics;
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Bets</CardTitle>
          <CardDescription>{metrics.totalBets}</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Win Rate</CardTitle>
          <CardDescription>{formatPercentage(metrics.winRate)}</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>ROI</CardTitle>
          <CardDescription>{formatPercentage(metrics.roi)}</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Profit</CardTitle>
          <CardDescription>{formatCurrency(metrics.profit, "USD")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}