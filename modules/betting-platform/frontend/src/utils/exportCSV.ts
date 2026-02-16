export function exportToCSV(data: any[], filename: string = 'data.csv') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const csvRows = [];
  
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escapedValue = String(value)
        .replace(/"/g, '""')
        .replace(/\n/g, ' ');
      return `"${escapedValue}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\r\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function downloadCSV(data: any[], filename: string = 'data.csv') {
  try {
    exportToCSV(data, filename);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV');
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function validateCSVData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const firstRowKeys = Object.keys(data[0]);
  
  for (const row of data) {
    if (typeof row !== 'object' || row === null) {
      return false;
    }
    
    const rowKeys = Object.keys(row);
    if (JSON.stringify(rowKeys) !== JSON.stringify(firstRowKeys)) {
      return false;
    }
  }
  
  return true;
}

export function sanitizeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const strValue = String(value);
  
  if (strValue.includes('"') || strValue.includes(',') || strValue.includes('\n')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  
  return strValue;
}

export function generateCSVContent(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) {
    throw new Error('No data to generate CSV content');
  }

  const csvRows = [];
  
  const finalHeaders = headers || Object.keys(data[0]);
  csvRows.push(finalHeaders.join(','));

  for (const row of data) {
    const values = finalHeaders.map(header => {
      return sanitizeCSVValue(row[header]);
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\r\n');
}

export function createCSVBlob(data: any[], filename: string = 'data.csv'): Blob {
  const csvContent = generateCSVContent(data);
  return new Blob([csvContent], { type: 'text/csv' });
}

export function saveCSVFile(data: any[], filename: string = 'data.csv'): void {
  const blob = createCSVBlob(data, filename);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function parseCSV(csvString: string): any[] {
  const rows = csvString.trim().split('\r\n');
  if (rows.length < 2) {
    throw new Error('Invalid CSV format');
  }

  const headers = rows[0].split(',').map(header => 
    header.replace(/^"|"$/g, '').replace(/'"''/g, '"')
  );

  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < row.length; j++) {
      const char = row[j];
      
      if (char === '"') {
        if (inQuotes && row[j + 1] === '"') {
          currentValue += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    
    if (values.length === headers.length) {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      data.push(obj);
    }
  }
  
  return data;
}

export function isCSVFile(file: File): boolean {
  return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
}

export function getCSVStats(data: any[]): {
  totalRows: number;
  totalBetAmount: number;
  totalPayout: number;
  totalProfit: number;
  winCount: number;
  lossCount: number;
  pendingCount: number;
} {
  return data.reduce(
    (stats, row) => {
      const betAmount = Number(row.betAmount) || 0;
      const payout = Number(row.payout) || 0;
      const profit = Number(row.profit) || 0;
      const status = row.status as string;
      
      return {
        totalRows: stats.totalRows + 1,
        totalBetAmount: stats.totalBetAmount + betAmount,
        totalPayout: stats.totalPayout + payout,
        totalProfit: stats.totalProfit + profit,
        winCount: status === 'win' ? stats.winCount + 1 : stats.winCount,
        lossCount: status === 'loss' ? stats.lossCount + 1 : stats.lossCount,
        pendingCount: status === 'pending' ? stats.pendingCount + 1 : stats.pendingCount,
      };
    },
    {
      totalRows: 0,
      totalBetAmount: 0,
      totalPayout: 0,
      totalProfit: 0,
      winCount: 0,
      lossCount: 0,
      pendingCount: 0,
    }
  );
}

export function validatePerformanceData(data: any[]): boolean {
  const requiredKeys = ['id', 'date', 'userId', 'betAmount', 'payout', 'profit', 'status'];
  
  return data.every(row => {
    return requiredKeys.every(key => key in row) &&
           typeof row.id === 'number' &&
           typeof row.date === 'string' &&
           typeof row.userId === 'string' &&
           typeof row.betAmount === 'number' &&
           typeof row.payout === 'number' &&
           typeof row.profit === 'number' &&
           ['win', 'loss', 'pending'].includes(row.status);
  });
}