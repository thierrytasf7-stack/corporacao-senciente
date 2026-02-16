import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, StatusBadgeProps } from "./StatusBadge";

export interface PositionCardProps {
  symbol: string;
  entry: number;
  current: number;
  pnl: number;
  status: StatusBadgeProps["status"];
}

export function PositionCard({ symbol, entry, current, pnl, status }: PositionCardProps) {
  const pnlColor = pnl > 0 ? "green" : "red";
  const pnlSign = pnl > 0 ? "+" : "";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          {symbol}
        </CardTitle>
        <CardDescription className="text-sm">
          Entry: ${entry.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Current</span>
          <span className="text-lg font-medium">${current.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">P&L</span>
          <span className={`text-lg font-medium text-${pnlColor}-600`} data-testid="pnl-value">
            {pnlSign}${Math.abs(pnl).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-end pt-2">
          <StatusBadge status={status} />
        </div>
      </CardContent>
    </Card>
  );
}