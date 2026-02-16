import { LiveOddsFeed } from "@/components/LiveOddsFeed";

export default function Home() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <LiveOddsFeed wsUrl="ws://localhost:8080/odds" />
    </div>
  );
}