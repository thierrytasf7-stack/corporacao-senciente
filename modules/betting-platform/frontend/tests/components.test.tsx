import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StrategyCard } from '../../src/components/StrategyCard';
import { MetricsDashboard } from '../../src/components/MetricsDashboard';
import { StrategyList } from '../../src/components/StrategyList';
import { Strategy } from '../../src/types/strategy';
import { getStrategyResult } from '../../src/utils/strategy-utils';
import { formatCurrency, formatPercentage } from '../../src/utils/reporting-utils';

jest.mock('../../src/utils/strategy-utils');
jest.mock('../../src/utils/reporting-utils');

describe('StrategyCard', () => {
  const mockStrategy: Strategy = {
    id: 'test-strategy',
    type: 'Test Strategy',
    enabled: true,
    minProfitThreshold: 10,
    maxStakePercent: 5,
  };

  const mockResult = {
    profit: 123.45,
    confidence: 0.85,
    riskLevel: 'Medium',
    recommendedStake: 50.00,
  };

  beforeEach(() => {
    (getStrategyResult as jest.Mock).mockReturnValue(mockResult);
    (formatCurrency as jest.Mock).mockImplementation((value: number) => `$${value.toFixed(2)}`);
    (formatPercentage as jest.Mock).mockImplementation((value: number) => `${(value * 100).toFixed(1)}%`);
  });

  test('renders strategy card with correct data', () => {
    render(<StrategyCard strategy={mockStrategy} onExecute={() => {}} />);
    
    expect(screen.getByText('Test Strategy')).toBeInTheDocument();
    expect(screen.getByText('test-strategy')).toBeInTheDocument();
    expect(screen.getByText('$123.45')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  test('calls onExecute when button is clicked', () => {
    const mockOnExecute = jest.fn();
    render(<StrategyCard strategy={mockStrategy} onExecute={mockOnExecute} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Execute' }));
    
    expect(mockOnExecute).toHaveBeenCalledTimes(1);
  });

  test('renders strategy card with correct props', () => {
    const mockStrategy2: Strategy = {
      id: 'test-strategy-2',
      type: 'Another Strategy',
      enabled: false,
      minProfitThreshold: 20,
      maxStakePercent: 10,
    };

    render(<StrategyCard strategy={mockStrategy2} onExecute={() => {}} />);
    
    expect(screen.getByText('Another Strategy')).toBeInTheDocument();
    expect(screen.getByText('test-strategy-2')).toBeInTheDocument();
  });

  test('renders strategy card with correct styling', () => {
    render(<StrategyCard strategy={mockStrategy} onExecute={() => {}} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('w-full');
  });
});

describe('MetricsDashboard', () => {
  const mockMetrics = {
    totalBets: 100,
    winRate: 0.75,
    roi: 0.25,
    profit: 1500.50,
  };

  beforeEach(() => {
    (formatCurrency as jest.Mock).mockImplementation((value: number) => `$${value.toFixed(2)}`);
    (formatPercentage as jest.Mock).mockImplementation((value: number) => `${(value * 100).toFixed(1)}%`);
  });

  test('renders 4 metrics cards', () => {
    render(<MetricsDashboard metrics={mockMetrics} />);
    
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  test('renders total bets card with correct value', () => {
    render(<MetricsDashboard metrics={mockMetrics} />);
    
    expect(screen.getByText('Total Bets')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('renders win rate card with formatted percentage', () => {
    render(<MetricsDashboard metrics={mockMetrics} />);
    
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  test('renders ROI card with formatted percentage', () => {
    render(<MetricsDashboard metrics={mockMetrics} />);
    
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  test('renders profit card with formatted currency', () => {
    render(<MetricsDashboard metrics={mockMetrics} />);
    
    expect(screen.getByText('Profit')).toBeInTheDocument();
    expect(screen.getByText('$1500.50')).toBeInTheDocument();
  });

  test('renders metrics dashboard with correct grid layout', () => {
    render(<MetricsDashboard metrics={mockMetrics} />);
    
    const container = screen.getByRole('presentation');
    expect(container).toHaveClass('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6');
  });
});

describe('StrategyList', () => {
  const mockStrategies = [
    {
      id: 'strategy-1',
      type: 'Strategy 1',
      enabled: true,
      minProfitThreshold: 10,
      maxStakePercent: 5,
    },
    {
      id: 'strategy-2',
      type: 'Strategy 2',
      enabled: false,
      minProfitThreshold: 20,
      maxStakePercent: 10,
    },
    {
      id: 'strategy-3',
      type: 'Strategy 3',
      enabled: true,
      minProfitThreshold: 15,
      maxStakePercent: 8,
    },
  ];

  test('renders strategy list with all strategies', () => {
    render(<StrategyList strategies={mockStrategies} selectedStrategyId="" onSelect={() => {}} />);
    
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  test('filters enabled strategies', () => {
    render(<StrategyList strategies={mockStrategies} selectedStrategyId="" onSelect={() => {}} />);
    
    const enabledStrategies = screen.getAllByText('Strategy 1', 'Strategy 3');
    expect(enabledStrategies).toHaveLength(2);
  });

  test('selects strategy when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<StrategyList strategies={mockStrategies} selectedStrategyId="" onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByText('Strategy 1'));
    
    expect(mockOnSelect).toHaveBeenCalledWith('strategy-1');
  });

  test('highlights selected strategy', () => {
    render(<StrategyList strategies={mockStrategies} selectedStrategyId="strategy-2" onSelect={() => {}} />);
    
    const selectedCard = screen.getByText('Strategy 2').closest('article');
    expect(selectedCard).toHaveClass('border-blue-500');
  });

  test('renders strategy list with correct layout', () => {
    render(<StrategyList strategies={mockStrategies} selectedStrategyId="" onSelect={() => {}} />);
    
    const container = screen.getByRole('presentation');
    expect(container).toHaveClass('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6');
  });

  test('handles empty strategy list', () => {
    render(<StrategyList strategies={[]} selectedStrategyId="" onSelect={() => {}} />);
    
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText('No strategies available')).toBeInTheDocument();
  });
});