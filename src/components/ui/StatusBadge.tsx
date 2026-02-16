import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "active" | "closed" | "pending";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    active: "success",
    closed: "danger",
    pending: "warning",
  };

  const labels: Record<string, string> = {
    active: "Active",
    closed: "Closed",
    pending: "Pending",
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}