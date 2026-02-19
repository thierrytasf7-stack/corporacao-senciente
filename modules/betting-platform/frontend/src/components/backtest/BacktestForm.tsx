import { useState } from 'react';
import { useRunBacktest } from '@/hooks/useBacktestQuery';

export function BacktestForm() {
  const { runBacktest } = useRunBacktest();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    strategyId: 'test-strategy',
    startDate: '2025-08-01',
    endDate: '2026-01-31',
    initialBankroll: 10000,
    stakingStrategy: 'kelly' as 'fixed' | 'percentage' | 'kelly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await runBacktest({
        strategyId: formData.strategyId,
        config: {
          dateRange: {
            start: formData.startDate,
            end: formData.endDate,
          },
          initialBankroll: formData.initialBankroll,
          stakingStrategy: formData.stakingStrategy,
          filters: {},
        },
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run backtest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Run New Backtest</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="strategyId" className="block text-sm font-medium mb-2">Strategy ID</label>
          <input
            id="strategyId"
            type="text"
            value={formData.strategyId}
            onChange={(e) => setFormData({ ...formData, strategyId: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">End Date</label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="initialBankroll" className="block text-sm font-medium mb-2">Initial Bankroll</label>
          <input
            id="initialBankroll"
            type="number"
            value={formData.initialBankroll}
            onChange={(e) => setFormData({ ...formData, initialBankroll: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="stakingStrategy" className="block text-sm font-medium mb-2">Staking Strategy</label>
          <select
            id="stakingStrategy"
            value={formData.stakingStrategy}
            onChange={(e) => setFormData({ ...formData, stakingStrategy: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage</option>
            <option value="kelly">Kelly</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Backtest'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-900 mb-2">Backtest Complete!</h3>
          <p className="text-sm text-green-800">
            Backtest ID: <code className="font-mono">{result.data.backtestId}</code>
          </p>
          <p className="text-sm text-green-800">Status: {result.data.status}</p>
        </div>
      )}
    </div>
  );
}
