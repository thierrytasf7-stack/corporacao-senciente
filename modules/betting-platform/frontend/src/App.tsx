import { StrategyList } from "./components/StrategyList";
import { DEFAULT_STRATEGIES } from "@/config/strategy-config";

function App() {
  const handleStrategySelect = (id: string) => {
    console.log("Selected strategy:", id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Betting Platform</h1>
      <StrategyList 
        strategies={DEFAULT_STRATEGIES} 
        onSelectStrategy={handleStrategySelect}
      />
    </div>
  );
}

export default App;