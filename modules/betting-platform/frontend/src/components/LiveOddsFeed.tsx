import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { OddsData } from "@/types/websocket";

interface LiveOddsFeedProps {
  wsUrl: string;
}

export const LiveOddsFeed: React.FC<LiveOddsFeedProps> = ({ wsUrl }) => {
  const [data, setData] = useState<OddsData[]>([]);
  const [previousOdds, setPreviousOdds] = useState<Map<string, number>>(new Map());
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const parsedData: OddsData = JSON.parse(event.data);
        const key = `${parsedData.market}-${parsedData.selection}`;
        
        const currentOdds = previousOdds.get(key);
        const newPreviousOdds = new Map(previousOdds);
        newPreviousOdds.set(key, parsedData.odds);
        setPreviousOdds(newPreviousOdds);

        setData(prev => {
          const index = prev.findIndex(
            item => item.market === parsedData.market && item.selection === parsedData.selection
          );
          
          if (index > -1) {
            const updated = [...prev];
            updated[index] = { ...parsedData, odds: parseFloat(parsedData.odds.toFixed(2)) };
            return updated;
          }
          
          return [...prev, { ...parsedData, odds: parseFloat(parsedData.odds.toFixed(2)) }];
        });
      } catch (error) {
        console.error("Error parsing WebSocket message", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const getOddsChange = (market: string, selection: string, currentOdds: number) => {
    const key = `${market}-${selection}`;
    const previous = previousOdds.get(key);
    
    if (previous === undefined) return null;
    
    if (currentOdds > previous) return "up";
    if (currentOdds < previous) return "down";
    return "same";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-muted-foreground">Live Odds Feed</h2>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHead>
            <TableRow>
              <TableCell className="text-left">Market</TableCell>
              <TableCell className="text-left">Selection</TableCell>
              <TableCell className="text-right">Odds</TableCell>
              <TableCell className="text-right">Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => {
              const change = getOddsChange(item.market, item.selection, item.odds);
              
              return (
                <TableRow key={`${item.market}-${item.selection}`}>
                  <TableCell className="text-left">{item.market}</TableCell>
                  <TableCell className="text-left">{item.selection}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <span className="mr-2">{item.odds}</span>
                      {change === "up" && (
                        <Badge variant="destructive" className="text-green-600 bg-green-100">
                          <ArrowUp className="w-3 h-3" />
                        </Badge>
                      )}
                      {change === "down" && (
                        <Badge variant="destructive" className="text-red-600 bg-red-100">
                          <ArrowDown className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.updated_at}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};