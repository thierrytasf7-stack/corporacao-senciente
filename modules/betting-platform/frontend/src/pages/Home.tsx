import { Header } from "@/components/ui/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-surface">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-8">Welcome to Betting Platform</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-paper dark:bg-gray-800 rounded-lg p-6 border border-surface dark:border-gray-700 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-600 dark:text-primary-400">Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access your betting dashboard and manage your bets.</p>
          </div>
          <div className="bg-surface-paper dark:bg-gray-800 rounded-lg p-6 border border-surface dark:border-gray-700 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-600 dark:text-primary-400">Place Bets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start placing bets on your favorite events.</p>
          </div>
          <div className="bg-surface-paper dark:bg-gray-800 rounded-lg p-6 border border-surface dark:border-gray-700 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary-600 dark:text-primary-400">Results</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check the latest results and outcomes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export { Header };