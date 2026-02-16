"""
Repository Pattern Implementation
Implementação do padrão Repository para acesso aos dados
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Generic, TypeVar, Dict, Any
from uuid import UUID

from ...core.entities.holding import Holding, Subsidiary, Agent, Opportunity

T = TypeVar('T')


class BaseRepository(ABC, Generic[T]):
    """Classe base abstrata para repositórios"""

    @abstractmethod
    async def add(self, entity: T) -> T:
        """Adiciona nova entidade"""
        pass

    @abstractmethod
    async def get_by_id(self, entity_id: UUID) -> Optional[T]:
        """Busca entidade por ID"""
        pass

    @abstractmethod
    async def update(self, entity: T) -> T:
        """Atualiza entidade existente"""
        pass

    @abstractmethod
    async def delete(self, entity_id: UUID) -> bool:
        """Remove entidade por ID"""
        pass

    @abstractmethod
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[T]:
        """Busca todas as entidades com paginação"""
        pass

    @abstractmethod
    async def count(self) -> int:
        """Conta total de entidades"""
        pass


class HoldingRepository(BaseRepository[Holding]):
    """Repositório para entidade Holding"""

    def __init__(self, db_connection):
        self.db = db_connection

    async def add(self, holding: Holding) -> Holding:
        """Adiciona nova holding"""
        data = {
            'id': str(holding.id),
            'name': holding.name,
            'mission': holding.mission,
            'vision': holding.vision,
            'status': holding.status,
            'founded_at': holding.founded_at.isoformat(),
            'updated_at': holding.updated_at.isoformat(),
            'total_revenue': float(holding.total_revenue),
            'total_profit': float(holding.total_profit),
            'total_investment': float(holding.total_investment),
            'cash_position': float(holding.cash_position),
            'total_active_users': holding.total_active_users,
            'average_customer_satisfaction': holding.average_customer_satisfaction,
            'innovation_index': holding.innovation_index
        }

        await self.db.execute_command('insert', 'holdings', data)
        return holding

    async def get_by_id(self, holding_id: UUID) -> Optional[Holding]:
        """Busca holding por ID"""
        results = await self.db.execute_query('holdings', id=str(holding_id))

        if not results:
            return None

        row = results[0]
        return Holding(
            id=UUID(row['id']),
            name=row['name'],
            mission=row['mission'],
            vision=row['vision'],
            status=row['status'],
            founded_at=row['founded_at'],  # Supabase já retorna datetime
            updated_at=row['updated_at'],
            total_revenue=row['total_revenue'],
            total_profit=row['total_profit'],
            total_investment=row['total_investment'],
            cash_position=row['cash_position'],
            total_active_users=row['total_active_users'],
            average_customer_satisfaction=row['average_customer_satisfaction'],
            innovation_index=row['innovation_index']
        )

    async def update(self, holding: Holding) -> Holding:
        """Atualiza holding existente"""
        data = {
            'id': str(holding.id),
            'name': holding.name,
            'mission': holding.mission,
            'vision': holding.vision,
            'status': holding.status,
            'updated_at': holding.updated_at.isoformat(),
            'total_revenue': float(holding.total_revenue),
            'total_profit': float(holding.total_profit),
            'total_investment': float(holding.total_investment),
            'cash_position': float(holding.cash_position),
            'total_active_users': holding.total_active_users,
            'average_customer_satisfaction': holding.average_customer_satisfaction,
            'innovation_index': holding.innovation_index
        }

        await self.db.execute_command('update', 'holdings', data)
        return holding

    async def delete(self, holding_id: UUID) -> bool:
        """Remove holding por ID"""
        data = {'id': str(holding_id)}
        return await self.db.execute_command('delete', 'holdings', data)

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Holding]:
        """Busca todas as holdings com paginação"""
        # Supabase não suporta offset/limit da mesma forma
        results = await self.db.execute_query('holdings')

        holdings = []
        for row in results[offset:offset+limit]:
            holdings.append(Holding(
                id=UUID(row['id']),
                name=row['name'],
                mission=row['mission'],
                vision=row['vision'],
                status=row['status'],
                founded_at=row['founded_at'],
                updated_at=row['updated_at'],
                total_revenue=row['total_revenue'],
                total_profit=row['total_profit'],
                total_investment=row['total_investment'],
                cash_position=row['cash_position'],
                total_active_users=row['total_active_users'],
                average_customer_satisfaction=row['average_customer_satisfaction'],
                innovation_index=row['innovation_index']
            ))

        return holdings

    async def count(self) -> int:
        """Conta total de holdings"""
        results = await self.db.execute_query('holdings')
        return len(results)


class SubsidiaryRepository(BaseRepository[Subsidiary]):
    """Repositório para entidade Subsidiary"""

    def __init__(self, db_connection):
        self.db = db_connection

    async def add(self, subsidiary: Subsidiary) -> Subsidiary:
        """Adiciona nova subsidiária"""
        query = """
        INSERT INTO subsidiaries (
            id, name, business_type, revenue_model, status, mission, vision,
            total_revenue, total_profit, monthly_recurring_revenue, active_users,
            customer_satisfaction_score, market_share_percentage, founded_at,
            launched_at, updated_at, parent_holding_id, risk_level, strategic_importance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        """

        await self.db.execute_command(query,
            subsidiary.id, subsidiary.name, subsidiary.business_type.value,
            subsidiary.revenue_model.value, subsidiary.status, subsidiary.mission,
            subsidiary.vision, subsidiary.total_revenue, subsidiary.total_profit,
            subsidiary.monthly_recurring_revenue, subsidiary.active_users,
            subsidiary.customer_satisfaction_score, subsidiary.market_share_percentage,
            subsidiary.founded_at, subsidiary.launched_at, subsidiary.updated_at,
            subsidiary.parent_holding_id, subsidiary.risk_level, subsidiary.strategic_importance
        )

        # Adicionar tags
        if subsidiary.tags:
            await self._add_tags(subsidiary.id, subsidiary.tags)

        return subsidiary

    async def get_by_id(self, subsidiary_id: UUID) -> Optional[Subsidiary]:
        """Busca subsidiária por ID"""
        query = "SELECT * FROM subsidiaries WHERE id = $1"
        result = await self.db.execute_query(query, subsidiary_id)

        if not result:
            return None

        row = result[0]
        subsidiary = Subsidiary(
            id=row['id'],
            name=row['name'],
            business_type=row['business_type'],
            revenue_model=row['revenue_model'],
            status=row['status'],
            mission=row['mission'],
            vision=row['vision'],
            total_revenue=row['total_revenue'],
            total_profit=row['total_profit'],
            monthly_recurring_revenue=row['monthly_recurring_revenue'],
            active_users=row['active_users'],
            customer_satisfaction_score=row['customer_satisfaction_score'],
            market_share_percentage=row['market_share_percentage'],
            founded_at=row['founded_at'],
            launched_at=row['launched_at'],
            updated_at=row['updated_at'],
            parent_holding_id=row['parent_holding_id'],
            risk_level=row['risk_level'],
            strategic_importance=row['strategic_importance']
        )

        # Carregar tags
        subsidiary.tags = await self._get_tags(subsidiary_id)

        return subsidiary

    async def update(self, subsidiary: Subsidiary) -> Subsidiary:
        """Atualiza subsidiária existente"""
        query = """
        UPDATE subsidiaries SET
            name = $2, business_type = $3, revenue_model = $4, status = $5,
            mission = $6, vision = $7, total_revenue = $8, total_profit = $9,
            monthly_recurring_revenue = $10, active_users = $11,
            customer_satisfaction_score = $12, market_share_percentage = $13,
            launched_at = $14, updated_at = $15, risk_level = $16, strategic_importance = $17
        WHERE id = $1
        """

        await self.db.execute_command(query,
            subsidiary.id, subsidiary.name, subsidiary.business_type.value,
            subsidiary.revenue_model.value, subsidiary.status, subsidiary.mission,
            subsidiary.vision, subsidiary.total_revenue, subsidiary.total_profit,
            subsidiary.monthly_recurring_revenue, subsidiary.active_users,
            subsidiary.customer_satisfaction_score, subsidiary.market_share_percentage,
            subsidiary.launched_at, subsidiary.updated_at, subsidiary.risk_level,
            subsidiary.strategic_importance
        )

        # Atualizar tags
        await self._update_tags(subsidiary.id, subsidiary.tags)

        return subsidiary

    async def delete(self, subsidiary_id: UUID) -> bool:
        """Remove subsidiária por ID"""
        # Remover tags primeiro
        await self._delete_tags(subsidiary_id)

        query = "DELETE FROM subsidiaries WHERE id = $1"
        result = await self.db.execute_command(query, subsidiary_id)
        return "DELETE 1" in result

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Subsidiary]:
        """Busca todas as subsidiárias com paginação"""
        query = "SELECT * FROM subsidiaries ORDER BY founded_at DESC LIMIT $1 OFFSET $2"
        results = await self.db.execute_query(query, limit, offset)

        subsidiaries = []
        for row in results:
            subsidiary = Subsidiary(
                id=row['id'],
                name=row['name'],
                business_type=row['business_type'],
                revenue_model=row['revenue_model'],
                status=row['status'],
                mission=row['mission'],
                vision=row['vision'],
                total_revenue=row['total_revenue'],
                total_profit=row['total_profit'],
                monthly_recurring_revenue=row['monthly_recurring_revenue'],
                active_users=row['active_users'],
                customer_satisfaction_score=row['customer_satisfaction_score'],
                market_share_percentage=row['market_share_percentage'],
                founded_at=row['founded_at'],
                launched_at=row['launched_at'],
                updated_at=row['updated_at'],
                parent_holding_id=row['parent_holding_id'],
                risk_level=row['risk_level'],
                strategic_importance=row['strategic_importance']
            )

            # Carregar tags
            subsidiary.tags = await self._get_tags(subsidiary.id)
            subsidiaries.append(subsidiary)

        return subsidiaries

    async def get_by_holding_id(self, holding_id: UUID) -> List[Subsidiary]:
        """Busca subsidiárias por ID da holding"""
        query = "SELECT * FROM subsidiaries WHERE parent_holding_id = $1 ORDER BY founded_at DESC"
        results = await self.db.execute_query(query, holding_id)

        subsidiaries = []
        for row in results:
            subsidiary = Subsidiary(
                id=row['id'],
                name=row['name'],
                business_type=row['business_type'],
                revenue_model=row['revenue_model'],
                status=row['status'],
                mission=row['mission'],
                vision=row['vision'],
                total_revenue=row['total_revenue'],
                total_profit=row['total_profit'],
                monthly_recurring_revenue=row['monthly_recurring_revenue'],
                active_users=row['active_users'],
                customer_satisfaction_score=row['customer_satisfaction_score'],
                market_share_percentage=row['market_share_percentage'],
                founded_at=row['founded_at'],
                launched_at=row['launched_at'],
                updated_at=row['updated_at'],
                parent_holding_id=row['parent_holding_id'],
                risk_level=row['risk_level'],
                strategic_importance=row['strategic_importance']
            )

            subsidiary.tags = await self._get_tags(subsidiary.id)
            subsidiaries.append(subsidiary)

        return subsidiaries

    async def count(self) -> int:
        """Conta total de subsidiárias"""
        query = "SELECT COUNT(*) as count FROM subsidiaries"
        result = await self.db.execute_query(query)
        return result[0]['count'] if result else 0

    async def _add_tags(self, subsidiary_id: UUID, tags: List[str]):
        """Adiciona tags para subsidiária"""
        for tag in tags:
            query = "INSERT INTO subsidiary_tags (subsidiary_id, tag) VALUES ($1, $2)"
            await self.db.execute_command(query, subsidiary_id, tag)

    async def _get_tags(self, subsidiary_id: UUID) -> List[str]:
        """Busca tags da subsidiária"""
        query = "SELECT tag FROM subsidiary_tags WHERE subsidiary_id = $1"
        results = await self.db.execute_query(query, subsidiary_id)
        return [row['tag'] for row in results]

    async def _update_tags(self, subsidiary_id: UUID, tags: List[str]):
        """Atualiza tags da subsidiária"""
        await self._delete_tags(subsidiary_id)
        await self._add_tags(subsidiary_id, tags)

    async def _delete_tags(self, subsidiary_id: UUID):
        """Remove todas as tags da subsidiária"""
        query = "DELETE FROM subsidiary_tags WHERE subsidiary_id = $1"
        await self.db.execute_command(query, subsidiary_id)


class AgentRepository(BaseRepository[Agent]):
    """Repositório para entidade Agent"""

    def __init__(self, db_connection):
        self.db = db_connection

    async def add(self, agent: Agent) -> Agent:
        """Adiciona novo agente"""
        query = """
        INSERT INTO agents (
            id, name, role, status, specialization_domain, autonomy_level,
            performance_score, tasks_completed, success_rate, average_response_time,
            memory_count, learning_sessions, adaptation_score, created_at,
            last_active, updated_at, assigned_subsidiary_id, supervisor_agent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        """

        await self.db.execute_command(query,
            agent.id, agent.name, agent.role.value, agent.status,
            agent.specialization_domain, agent.autonomy_level, agent.performance_score,
            agent.tasks_completed, agent.success_rate, agent.average_response_time,
            agent.memory_count, agent.learning_sessions, agent.adaptation_score,
            agent.created_at, agent.last_active, agent.updated_at,
            agent.assigned_subsidiary_id, agent.supervisor_agent_id
        )

        # Adicionar capacidades
        if agent.capabilities:
            await self._add_capabilities(agent.id, agent.capabilities)

        return agent

    async def get_by_id(self, agent_id: UUID) -> Optional[Agent]:
        """Busca agente por ID"""
        query = "SELECT * FROM agents WHERE id = $1"
        result = await self.db.execute_query(query, agent_id)

        if not result:
            return None

        row = result[0]
        agent = Agent(
            id=row['id'],
            name=row['name'],
            role=row['role'],
            status=row['status'],
            specialization_domain=row['specialization_domain'],
            autonomy_level=row['autonomy_level'],
            performance_score=row['performance_score'],
            tasks_completed=row['tasks_completed'],
            success_rate=row['success_rate'],
            average_response_time=row['average_response_time'],
            memory_count=row['memory_count'],
            learning_sessions=row['learning_sessions'],
            adaptation_score=row['adaptation_score'],
            created_at=row['created_at'],
            last_active=row['last_active'],
            updated_at=row['updated_at'],
            assigned_subsidiary_id=row['assigned_subsidiary_id'],
            supervisor_agent_id=row['supervisor_agent_id']
        )

        # Carregar capacidades
        agent.capabilities = await self._get_capabilities(agent_id)

        return agent

    async def update(self, agent: Agent) -> Agent:
        """Atualiza agente existente"""
        query = """
        UPDATE agents SET
            name = $2, role = $3, status = $4, specialization_domain = $5,
            autonomy_level = $6, performance_score = $7, tasks_completed = $8,
            success_rate = $9, average_response_time = $10, memory_count = $11,
            learning_sessions = $12, adaptation_score = $13, last_active = $14,
            updated_at = $15, assigned_subsidiary_id = $16, supervisor_agent_id = $17
        WHERE id = $1
        """

        await self.db.execute_command(query,
            agent.id, agent.name, agent.role.value, agent.status,
            agent.specialization_domain, agent.autonomy_level, agent.performance_score,
            agent.tasks_completed, agent.success_rate, agent.average_response_time,
            agent.memory_count, agent.learning_sessions, agent.adaptation_score,
            agent.last_active, agent.updated_at, agent.assigned_subsidiary_id,
            agent.supervisor_agent_id
        )

        # Atualizar capacidades
        await self._update_capabilities(agent.id, agent.capabilities)

        return agent

    async def delete(self, agent_id: UUID) -> bool:
        """Remove agente por ID"""
        # Remover capacidades primeiro
        await self._delete_capabilities(agent_id)

        query = "DELETE FROM agents WHERE id = $1"
        result = await self.db.execute_command(query, agent_id)
        return "DELETE 1" in result

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Agent]:
        """Busca todos os agentes com paginação"""
        query = "SELECT * FROM agents ORDER BY created_at DESC LIMIT $1 OFFSET $2"
        results = await self.db.execute_query(query, limit, offset)

        agents = []
        for row in results:
            agent = Agent(
                id=row['id'],
                name=row['name'],
                role=row['role'],
                status=row['status'],
                specialization_domain=row['specialization_domain'],
                autonomy_level=row['autonomy_level'],
                performance_score=row['performance_score'],
                tasks_completed=row['tasks_completed'],
                success_rate=row['success_rate'],
                average_response_time=row['average_response_time'],
                memory_count=row['memory_count'],
                learning_sessions=row['learning_sessions'],
                adaptation_score=row['adaptation_score'],
                created_at=row['created_at'],
                last_active=row['last_active'],
                updated_at=row['updated_at'],
                assigned_subsidiary_id=row['assigned_subsidiary_id'],
                supervisor_agent_id=row['supervisor_agent_id']
            )

            agent.capabilities = await self._get_capabilities(agent.id)
            agents.append(agent)

        return agents

    async def get_by_subsidiary_id(self, subsidiary_id: UUID) -> List[Agent]:
        """Busca agentes por ID da subsidiária"""
        query = "SELECT * FROM agents WHERE assigned_subsidiary_id = $1 ORDER BY created_at DESC"
        results = await self.db.execute_query(query, subsidiary_id)

        agents = []
        for row in results:
            agent = Agent(
                id=row['id'],
                name=row['name'],
                role=row['role'],
                status=row['status'],
                specialization_domain=row['specialization_domain'],
                autonomy_level=row['autonomy_level'],
                performance_score=row['performance_score'],
                tasks_completed=row['tasks_completed'],
                success_rate=row['success_rate'],
                average_response_time=row['average_response_time'],
                memory_count=row['memory_count'],
                learning_sessions=row['learning_sessions'],
                adaptation_score=row['adaptation_score'],
                created_at=row['created_at'],
                last_active=row['last_active'],
                updated_at=row['updated_at'],
                assigned_subsidiary_id=row['assigned_subsidiary_id'],
                supervisor_agent_id=row['supervisor_agent_id']
            )

            agent.capabilities = await self._get_capabilities(agent.id)
            agents.append(agent)

        return agents

    async def count(self) -> int:
        """Conta total de agentes"""
        query = "SELECT COUNT(*) as count FROM agents"
        result = await self.db.execute_query(query)
        return result[0]['count'] if result else 0

    async def _add_capabilities(self, agent_id: UUID, capabilities: List[str]):
        """Adiciona capacidades para agente"""
        for capability in capabilities:
            query = "INSERT INTO agent_capabilities (agent_id, capability) VALUES ($1, $2)"
            await self.db.execute_command(query, agent_id, capability)

    async def _get_capabilities(self, agent_id: UUID) -> List[str]:
        """Busca capacidades do agente"""
        query = "SELECT capability FROM agent_capabilities WHERE agent_id = $1"
        results = await self.db.execute_query(query, agent_id)
        return [row['capability'] for row in results]

    async def _update_capabilities(self, agent_id: UUID, capabilities: List[str]):
        """Atualiza capacidades do agente"""
        await self._delete_capabilities(agent_id)
        await self._add_capabilities(agent_id, capabilities)

    async def _delete_capabilities(self, agent_id: UUID):
        """Remove todas as capacidades do agente"""
        query = "DELETE FROM agent_capabilities WHERE agent_id = $1"
        await self.db.execute_command(query, agent_id)


class OpportunityRepository(BaseRepository[Opportunity]):
    """Repositório para entidade Opportunity"""

    def __init__(self, db_connection):
        self.db = db_connection

    async def add(self, opportunity: Opportunity) -> Opportunity:
        """Adiciona nova oportunidade"""
        query = """
        INSERT INTO opportunities (
            id, title, description, source, status, tam, sam, som, growth_rate,
            competition_level, market_maturity, technical_feasibility,
            business_feasibility, financial_feasibility, recommended_business_type,
            recommended_revenue_model, estimated_investment, estimated_first_year_revenue,
            estimated_time_to_market, identified_at, analyzed_at, approved_at,
            identified_by_agent_id, priority_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        """

        await self.db.execute_command(query,
            opportunity.id, opportunity.title, opportunity.description, opportunity.source,
            opportunity.status, opportunity.tam, opportunity.sam, opportunity.som,
            opportunity.growth_rate, opportunity.competition_level, opportunity.market_maturity,
            opportunity.technical_feasibility, opportunity.business_feasibility,
            opportunity.financial_feasibility, opportunity.recommended_business_type.value,
            opportunity.recommended_revenue_model.value, opportunity.estimated_investment,
            opportunity.estimated_first_year_revenue, opportunity.estimated_time_to_market,
            opportunity.identified_at, opportunity.analyzed_at, opportunity.approved_at,
            opportunity.identified_by_agent_id, opportunity.priority_score
        )

        return opportunity

    async def get_by_id(self, opportunity_id: UUID) -> Optional[Opportunity]:
        """Busca oportunidade por ID"""
        query = "SELECT * FROM opportunities WHERE id = $1"
        result = await self.db.execute_query(query, opportunity_id)

        if not result:
            return None

        row = result[0]
        return Opportunity(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            source=row['source'],
            status=row['status'],
            tam=row['tam'],
            sam=row['sam'],
            som=row['som'],
            growth_rate=row['growth_rate'],
            competition_level=row['competition_level'],
            market_maturity=row['market_maturity'],
            technical_feasibility=row['technical_feasibility'],
            business_feasibility=row['business_feasibility'],
            financial_feasibility=row['financial_feasibility'],
            recommended_business_type=row['recommended_business_type'],
            recommended_revenue_model=row['recommended_revenue_model'],
            estimated_investment=row['estimated_investment'],
            estimated_first_year_revenue=row['estimated_first_year_revenue'],
            estimated_time_to_market=row['estimated_time_to_market'],
            identified_at=row['identified_at'],
            analyzed_at=row['analyzed_at'],
            approved_at=row['approved_at'],
            identified_by_agent_id=row['identified_by_agent_id'],
            priority_score=row['priority_score']
        )

    async def update(self, opportunity: Opportunity) -> Opportunity:
        """Atualiza oportunidade existente"""
        query = """
        UPDATE opportunities SET
            title = $2, description = $3, source = $4, status = $5, tam = $6,
            sam = $7, som = $8, growth_rate = $9, competition_level = $10,
            market_maturity = $11, technical_feasibility = $12, business_feasibility = $13,
            financial_feasibility = $14, recommended_business_type = $15,
            recommended_revenue_model = $16, estimated_investment = $17,
            estimated_first_year_revenue = $18, estimated_time_to_market = $19,
            analyzed_at = $20, approved_at = $21, priority_score = $22
        WHERE id = $1
        """

        await self.db.execute_command(query,
            opportunity.id, opportunity.title, opportunity.description, opportunity.source,
            opportunity.status, opportunity.tam, opportunity.sam, opportunity.som,
            opportunity.growth_rate, opportunity.competition_level, opportunity.market_maturity,
            opportunity.technical_feasibility, opportunity.business_feasibility,
            opportunity.financial_feasibility, opportunity.recommended_business_type.value,
            opportunity.recommended_revenue_model.value, opportunity.estimated_investment,
            opportunity.estimated_first_year_revenue, opportunity.estimated_time_to_market,
            opportunity.analyzed_at, opportunity.approved_at, opportunity.priority_score
        )

        return opportunity

    async def delete(self, opportunity_id: UUID) -> bool:
        """Remove oportunidade por ID"""
        query = "DELETE FROM opportunities WHERE id = $1"
        result = await self.db.execute_command(query, opportunity_id)
        return "DELETE 1" in result

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Opportunity]:
        """Busca todas as oportunidades com paginação"""
        query = "SELECT * FROM opportunities ORDER BY identified_at DESC LIMIT $1 OFFSET $2"
        results = await self.db.execute_query(query, limit, offset)

        opportunities = []
        for row in results:
            opportunities.append(Opportunity(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                source=row['source'],
                status=row['status'],
                tam=row['tam'],
                sam=row['sam'],
                som=row['som'],
                growth_rate=row['growth_rate'],
                competition_level=row['competition_level'],
                market_maturity=row['market_maturity'],
                technical_feasibility=row['technical_feasibility'],
                business_feasibility=row['business_feasibility'],
                financial_feasibility=row['financial_feasibility'],
                recommended_business_type=row['recommended_business_type'],
                recommended_revenue_model=row['recommended_revenue_model'],
                estimated_investment=row['estimated_investment'],
                estimated_first_year_revenue=row['estimated_first_year_revenue'],
                estimated_time_to_market=row['estimated_time_to_market'],
                identified_at=row['identified_at'],
                analyzed_at=row['analyzed_at'],
                approved_at=row['approved_at'],
                identified_by_agent_id=row['identified_by_agent_id'],
                priority_score=row['priority_score']
            ))

        return opportunities

    async def get_by_status(self, status: str) -> List[Opportunity]:
        """Busca oportunidades por status"""
        query = "SELECT * FROM opportunities WHERE status = $1 ORDER BY priority_score DESC"
        results = await self.db.execute_query(query, status)

        opportunities = []
        for row in results:
            opportunities.append(Opportunity(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                source=row['source'],
                status=row['status'],
                tam=row['tam'],
                sam=row['sam'],
                som=row['som'],
                growth_rate=row['growth_rate'],
                competition_level=row['competition_level'],
                market_maturity=row['market_maturity'],
                technical_feasibility=row['technical_feasibility'],
                business_feasibility=row['business_feasibility'],
                financial_feasibility=row['financial_feasibility'],
                recommended_business_type=row['recommended_business_type'],
                recommended_revenue_model=row['recommended_revenue_model'],
                estimated_investment=row['estimated_investment'],
                estimated_first_year_revenue=row['estimated_first_year_revenue'],
                estimated_time_to_market=row['estimated_time_to_market'],
                identified_at=row['identified_at'],
                analyzed_at=row['analyzed_at'],
                approved_at=row['approved_at'],
                identified_by_agent_id=row['identified_by_agent_id'],
                priority_score=row['priority_score']
            ))

        return opportunities

    async def count(self) -> int:
        """Conta total de oportunidades"""
        query = "SELECT COUNT(*) as count FROM opportunities"
        result = await self.db.execute_query(query)
        return result[0]['count'] if result else 0