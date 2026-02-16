import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const changeColor = change >= 0 ? "text-green-600" : "text-red-600";
  const changeIcon = change >= 0 ? "arrow-sm-up" : "arrow-sm-down";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">{title}</div>
        <div className="w-4 h-4 bg-muted rounded">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className={`flex items-center gap-1 ${changeColor}`}>
        <svg className={`w-4 h-4 ${changeIcon}`}>
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M7 14l5 5 5-5z" />
        </svg>
        <span className="text-sm font-medium">{Math.abs(change).toFixed(2)}%</span>
      </div>
    </Card>
  );
}