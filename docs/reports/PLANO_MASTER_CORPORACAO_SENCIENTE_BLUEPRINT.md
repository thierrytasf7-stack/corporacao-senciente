# 🔬 **BLUEPRINT EXECUTÁVEL - CORPORAÇÃO SENCIENTE HOLDING AUTÔNOMA**

**Chief AI Architect & Principal Software Engineer**
**Data:** Janeiro 2026
**Input:** Corporação Senciente como Holding Autônoma
**Stack:** Python 3.12+ (Async), React 19+, Supabase, MCP Protocol, Vector DB

---

## 1. 🏗️ **ARQUITETURA DE ALTO NÍVEL (C4 MODEL)**

### **System Context - Holding Autônoma**
```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYSTEM CONTEXT                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   ADMIN USER    │  │ CORPORAÇÃO      │  │   SUBSIDIÁRIAS   │     │
│  │   (Você)        │  │ SENCIENTE       │  │   AUTÔNOMAS      │     │
│  │                 │  │ HOLDING         │  │                 │     │
│  │ • Painel Admin  │  │ • Cérebro Central│  │ • SaaS Apps     │     │
│  │ • Controle      │  │ • Agentes IA    │  │ • Trading Bots   │     │
│  │ • Monitoring    │  │ • Auto-Criação │  │ • E-commerce     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                        │                        │      │
│           └────────────────────────┼────────────────────────┘      │
│                                    │                               │
│                    ┌───────────────▼─────────────────────────┐     │
│                    │         EXTERNAL SYSTEMS                │     │
│                    │    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │     │
│                    │    │Users│ │Banks│ │APIs │ │Cloud│      │     │
│                    │    └─────┘ └─────┘ └─────┘ └─────┘      │     │
│                    └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### **Container Diagram - Arquitetura Técnica**
```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTAINER DIAGRAM                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   REACT ADMIN   │  │   PYTHON CORE   │  │   SUPABASE DB    │     │
│  │   FRONTEND      │  │   BACKEND       │  │   VECTOR STORE   │     │
│  │   (Dashboard)   │  │   (Cérebro)     │  │   (Memória)      │     │
│  │                 │  │                 │  │                 │     │
│  │ • Painel Admin  │  │ • Agentes IA    │  │ • Dados Holding  │     │
│  │ • Real-time     │  │ • Auto-Criação │  │ • Vector Search  │     │
│  │ • Charts        │  │ • Orchestration│  │ • RLS Security   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                        │                        │      │
│           └────────────────────────┼────────────────────────┘      │
│                                    │                               │
│                    ┌───────────────▼─────────────────────────┐     │
│                    │         SHARED SERVICES                 │     │
│                    │    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │     │
│                    │    │Redis│ │Stripe│ │MCP  │ │SMTP │      │     │
│                    │    │Cache│ │Pay  │ │Proto│ │Email│      │     │
│                    │    └─────┘ └─────┘ └─────┘ └─────┘      │     │
│                    └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### **Directory Structure - Árvore Completa**
```
corporacao-senciente/
├── 📁 docs/                          # Documentação viva
│   ├── architecture/                 # Arquitetura C4
│   ├── ddd/                         # Domain-Driven Design
│   └── blueprints/                   # Blueprints executáveis
├── 📁 frontend/                      # React Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/               # UI Atoms
│   │   │   ├── molecules/           # UI Molecules
│   │   │   ├── organisms/           # UI Organisms
│   │   │   └── holding/             # Holding-specific components
│   │   ├── pages/                   # Dashboard pages
│   │   │   ├── HoldingDashboard.tsx
│   │   │   ├── Subsidiaries.tsx
│   │   │   └── CreationSystem.tsx
│   │   ├── services/                # API services
│   │   └── hooks/                   # React hooks
├── 📁 backend/                       # Python Core Engine
│   ├── core/                        # Domain core
│   │   ├── entities/                # DDD Entities
│   │   ├── value_objects/           # DDD Value Objects
│   │   ├── aggregates/              # DDD Aggregates
│   │   ├── services/                # Domain services
│   │   └── events/                  # Domain events
│   ├── agents/                      # AI Agents
│   │   ├── base/                    # Base agent classes
│   │   ├── specialized/             # Specialized agents
│   │   ├── orchestration/           # Agent orchestration
│   │   └── mcp/                     # MCP protocol tools
│   ├── infrastructure/              # Infra layer
│   │   ├── database/                # Supabase client
│   │   ├── cache/                   # Redis client
│   │   ├── external/                # External APIs
│   │   └── messaging/               # Event messaging
│   ├── application/                 # Application layer
│   │   ├── use_cases/               # Application use cases
│   │   ├── dto/                     # Data transfer objects
│   │   └── handlers/                # Event handlers
│   └── presentation/                # API layer
│       ├── api/                     # REST API routes
│       ├── graphql/                 # GraphQL schema
│       └── websocket/               # Real-time updates
├── 📁 scripts/                       # Automation scripts
│   ├── deployment/                   # Deploy automation
│   ├── monitoring/                   # Health monitoring
│   ├── testing/                      # Test automation
│   └── maintenance/                  # Maintenance scripts
├── 📁 data/                          # Data & configurations
│   ├── schemas/                      # Database schemas
│   ├── fixtures/                     # Test data
│   └── migrations/                   # DB migrations
├── 📁 tests/                         # Test suites
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   ├── e2e/                         # End-to-end tests
│   └── performance/                 # Performance tests
├── 📁 tools/                         # Development tools
│   ├── cli/                         # Command-line tools
│   ├── scripts/                     # Utility scripts
│   └── templates/                   # Code templates
├── 📁 docs/                          # Documentation
├── pyproject.toml                    # Python project config
├── package.json                      # Node.js dependencies
├── docker-compose.yml               # Local development
├── Dockerfile                       # Container config
└── .project-context.md              # Agentic memory file
```

---

## 2. 🎯 **DOMAIN-DRIVEN DESIGN (DDD) & DATA SCHEMA**

### **Bounded Contexts Identificados**

#### **BC1: Holding Management (Core Domain)**
**Responsabilidades:**
- Gestão estratégica da holding
- Alocação de recursos entre subsidiárias
- Monitoramento de performance consolidada
- Decisões de investimento e expansão

**Entidades Principais:**
- `Holding`: Entidade raiz representando a corporação
- `Subsidiary`: Subsidiária autônoma
- `Portfolio`: Portfólio de investimentos
- `ResourceAllocation`: Alocação de recursos

#### **BC2: Subsidiary Creation (Supporting Domain)**
**Responsabilidades:**
- Identificação de oportunidades de negócio
- Criação automatizada de subsidiárias
- Validação de viabilidade econômica
- Setup inicial de infraestrutura

**Entidades Principais:**
- `Opportunity`: Oportunidade de negócio identificada
- `SubsidiaryTemplate`: Template para criação
- `CreationProcess`: Processo de criação
- `ValidationResult`: Resultado de validação

#### **BC3: Agent Orchestration (Generic Domain)**
**Responsabilidades:**
- Coordenação de agentes IA
- Protocolo L.L.B. implementation
- Task delegation e monitoring
- Performance optimization

**Entidades Principais:**
- `Agent`: Agente IA individual
- `OrchestrationTask`: Tarefa de coordenação
- `LLBProtocol`: Protocolo Lang/Letta/ByteRover
- `PerformanceMetrics`: Métricas de performance

### **Entidades e Value Objects Principais**

#### **Entidades Core:**
```python
@dataclass
class Holding:
    id: UUID
    name: str = "Corporação Senciente"
    vision: str = "Holding que constrói empresas"
    created_at: datetime
    subsidiaries: List[Subsidiary] = field(default_factory=list)
    total_revenue: Decimal = Decimal('0')
    total_assets: Decimal = Decimal('0')

@dataclass
class Subsidiary:
    id: UUID
    name: str
    business_type: BusinessType  # Enum: SAAS, TRADING, ECOMMERCE, etc.
    status: SubsidiaryStatus     # Enum: PLANNING, ACTIVE, INACTIVE, etc.
    revenue_target: Decimal
    current_revenue: Decimal = Decimal('0')
    autonomy_level: float = 0.0  # 0-100%
    created_at: datetime
    agents: List[Agent] = field(default_factory=list)

@dataclass
class Agent:
    id: UUID
    name: str
    role: AgentRole  # Enum: MARKETING, SALES, DEVELOPMENT, etc.
    specialization: str
    autonomy_level: float
    performance_score: float = 0.0
    tasks_completed: int = 0
    subsidiary_id: Optional[UUID] = None
```

#### **Value Objects:**
```python
@dataclass(frozen=True)
class BusinessType:
    value: str
    category: str  # B2B, B2C, B2G

@dataclass(frozen=True)
class RevenueTarget:
    monthly_target: Decimal
    growth_rate: float
    timeframe_months: int

@dataclass(frozen=True)
class AutonomyMetrics:
    decision_accuracy: float  # 0-100%
    human_intervention_rate: float  # 0-100%
    task_completion_rate: float  # 0-100%
    error_recovery_time: timedelta
```

### **Data Schema (PostgreSQL + Vector)**
```sql
-- Core Tables
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    vision TEXT,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_assets DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subsidiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID REFERENCES holdings(id),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNING',
    revenue_target DECIMAL(15,2),
    current_revenue DECIMAL(15,2) DEFAULT 0,
    autonomy_level DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsidiary_id UUID REFERENCES subsidiaries(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    specialization TEXT,
    autonomy_level DECIMAL(5,2) DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector Memory Tables (for AI context)
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    memory_type VARCHAR(20), -- lang, letta, byterover
    content TEXT,
    embedding vector(1536), -- OpenAI text-embedding-ada-002
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subsidiary_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_segment VARCHAR(100),
    opportunity_description TEXT,
    estimated_revenue DECIMAL(15,2),
    risk_level VARCHAR(20),
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subsidiaries_holding ON subsidiaries(holding_id);
CREATE INDEX idx_agents_subsidiary ON agents(subsidiary_id);
CREATE INDEX idx_agent_memories_agent ON agent_memories(agent_id);
CREATE INDEX idx_agent_memories_embedding ON agent_memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_opportunities_embedding ON subsidiary_opportunities USING ivfflat (embedding vector_cosine_ops);
```

---

## 3. ⚛️ **ATOMIC DECOMPOSITION (COMPONENT & LOGIC)**

### **Átomos (Funções Utilitárias Puras)**
```python
# atoms/financial.py
from decimal import Decimal
from typing import List

def calculate_roi(investment: Decimal, revenue: Decimal) -> float:
    """Calculate ROI percentage"""
    if investment == 0:
        return 0.0
    return float(((revenue - investment) / investment) * 100)

def compound_growth(principal: Decimal, rate: float, periods: int) -> Decimal:
    """Calculate compound growth"""
    return principal * (Decimal(1 + rate) ** periods)

# atoms/validation.py
from pydantic import BaseModel, validator
from typing import Optional

class EmailStr(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise ValueError('must be a string')
        if '@' not in v:
            raise ValueError('must be a valid email')
        return cls(v)

# atoms/agent_protocol.py
from abc import ABC, abstractmethod
from typing import Dict, Any

class AgentProtocol(ABC):
    @abstractmethod
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_status(self) -> Dict[str, Any]:
        pass
```

### **Moléculas (Classes de Serviço Isoladas)**
```python
# molecules/agent_service.py
from typing import List, Optional
from core.entities import Agent
from core.value_objects import AutonomyMetrics

class AgentService:
    def __init__(self, repository: 'AgentRepository'):
        self.repository = repository

    async def calculate_autonomy_metrics(self, agent_id: str) -> AutonomyMetrics:
        agent = await self.repository.get_by_id(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        # Calculate metrics based on agent performance
        decision_accuracy = await self._calculate_decision_accuracy(agent)
        human_intervention = await self._calculate_human_intervention(agent)

        return AutonomyMetrics(
            decision_accuracy=decision_accuracy,
            human_intervention_rate=human_intervention,
            task_completion_rate=agent.tasks_completed / max(agent.tasks_completed + 1, 1),
            error_recovery_time=timedelta(seconds=30)  # Simplified
        )

# molecules/subsidiary_validator.py
from typing import Dict, Any
from core.entities import Subsidiary
from core.value_objects import RevenueTarget

class SubsidiaryValidator:
    def __init__(self, market_analyzer: 'MarketAnalyzer'):
        self.market_analyzer = market_analyzer

    async def validate_opportunity(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        # Analyze market potential
        market_size = await self.market_analyzer.get_market_size(
            opportunity['market_segment']
        )

        # Calculate revenue potential
        revenue_potential = await self._calculate_revenue_potential(opportunity)

        # Assess risk level
        risk_assessment = await self._assess_risk_level(opportunity)

        return {
            'market_size': market_size,
            'revenue_potential': revenue_potential,
            'risk_level': risk_assessment,
            'viability_score': self._calculate_viability_score(
                market_size, revenue_potential, risk_assessment
            )
        }
```

### **Organismos (Módulos de Funcionalidade Completa)**
```python
# organisms/subsidiary_creation_engine.py
from typing import Dict, Any, List
from molecules.subsidiary_validator import SubsidiaryValidator
from molecules.agent_service import AgentService
from infrastructure.database import SubsidiaryRepository
from infrastructure.external import CloudProvisioner

class SubsidiaryCreationEngine:
    def __init__(
        self,
        validator: SubsidiaryValidator,
        agent_service: AgentService,
        repository: SubsidiaryRepository,
        provisioner: CloudProvisioner
    ):
        self.validator = validator
        self.agent_service = agent_service
        self.repository = repository
        self.provisioner = provisioner

    async def create_subsidiary(self, opportunity: Dict[str, Any]) -> Subsidiary:
        # Step 1: Validate opportunity
        validation = await self.validator.validate_opportunity(opportunity)
        if validation['viability_score'] < 0.7:
            raise ValueError("Opportunity not viable enough")

        # Step 2: Create subsidiary entity
        subsidiary = Subsidiary(
            name=opportunity['name'],
            business_type=opportunity['business_type'],
            revenue_target=Decimal(str(validation['revenue_potential']))
        )

        # Step 3: Provision infrastructure
        infra_config = await self.provisioner.provision_subsidiary_infrastructure(
            subsidiary.id,
            subsidiary.business_type
        )

        # Step 4: Assign initial agents
        agents = await self._assign_initial_agents(subsidiary)

        # Step 5: Persist to database
        saved_subsidiary = await self.repository.save(subsidiary)

        return saved_subsidiary

# organisms/holding_dashboard_service.py
from typing import Dict, Any, List
from molecules.financial_aggregator import FinancialAggregator
from molecules.performance_monitor import PerformanceMonitor
from infrastructure.database import HoldingRepository

class HoldingDashboardService:
    def __init__(
        self,
        financial_aggregator: FinancialAggregator,
        performance_monitor: PerformanceMonitor,
        repository: HoldingRepository
    ):
        self.financial_aggregator = financial_aggregator
        self.performance_monitor = performance_monitor
        self.repository = repository

    async def get_executive_dashboard(self, holding_id: str) -> Dict[str, Any]:
        holding = await self.repository.get_by_id(holding_id)

        # Aggregate financial data
        financial_summary = await self.financial_aggregator.aggregate_holding_financials(holding)

        # Get performance metrics
        performance_metrics = await self.performance_monitor.get_holding_performance(holding)

        # Calculate KPIs
        kpis = self._calculate_kpis(financial_summary, performance_metrics)

        return {
            'holding': holding,
            'financial_summary': financial_summary,
            'performance_metrics': performance_metrics,
            'kpis': kpis,
            'alerts': await self._get_active_alerts(holding),
            'recommendations': await self._generate_recommendations(holding)
        }
```

---

## 4. 📋 **O PLANO DE EXECUÇÃO (STEP-BY-STEP ACTIONABLE)**

### **Passo 001** - Configuração Base do Projeto
**Fase:** Configuração  
**Ação:** Criar estrutura base do projeto Python com configurações iniciais  
**Arquivo Alvo:** `pyproject.toml`  
**Código/Spec:**
```toml
[tool.poetry]
name = "corporacao-senciente-holding"
version = "0.1.0"
description = "Holding Autônoma que cria empresas subsidiárias"
authors = ["Corporação Senciente <admin@corporacao-senciente.com>"]

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.104.1"
uvicorn = "^0.24.0"
pydantic = "^2.5.0"
sqlalchemy = "^2.0.23"
asyncpg = "^0.29.0"
redis = "^5.0.1"
chromadb = "^0.4.18"
openai = "^1.3.7"
supabase = "^2.3.0"
stripe = "^7.4.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
black = "^23.11.0"
mypy = "^1.7.1"
```

**Definition of Done:** Executar `poetry install` sem erros e `python -c "import fastapi, pydantic; print('Dependencies OK')"` passar.

### **Passo 002** - Entidades Core do Domínio
**Fase:** Core  
**Ação:** Implementar entidades DDD fundamentais da holding  
**Arquivo Alvo:** `backend/core/entities/holding.py`  
**Código/Spec:**
```python
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID, uuid4

from core.value_objects import BusinessType, SubsidiaryStatus

@dataclass
class Holding:
    id: UUID = field(default_factory=uuid4)
    name: str = "Corporação Senciente"
    vision: str = "Holding que constrói empresas automaticamente"
    total_revenue: Decimal = Decimal('0')
    total_assets: Decimal = Decimal('0')
    subsidiaries: List['Subsidiary'] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def add_subsidiary(self, subsidiary: 'Subsidiary') -> None:
        self.subsidiaries.append(subsidiary)

    def calculate_total_revenue(self) -> Decimal:
        return sum(s.current_revenue for s in self.subsidiaries)

@dataclass
class Subsidiary:
    id: UUID = field(default_factory=uuid4)
    holding_id: UUID
    name: str
    business_type: BusinessType
    status: SubsidiaryStatus = SubsidiaryStatus.PLANNING
    revenue_target: Decimal
    current_revenue: Decimal = Decimal('0')
    autonomy_level: float = 0.0
    agents: List['Agent'] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def assign_agent(self, agent: 'Agent') -> None:
        agent.subsidiary_id = self.id
        self.agents.append(agent)

    def calculate_autonomy_percentage(self) -> float:
        if not self.agents:
            return 0.0
        return sum(a.autonomy_level for a in self.agents) / len(self.agents)
```

**Definition of Done:** Executar `python -c "from backend.core.entities.holding import Holding, Subsidiary; h = Holding(); print('Entities OK')"` sem erros.

### **Passo 003** - Value Objects Essenciais
**Fase:** Core  
**Ação:** Criar value objects imutáveis para o domínio  
**Arquivo Alvo:** `backend/core/value_objects.py`  
**Código/Spec:**
```python
from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Optional

class BusinessType(Enum):
    SAAS = "saas"
    TRADING = "trading"
    ECOMMERCE = "ecommerce"
    MARKETPLACE = "marketplace"
    CONSULTING = "consulting"
    RESEARCH = "research"

class SubsidiaryStatus(Enum):
    PLANNING = "planning"
    DEVELOPMENT = "development"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"

class AgentRole(Enum):
    MARKETING = "marketing"
    SALES = "sales"
    DEVELOPMENT = "development"
    OPERATIONS = "operations"
    FINANCE = "finance"
    RESEARCH = "research"
    MANAGEMENT = "management"

@dataclass(frozen=True)
class RevenueTarget:
    monthly_target: Decimal
    growth_rate: float  # Percentage per month
    timeframe_months: int

    def calculate_total_target(self) -> Decimal:
        """Calculate total revenue target over timeframe"""
        principal = self.monthly_target * self.timeframe_months
        growth_factor = (1 + self.growth_rate) ** self.timeframe_months
        return principal * Decimal(str(growth_factor))

@dataclass(frozen=True)
class AutonomyMetrics:
    decision_accuracy: float  # 0-100%
    human_intervention_rate: float  # 0-100%
    task_completion_rate: float  # 0-100%
    error_recovery_time_seconds: float

    def calculate_overall_score(self) -> float:
        """Calculate weighted autonomy score"""
        weights = {
            'decision_accuracy': 0.4,
            'human_intervention_rate': -0.3,  # Negative because lower is better
            'task_completion_rate': 0.2,
            'error_recovery_time_seconds': -0.1  # Negative because lower is better
        }

        score = (
            self.decision_accuracy * weights['decision_accuracy'] +
            (100 - self.human_intervention_rate) * abs(weights['human_intervention_rate']) +
            self.task_completion_rate * weights['task_completion_rate'] +
            max(0, 100 - self.error_recovery_time_seconds) * abs(weights['error_recovery_time_seconds'])
        )

        return min(100.0, max(0.0, score))
```

**Definition of Done:** Executar `python -c "from backend.core.value_objects import BusinessType, RevenueTarget; bt = BusinessType.SAAS; rt = RevenueTarget(Decimal('10000'), 0.1, 12); print('Value Objects OK')"` sem erros.

### **Passo 004** - Base de Dados e Migrações
**Fase:** Core  
**Ação:** Configurar Supabase e criar migrações iniciais  
**Arquivo Alvo:** `data/schemas/holding_schema.sql`  
**Código/Spec:**
```sql
-- Holding Core Schema
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Corporação Senciente',
    vision TEXT NOT NULL DEFAULT 'Holding que constrói empresas',
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_assets DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subsidiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('saas', 'trading', 'ecommerce', 'marketplace', 'consulting', 'research')),
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'active', 'inactive', 'archived')),
    revenue_target DECIMAL(15,2),
    current_revenue DECIMAL(15,2) DEFAULT 0,
    autonomy_level DECIMAL(5,2) DEFAULT 0 CHECK (autonomy_level >= 0 AND autonomy_level <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsidiary_id UUID REFERENCES subsidiaries(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('marketing', 'sales', 'development', 'operations', 'finance', 'research', 'management')),
    specialization TEXT,
    autonomy_level DECIMAL(5,2) DEFAULT 0 CHECK (autonomy_level >= 0 AND autonomy_level <= 100),
    performance_score DECIMAL(5,2) DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
    tasks_completed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector Memory for AI Agents
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    memory_type VARCHAR(20) NOT NULL CHECK (memory_type IN ('lang', 'letta', 'byterover')),
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-ada-002
    importance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subsidiary Opportunities
CREATE TABLE subsidiary_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_segment VARCHAR(100) NOT NULL,
    opportunity_description TEXT NOT NULL,
    estimated_revenue DECIMAL(15,2),
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_subsidiaries_holding_id ON subsidiaries(holding_id);
CREATE INDEX idx_agents_subsidiary_id ON agents(subsidiary_id);
CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX idx_agent_memories_memory_type ON agent_memories(memory_type);
CREATE INDEX idx_opportunities_market_segment ON subsidiary_opportunities(market_segment);

-- Vector Indexes for Similarity Search
CREATE INDEX idx_agent_memories_embedding ON agent_memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_opportunities_embedding ON subsidiary_opportunities USING ivfflat (embedding vector_cosine_ops);

-- Row Level Security Policies
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidiary_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified - would be more complex in production)
CREATE POLICY "holding_access" ON holdings FOR ALL USING (true);
CREATE POLICY "subsidiary_access" ON subsidiaries FOR ALL USING (true);
CREATE POLICY "agent_access" ON agents FOR ALL USING (true);
CREATE POLICY "memory_access" ON agent_memories FOR ALL USING (true);
CREATE POLICY "opportunity_access" ON subsidiary_opportunities FOR ALL USING (true);
```

**Definition of Done:** Executar migração no Supabase Dashboard e verificar que todas as tabelas foram criadas com `SELECT COUNT(*) FROM holdings;` retornando 0.

### **Passo 005** - Repositório Base de Dados
**Fase:** Core  
**Ação:** Implementar repositório para acesso aos dados da holding  
**Arquivo Alvo:** `backend/infrastructure/database/holding_repository.py`  
**Código/Spec:**
```python
from typing import List, Optional
from uuid import UUID

from core.entities import Holding, Subsidiary, Agent
from infrastructure.database.connection import DatabaseConnection

class HoldingRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save(self, holding: Holding) -> Holding:
        query = """
        INSERT INTO holdings (id, name, vision, total_revenue, total_assets, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            vision = EXCLUDED.vision,
            total_revenue = EXCLUDED.total_revenue,
            total_assets = EXCLUDED.total_assets,
            updated_at = NOW()
        RETURNING *
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query,
                holding.id, holding.name, holding.vision,
                holding.total_revenue, holding.total_assets, holding.created_at
            )

        return self._row_to_entity(row)

    async def get_by_id(self, holding_id: UUID) -> Optional[Holding]:
        query = """
        SELECT h.*, array_agg(s.*) as subsidiaries
        FROM holdings h
        LEFT JOIN subsidiaries s ON h.id = s.holding_id
        WHERE h.id = $1
        GROUP BY h.id
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query, holding_id)

        if not row:
            return None

        return self._row_to_entity_with_subsidiaries(row)

    async def get_all(self) -> List[Holding]:
        query = "SELECT * FROM holdings ORDER BY created_at DESC"

        async with self.db.connection() as conn:
            rows = await conn.fetch(query)

        return [self._row_to_entity(row) for row in rows]

    def _row_to_entity(self, row) -> Holding:
        return Holding(
            id=row['id'],
            name=row['name'],
            vision=row['vision'],
            total_revenue=Decimal(str(row['total_revenue'])),
            total_assets=Decimal(str(row['total_assets'])),
            created_at=row['created_at']
        )

    def _row_to_entity_with_subsidiaries(self, row) -> Holding:
        holding = self._row_to_entity(row)
        # Parse subsidiaries from array_agg result
        # This would require additional parsing logic
        return holding

class SubsidiaryRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save(self, subsidiary: Subsidiary) -> Subsidiary:
        query = """
        INSERT INTO subsidiaries (id, holding_id, name, business_type, status,
                                revenue_target, current_revenue, autonomy_level, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            business_type = EXCLUDED.business_type,
            status = EXCLUDED.status,
            revenue_target = EXCLUDED.revenue_target,
            current_revenue = EXCLUDED.current_revenue,
            autonomy_level = EXCLUDED.autonomy_level,
            updated_at = NOW()
        RETURNING *
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query,
                subsidiary.id, subsidiary.holding_id, subsidiary.name,
                subsidiary.business_type.value, subsidiary.status.value,
                subsidiary.revenue_target, subsidiary.current_revenue,
                subsidiary.autonomy_level, subsidiary.created_at
            )

        return self._row_to_entity(row)

    async def get_by_holding_id(self, holding_id: UUID) -> List[Subsidiary]:
        query = """
        SELECT s.*, array_agg(a.*) as agents
        FROM subsidiaries s
        LEFT JOIN agents a ON s.id = a.subsidiary_id
        WHERE s.holding_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC
        """

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, holding_id)

        return [self._row_to_entity_with_agents(row) for row in rows]

    def _row_to_entity(self, row) -> Subsidiary:
        return Subsidiary(
            id=row['id'],
            holding_id=row['holding_id'],
            name=row['name'],
            business_type=BusinessType(row['business_type']),
            status=SubsidiaryStatus(row['status']),
            revenue_target=Decimal(str(row['revenue_target'])),
            current_revenue=Decimal(str(row['current_revenue'])),
            autonomy_level=float(row['autonomy_level']),
            created_at=row['created_at']
        )

    def _row_to_entity_with_agents(self, row) -> Subsidiary:
        subsidiary = self._row_to_entity(row)
        # Parse agents from array_agg result
        # This would require additional parsing logic
        return subsidiary
```

**Definition of Done:** Executar testes unitários `pytest tests/unit/test_holding_repository.py` e verificar que operações CRUD básicas funcionam.

---

## 5. 📄 **AGENTIC MEMORY FILE (.project-context.md)**

### **Regras de Negócio Imutáveis**
1. **Holding Autônoma:** A Corporação Senciente é uma holding que cria subsidiárias, não um produto SaaS
2. **Painel Admin Executivo:** Frontend é painel de controle para admin humano, não interface de usuário final
3. **Auto-Sustentação:** Revenue das subsidiárias paga todas as operações da holding
4. **Criação Automática:** Agentes identificam e criam subsidiárias automaticamente
5. **Autonomia Progressiva:** Subsidiárias começam com baixa autonomia e evoluem

### **Decisões Arquiteturais tomadas**
- **DDD Bounded Contexts:** Holding Management, Subsidiary Creation, Agent Orchestration
- **Stack Tecnológico:** Python 3.12+ (FastAPI), React 19+ (Admin), Supabase (Data), Vector DB (Memory)
- **Arquitetura:** Modular Monolith com Microservices para subsidiárias
- **Protocolo L.L.B.:** LangMem (wisdom), Letta (state), ByteRover (action)
- **MCP Integration:** Ferramentas customizadas via Model Context Protocol
- **Auto-Evolution:** Sistema aprende e melhora continuamente

### **Lista de Tecnologias escolhidas**
- **Backend Core:** Python 3.12+ com FastAPI (async/await nativo)
- **Domain Layer:** Pydantic V2 para validação rigorosa
- **Data Layer:** Supabase (PostgreSQL + Vector embeddings)
- **Cache Layer:** Redis para performance
- **AI Layer:** OpenAI GPT-4 + Custom fine-tuning
- **Vector DB:** ChromaDB/Qdrant para contexto semântico
- **Frontend:** React 19+ Server Components
- **UI Framework:** Tailwind CSS + Componentes customizados
- **MCP Tools:** File operations, Web scraping, API calls
- **Deployment:** Docker + Kubernetes para escalabilidade
- **Monitoring:** Custom dashboards + Alerting system

---

**🎯 BLUEPRINT CONCLUÍDO - PRONTO PARA EXECUÇÃO!**

**🏭 CORPORAÇÃO SENCIENTE = HOLDING AUTÔNOMA CONFIRMADA**
**🎮 PAINEL ADMIN = CONTROLE EXECUTIVO**
**🤖 CRIAÇÃO AUTOMÁTICA = CORE DA AUTONOMIA**
**💰 AUTO-SUSTENTAÇÃO = META ALCANÇÁVEL**

**🚀 PRÓXIMO: EXECUTAR PASSO 001 - CONFIGURAÇÃO BASE!**