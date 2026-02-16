"""
Repository Layer para Holding Autônoma
Implementa o padrão Repository para acesso aos dados da holding
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

from backend.core.entities.holding import Holding, Subsidiary, Agent, Opportunity
from backend.core.value_objects import BusinessType, SubsidiaryStatus, AgentRole


class DatabaseConnection:
    """Base database connection interface"""
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._connection = None

    async def connect(self):
        """Connect to database"""
        # Implementation would depend on actual database driver
        pass

    async def disconnect(self):
        """Disconnect from database"""
        if self._connection:
            await self._connection.close()

    def connection(self):
        """Get database connection"""
        return self._connection


class HoldingRepository:
    """Repository for Holding entities"""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save(self, holding: Holding) -> Holding:
        """Save or update holding"""
        query = """
        INSERT INTO holdings (id, name, vision, total_revenue, total_assets, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            vision = EXCLUDED.vision,
            total_revenue = EXCLUDED.total_revenue,
            total_assets = EXCLUDED.total_assets,
            updated_at = EXCLUDED.updated_at
        RETURNING id, name, vision, total_revenue, total_assets, created_at, updated_at
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query,
                holding.id, holding.name, holding.vision,
                holding.total_revenue, holding.total_assets,
                holding.created_at, holding.updated_at
            )

        return self._row_to_entity(row)

    async def get_by_id(self, holding_id: UUID) -> Optional[Holding]:
        """Get holding by ID with subsidiaries"""
        query = """
        SELECT h.*,
               COALESCE(json_agg(
                   json_build_object(
                       'id', s.id,
                       'name', s.name,
                       'business_type', s.business_type,
                       'status', s.status,
                       'revenue_target_monthly', s.revenue_target_monthly,
                       'revenue_target_growth_rate', s.revenue_target_growth_rate,
                       'revenue_target_timeframe', s.revenue_target_timeframe,
                       'current_revenue', s.current_revenue,
                       'autonomy_level', s.autonomy_level,
                       'created_at', s.created_at
                   )
               ) FILTER (WHERE s.id IS NOT NULL), '[]'::json) as subsidiaries
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
        """Get all holdings"""
        query = "SELECT * FROM holdings ORDER BY created_at DESC"

        async with self.db.connection() as conn:
            rows = await conn.fetch(query)

        return [self._row_to_entity(row) for row in rows]

    async def update_financials(self, holding_id: UUID) -> None:
        """Update holding financials based on subsidiaries"""
        query = """
        UPDATE holdings
        SET total_revenue = (
            SELECT COALESCE(SUM(current_revenue), 0)
            FROM subsidiaries
            WHERE holding_id = $1
        ),
        total_assets = total_revenue * 1.5, -- Simplified calculation
        updated_at = NOW()
        WHERE id = $1
        """

        async with self.db.connection() as conn:
            await conn.execute(query, holding_id)

    def _row_to_entity(self, row) -> Holding:
        """Convert database row to Holding entity"""
        return Holding(
            id=row['id'],
            name=row['name'],
            vision=row['vision'],
            total_revenue=Decimal(str(row['total_revenue'] or 0)),
            total_assets=Decimal(str(row['total_assets'] or 0)),
            created_at=row['created_at'],
            subsidiaries=[]  # Loaded separately if needed
        )

    def _row_to_entity_with_subsidiaries(self, row) -> Holding:
        """Convert database row to Holding entity with subsidiaries"""
        holding = self._row_to_entity(row)

        # Parse subsidiaries from JSON
        subsidiaries_data = row.get('subsidiaries', [])
        for sub_data in subsidiaries_data:
            if sub_data:  # Skip null entries
                subsidiary = Subsidiary(
                    id=sub_data['id'],
                    holding_id=holding.id,
                    name=sub_data['name'],
                    business_type=BusinessType(sub_data['business_type']),
                    status=SubsidiaryStatus(sub_data['status']),
                    current_revenue=Decimal(str(sub_data.get('current_revenue', 0))),
                    autonomy_level=float(sub_data.get('autonomy_level', 0)),
                    created_at=sub_data['created_at']
                )
                holding.subsidiaries.append(subsidiary)

        return holding


class SubsidiaryRepository:
    """Repository for Subsidiary entities"""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save(self, subsidiary: Subsidiary) -> Subsidiary:
        """Save or update subsidiary"""
        revenue_target = subsidiary.revenue_target

        query = """
        INSERT INTO subsidiaries (
            id, holding_id, name, business_type, status,
            revenue_target_monthly, revenue_target_growth_rate, revenue_target_timeframe,
            current_revenue, autonomy_level, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            business_type = EXCLUDED.business_type,
            status = EXCLUDED.status,
            revenue_target_monthly = EXCLUDED.revenue_target_monthly,
            revenue_target_growth_rate = EXCLUDED.revenue_target_growth_rate,
            revenue_target_timeframe = EXCLUDED.revenue_target_timeframe,
            current_revenue = EXCLUDED.current_revenue,
            autonomy_level = EXCLUDED.autonomy_level,
            updated_at = EXCLUDED.updated_at
        RETURNING *
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query,
                subsidiary.id, subsidiary.holding_id, subsidiary.name,
                subsidiary.business_type.value, subsidiary.status.value,
                revenue_target.monthly_target if revenue_target else None,
                revenue_target.growth_rate if revenue_target else None,
                revenue_target.timeframe_months if revenue_target else None,
                subsidiary.current_revenue, subsidiary.autonomy_level,
                subsidiary.created_at, subsidiary.updated_at
            )

        return self._row_to_entity(row)

    async def get_by_id(self, subsidiary_id: UUID) -> Optional[Subsidiary]:
        """Get subsidiary by ID with agents"""
        query = """
        SELECT s.*,
               COALESCE(json_agg(
                   json_build_object(
                       'id', a.id,
                       'name', a.name,
                       'role', a.role,
                       'specialization', a.specialization,
                       'autonomy_level', a.autonomy_level,
                       'performance_score', a.performance_score,
                       'tasks_completed', a.tasks_completed,
                       'is_active', a.is_active,
                       'created_at', a.created_at
                   )
               ) FILTER (WHERE a.id IS NOT NULL), '[]'::json) as agents
        FROM subsidiaries s
        LEFT JOIN agents a ON s.id = a.subsidiary_id
        WHERE s.id = $1
        GROUP BY s.id
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query, subsidiary_id)

        if not row:
            return None

        return self._row_to_entity_with_agents(row)

    async def get_by_holding_id(self, holding_id: UUID) -> List[Subsidiary]:
        """Get all subsidiaries for a holding"""
        query = """
        SELECT s.*,
               COALESCE(json_agg(
                   json_build_object(
                       'id', a.id,
                       'name', a.name,
                       'role', a.role
                   )
               ) FILTER (WHERE a.id IS NOT NULL), '[]'::json) as agents
        FROM subsidiaries s
        LEFT JOIN agents a ON s.id = a.subsidiary_id
        WHERE s.holding_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC
        """

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, holding_id)

        return [self._row_to_entity_with_agents(row) for row in rows]

    async def get_by_status(self, status: SubsidiaryStatus) -> List[Subsidiary]:
        """Get subsidiaries by status"""
        query = "SELECT * FROM subsidiaries WHERE status = $1 ORDER BY created_at DESC"

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, status.value)

        return [self._row_to_entity(row) for row in rows]

    async def update_autonomy_level(self, subsidiary_id: UUID) -> None:
        """Update subsidiary autonomy level based on agents"""
        query = """
        UPDATE subsidiaries
        SET autonomy_level = calculate_subsidiary_autonomy($1),
            updated_at = NOW()
        WHERE id = $1
        """

        async with self.db.connection() as conn:
            await conn.execute(query, subsidiary_id)

    def _row_to_entity(self, row) -> Subsidiary:
        """Convert database row to Subsidiary entity"""
        from backend.core.value_objects import RevenueTarget

        revenue_target = None
        if row.get('revenue_target_monthly'):
            revenue_target = RevenueTarget(
                monthly_target=Decimal(str(row['revenue_target_monthly'])),
                growth_rate=float(row.get('revenue_target_growth_rate', 0.1)),
                timeframe_months=row.get('revenue_target_timeframe', 12)
            )

        return Subsidiary(
            id=row['id'],
            holding_id=row['holding_id'],
            name=row['name'],
            business_type=BusinessType(row['business_type']),
            status=SubsidiaryStatus(row['status']),
            revenue_target=revenue_target,
            current_revenue=Decimal(str(row.get('current_revenue', 0))),
            autonomy_level=float(row.get('autonomy_level', 0)),
            created_at=row['created_at']
        )

    def _row_to_entity_with_agents(self, row) -> Subsidiary:
        """Convert database row to Subsidiary entity with agents"""
        subsidiary = self._row_to_entity(row)

        # Parse agents from JSON
        agents_data = row.get('agents', [])
        for agent_data in agents_data:
            if agent_data and agent_data.get('id'):  # Skip null entries
                agent = Agent(
                    id=agent_data['id'],
                    subsidiary_id=subsidiary.id,
                    name=agent_data['name'],
                    role=AgentRole(agent_data['role']),
                    specialization=agent_data.get('specialization', ''),
                    autonomy_level=float(agent_data.get('autonomy_level', 0)),
                    performance_score=float(agent_data.get('performance_score', 0)),
                    tasks_completed=agent_data.get('tasks_completed', 0),
                    is_active=agent_data.get('is_active', True),
                    created_at=agent_data['created_at']
                )
                subsidiary.agents.append(agent)

        return subsidiary


class AgentRepository:
    """Repository for Agent entities"""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save(self, agent: Agent) -> Agent:
        """Save or update agent"""
        query = """
        INSERT INTO agents (
            id, subsidiary_id, name, role, specialization,
            autonomy_level, performance_score, tasks_completed,
            is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
            subsidiary_id = EXCLUDED.subsidiary_id,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            specialization = EXCLUDED.specialization,
            autonomy_level = EXCLUDED.autonomy_level,
            performance_score = EXCLUDED.performance_score,
            tasks_completed = EXCLUDED.tasks_completed,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at
        RETURNING *
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query,
                agent.id, agent.subsidiary_id, agent.name, agent.role.value,
                agent.specialization, agent.autonomy_level, agent.performance_score,
                agent.tasks_completed, agent.is_active, agent.created_at, agent.updated_at
            )

        return self._row_to_entity(row)

    async def get_by_id(self, agent_id: UUID) -> Optional[Agent]:
        """Get agent by ID"""
        query = "SELECT * FROM agents WHERE id = $1"

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query, agent_id)

        if not row:
            return None

        return self._row_to_entity(row)

    async def get_by_subsidiary_id(self, subsidiary_id: UUID) -> List[Agent]:
        """Get all agents for a subsidiary"""
        query = """
        SELECT * FROM agents
        WHERE subsidiary_id = $1 AND is_active = true
        ORDER BY autonomy_level DESC, performance_score DESC
        """

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, subsidiary_id)

        return [self._row_to_entity(row) for row in rows]

    async def get_high_performers(self, limit: int = 10) -> List[Agent]:
        """Get top performing agents"""
        query = """
        SELECT * FROM agents
        WHERE is_active = true
        ORDER BY performance_score DESC, autonomy_level DESC
        LIMIT $1
        """

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, limit)

        return [self._row_to_entity(row) for row in rows]

    async def update_performance(self, agent_id: UUID, task_result: Dict[str, Any]) -> None:
        """Update agent performance based on task result"""
        success = task_result.get('success', False)
        performance_change = 1.0 if success else -0.5

        query = """
        UPDATE agents
        SET performance_score = GREATEST(0, LEAST(100, performance_score + $2)),
            tasks_completed = tasks_completed + 1,
            updated_at = NOW()
        WHERE id = $1
        """

        async with self.db.connection() as conn:
            await conn.execute(query, agent_id, performance_change)

    def _row_to_entity(self, row) -> Agent:
        """Convert database row to Agent entity"""
        return Agent(
            id=row['id'],
            subsidiary_id=row.get('subsidiary_id'),
            name=row['name'],
            role=AgentRole(row['role']),
            specialization=row.get('specialization', ''),
            autonomy_level=float(row.get('autonomy_level', 0)),
            performance_score=float(row.get('performance_score', 0)),
            tasks_completed=row.get('tasks_completed', 0),
            is_active=row.get('is_active', True),
            created_at=row['created_at']
        )


class OpportunityRepository:
    """Repository for Opportunity entities"""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save(self, opportunity: Opportunity) -> Opportunity:
        """Save or update opportunity"""
        query = """
        INSERT INTO subsidiary_opportunities (
            id, market_segment, opportunity_description, estimated_revenue,
            risk_level, confidence_score, market_size, market_growth_rate,
            competition_level, entry_barriers, customer_pain_points,
            estimated_market_share, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
            market_segment = EXCLUDED.market_segment,
            opportunity_description = EXCLUDED.opportunity_description,
            estimated_revenue = EXCLUDED.estimated_revenue,
            risk_level = EXCLUDED.risk_level,
            confidence_score = EXCLUDED.confidence_score,
            market_size = EXCLUDED.market_size,
            market_growth_rate = EXCLUDED.market_growth_rate,
            competition_level = EXCLUDED.competition_level,
            entry_barriers = EXCLUDED.entry_barriers,
            customer_pain_points = EXCLUDED.customer_pain_points,
            estimated_market_share = EXCLUDED.estimated_market_share,
            updated_at = EXCLUDED.updated_at
        RETURNING *
        """

        async with self.db.connection() as conn:
            row = await conn.fetchrow(query,
                opportunity.id, opportunity.market_segment,
                opportunity.opportunity_description, opportunity.estimated_revenue,
                opportunity.risk_level, opportunity.confidence_score,
                opportunity.market_analysis.market_size if opportunity.market_analysis else None,
                opportunity.market_analysis.market_growth_rate if opportunity.market_analysis else None,
                opportunity.market_analysis.competition_level if opportunity.market_analysis else None,
                opportunity.market_analysis.entry_barriers if opportunity.market_analysis else None,
                opportunity.market_analysis.customer_pain_points if opportunity.market_analysis else None,
                opportunity.market_analysis.estimated_market_share if opportunity.market_analysis else None,
                opportunity.created_at, opportunity.updated_at
            )

        return self._row_to_entity(row)

    async def get_viable_opportunities(self, threshold: float = 60.0) -> List[Opportunity]:
        """Get opportunities that meet viability threshold"""
        query = """
        SELECT *, get_opportunity_viability_score(id) as viability_score
        FROM subsidiary_opportunities
        WHERE get_opportunity_viability_score(id) >= $1
        ORDER BY get_opportunity_viability_score(id) DESC
        """

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, threshold)

        return [self._row_to_entity(row) for row in rows]

    async def get_by_market_segment(self, segment: str) -> List[Opportunity]:
        """Get opportunities by market segment"""
        query = """
        SELECT * FROM subsidiary_opportunities
        WHERE market_segment ILIKE $1
        ORDER BY confidence_score DESC
        """

        async with self.db.connection() as conn:
            rows = await conn.fetch(query, f'%{segment}%')

        return [self._row_to_entity(row) for row in rows]

    def _row_to_entity(self, row) -> Opportunity:
        """Convert database row to Opportunity entity"""
        from backend.core.value_objects import MarketAnalysis, RiskAssessment

        market_analysis = None
        if row.get('market_size'):
            market_analysis = MarketAnalysis(
                market_size=Decimal(str(row['market_size'])),
                market_growth_rate=float(row.get('market_growth_rate', 0)),
                competition_level=row.get('competition_level', 'medium'),
                entry_barriers=row.get('entry_barriers', 'medium'),
                customer_pain_points=row.get('customer_pain_points', []),
                estimated_market_share=float(row.get('estimated_market_share', 0))
            )

        # Risk assessment would need additional data from database
        risk_assessment = None

        return Opportunity(
            id=row['id'],
            market_segment=row['market_segment'],
            opportunity_description=row['opportunity_description'],
            estimated_revenue=Decimal(str(row['estimated_revenue'])),
            risk_level=row['risk_level'],
            confidence_score=float(row['confidence_score']),
            market_analysis=market_analysis,
            risk_assessment=risk_assessment,
            created_at=row['created_at']
        )