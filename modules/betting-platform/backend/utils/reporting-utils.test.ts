import { formatCurrency, formatPercentage, formatDate, aggregateByPeriod } from './reporting-utils';

describe('Reporting Utils', () => {
  describe('formatCurrency', () => {
    it('formats USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('formats EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });

    it('formats large amounts with commas', () => {
      expect(formatCurrency(1234567.89, 'USD')).toBe('$1,234,567.89');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with default decimals', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
    });

    it('formats percentage with custom decimals', () => {
      expect(formatPercentage(0.1234, 1)).toBe('12.3%');
    });

    it('formats whole percentages', () => {
      expect(formatPercentage(1)).toBe('100.00%');
    });
  });

  describe('formatDate', () => {
    it('formats date with custom format', () => {
      const date = new Date('2024-01-15T12:34:56');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    it('formats date with time', () => {
      const date = new Date('2024-01-15T12:34:56');
      expect(formatDate(date, 'yyyy-MM-dd HH:mm')).toBe('2024-01-15 12:34');
    });

    it('formats date with month name', () => {
      const date = new Date('2024-01-15T12:34:56');
      expect(formatDate(date, 'MMMM dd, yyyy')).toBe('January 15, 2024');
    });
  });

  describe('aggregateByPeriod', () => {
    const testData = [
      { date: '2024-01-01', amount: 100 },
      { date: '2024-01-02', amount: 200 },
      { date: '2024-01-03', amount: 150 },
      { date: '2024-01-10', amount: 300 },
      { date: '2024-02-01', amount: 500 },
    ];

    it('aggregates by day', () => {
      const result = aggregateByPeriod(testData, 'day');
      expect(result.length).toBe(5);
      expect(result[0]).toEqual({
        period: '2024-01-01',
        count: 1,
        total: 100,
        items: [{ date: '2024-01-01', amount: 100 }],
      });
    });

    it('aggregates by week', () => {
      const result = aggregateByPeriod(testData, 'week');
      expect(result.length).toBe(2);
      expect(result[0].period).toMatch(/2024-'Week' \d+/);
      expect(result[0].count).toBe(3);
      expect(result[0].total).toBe(450);
    });

    it('aggregates by month', () => {
      const result = aggregateByPeriod(testData, 'month');
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        period: '2024-01',
        count: 4,
        total: 750,
        items: [
          { date: '2024-01-01', amount: 100 },
          { date: '2024-01-02', amount: 200 },
          { date: '2024-01-03', amount: 150 },
          { date: '2024-01-10', amount: 300 },
        ],
      });
    });
  });
});