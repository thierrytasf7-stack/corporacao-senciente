import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CSVLink } from "react-csv";

interface ReportData {
  id: string;
  date: string;
  userId: string;
  betAmount: number;
  payout: number;
  status: "won" | "lost" | "pending";
}

const mockData: ReportData[] = [
  { id: "1", date: "2024-01-15", userId: "user_123", betAmount: 100, payout: 150, status: "won" },
  { id: "2", date: "2024-01-14", userId: "user_456", betAmount: 200, payout: 0, status: "lost" },
  { id: "3", date: "2024-01-13", userId: "user_789", betAmount: 50, payout: 75, status: "won" },
  { id: "4", date: "2024-01-12", userId: "user_123", betAmount: 300, payout: 0, status: "lost" },
  { id: "5", date: "2024-01-11", userId: "user_456", betAmount: 150, payout: 225, status: "won" },
];

export function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"won" | "lost" | "pending" | "all">("all");
  const [sortBy, setSortBy] = useState<keyof ReportData>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredData = mockData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const csvData = [
    ['ID', 'Date', 'User ID', 'Bet Amount', 'Payout', 'Status'],
    ...sortedData.map(item => [
      item.id,
      item.date,
      item.userId,
      item.betAmount,
      item.payout,
      item.status
    ])
  ];

  const totalBets = sortedData.length;
  const totalAmount = sortedData.reduce((sum, item) => sum + item.betAmount, 0);
  const totalPayout = sortedData.reduce((sum, item) => sum + item.payout, 0);
  const totalProfit = totalPayout - totalAmount;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600 mt-2">View and export betting reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Bets</CardTitle>
            <CardDescription>{totalBets}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
            <CardDescription>${totalAmount.toFixed(2)}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
            <CardDescription className={totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
              ${totalProfit.toFixed(2)}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Betting History</CardTitle>
            <div className="flex gap-2">
              <CSVLink data={csvData} filename="betting-reports.csv">
                <Button variant="outline">Export CSV</Button>
              </CSVLink>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <Input
              placeholder="Search by user ID or bet ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => {
                  setSortBy("id");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}>
                  Bet ID {sortBy === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell onClick={() => {
                  setSortBy("date");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}>
                  Date {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell onClick={() => {
                  setSortBy("userId");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}>
                  User ID {sortBy === "userId" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell onClick={() => {
                  setSortBy("betAmount");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}>
                  Bet Amount {sortBy === "betAmount" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell onClick={() => {
                  setSortBy("payout");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}>
                  Payout {sortBy === "payout" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.userId}</TableCell>
                  <TableCell>${item.betAmount.toFixed(2)}</TableCell>
                  <TableCell>${item.payout.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "won" ? "default" : item.status === "lost" ? "destructive" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {sortedData.length === 0 && (
            <div className="text-center py-8 text-gray-500">No data found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}