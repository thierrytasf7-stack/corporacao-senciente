import { BacktestForm } from '@/components/backtest/BacktestForm';

export function Backtest() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Backtest System</h1>
      <BacktestForm />
    </div>
  );
}
