# CEO-BET - Strategic Orchestrator for BET-SPORTS Domain

## Overview

CEO-BET is the strategic orchestrator for the BET-SPORTS domain, responsible for coordinating five specialized squads to optimize betting portfolio performance. This squad serves as the central command center, making data-driven decisions and ensuring all operations align with strategic objectives.

## Purpose

The CEO-BET squad orchestrates the entire BET-SPORTS ecosystem, ensuring:
- **Strategic Alignment**: All squads work toward common objectives
- **Risk Management**: Betting operations stay within risk tolerance limits
- **Performance Optimization**: Continuous improvement of portfolio returns
- **Data-Driven Decisions**: Strategic choices based on comprehensive analysis

## Architecture

### Squad Structure
```
ceo-bet/
├── agents/                 # Agent definitions
│   └── ceo-bet.md         # Strategic orchestrator
├── tasks/                  # Task definitions
│   ├── orchestrate-*       # 5 orchestration tasks
│   ├── daily-briefing.md   # Daily consolidation
│   ├── strategic-decision.md # High-level decisions
│   └── portfolio-review.md # Portfolio optimization
├── workflows/              # Multi-step workflows
├── checklists/             # Validation checklists
├── templates/              # Document templates
├── tools/                  # Custom tools
├── scripts/                # Utility scripts
├── data/                   # Static data
└── docs/                   # Documentation
```

### Coordinated Squads

1. **live-betting** - Real-time betting operations
2. **data-sports** - Data pipeline and analytics
3. **strategy-sports** - Strategy development and optimization
4. **infra-sports** - Infrastructure and integrations
5. **analytics-sports** - Performance analysis and reporting

## Key Features

### Strategic Orchestration
- Coordinates all five BET-SPORTS squads
- Makes data-driven strategic decisions
- Ensures risk management compliance
- Optimizes portfolio performance

### Risk Management
- Monitors risk exposure across all operations
- Enforces bankroll management protocols
- Implements stop-loss mechanisms
- Diversifies betting portfolio

### Performance Optimization
- Analyzes performance across all squads
- Identifies optimization opportunities
- Adjusts strategies based on data
- Sets and monitors performance targets

## Usage

### Daily Operations
1. **Morning Briefing**: Generate daily briefing from all squads
2. **Strategic Review**: Make decisions based on briefing analysis
3. **Portfolio Optimization**: Review and adjust portfolio composition
4. **Squad Coordination**: Ensure all squads are aligned and performing

### Strategic Decisions
- Use `*daily-briefing` to get consolidated information
- Use `*strategic-decision` for high-level choices
- Use `*portfolio-review` for comprehensive portfolio analysis

## Integration

### Dependencies
- **live-betting**: Real-time betting execution
- **data-sports**: Data collection and processing
- **strategy-sports**: Strategy development and testing
- **infra-sports**: Technical infrastructure support
- **analytics-sports**: Performance analysis and insights

### Tools
- **PostgreSQL**: Data storage and analysis
- **Context7**: Documentation and research
- **Custom Scripts**: Automation and reporting

## Success Metrics

### Performance Indicators
- **Portfolio ROI**: Return on investment across all bets
- **Risk-Adjusted Returns**: Performance considering risk exposure
- **Win Rate**: Percentage of successful bets
- **Response Time**: Speed of decision-making

### Risk Metrics
- **Maximum Exposure**: Highest risk level maintained
- **Diversification**: Portfolio spread across markets
- **Stop-Loss Compliance**: Adherence to loss limits
- **Bankroll Management**: Effective use of available funds

## Getting Started

1. **Activate CEO-BET**: Use the CEO-BET command interface
2. **Generate Briefing**: Start with `*daily-briefing`
3. **Review Portfolio**: Use `*portfolio-review` for analysis
4. **Make Decisions**: Use `*strategic-decision` for high-level choices
5. **Monitor Performance**: Track metrics and adjust strategies

## Support

For questions or issues with CEO-BET:
- Check the documentation in `docs/`
- Review task definitions in `tasks/`
- Consult the strategic orchestrator agent in `agents/ceo-bet.md`
- Contact the BET-SPORTS team for domain-specific questions

---

**CEO-BET**: Strategic orchestration for optimal betting performance. Data-driven decisions, risk-aware operations, portfolio-focused optimization.