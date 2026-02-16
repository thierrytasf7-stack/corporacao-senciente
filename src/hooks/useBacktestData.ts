import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestService } from '@/services/backtestService';

export function useBacktestData(period: string) {
  const [backtestData, setBacktestData] = useState<BacktestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBacktestData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await BacktestService.fetchBacktestResults(period);
      setBacktestData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    backtestData,
    loading,
    error,
    loadBacktestData,
  };
}