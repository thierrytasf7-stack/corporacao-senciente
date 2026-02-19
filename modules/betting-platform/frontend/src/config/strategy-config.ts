export const DEFAULT_STRATEGIES = [
  {
    id: 'martingale',
    name: 'Martingale',
    description: 'Double your bet after each loss to recover losses',
    riskLevel: 'High',
    successRate: 45
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    description: 'Follow Fibonacci sequence for bet sizing',
    riskLevel: 'Medium',
    successRate: 52
  },
  {
    id: 'dalembert',
    name: 'D\'Alembert',
    description: 'Increase bet by one unit after loss, decrease after win',
    riskLevel: 'Low',
    successRate: 58
  },
  {
    id: 'labouchere',
    name: 'Labouchere',
    description: 'Cancel numbers from sequence when winning, add when losing',
    riskLevel: 'Medium',
    successRate: 49
  },
  {
    id: 'paroli',
    name: 'Paroli',
    description: 'Positive progression system, double after wins',
    riskLevel: 'Low',
    successRate: 55
  },
  {
    id: 'oscars-grind',
    name: 'Oscar\'s Grind',
    description: 'Increase bets by one unit after wins, keep after losses',
    riskLevel: 'Low',
    successRate: 53
  }
];