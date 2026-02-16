import { format } from 'date-fns';

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
}

export function formatDate(date: Date, format: string): string {
  return format(date, format);
}

export function aggregateByPeriod(data: any[], period: 'day' | 'week' | 'month'): any[] {
  const grouped = new Map();
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;
    
    switch (period) {
      case 'day':
        key = formatDate(date, 'yyyy-MM-dd');
        break;
      case 'week':
        key = formatDate(date, 'yyyy-\'Week\' w');
        break;
      case 'month':
        key = formatDate(date, 'yyyy-MM');
        break;
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    
    grouped.get(key).push(item);
  });
  
  return Array.from(grouped.entries()).map(([key, items]) => ({
    period: key,
    count: items.length,
    total: items.reduce((sum, item) => sum + (item.amount || 0), 0),
    items,
  }));
}