"""
Sensory Feedback System - Industry 6.0
Corporação Senciente - Human-AI Symbiosis Layer

This module implements the sensory feedback loop that enables:
- Hyper-personalized interactivity
- Real-time behavioral adaptation
- Emotional state awareness
- Contextual response optimization

Industry 6.0 Principles:
- Symbiotic relationship between human and AI
- Continuous feedback integration
- Adaptive response strategies
- Emotional intelligence integration
"""

import asyncio
from typing import Optional, Dict, Any, List, Callable, Awaitable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging
import json

logger = logging.getLogger(__name__)


class EmotionalValence(Enum):
    """Emotional valence spectrum"""
    VERY_NEGATIVE = -2
    NEGATIVE = -1
    NEUTRAL = 0
    POSITIVE = 1
    VERY_POSITIVE = 2


class InteractionType(Enum):
    """Types of human-AI interactions"""
    QUERY = "query"
    COMMAND = "command"
    FEEDBACK = "feedback"
    CORRECTION = "correction"
    APPROVAL = "approval"
    REJECTION = "rejection"


@dataclass
class UserBehaviorModel:
    """
    Model of user behavior patterns
    Enables hyper-personalization
    """
    user_id: str
    interaction_count: int = 0
    avg_response_time: float = 0.0  # seconds
    preferred_detail_level: str = "medium"  # brief, medium, detailed
    correction_frequency: float = 0.0
    approval_rate: float = 0.5
    emotional_baseline: EmotionalValence = EmotionalValence.NEUTRAL
    active_hours: List[int] = field(default_factory=lambda: list(range(9, 18)))
    topic_preferences: Dict[str, float] = field(default_factory=dict)
    last_interaction: datetime = field(default_factory=datetime.utcnow)
    
    def update_from_interaction(self, interaction: Dict[str, Any]) -> None:
        """Update model from new interaction"""
        self.interaction_count += 1
        self.last_interaction = datetime.utcnow()
        
        # Update response time average
        if 'response_time' in interaction:
            self.avg_response_time = (
                (self.avg_response_time * (self.interaction_count - 1) + 
                 interaction['response_time']) / self.interaction_count
            )
        
        # Update approval rate
        if interaction.get('type') == InteractionType.APPROVAL.value:
            self.approval_rate = (
                (self.approval_rate * (self.interaction_count - 1) + 1) / 
                self.interaction_count
            )
        elif interaction.get('type') == InteractionType.REJECTION.value:
            self.approval_rate = (
                (self.approval_rate * (self.interaction_count - 1)) / 
                self.interaction_count
            )
        
        # Update topic preferences
        if 'topic' in interaction:
            topic = interaction['topic']
            current = self.topic_preferences.get(topic, 0.5)
            self.topic_preferences[topic] = current * 0.9 + 0.1  # Increase preference


@dataclass
class EmotionalVector:
    """
    Emotional state representation
    Multi-dimensional emotional awareness
    """
    valence: float = 0.0  # -1 (negative) to 1 (positive)
    arousal: float = 0.0  # -1 (calm) to 1 (excited)
    dominance: float = 0.0  # -1 (submissive) to 1 (dominant)
    confidence: float = 0.5  # 0 (uncertain) to 1 (certain)
    
    @classmethod
    def from_text_analysis(cls, sentiment_score: float, urgency: float = 0.0) -> 'EmotionalVector':
        """Create from text sentiment analysis"""
        return cls(
            valence=sentiment_score,
            arousal=abs(sentiment_score) * 0.5 + urgency * 0.5,
            dominance=0.0,  # Neutral until more context
            confidence=min(1.0, abs(sentiment_score) + 0.3)
        )
    
    def blend(self, other: 'EmotionalVector', weight: float = 0.5) -> 'EmotionalVector':
        """Blend with another emotional vector"""
        return EmotionalVector(
            valence=self.valence * (1 - weight) + other.valence * weight,
            arousal=self.arousal * (1 - weight) + other.arousal * weight,
            dominance=self.dominance * (1 - weight) + other.dominance * weight,
            confidence=min(self.confidence, other.confidence)
        )


@dataclass
class ResponseStrategy:
    """
    Adaptive response strategy
    Optimizes AI output based on user model and emotional state
    """
    detail_level: str = "medium"  # brief, medium, detailed
    tone: str = "professional"  # casual, professional, formal
    empathy_level: float = 0.5  # 0-1
    proactivity: float = 0.5  # 0-1
    explanation_depth: str = "standard"  # minimal, standard, comprehensive
    follow_up_suggestions: bool = True
    
    @classmethod
    def from_context(
        cls, 
        user_model: UserBehaviorModel, 
        emotional_state: EmotionalVector
    ) -> 'ResponseStrategy':
        """Generate strategy from user model and emotional state"""
        
        # Adapt detail level to user preference
        detail_level = user_model.preferred_detail_level
        
        # Increase empathy for negative emotions
        empathy_level = 0.5
        if emotional_state.valence < -0.3:
            empathy_level = 0.8
        elif emotional_state.valence > 0.5:
            empathy_level = 0.3
        
        # Increase proactivity for positive emotional states
        proactivity = 0.5 + emotional_state.valence * 0.3
        
        # Tone based on user correction frequency
        tone = "professional"
        if user_model.correction_frequency > 0.3:
            tone = "formal"  # More precise for users who correct often
        elif user_model.approval_rate > 0.8:
            tone = "casual"  # More relaxed for satisfied users
        
        return cls(
            detail_level=detail_level,
            tone=tone,
            empathy_level=empathy_level,
            proactivity=proactivity,
            explanation_depth="comprehensive" if user_model.correction_frequency > 0.2 else "standard",
            follow_up_suggestions=user_model.approval_rate > 0.6
        )


@dataclass
class SensoryFeedback:
    """
    Complete sensory feedback packet
    Combines all Industry 6.0 sensory data
    """
    user_context: UserBehaviorModel
    emotional_state: EmotionalVector
    adaptive_response: ResponseStrategy
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)


class SensoryFeedbackLoop:
    """
    Industry 6.0 Sensory Feedback Loop
    
    Enables continuous adaptation and hyper-personalization
    through real-time feedback integration.
    
    Features:
    - User behavior modeling
    - Emotional state tracking
    - Response strategy adaptation
    - Feedback processing pipeline
    """
    
    def __init__(self):
        self.user_models: Dict[str, UserBehaviorModel] = {}
        self.emotional_states: Dict[str, EmotionalVector] = {}
        self.feedback_handlers: List[Callable[[SensoryFeedback], Awaitable[None]]] = []
        self.interaction_buffer: List[Dict[str, Any]] = []
        self.buffer_size = 100
        
        # Statistics
        self.stats = {
            'interactions_processed': 0,
            'feedback_emitted': 0,
            'adaptations_made': 0
        }
        
        logger.info("[SensoryFeedbackLoop] Initialized for Industry 6.0")
    
    def register_handler(self, handler: Callable[[SensoryFeedback], Awaitable[None]]) -> None:
        """Register a feedback handler"""
        self.feedback_handlers.append(handler)
        logger.debug(f"[SensoryFeedbackLoop] Handler registered, total: {len(self.feedback_handlers)}")
    
    async def process_interaction(
        self,
        user_id: str,
        interaction_type: InteractionType,
        content: Dict[str, Any],
        sentiment_score: float = 0.0
    ) -> SensoryFeedback:
        """
        Process a user interaction and generate sensory feedback
        
        Args:
            user_id: Unique user identifier
            interaction_type: Type of interaction
            content: Interaction content and metadata
            sentiment_score: Pre-computed sentiment (-1 to 1)
        
        Returns:
            SensoryFeedback packet for adaptation
        """
        # Get or create user model
        if user_id not in self.user_models:
            self.user_models[user_id] = UserBehaviorModel(user_id=user_id)
        
        user_model = self.user_models[user_id]
        
        # Update user model
        interaction_data = {
            'type': interaction_type.value,
            'timestamp': datetime.utcnow().isoformat(),
            **content
        }
        user_model.update_from_interaction(interaction_data)
        
        # Compute emotional state
        emotional_state = EmotionalVector.from_text_analysis(
            sentiment_score,
            urgency=content.get('urgency', 0.0)
        )
        
        # Blend with previous emotional state if exists
        if user_id in self.emotional_states:
            emotional_state = self.emotional_states[user_id].blend(emotional_state, 0.3)
        
        self.emotional_states[user_id] = emotional_state
        
        # Generate adaptive response strategy
        response_strategy = ResponseStrategy.from_context(user_model, emotional_state)
        
        # Create feedback packet
        feedback = SensoryFeedback(
            user_context=user_model,
            emotional_state=emotional_state,
            adaptive_response=response_strategy,
            metadata={
                'interaction_type': interaction_type.value,
                'content_summary': str(content)[:100]
            }
        )
        
        # Buffer interaction
        self._buffer_interaction(interaction_data)
        
        # Emit to handlers
        await self._emit_feedback(feedback)
        
        # Update stats
        self.stats['interactions_processed'] += 1
        
        return feedback
    
    async def get_response_strategy(self, user_id: str) -> ResponseStrategy:
        """
        Get current response strategy for a user
        
        Args:
            user_id: User identifier
        
        Returns:
            Current optimal ResponseStrategy
        """
        user_model = self.user_models.get(user_id, UserBehaviorModel(user_id=user_id))
        emotional_state = self.emotional_states.get(user_id, EmotionalVector())
        
        return ResponseStrategy.from_context(user_model, emotional_state)
    
    async def record_feedback(
        self,
        user_id: str,
        feedback_type: str,
        success: bool,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Record explicit user feedback
        
        Args:
            user_id: User identifier
            feedback_type: Type of feedback (approval, correction, etc.)
            success: Whether the interaction was successful
            details: Additional feedback details
        """
        interaction_type = InteractionType.APPROVAL if success else InteractionType.CORRECTION
        
        await self.process_interaction(
            user_id=user_id,
            interaction_type=interaction_type,
            content={
                'feedback_type': feedback_type,
                'success': success,
                **(details or {})
            }
        )
        
        # Update correction frequency
        if user_id in self.user_models:
            model = self.user_models[user_id]
            if not success:
                model.correction_frequency = (
                    model.correction_frequency * 0.9 + 0.1
                )
            else:
                model.correction_frequency *= 0.95
        
        self.stats['adaptations_made'] += 1
    
    def _buffer_interaction(self, interaction: Dict[str, Any]) -> None:
        """Buffer interaction for batch processing"""
        self.interaction_buffer.append(interaction)
        
        # Trim buffer if needed
        if len(self.interaction_buffer) > self.buffer_size:
            self.interaction_buffer = self.interaction_buffer[-self.buffer_size:]
    
    async def _emit_feedback(self, feedback: SensoryFeedback) -> None:
        """Emit feedback to all handlers"""
        for handler in self.feedback_handlers:
            try:
                await handler(feedback)
            except Exception as e:
                logger.error(f"[SensoryFeedbackLoop] Handler error: {e}")
        
        self.stats['feedback_emitted'] += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Get loop statistics"""
        return {
            **self.stats,
            'active_users': len(self.user_models),
            'buffer_size': len(self.interaction_buffer)
        }
    
    def export_user_model(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Export user model for persistence"""
        if user_id not in self.user_models:
            return None
        
        model = self.user_models[user_id]
        return {
            'user_id': model.user_id,
            'interaction_count': model.interaction_count,
            'avg_response_time': model.avg_response_time,
            'preferred_detail_level': model.preferred_detail_level,
            'correction_frequency': model.correction_frequency,
            'approval_rate': model.approval_rate,
            'topic_preferences': model.topic_preferences,
            'last_interaction': model.last_interaction.isoformat()
        }


# Global instance
_sensory_loop: Optional[SensoryFeedbackLoop] = None


def get_sensory_feedback_loop() -> SensoryFeedbackLoop:
    """Get global sensory feedback loop instance"""
    global _sensory_loop
    
    if _sensory_loop is None:
        _sensory_loop = SensoryFeedbackLoop()
    
    return _sensory_loop


async def init_sensory_feedback() -> None:
    """Initialize sensory feedback system"""
    loop = get_sensory_feedback_loop()
    logger.info("[SensoryFeedback] Industry 6.0 sensory system initialized")


# Convenience decorators
def with_sensory_feedback(user_id_param: str = 'user_id'):
    """
    Decorator to automatically process sensory feedback for a function
    
    Usage:
        @with_sensory_feedback('user_id')
        async def my_agent_function(user_id: str, task: str):
            ...
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            user_id = kwargs.get(user_id_param) or (args[0] if args else 'anonymous')
            loop = get_sensory_feedback_loop()
            
            # Get response strategy
            strategy = await loop.get_response_strategy(user_id)
            kwargs['_response_strategy'] = strategy
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Record interaction
            await loop.process_interaction(
                user_id=user_id,
                interaction_type=InteractionType.COMMAND,
                content={'function': func.__name__, 'result_type': type(result).__name__}
            )
            
            return result
        
        return wrapper
    return decorator
