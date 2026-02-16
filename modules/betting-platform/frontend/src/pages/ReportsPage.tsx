import React, { useState, useEffect } from 'react';
import { PerformanceTable } from '../components/reports/PerformanceTable';
import { saveCSVFile } from '../utils/exportCSV';

interface ReportData {
  id: number;
  date: string;
  userId: string;
  betAmount: number;
  payout: number;
  profit: number;
  status: 'win' | 'loss' | 'pending';
}

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportData[]>([]);

  useEffect(() => {
    const sampleData: ReportData[] = [
      {
        id: 1,
        date: new Date().toISOString(),
        userId: 'user_123',
        betAmount: 100.5,
        payout: 150.75,
        profit: 50.25,
        status: 'win' as const,
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        userId: 'user_456',
        betAmount: 200,
        payout: 0,
        profit: -200,
        status: 'loss' as const,
      },
      {
        id: 3,
        date: new Date(Date.now() - 172800000).toISOString(),
        userId: 'user_789',
        betAmount: 50,
        payout: 75,
        profit: 25,
        status: 'win' as const,
      },
    ];
    
    setData(sampleData);
  }, []);

  const handleExportCSV = () => {
    if (data.length > 0) {
      saveCSVFile(data, 'performance_report.csv');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Reports Dashboard</h1>
      
      <PerformanceTable 
        data={data} 
        onExportCSV={handleExportCSV}
      />
      
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Total Bets</h3>
            <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Total Profit</h3>
            <p className="text-2xl font-bold text-green-600">{
              data.reduce((sum, item) => sum + item.profit, 0).toFixed(2)
            }</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Win Rate</h3>
            <p className="text-2xl font-bold text-green-600">{
              data.filter(item => item.status === 'win').length / data.length * 100
            }%</p>
          </div>
        </div>
      </div>
    </div>
  );
};