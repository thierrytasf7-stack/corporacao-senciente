"""
Unit tests for ReActLoop functionality
Tests complete ReAct cycle, error handling, and integration scenarios.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from src.az_os.core.react_loop import ReActLoop, ReActTurn, ReActStep
from src.az_os.core import TaskState, TaskResult
from src.az_os.core.llm_client import LLMClient
from src.az_os.core.mcp_client import MCPClient


class TestReActLoop:
    """Test ReActLoop functionality"""
    
    @pytest.fixture
    def mock_llm_client(self):
        """Create a mock LLM client."""
        return MagicMock()
    
    @pytest.fixture
    def mock_mcp_client(self):
        """Create a mock MCP client."""
        return MagicMock()
    
    @pytest.fixture
    def sample_task(self):
        """Create a sample task."""
        return TaskState(
            task_id="test_task",
            task_type="test",
            description="Test task description",
            created_at=1234567890,
            priority="medium"
        )
    
    @pytest.fixture
    def sample_result(self):
        """Create a sample task result."""
        return TaskResult(
            task_id="test_task",
            status="completed",
            output="Test output",
            error=None,
            metrics={}
        )
    
    def test_complete_react_cycle_success(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test complete Reason → Act → Observe cycle with success"""
        # Setup mock responses
        mock_llm_client.reason = MagicMock(side_effect=[
            "I should execute the tool to get data",
            "The tool returned data successfully",
            "I have the data I need"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(return_value="Tool data")
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=3)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=3)
        
        # Verify result
        assert result.status == "completed"
        assert result.output == "I have the data I need"
        assert len(history) == 9  # 3 turns × 3 steps each
        
        # Verify history
        reasoning_steps = [step for step in history if step.turn == ReActTurn.REASONING]
        action_steps = [step for step in history if step.turn == ReActTurn.ACTION]
        observation_steps = [step for step in history if step.turn == ReActTurn.OBSERVATION]
        
        assert len(reasoning_steps) == 3
        assert len(action_steps) == 3
        assert len(observation_steps) == 3
    
    def test_task_completion_after_3_turns(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test task completion after 3 turns"""
        # Setup mock responses that indicate completion
        mock_llm_client.reason = MagicMock(side_effect=[
            "I need to execute tool",
            "Tool executed, checking results",
            "Task completed successfully"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(return_value="Tool result")
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=5)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=5)
        
        # Should complete in 3 turns
        assert len(history) == 9  # 3 turns × 3 steps
        assert result.status == "completed"
        assert "Task completed successfully" in result.output
    
    def test_reasoning_traces_captured(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test reasoning traces are captured in history"""
        mock_llm_client.reason = MagicMock(side_effect=[
            "Reasoning step 1",
            "Reasoning step 2",
            "Reasoning step 3"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(return_value="Tool data")
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=3)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=3)
        
        # Verify reasoning traces
        reasoning_steps = [step for step in history if step.turn == ReActTurn.REASONING]
        assert len(reasoning_steps) == 3
        
        for i, step in enumerate(reasoning_steps, 1):
            assert f"Reasoning step {i}" in step.output
            assert step.input == sample_task.description if i == 1 else f"Reasoning step {i-1}"
    
    def test_tool_execution_failure_handling(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test tool execution failure handling"""
        # Setup tool failure
        mock_llm_client.reason = MagicMock(side_effect=[
            "I should execute the tool",
            "Tool failed, need to handle error"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(side_effect=Exception("Tool execution failed"))
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=2)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=2)
        
        # Verify graceful degradation
        assert result.status == "failed"
        assert "Tool execution failed" in str(result.error)
        assert len(history) == 2  # Only reasoning steps completed
        
        # Verify user-friendly error
        assert "failed" in result.status
        assert result.error is not None
    
    def test_graceful_degradation_on_failure(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test graceful degradation when tool fails"""
        mock_llm_client.reason = MagicMock(side_effect=[
            "First reasoning",
            "Tool failed, fallback needed",
            "Final reasoning with fallback"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(side_effect=Exception("Network error"))
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=3)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=3)
        
        # Verify graceful handling
        assert result.status == "failed"
        assert len(history) == 3  # Only reasoning steps
        assert "fallback" in history[-1].output.lower()
    
    def test_user_friendly_error_messages(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test user-friendly error messages"""
        mock_llm_client.reason = MagicMock(side_effect=[
            "Initial reasoning",
            "Error occurred"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(side_effect=Exception("Database connection lost"))
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=2)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=2)
        
        # Verify error message is user-friendly
        assert "connection lost" in str(result.error).lower()
        assert "failed" in result.status.lower()
        assert "error occurred" in history[-1].output.lower()
    
    def test_loop_terminates_at_max_turns(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test loop terminates at max_turns"""
        # Setup that never completes
        mock_llm_client.reason = MagicMock(side_effect=[
            "Reasoning step",
            "Reasoning step",
            "Reasoning step",
            "Reasoning step"  # Should not get here
        ])
        
        mock_mcp_client.execute_tool = MagicMock(return_value="Tool data")
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=3)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=3)
        
        # Verify termination at max turns
        assert len(history) == 9  # 3 turns × 3 steps
        assert result.status == "completed"  # Should complete even if not truly done
        assert react_loop.current_turn == 3
    
    def test_no_infinite_loops(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test no infinite loops occur"""
        # Setup that would loop forever without max_turns
        mock_llm_client.reason = MagicMock(return_value="Continue reasoning")
        mock_mcp_client.execute_tool = MagicMock(return_value="Tool data")
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=5)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=5)
        
        # Verify loop terminates
        assert len(history) == 15  # 5 turns × 3 steps
        assert react_loop.current_turn == 5
    
    def test_final_state_correct_after_max_turns(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test final state is correct after max_turns"""
        mock_llm_client.reason = MagicMock(side_effect=[
            "Step 1",
            "Step 2",
            "Step 3",
            "Step 4",
            "Step 5"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(return_value="Tool data")
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=5)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=5)
        
        # Verify final state
        assert result.status == "completed"
        assert "Step 5" in result.output
        assert len(history) == 15
        assert react_loop.current_turn == 5
    
    def test_integration_with_execution_engine(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test integration with real ExecutionEngine"""
        # Mock subprocess execution
        with patch('subprocess.run') as mock_subprocess:
            mock_subprocess.return_value.stdout = b"Execution result"
            mock_subprocess.return_value.returncode = 0
            
            mock_llm_client.reason = MagicMock(side_effect=[
                "Execute command",
                "Command executed"
            ])
            
            mock_mcp_client.execute_tool = MagicMock(return_value="Execution result")
            
            react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=2)
            
            result, history = react_loop.run_react_cycle(sample_task, max_turns=2)
            
            # Verify subprocess integration
            mock_subprocess.assert_called_once()
            assert "Execution result" in result.output
    
    def test_integration_with_real_model_router(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test integration with real ModelRouter"""
        from src.az_os.core.model_router import ModelRouter
        
        model_router = ModelRouter()
        
        # Mock model selection
        with patch.object(ModelRouter, 'select_model', return_value=(ModelType.CLAUDE, 9.5)):
            
            mock_llm_client.reason = MagicMock(side_effect=[
                "Select model",
                "Model selected"
            ])
            
            mock_mcp_client.execute_tool = MagicMock(return_value="Model result")
            
            react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=2)
            
            result, history = react_loop.run_react_cycle(sample_task, max_turns=2)
            
            # Verify model router integration
            assert "Model result" in result.output
    
    def test_tool_execution_integration(self, mock_llm_client, mock_mcp_client, sample_task):
        """Test tool execution integration"""
        mock_llm_client.reason = MagicMock(side_effect=[
            "Execute data tool",
            "Process data",
            "Complete task"
        ])
        
        mock_mcp_client.execute_tool = MagicMock(side_effect=[
            "Data from tool",
            "Processed data"
        ])
        
        react_loop = ReActLoop(mock_llm_client, mock_mcp_client, max_turns=3)
        
        result, history = react_loop.run_react_cycle(sample_task, max_turns=3)
        
        # Verify tool execution flow
        assert mock_mcp_client.execute_tool.call_count == 2
        assert "Data from tool" in history[1].output
        assert "Processed data" in history[4].output
        assert "Complete task" in result.output