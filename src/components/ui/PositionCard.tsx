import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface PositionCardProps {
  symbol: string;
  entry: number;
  current: number;
  pnl: number;
  status: "active" | "closed" | "pending";
}

export function PositionCard({
  symbol,
  entry,
  current,
  pnl,
  status,
}: PositionCardProps) {
  const pnlColor = pnl >= 0 ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        =iv className="text-lg font-semibold">{symbol}</div>
        <StatusBadge status={status} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Entry</div>
          <div className="font-mono text-sm">${entry.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Current</div>
          <div className="font-mono text-sm">${current.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">P&L</div>
        <div className={`font-mono text-sm ${pnlColor}`}>
          {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
        </div>
      </div>
    </Card>
  );
}