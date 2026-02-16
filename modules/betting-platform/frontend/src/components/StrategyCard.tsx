import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StrategyResult } from "@/types/strategy";
import { getStrategyResult } from "@/utils/strategy-utils";

interface StrategyCardProps {
  strategy: Strategy;
  onExecute: () => void;
}

type Strategy = {
  id: string;
  type: string;
  enabled: boolean;
  minProfitThreshold: number;
  maxStakePercent: number;
  [key: string]: unknown;
};

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onExecute }) => {
  const result = getStrategyResult(strategy);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{strategy.type}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {strategy.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Profit</p>
            <p className="text-lg font-semibold">${result.profit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-lg font-semibold">{Math.round(result.confidence * 100)}%</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Risk Level</p>
            <p className="text-lg font-semibold">{result.riskLevel}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recommended Stake</p>
            <p className="text-lg font-semibold">${result.recommendedStake.toFixed(2)}</p>
          </div>
        </div>
        <Button 
          onClick={onExecute}
          className="w-full"
        >
          Execute
        </Button>
      </CardContent>
    </Card>
  );
};