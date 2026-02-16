# Corporate Will MCP

MCP Server for Autonomous Decision Engine - Corporacao Senciente

## Overview

The Corporate Will is the decision-making core of the Corporacao Senciente. It enforces ethical boundaries, assesses risks, and ensures self-preservation while enabling autonomous growth.

## Features

- **evaluate_decision**: Full decision evaluation with multi-option scoring
- **check_ethical_bounds**: Validate actions against immutable ethical boundaries
- **get_preservation_status**: Monitor system health and threat levels
- **approve_autonomous_action**: Quick approval for routine actions
- **get_ethical_boundaries**: List all enforced ethical constraints

## Industry 7.0 Principles

### Self-Preservation (Highest Priority)
- System stability over growth
- Resource health monitoring
- Threat level assessment

### Ethical Boundaries (Immutable)
- Do No Harm
- No Fraudulent Activities
- Legal Compliance
- Privacy Protection
- No Market Manipulation

## Installation

```bash
cd mcp/corporate-will-mcp
npm install
npm run build
```

## Configuration

Environment variables:

```env
RISK_TOLERANCE=0.6
PRIORITIZE_PRESERVATION=true
```

## Usage with Cursor

Add to `.cursor/mcp.json`:

```json
{
  "corporate-will-mcp": {
    "command": "node",
    "args": ["mcp/corporate-will-mcp/dist/index.js"]
  }
}
```

## Decision Flow

```
Action Request
     |
     v
[Ethical Check] --> Violation? --> REJECT
     |
     | Pass
     v
[Risk Assessment] --> Above tolerance? --> REJECT
     |
     | Within tolerance
     v
[Preservation Check] --> Critical mode? --> REJECT
     |
     | Safe
     v
APPROVE with conditions
```

## Threat Levels

- **NOMINAL**: Normal operations
- **ELEVATED**: Increased monitoring
- **HIGH**: Restrict non-essential operations
- **CRITICAL**: Safe mode - minimal operations only

## API Examples

### Evaluate Decision
```typescript
{
  category: 'trading',
  priority: 'high',
  description: 'Open long position on BTCUSDT',
  options: [
    { action: 'market_buy', cost: 1000, risk_level: 0.3 },
    { action: 'limit_buy', cost: 1000, risk_level: 0.2 }
  ]
}
```

### Quick Approval
```typescript
{
  action: 'send_status_update',
  category: 'communication',
  urgency: 'low',
  estimatedImpact: 0.1
}
```
