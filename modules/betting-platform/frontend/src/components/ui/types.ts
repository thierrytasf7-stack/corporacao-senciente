export interface StatusBadgeProps {
  status: "active" | "closed" | "pending";
}

export interface PositionCardProps {
  symbol: string;
  entry: number;
  current: number;
  pnl: number;
  status: "active" | "closed" | "pending";
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export type { StatusBadgeProps, PositionCardProps, MetricCardProps };