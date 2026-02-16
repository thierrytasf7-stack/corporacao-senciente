"""
Base Agent Classes - Foundation for Autonomous Agents
Implementa a arquitetura base para agentes da corporação
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Union
from uuid import UUID, uuid4
from datetime import datetime
import asyncio
import json

from backend.core.entities.holding import Agent
from backend.core.value_objects import AgentRole, MemoryType, LLBProtocol


class AgentTask:
    """Represents a task that an agent can execute"""

    def __init__(
        self,
        task_type: str,
        description: str,
        parameters: Dict[str, Any] = None,
        priority: int = 1,
        deadline: Optional[datetime] = None
    ):
        self.id = uuid4()
        self.task_type = task_type
        self.description = description
        self.parameters = parameters or {}
        self.priority = priority  # 1-10, higher = more urgent
        self.deadline = deadline
        self.created_at = datetime.utcnow()
        self.status = "pending"  # pending, running, completed, failed
        self.result = None
        self.error_message = None
        self.execution_time_seconds = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            'id': str(self.id),
            'task_type': self.task_type,
            'description': self.description,
            'parameters': self.parameters,
            'priority': self.priority,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'result': self.result,
            'error_message': self.error_message,
            'execution_time_seconds': self.execution_time_seconds
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AgentTask':
        """Create task from dictionary"""
        task = cls(
            task_type=data['task_type'],
            description=data['description'],
            parameters=data.get('parameters', {}),
            priority=data.get('priority', 1),
            deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None
        )
        task.id = UUID(data['id'])
        task.created_at = datetime.fromisoformat(data['created_at'])
        task.status = data.get('status', 'pending')
        task.result = data.get('result')
        task.error_message = data.get('error_message')
        task.execution_time_seconds = data.get('execution_time_seconds')
        return task


class AgentCapability(ABC):
    """Abstract base class for agent capabilities"""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the capability"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what this capability does"""
        pass

    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the capability with given parameters"""
        pass

    def validate_parameters(self, parameters: Dict[str, Any]) -> bool:
        """Validate input parameters"""
        return True

    def get_required_parameters(self) -> List[str]:
        """Return list of required parameter names"""
        return []


class BaseAgent(ABC):
    """
    Base class for all autonomous agents in the corporation
    Implements core agent functionality and L.L.B. protocol
    """

    def __init__(
        self,
        agent_id: Optional[UUID] = None,
        name: str = "",
        role: AgentRole = AgentRole.MANAGEMENT,
        specialization: str = "",
        autonomy_level: float = 0.0
    ):
        self.id = agent_id or uuid4()
        self.name = name
        self.role = role
        self.specialization = specialization
        self.autonomy_level = autonomy_level
        self.performance_score = 0.0
        self.tasks_completed = 0
        self.is_active = True
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        # L.L.B. Protocol memory
        self.llb_protocol = LLBProtocol([], [], [])

        # Task queue
        self.task_queue: asyncio.Queue[AgentTask] = asyncio.Queue()

        # Capabilities registry
        self.capabilities: Dict[str, AgentCapability] = {}

        # Background task for processing
        self._processing_task: Optional[asyncio.Task] = None
        self._shutdown_event = asyncio.Event()

    def register_capability(self, capability: AgentCapability) -> None:
        """Register a new capability for this agent"""
        self.capabilities[capability.name] = capability

    def unregister_capability(self, capability_name: str) -> None:
        """Unregister a capability"""
        if capability_name in self.capabilities:
            del self.capabilities[capability_name]

    def has_capability(self, capability_name: str) -> bool:
        """Check if agent has a specific capability"""
        return capability_name in self.capabilities

    def get_capabilities_list(self) -> List[str]:
        """Get list of all capability names"""
        return list(self.capabilities.keys())

    async def assign_task(self, task: AgentTask) -> None:
        """Assign a task to the agent's queue"""
        await self.task_queue.put(task)

    async def start_processing(self) -> None:
        """Start the agent's task processing loop"""
        if self._processing_task and not self._processing_task.done():
            return

        self._processing_task = asyncio.create_task(self._process_tasks())
        self.is_active = True

    async def stop_processing(self) -> None:
        """Stop the agent's task processing"""
        self._shutdown_event.set()
        if self._processing_task:
            await self._processing_task
        self.is_active = False

    async def _process_tasks(self) -> None:
        """Main task processing loop"""
        while not self._shutdown_event.is_set():
            try:
                # Wait for task with timeout
                task = await asyncio.wait_for(
                    self.task_queue.get(),
                    timeout=1.0
                )

                # Process the task
                await self._execute_task(task)

            except asyncio.TimeoutError:
                # No task available, continue loop
                continue
            except Exception as e:
                # Log error and continue
                print(f"Agent {self.name}: Error processing task - {str(e)}")
                continue

    async def _execute_task(self, task: AgentTask) -> None:
        """Execute a single task"""
        start_time = datetime.utcnow()
        task.status = "running"

        try:
            # Validate task can be executed
            if not self._can_execute_task(task):
                raise ValueError(f"Agent cannot execute task type: {task.task_type}")

            # Execute based on task type
            if task.task_type == "capability_execution":
                result = await self._execute_capability(task.parameters)
            elif task.task_type == "learning_task":
                result = await self._execute_learning_task(task.parameters)
            elif task.task_type == "analysis_task":
                result = await self._execute_analysis_task(task.parameters)
            else:
                result = await self._execute_custom_task(task)

            # Success
            task.status = "completed"
            task.result = result

            # Update agent performance
            self.tasks_completed += 1
            self._update_performance_score(True)

            # Add to memory
            await self._add_task_memory(task, success=True)

        except Exception as e:
            # Failure
            task.status = "failed"
            task.error_message = str(e)

            # Update agent performance
            self._update_performance_score(False)

            # Add to memory
            await self._add_task_memory(task, success=False)

        finally:
            # Calculate execution time
            end_time = datetime.utcnow()
            task.execution_time_seconds = (end_time - start_time).total_seconds()

            # Update timestamp
            self.updated_at = end_time

    def _can_execute_task(self, task: AgentTask) -> bool:
        """Check if agent can execute the given task"""
        if task.task_type == "capability_execution":
            capability_name = task.parameters.get('capability')
            return capability_name in self.capabilities

        return True  # Default allow

    async def _execute_capability(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a capability"""
        capability_name = parameters.get('capability')
        if not capability_name or capability_name not in self.capabilities:
            raise ValueError(f"Capability not found: {capability_name}")

        capability = self.capabilities[capability_name]
        capability_params = parameters.get('parameters', {})

        if not capability.validate_parameters(capability_params):
            raise ValueError("Invalid parameters for capability")

        return await capability.execute(capability_params)

    async def _execute_learning_task(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a learning task"""
        learning_type = parameters.get('type', 'experience')

        if learning_type == 'experience':
            return await self._learn_from_experience(parameters)
        elif learning_type == 'knowledge':
            return await self._learn_from_knowledge(parameters)
        elif learning_type == 'feedback':
            return await self._learn_from_feedback(parameters)
        else:
            raise ValueError(f"Unknown learning type: {learning_type}")

    async def _execute_analysis_task(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an analysis task"""
        analysis_type = parameters.get('type', 'data')

        if analysis_type == 'data':
            return await self._analyze_data(parameters)
        elif analysis_type == 'performance':
            return await self._analyze_performance(parameters)
        elif analysis_type == 'market':
            return await self._analyze_market(parameters)
        else:
            raise ValueError(f"Unknown analysis type: {analysis_type}")

    async def _execute_custom_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute a custom task - override in subclasses"""
        return await self.execute_custom_task(task)

    @abstractmethod
    async def execute_custom_task(self, task: AgentTask) -> Dict[str, Any]:
        """Abstract method for custom task execution"""
        pass

    async def _learn_from_experience(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Learn from task execution experience"""
        task_result = parameters.get('task_result')
        feedback = parameters.get('feedback', '')

        # Add to L.L.B. memory
        memory_content = f"Task experience: {task_result}. Feedback: {feedback}"
        self.llb_protocol.add_memory(memory_content, MemoryType.LETTA)

        # Adjust autonomy level based on success
        success = task_result.get('success', False)
        if success:
            self.autonomy_level = min(100.0, self.autonomy_level + 0.5)
        else:
            self.autonomy_level = max(0.0, self.autonomy_level - 0.2)

        return {
            'learned': True,
            'new_autonomy_level': self.autonomy_level,
            'memory_added': True
        }

    async def _learn_from_knowledge(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Learn from external knowledge"""
        knowledge = parameters.get('knowledge', '')
        source = parameters.get('source', 'unknown')

        # Add to L.L.B. memory
        memory_content = f"Knowledge from {source}: {knowledge}"
        self.llb_protocol.add_memory(memory_content, MemoryType.LANG)

        return {
            'learned': True,
            'knowledge_source': source,
            'memory_added': True
        }

    async def _learn_from_feedback(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Learn from human or system feedback"""
        feedback = parameters.get('feedback', '')
        feedback_type = parameters.get('type', 'general')

        # Add to L.L.B. memory
        memory_content = f"Feedback ({feedback_type}): {feedback}"
        self.llb_protocol.add_memory(memory_content, MemoryType.LANG)

        # Adjust performance score based on feedback
        if 'positive' in feedback_type.lower():
            self.performance_score = min(100.0, self.performance_score + 2.0)
        elif 'negative' in feedback_type.lower():
            self.performance_score = max(0.0, self.performance_score - 1.0)

        return {
            'learned': True,
            'feedback_type': feedback_type,
            'performance_adjusted': True,
            'new_performance_score': self.performance_score
        }

    async def _analyze_data(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze data using agent's capabilities"""
        data = parameters.get('data', [])
        analysis_type = parameters.get('analysis_type', 'basic')

        # Basic statistical analysis
        if isinstance(data, list) and len(data) > 0:
            numeric_data = [x for x in data if isinstance(x, (int, float))]

            if numeric_data:
                result = {
                    'count': len(numeric_data),
                    'mean': sum(numeric_data) / len(numeric_data),
                    'min': min(numeric_data),
                    'max': max(numeric_data),
                    'analysis_type': analysis_type
                }

                # Add advanced metrics if available
                if len(numeric_data) > 1:
                    sorted_data = sorted(numeric_data)
                    mid = len(sorted_data) // 2
                    result['median'] = sorted_data[mid] if len(sorted_data) % 2 != 0 else (sorted_data[mid-1] + sorted_data[mid]) / 2

                return result

        return {
            'error': 'Invalid or empty data for analysis',
            'analysis_type': analysis_type
        }

    async def _analyze_performance(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze agent or system performance"""
        metrics = parameters.get('metrics', {})
        timeframe = parameters.get('timeframe', 'daily')

        # Calculate performance indicators
        indicators = {}

        if 'tasks_completed' in metrics and 'success_rate' in metrics:
            efficiency = metrics['tasks_completed'] * metrics['success_rate']
            indicators['efficiency_score'] = efficiency

        if 'autonomy_level' in metrics:
            indicators['autonomy_rating'] = 'high' if metrics['autonomy_level'] > 80 else 'medium' if metrics['autonomy_level'] > 50 else 'low'

        if 'error_rate' in metrics:
            indicators['reliability_rating'] = 'high' if metrics['error_rate'] < 0.1 else 'medium' if metrics['error_rate'] < 0.3 else 'low'

        return {
            'timeframe': timeframe,
            'indicators': indicators,
            'recommendations': self._generate_performance_recommendations(indicators)
        }

    async def _analyze_market(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze market opportunities"""
        market_data = parameters.get('market_data', {})
        segment = parameters.get('segment', 'general')

        # Basic market analysis
        analysis = {
            'segment': segment,
            'market_size': market_data.get('size', 0),
            'growth_potential': 'high' if market_data.get('growth_rate', 0) > 0.15 else 'medium' if market_data.get('growth_rate', 0) > 0.05 else 'low',
            'competition_level': market_data.get('competition', 'medium'),
            'opportunity_score': self._calculate_opportunity_score(market_data)
        }

        return analysis

    def _calculate_opportunity_score(self, market_data: Dict[str, Any]) -> float:
        """Calculate opportunity score"""
        score = 50.0  # Base score

        # Adjust based on market size
        if market_data.get('size', 0) > 1000000:  # $1M+
            score += 20

        # Adjust based on growth
        growth = market_data.get('growth_rate', 0)
        if growth > 0.2:
            score += 15
        elif growth > 0.1:
            score += 10

        # Adjust based on competition
        competition = market_data.get('competition', 'medium')
        if competition == 'low':
            score += 15
        elif competition == 'high':
            score -= 10

        return min(100.0, max(0.0, score))

    def _generate_performance_recommendations(self, indicators: Dict[str, Any]) -> List[str]:
        """Generate performance improvement recommendations"""
        recommendations = []

        if indicators.get('autonomy_rating') == 'low':
            recommendations.append("Increase task delegation and decision-making autonomy")

        if indicators.get('reliability_rating') == 'low':
            recommendations.append("Implement better error handling and recovery mechanisms")

        if indicators.get('efficiency_score', 0) < 50:
            recommendations.append("Optimize task execution and reduce processing time")

        if not recommendations:
            recommendations.append("Performance is satisfactory, continue monitoring")

        return recommendations

    def _update_performance_score(self, success: bool) -> None:
        """Update agent's performance score"""
        change = 1.0 if success else -0.5
        self.performance_score = min(100.0, max(0.0, self.performance_score + change))

    async def _add_task_memory(self, task: AgentTask, success: bool) -> None:
        """Add task execution to L.L.B. memory"""
        memory_content = {
            'task_type': task.task_type,
            'description': task.description,
            'success': success,
            'execution_time': task.execution_time_seconds,
            'result_summary': str(task.result)[:500] if task.result else None,
            'error': task.error_message
        }

        self.llb_protocol.add_memory(
            json.dumps(memory_content),
            MemoryType.LETTA,
            {'task_id': str(task.id), 'timestamp': task.created_at.isoformat()}
        )

    def get_memory_context(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Get relevant memory context for a query"""
        return self.llb_protocol.get_relevant_context(query, limit)

    def to_entity(self) -> Agent:
        """Convert to domain entity"""
        return Agent(
            id=self.id,
            name=self.name,
            role=self.role,
            specialization=self.specialization,
            autonomy_level=self.autonomy_level,
            performance_score=self.performance_score,
            tasks_completed=self.tasks_completed,
            llb_protocol=self.llb_protocol,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_entity(cls, entity: Agent) -> 'BaseAgent':
        """Create agent from domain entity"""
        agent = cls(
            agent_id=entity.id,
            name=entity.name,
            role=entity.role,
            specialization=entity.specialization,
            autonomy_level=entity.autonomy_level
        )
        agent.performance_score = entity.performance_score
        agent.tasks_completed = entity.tasks_completed
        agent.llb_protocol = entity.llb_protocol
        agent.is_active = entity.is_active
        agent.created_at = entity.created_at
        agent.updated_at = entity.updated_at
        return agent