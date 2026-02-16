import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Badge, Input, Select, Option } from '@synkra/ui';

interface PerformanceData {
  id: number;
  date: string;
  userId: string;
  betAmount: number;
  payout: number;
  profit: number;
  status: 'win' | 'loss' | 'pending';
}

interface PerformanceTableProps {
  data: PerformanceData[];
  onExportCSV: () => void;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({ data, onExportCSV }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof PerformanceData; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Partial<Record<keyof PerformanceData, string | number>>>({});

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortConfig]);

  const filteredData = React.useMemo(() => {
    return sortedData.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof PerformanceData];
        
        if (typeof itemValue === 'number') {
          return itemValue === Number(value);
        }
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [sortedData, filters]);

  const handleSort = (key: keyof PerformanceData) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const handleFilterChange = (key: keyof PerformanceData, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
        <Button onClick={onExportCSV} variant="outline">
          Export CSV
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input 
              value={filters.userId as string || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Filter by user ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select 
              value={filters.status as string || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as any)}
            >
              <Option value="">All Status</Option>
              <Option value="win">Win</Option>
              <Option value="loss">Loss</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Bet Amount</label>
            <Input 
              type="number"
              value={filters.betAmount as string || ''}
              onChange={(e) => handleFilterChange('betAmount', Number(e.target.value))}
              placeholder="Min bet amount"
            />
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('date')} className="cursor-pointer">
                Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('userId')} className="cursor-pointer">
                User ID {sortConfig?.key === 'userId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('betAmount')} className="cursor-pointer">
                Bet Amount {sortConfig?.key === 'betAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('payout')} className="cursor-pointer">
                Payout {sortConfig?.key === 'payout' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('profit')} className="cursor-pointer">
                Profit {sortConfig?.key === 'profit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.userId}</TableCell>
                <TableCell>${row.betAmount.toFixed(2)}</TableCell>
                <TableCell>${row.payout.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={row.profit > 0 ? 'success' : row.profit < 0 ? 'error' : 'warning'}>
                    ${row.profit.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.status === 'win' ? 'success' : row.status === 'loss' ? 'error' : 'warning'}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No data found matching the filters
          </div>
        )}
      </div>
    </div>
  );
};