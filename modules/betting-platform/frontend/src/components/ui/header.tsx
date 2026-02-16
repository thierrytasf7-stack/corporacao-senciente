import { ThemeToggle } from "./theme";

export function Header() {
  return (
    <header className="bg-background text-surface sticky top-0 z-50 border-b border-surface-paper dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">Betting Platform</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;