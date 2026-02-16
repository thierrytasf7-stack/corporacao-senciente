import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change > 0;
  const changeSign = isPositive ? "+" : "";
  const changeColor = isPositive ? "green" : "red";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1 text-sm font-medium text-${changeColor}-600`} data-testid="change-value">
            {changeSign}{Math.abs(change).toFixed(2)}%
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}