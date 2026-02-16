import { Layout } from '@/components/Layout';

export function HomePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Betting Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the ultimate betting platform with real-time odds, live betting, and comprehensive analytics.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Live Betting
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Bet on live events as they happen with real-time odds updates.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sports Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access comprehensive statistics and insights for informed betting decisions.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Secure Platform
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your data and transactions are protected with industry-leading security measures.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}