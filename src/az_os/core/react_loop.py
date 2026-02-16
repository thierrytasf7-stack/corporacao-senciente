from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import time
from .llm_client import LLMClient
from .mcp_client import MCPClient
from .storage import TaskState, TaskResult


class ReActTurn(Enum):
    REASONING = "reasoning"
    ACTION = "action"
    OBSERVATION = "observation"
    REFLECTION = "reflection"


@dataclass
class ReActStep:
    turn: ReActTurn
    input: str
    output: str
    timestamp: float


class ReActLoop:
    def __init__(
        self,
        llm_client: LLMClient,
        mcp_client: MCPClient,
        max_turns: int = 5,
        reasoning_model: str = "trinity"
    ):
        self.llm_client = llm_client
        self.mcp_client = mcp_client
        self.max_turns = max_turns
        self.reasoning_model = reasoning_model
        self.history: List[ReActStep] = []
        self.current_task: Optional[TaskState] = None
        self.current_turn = 0

    def run_react_cycle(
        self,
        task: TaskState,
        max_turns: int = 5
    ) -> Tuple[TaskResult, List[ReActStep]]:
        """Execute complete ReAct cycle for a task."""
        self.current_task = task
        self.max_turns = max_turns
        self.current_turn = 0
        self.history = []

        result = TaskResult(
            task_id=task.task_id,
            status="running",
            output="",
            error=None,
            metrics={}
        )

        try:
            while self.current_turn < self.max_turns:
                self.current_turn += 1
                
                # Reasoning turn
                reasoning_output = self._reasoning_turn(task)
                self._record_step(ReActTurn.REASONING, task.description, reasoning_output)
                
                if self._should_stop(reasoning_output):
                    break
                
                # Action turn
                action_output = self._action_turn(reasoning_output)
                self._record_step(ReActTurn.ACTION, reasoning_output, action_output)
                
                if self._should_stop(action_output):
                    break
                
                # Observation turn
                observation_output = self._observation_turn(action_output)
                self._record_step(ReActTurn.OBSERVATION, action_output, observation_output)
                
                if self._should_stop(observation_output):
                    break
                
                # Reflection turn
                reflection_output = self._reflection_turn(observation_output)
                self._record_step(ReActTurn.REFLECTION, observation_output, reflection_output)
                
                if self._should_stop(reflection_output):
                    break
                
                # Update task with new context
                task.description = reflection_output
                
            # Final result
            result.status = "completed" if self._is_successful() else "failed"
            result.output = self.history[-1].output if self.history else ""
            result.metrics = {
                "turns_executed": self.current_turn,
                "total_duration": time.time() - task.created_at,
                "final_status": result.status
            }
            
        except Exception as e:
            result.status = "error"
            result.error = str(e)
            result.metrics = {
                "turns_executed": self.current_turn,
                "error": str(e),
                "exception_type": type(e).__name__
            }
        
        return result, self.history

    def step(self) -> Optional[str]:
        """Execute single step in ReAct cycle."""
        if not self.current_task or self.current_turn >= self.max_turns:
            return None
        
        self.current_turn += 1
        
        # Determine next turn based on history
        if not self.history:
            # First turn: reasoning
            output = self._reasoning_turn(self.current_task)
            self._record_step(ReActTurn.REASONING, self.current_task.description, output)
            return output
        
        last_turn = self.history[-1].turn
        
        if last_turn == ReActTurn.REASONING:
            output = self._action_turn(self.history[-1].output)
            self._record_step(ReActTurn.ACTION, self.history[-1].output, output)
        elif last_turn == ReActTurn.ACTION:
            output = self._observation_turn(self.history[-1].output)
            self._record_step(ReActTurn.OBSERVATION, self.history[-1].output, output)
        elif last_turn == ReActTurn.OBSERVATION:
            output = self._reflection_turn(self.history[-1].output)
            self._record_step(ReActTurn.REFLECTION, self.history[-1].output, output)
            # Update task description for next reasoning
            self.current_task.description = output
        elif last_turn == ReActTurn.REFLECTION:
            output = self._reasoning_turn(self.current_task)
            self._record_step(ReActTurn.REASONING, self.current_task.description, output)
        
        return output

    def observe(self) -> Dict[str, Any]:
        """Get current state of the ReAct loop."""
        return {
            "current_turn": self.current_turn,
            "max_turns": self.max_turns,
            "task_id": self.current_task.task_id if self.current_task else None,
            "history_length": len(self.history),
            "last_turn_type": self.history[-1].turn.name if self.history else None,
            "is_complete": self.current_turn >= self.max_turns or self._is_successful()
        }

    def _reasoning_turn(self, task: TaskState) -> str:
        """Generate reasoning about the task."""
        prompt = f"""You are an autonomous agent reasoning about a task. 

TASK: {task.description}

Please provide reasoning about what needs to be done, what tools might be needed, and what the expected outcome should be. 

Reasoning (do not execute actions yet):"""
        
        response = self.llm_client.generate(
            prompt,
            model=self.reasoning_model,
            temperature=0.3
        )
        return response

    def _action_turn(self, reasoning: str) -> str:
        """Determine and execute action based on reasoning."""
        prompt = f"""Based on the reasoning provided, determine the specific action to take. 

Reasoning: {reasoning}

ACTION: What specific action should be executed? If tools are needed, specify which MCP tools to use and with what parameters."""
        
        response = self.llm_client.generate(prompt, model=self.reasoning_model)
        
        # Execute action via MCP if specified
        if "use tool" in response.lower():
            tool_call = self._parse_tool_call(response)
            if tool_call:
                return self.mcp_client.call_tool(tool_call[0], tool_call[1])
        
        return response

    def _observation_turn(self, action_result: str) -> str:
        """Observe the results of the action."""
        prompt = f"""Observe and report on the results of the action taken. 

ACTION RESULT: {action_result}

OBSERVATION: What happened? What was the outcome? Any errors or success indicators?"""
        
        response = self.llm_client.generate(prompt, model=self.reasoning_model)
        return response

    def _reflection_turn(self, observation: str) -> str:
        """Reflect on observations and plan next steps."""
        prompt = f"""Reflect on the observations and determine next steps. 

OBSERVATION: {observation}

REFLECTION: What did we learn? Should we continue, adjust approach, or stop? Provide updated task description for next iteration."""
        
        response = self.llm_client.generate(prompt, model=self.reasoning_model)
        return response

    def _record_step(self, turn: ReActTurn, input: str, output: str):
        """Record a step in the ReAct history."""
        self.history.append(ReActStep(
            turn=turn,
            input=input,
            output=output,
            timestamp=time.time()
        ))

    def _parse_tool_call(self, response: str) -> Optional[Tuple[str, Dict]]:
        """Parse tool call from LLM response."""
        # Simple parser for tool calls like "call tool 'search' with params {'query': 'test'}"""
        if "call tool" in response.lower():
            try:
                parts = response.split("call tool")
                if len(parts) > 1:
                    tool_part = parts[1].strip()
                    tool_name = tool_part.split("'")[1]
                    params_part = tool_part.split("with params")
                    if len(params_part) > 1:
                        params_str = params_part[1].strip().strip("'")
                        # Simple eval for params (in production, use safer parsing)
                        params = eval(params_str)
                        return tool_name, params
            except:
                pass
        return None

    def _should_stop(self, output: str) -> bool:
        """Determine if loop should stop based on output."""
        stop_keywords = ["done", "complete", "finished", "stop", "exit"]
        return any(keyword in output.lower() for keyword in stop_keywords) or self.current_turn >= self.max_turns

    def _is_successful(self) -> bool:
        """Determine if task was successful based on history."""
        if not self.history:
            return False
        
        last_output = self.history[-1].output.lower()
        success_indicators = ["success", "completed", "done", "achieved"]
        return any(indicator in last_output for indicator in success_indicators)
