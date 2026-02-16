# Agents Directory - Atomic Structure

## Overview
This is the canonical source for all JavaScript/TypeScript agent implementations in the Corporação Senciente system.

## Structure

```
backend/scripts/agents/
├── core/                    # Atomic Foundation
│   ├── base_agent.js        # BaseAgent class
│   ├── agent_call_tracker.js # Call tracking utilities
│   ├── handoff_manager.js   # Agent handoff logic
│   ├── multi_agent_framework.js # Framework utilities
│   └── index.js             # Core exports
│
├── technical/               # Technical Domain Agents
│   ├── architect_agent.js   # Architecture & design
│   ├── dev_agent.js         # Development tasks
│   ├── debug_agent.js       # Debugging & troubleshooting
│   ├── product_agent.js     # Product management
│   └── validation_agent.js  # Code validation
│
├── business/                # Business Domain Agents
│   ├── copywriting_agent.js # Content creation
│   ├── finance_agent.js     # Financial analysis
│   ├── marketing_agent.js   # Marketing automation
│   └── sales_agent.js       # Sales operations
│
├── operations/              # Operations Domain Agents
│   ├── devex_agent.js       # Developer experience
│   ├── metrics_agent.js     # Metrics & analytics
│   ├── quality_agent.js     # Quality assurance
│   └── security_agent.js    # Security operations
│
└── specialized/             # Specialized Domain Agents
    ├── customer_success_agent.js # Customer success
    ├── data_agent.js             # Data operations
    ├── innovation_agent.js       # Innovation & R&D
    ├── research_agent.js         # Research tasks
    └── strategy_agent.js         # Strategic planning
```

## Usage

### Importing Core Components
```javascript
import { BaseAgent, getHandoffManager } from './core/index.js';
```

### Creating a New Agent
```javascript
import { BaseAgent } from './core/base_agent.js';

class MyNewAgent extends BaseAgent {
    constructor() {
        super({
            name: 'my_new_agent',
            sector: 'Technical', // or Business, Operations
            specialization: 'My Domain',
            tools: ['write_file', 'search_replace'],
            canCallAgents: ['dev_agent', 'architect_agent']
        });
    }
    
    async processTask(task, context) {
        // Implementation
    }
}
```

## Python Agents
Python agent implementations are located in `backend/agents/`:
- `backend/agents/base/` - Base agent class
- `backend/agents/memory/` - Memory systems (L.L.B.)
- `backend/agents/specialized/` - Specialized Python agents

---
*Consolidated as part of Alquimia Digital - January 2026*
