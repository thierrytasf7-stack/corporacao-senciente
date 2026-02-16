import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker, DatePickerContent, DatePickerTrigger } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

interface PnLData {
  date: string;
  profitLoss: number;
  balance: number;
  trades: number;
}

interface BacktestResults {
  data: PnLData[];
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
}

const generateSampleData = (): BacktestResults => {
  const data: PnLData[] = [];
  const days = 90;
  let balance = 10000;
  let totalProfit = 0;
  let totalLoss = 0;
  let winCount = 0;
  let maxDrawdown = 0;
  let minBalance = balance;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    const isWin = Math.random() > 0.4;
    const tradeSize = Math.random() * 1000 + 200;
    const profitLoss = isWin ? tradeSize * (Math.random() * 0.02 + 0.01) : -tradeSize * (Math.random() * 0.02 + 0.01);
    
    balance += profitLoss;
    totalProfit += Math.max(0, profitLoss);
    totalLoss += Math.abs(Math.min(0, profitLoss));
    winCount += isWin ? 1 : 0;
    
    if (balance < minBalance) {
      minBalance = balance;
      maxDrawdown = Math.max(maxDrawdown, 10000 - balance);
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      profitLoss: profitLoss,
      balance: balance,
      trades: 1
    });
  }

  const winRate = (winCount / days) * 100;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit;

  return {
    data,
    totalTrades: days,
    winRate: Math.round(winRate * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100
  };
};

export default function PnLChart() {
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
  const [filteredData, setFilteredData] = useState<PnLData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [symbol, setSymbol] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortField, setSortField] = useState<keyof PnLData>("date");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const results = generateSampleData();
    setBacktestResults(results);
    setFilteredData(results.data);
  }, []);

  useEffect(() => {
    if (!backtestResults) return;
    
    let data = backtestResults.data;
    
    if (startDate) {
      data = data.filter(item => 
        new Date(item.date) >= startDate
      );
    }
    
    if (endDate) {
      data = data.filter(item => 
        new Date(item.date) <= endDate
      );
    }
    
    if (symbol) {
      data = data.filter(item => item.date.includes(symbol));
    }
    
    const sorted = [...data].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredData(sorted);
  }, [backtestResults, startDate, endDate, symbol, sortField, sortDirection]);

  const handleSort = (field: keyof PnLData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (!backtestResults) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Estatísticas do Backtest</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Resumo dos resultados do backtest
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Total de Trades</div>
            <div className="text-2xl font-bold">{backtestResults.totalTrades}</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold">{backtestResults.winRate}%</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Profit Factor</div>
            <div className="text-2xl font-bold">{backtestResults.profitFactor}</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Max Drawdown</div>
            <div className="text-2xl font-bold">{backtestResults.maxDrawdown}</div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <DatePicker>
              <DatePickerTrigger>
                <Button variant="outline" className="w-full">
                  {startDate ? startDate.toLocaleDateString() : 'Data Inicial'}
                </Button>
              </DatePickerTrigger>
              <DatePickerContent
                date={startDate}
                onChange={setStartDate}
                className="w-80"
              />
            </DatePicker>
          </div>
          <div>
            <DatePicker>
              <DatePickerTrigger>
                <Button variant="outline" className="w-full">
                  {endDate ? endDate.toLocaleDateString() : 'Data Final'}
                </Button>
              </DatePickerTrigger>
              <DatePickerContent
                date={endDate}
                onChange={setEndDate}
                className="w-80"
              />
            </DatePicker>
          </div>
          <div>
            <Select value={symbol} onValueChange={setSymbol} className="w-full">
              <SelectTrigger>
                <SelectValue placeholder="Símbolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
                <SelectItem value="ADA">ADA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setSymbol("");
            }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lucro e Prejuízo (P&L)</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: "R$", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: "middle" } 
                }}
              />
              <Tooltip 
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Resultados Detalhados</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Total: {filteredData.length} trades</span>
            <Select value={rowsPerPage} onValueChange={setRowsPerPage} className="min-w-[80px]">
              <SelectTrigger>
                <SelectValue placeholder="Linhas" />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(size => (
                  <SelectItem key={size} value={size}>
                    {size} por página
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort("date")}
                  className="cursor-pointer flex items-center gap-1"
                >
                  Data
                  {sortField === "date" && (
                    <span className={`text-muted-foreground ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`}>
                      ▼
                    </span>
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort("profitLoss")}
                  className="cursor-pointer flex items-center gap-1"
                >
                  P&L
                  {sortField === "profitLoss" && (
                    <span className={`text-muted-foreground ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`}>
                      ▼
                    </span>
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort("balance")}
                  className="cursor-pointer flex items-center gap-1"
                >
                  Saldo
                  {sortField === "balance" && (
                    <span className={`text-muted-foreground ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`}>
                      ▼
                    </span>
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort("trades")}
                  className="cursor-pointer flex items-center gap-1"
                >
                  Trades
                  {sortField === "trades" && (
                    <span className={`text-muted-foreground ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`}>
                      ▼
                    </span>
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className={item.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                    R$ {item.profitLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <Badge variant={item.profitLoss >= 0 ? "default" : "destructive"}>
                      {item.profitLoss >= 0 ? "Lucro" : "Prejuízo"}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {item.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>{item.trades}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {filteredData.length > rowsPerPage && (
          <CardContent className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * rowsPerPage) + 1} a {Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length} trades
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} de {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Próxima
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}