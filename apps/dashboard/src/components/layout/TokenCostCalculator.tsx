'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, Zap } from 'lucide-react';

interface MetricsSummary {
  total_tasks: number;
  total_savings_usd: number;
  total_tokens_processed: number;
}

export function TokenCostCalculator() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics from Agent Zero
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/agent-zero/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Refresh every 30s
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Zap className="h-3 w-3" />
        <span>Loading...</span>
      </div>
    );
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Savings */}
      <div className="flex items-center gap-1.5">
        <DollarSign className="h-3 w-3 text-success" />
        <span className="text-muted-foreground">
          Saved:{' '}
          <span className="text-success font-medium">
            ${metrics.total_savings_usd.toFixed(2)}
          </span>
        </span>
      </div>

      {/* Tokens */}
      <div className="flex items-center gap-1.5">
        <Zap className="h-3 w-3 text-primary" />
        <span className="text-muted-foreground">
          Tokens:{' '}
          <span className="text-foreground font-medium">
            {formatTokens(metrics.total_tokens_processed)}
          </span>
        </span>
      </div>

      {/* Tasks */}
      <span className="text-muted-foreground">
        Tasks:{' '}
        <span className="text-foreground font-medium">
          {metrics.total_tasks}
        </span>
      </span>
    </div>
  );
}
