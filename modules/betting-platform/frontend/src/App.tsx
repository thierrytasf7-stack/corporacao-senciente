import { useState, Component } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrategyList } from "./components/StrategyList";
import { DEFAULT_STRATEGIES } from "@/config/strategy-config";
import { Backtest } from "@/pages/Backtest";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md m-4">
          <p className="text-red-800 font-medium">Component error: {this.state.error}</p>
          <p className="text-red-600 text-sm mt-1">This section is temporarily unavailable.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'strategies' | 'backtest'>('backtest');

  const handleStrategySelect = (id: string) => {
    console.log("Selected strategy:", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('strategies')}
              className={`px-4 py-2 rounded-md ${
                currentPage === 'strategies'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Strategies
            </button>
            <button
              onClick={() => setCurrentPage('backtest')}
              className={`px-4 py-2 rounded-md ${
                currentPage === 'backtest'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Backtest
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {currentPage === 'strategies' && (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-8">Betting Strategies</h1>
            <ErrorBoundary>
              <StrategyList
                strategies={DEFAULT_STRATEGIES}
                onSelectStrategy={handleStrategySelect}
              />
            </ErrorBoundary>
          </div>
        )}

        {currentPage === 'backtest' && <Backtest />}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
