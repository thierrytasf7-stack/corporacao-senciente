"""
Trading Agent - Industry 7.0
Corporacao Senciente

Autonomous trading agent integrated with:
- L.L.B. Protocol (memory of trades)
- SensoryFeedback (market adaptation)
- Corporate Will (trade approval)
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from backend.agents.base.agent_base import BaseAgent
from backend.core.services.autonomous_decision_engine import (
    CorporateWill,
    DecisionContext,
    DecisionCategory,
    DecisionPriority,
    get_corporate_will
)
from backend.core.services.sensory_feedback_system import (
    SensoryFeedbackLoop,
    InteractionType,
    get_sensory_feedback_loop
)
from backend.core.value_objects import (
    LLBProtocolManager,
    MemoryType,
    MemoryPriority
)

logger = logging.getLogger(__name__)


class TradeSignal(Enum):
    """Trade signal types"""
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


@dataclass
class TradeContext:
    """Context for a trade decision"""
    symbol: str
    signal: TradeSignal
    confidence: float
    entry_price: float
    quantity: float
    leverage: int
    stop_loss_price: float
    take_profit_price: float
    strategy_name: str
    metadata: Dict[str, Any]


@dataclass
class TradeResult:
    """Result of a trade execution"""
    success: bool
    order_id: Optional[str]
    symbol: str
    side: str
    quantity: float
    price: float
    timestamp: datetime
    error: Optional[str] = None


class TradingAgent(BaseAgent):
    """
    Industry 7.0 Trading Agent
    
    Autonomous trading with full integration into the Corporacao Senciente ecosystem.
    All trades require Corporate Will approval and are logged to L.L.B. Protocol.
    """
    
    def __init__(
        self,
        name: str = "trading_agent",
        trade_threshold_usd: float = 100.0,
        max_daily_trades: int = 50,
        testnet_only: bool = True
    ):
        super().__init__(
            name=name,
            sector="Finance",
            specialization="Algorithmic Trading"
        )
        
        self.trade_threshold_usd = trade_threshold_usd
        self.max_daily_trades = max_daily_trades
        self.testnet_only = testnet_only
        
        # Initialize integrations
        self.corporate_will = get_corporate_will()
        self.sensory_feedback = get_sensory_feedback_loop()
        self.llb_manager = LLBProtocolManager()
        self.llb_manager.create_protocol(self.name)
        
        # Trading state
        self.daily_trade_count = 0
        self.daily_pnl = 0.0
        self.last_reset_date = datetime.now().date()
        self.active_positions: Dict[str, Dict[str, Any]] = {}
        
        # Performance tracking
        self.total_trades = 0
        self.winning_trades = 0
        self.losing_trades = 0
        
        logger.info(f"TradingAgent initialized: {name} (testnet={testnet_only})")
    
    async def evaluate_trade(self, context: TradeContext) -> Dict[str, Any]:
        """
        Evaluate a potential trade through Corporate Will
        
        Args:
            context: Trade context with all relevant information
            
        Returns:
            Evaluation result with approval status
        """
        # Check daily limits
        if self.daily_trade_count >= self.max_daily_trades:
            return {
                "approved": False,
                "reason": f"Daily trade limit reached ({self.max_daily_trades})",
                "confidence": 1.0
            }
        
        # Build decision context for Corporate Will
        trade_value = context.quantity * context.entry_price
        risk_level = self._calculate_risk_level(context)
        
        decision_context = DecisionContext(
            category=DecisionCategory.TRADING,
            priority=self._determine_priority(context),
            description=f"Execute {context.signal.value} on {context.symbol}",
            options=[{
                "action": f"{context.signal.value}_{context.symbol}",
                "cost": trade_value,
                "risk_level": risk_level,
                "expected_return": self._estimate_return(context),
                "time_to_implement": "immediate"
            }]
        )
        
        # Evaluate through Corporate Will
        decision = await self.corporate_will.evaluate(decision_context)
        
        # Log decision to L.L.B.
        self.llb_manager.store_memory(
            agent_id=self.name,
            content=f"Trade evaluation: {context.symbol} {context.signal.value} - {decision.reasoning}",
            memory_type=MemoryType.LETTA,
            priority=MemoryPriority.HIGH,
            metadata={
                "symbol": context.symbol,
                "signal": context.signal.value,
                "approved": decision.approved,
                "confidence": decision.confidence,
                "timestamp": datetime.now().isoformat()
            }
        )
        
        return {
            "approved": decision.approved,
            "reason": decision.reasoning,
            "confidence": decision.confidence,
            "decision_id": decision.decision_id,
            "ethical_check": decision.ethical_check,
            "risk_assessment": decision.risk_assessment
        }
    
    async def execute_trade(
        self,
        context: TradeContext,
        trading_service: Any  # FuturesTradingService from BINANCE-BOT
    ) -> TradeResult:
        """
        Execute a trade after Corporate Will approval
        
        Args:
            context: Trade context
            trading_service: The trading service to execute on
            
        Returns:
            Trade result
        """
        # Evaluate first
        evaluation = await self.evaluate_trade(context)
        
        if not evaluation["approved"]:
            return TradeResult(
                success=False,
                order_id=None,
                symbol=context.symbol,
                side=context.signal.value,
                quantity=context.quantity,
                price=context.entry_price,
                timestamp=datetime.now(),
                error=f"Not approved: {evaluation['reason']}"
            )
        
        try:
            # Execute the trade
            if context.signal == TradeSignal.HOLD:
                return TradeResult(
                    success=True,
                    order_id=None,
                    symbol=context.symbol,
                    side="hold",
                    quantity=0,
                    price=context.entry_price,
                    timestamp=datetime.now()
                )
            
            # Set leverage
            await trading_service.setLeverage(context.symbol, context.leverage)
            
            # Place order
            order = await trading_service.placeOrder({
                "symbol": context.symbol,
                "side": "BUY" if context.signal == TradeSignal.BUY else "SELL",
                "type": "MARKET",
                "quantity": context.quantity
            })
            
            # Update state
            self.daily_trade_count += 1
            self.total_trades += 1
            
            # Store position
            self.active_positions[context.symbol] = {
                "order_id": order.orderId,
                "side": context.signal.value,
                "entry_price": float(order.avgPrice),
                "quantity": context.quantity,
                "leverage": context.leverage,
                "stop_loss": context.stop_loss_price,
                "take_profit": context.take_profit_price,
                "timestamp": datetime.now().isoformat()
            }
            
            # Store trade memory
            self.llb_manager.store_memory(
                agent_id=self.name,
                content=f"Trade executed: {context.signal.value} {context.quantity} {context.symbol} @ {order.avgPrice}",
                memory_type=MemoryType.LANG,
                priority=MemoryPriority.HIGH,
                metadata={
                    "order_id": order.orderId,
                    "symbol": context.symbol,
                    "side": context.signal.value,
                    "quantity": context.quantity,
                    "price": float(order.avgPrice),
                    "strategy": context.strategy_name,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Emit sensory feedback
            await self.sensory_feedback.process_interaction(
                user_id="system",
                interaction_type=InteractionType.APPROVAL,
                content={
                    "action": "trade_execution",
                    "symbol": context.symbol,
                    "side": context.signal.value,
                    "success": True
                },
                sentiment_score=0.7
            )
            
            logger.info(f"Trade executed: {context.signal.value} {context.quantity} {context.symbol}")
            
            return TradeResult(
                success=True,
                order_id=str(order.orderId),
                symbol=context.symbol,
                side=context.signal.value,
                quantity=context.quantity,
                price=float(order.avgPrice),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Trade execution error: {e}")
            
            # Store failure memory
            self.llb_manager.store_memory(
                agent_id=self.name,
                content=f"Trade failed: {context.symbol} {context.signal.value} - {str(e)}",
                memory_type=MemoryType.LETTA,
                priority=MemoryPriority.CRITICAL,
                metadata={
                    "symbol": context.symbol,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Emit negative feedback
            await self.sensory_feedback.process_interaction(
                user_id="system",
                interaction_type=InteractionType.CORRECTION,
                content={
                    "action": "trade_execution",
                    "symbol": context.symbol,
                    "error": str(e)
                },
                sentiment_score=-0.5
            )
            
            return TradeResult(
                success=False,
                order_id=None,
                symbol=context.symbol,
                side=context.signal.value,
                quantity=context.quantity,
                price=context.entry_price,
                timestamp=datetime.now(),
                error=str(e)
            )
    
    async def close_position(
        self,
        symbol: str,
        trading_service: Any,
        reason: str = "manual"
    ) -> TradeResult:
        """Close an existing position"""
        if symbol not in self.active_positions:
            return TradeResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side="close",
                quantity=0,
                price=0,
                timestamp=datetime.now(),
                error="No active position"
            )
        
        position = self.active_positions[symbol]
        
        try:
            order = await trading_service.closePosition(symbol)
            
            if order:
                # Calculate P&L
                entry_price = position["entry_price"]
                exit_price = float(order.avgPrice)
                quantity = position["quantity"]
                
                if position["side"] == "buy":
                    pnl = (exit_price - entry_price) * quantity
                else:
                    pnl = (entry_price - exit_price) * quantity
                
                self.daily_pnl += pnl
                
                if pnl > 0:
                    self.winning_trades += 1
                else:
                    self.losing_trades += 1
                
                # Remove from active positions
                del self.active_positions[symbol]
                
                # Store close memory
                self.llb_manager.store_memory(
                    agent_id=self.name,
                    content=f"Position closed: {symbol} - P&L: ${pnl:.2f} ({reason})",
                    memory_type=MemoryType.LANG,
                    priority=MemoryPriority.HIGH,
                    metadata={
                        "symbol": symbol,
                        "pnl": pnl,
                        "reason": reason,
                        "entry_price": entry_price,
                        "exit_price": exit_price,
                        "timestamp": datetime.now().isoformat()
                    }
                )
                
                return TradeResult(
                    success=True,
                    order_id=str(order.orderId),
                    symbol=symbol,
                    side="close",
                    quantity=quantity,
                    price=exit_price,
                    timestamp=datetime.now()
                )
            
            return TradeResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side="close",
                quantity=0,
                price=0,
                timestamp=datetime.now(),
                error="No position to close"
            )
            
        except Exception as e:
            logger.error(f"Error closing position {symbol}: {e}")
            return TradeResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side="close",
                quantity=0,
                price=0,
                timestamp=datetime.now(),
                error=str(e)
            )
    
    def get_trade_wisdom(self, symbol: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get wisdom from past trades for a symbol"""
        from backend.core.value_objects import MemoryRetrievalQuery
        
        query = MemoryRetrievalQuery(
            query_text=f"trade {symbol}",
            memory_types=[MemoryType.LANG],
            priority_filter=MemoryPriority.HIGH,
            limit=limit
        )
        
        return self.llb_manager.retrieve_memories(self.name, query)
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get agent performance statistics"""
        win_rate = (self.winning_trades / self.total_trades * 100) if self.total_trades > 0 else 0
        
        return {
            "total_trades": self.total_trades,
            "winning_trades": self.winning_trades,
            "losing_trades": self.losing_trades,
            "win_rate": win_rate,
            "daily_trade_count": self.daily_trade_count,
            "daily_pnl": self.daily_pnl,
            "active_positions": len(self.active_positions),
            "testnet_mode": self.testnet_only
        }
    
    def reset_daily_stats(self):
        """Reset daily statistics (call at day start)"""
        self.daily_trade_count = 0
        self.daily_pnl = 0.0
        self.last_reset_date = datetime.now().date()
        logger.info("Daily stats reset")
    
    def _calculate_risk_level(self, context: TradeContext) -> float:
        """Calculate risk level for a trade (0-1)"""
        risk = 0.0
        
        # Leverage risk
        risk += min(0.3, context.leverage / 20 * 0.3)
        
        # Confidence inverse
        risk += (1 - context.confidence) * 0.2
        
        # Position size risk (relative)
        trade_value = context.quantity * context.entry_price
        if trade_value > self.trade_threshold_usd * 2:
            risk += 0.2
        
        # Stop loss distance
        sl_distance = abs(context.entry_price - context.stop_loss_price) / context.entry_price
        risk += min(0.3, sl_distance * 3)
        
        return min(1.0, risk)
    
    def _estimate_return(self, context: TradeContext) -> float:
        """Estimate potential return"""
        tp_distance = abs(context.take_profit_price - context.entry_price) / context.entry_price
        return context.quantity * context.entry_price * tp_distance * context.leverage
    
    def _determine_priority(self, context: TradeContext) -> DecisionPriority:
        """Determine decision priority based on trade context"""
        if context.confidence > 0.8:
            return DecisionPriority.HIGH
        elif context.confidence > 0.6:
            return DecisionPriority.MEDIUM
        return DecisionPriority.LOW


# Factory function
def create_trading_agent(
    name: str = "trading_agent",
    trade_threshold_usd: float = 100.0,
    max_daily_trades: int = 50,
    testnet_only: bool = True
) -> TradingAgent:
    """Create a new TradingAgent instance"""
    return TradingAgent(
        name=name,
        trade_threshold_usd=trade_threshold_usd,
        max_daily_trades=max_daily_trades,
        testnet_only=testnet_only
    )
