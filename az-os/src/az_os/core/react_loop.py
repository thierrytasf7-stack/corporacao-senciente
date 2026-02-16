"""ReAct Loop - Reasoning + Acting + Observing for autonomous task execution."""
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class ActionType(Enum):
    """Types of actions the agent can take."""
    READ_FILE = "read_file"
    WRITE_FILE = "write_file"
    EXECUTE_COMMAND = "execute_command"
    QUERY_LLM = "query_llm"
    SEARCH_MEMORY = "search_memory"
    NONE = "none"


@dataclass
class ReActStep:
    """Single step in ReAct loop."""
    turn: int
    reasoning: str
    action: ActionType
    action_input: Dict[str, Any]
    observation: str
    reward: float = 0.0


class ReActLoop:
    """Multi-turn ReAct loop for autonomous task execution."""

    def __init__(self, llm_client=None, mcp_client=None, rag_engine=None, max_turns: int = 5):
        """Initialize ReAct loop."""
        self.llm_client = llm_client
        self.mcp_client = mcp_client
        self.rag_engine = rag_engine
        self.max_turns = max_turns
        self.steps: List[ReActStep] = []
        self.final_answer = None

    async def run(self, task_description: str, initial_context: Optional[str] = None) -> Tuple[str, List[ReActStep]]:
        """Run ReAct loop for a task."""
        print(f"🤔 Starting ReAct loop for: {task_description[:50]}...")

        # Add initial context from RAG if available
        context = initial_context or ""
        if self.rag_engine:
            rag_context = self.rag_engine.get_context("task", task_description)
            context += rag_context

        current_reasoning = f"Task: {task_description}\nContext: {context[:200]}"

        for turn in range(1, self.max_turns + 1):
            # REASONING: Let LLM think
            reasoning = await self._reason(current_reasoning)
            print(f"  [Turn {turn}] Reasoning: {reasoning[:100]}...")

            # ACTING: Parse and execute action
            action_type, action_input = await self._parse_action(reasoning)
            print(f"  [Turn {turn}] Action: {action_type.value}")

            # OBSERVING: Execute action and get result
            observation = await self._execute_action(action_type, action_input)
            print(f"  [Turn {turn}] Observation: {observation[:100]}...")

            # Create step record
            step = ReActStep(
                turn=turn,
                reasoning=reasoning,
                action=action_type,
                action_input=action_input,
                observation=observation
            )
            self.steps.append(step)

            # Check if done
            if action_type == ActionType.NONE or "final answer" in observation.lower():
                self.final_answer = observation
                break

            # Update context for next turn
            current_reasoning += f"\nObservation: {observation}"

        return self.final_answer or "Task completed without explicit answer", self.steps

    async def _reason(self, context: str) -> str:
        """LLM reasoning step."""
        if not self.llm_client:
            return "No reasoning available"

        prompt = f"Given this context, what should we do next?\n\n{context}\n\nThink step by step:"
        try:
            # Simplified - in real impl would use actual LLM call
            return f"Reasoning based on: {context[:50]}"
        except Exception as e:
            return f"Reasoning failed: {str(e)}"

    async def _parse_action(self, reasoning: str) -> Tuple[ActionType, Dict]:
        """Parse action from reasoning output."""
        reasoning_lower = reasoning.lower()

        # Simple heuristic-based parsing
        if "read" in reasoning_lower:
            return ActionType.READ_FILE, {"path": "README.md"}
        elif "write" in reasoning_lower:
            return ActionType.WRITE_FILE, {"path": "output.txt", "content": ""}
        elif "execute" in reasoning_lower or "run" in reasoning_lower:
            return ActionType.EXECUTE_COMMAND, {"command": "echo 'hello'"}
        elif "search" in reasoning_lower or "query" in reasoning_lower:
            return ActionType.QUERY_LLM, {"prompt": reasoning}
        elif "final answer" in reasoning_lower or "done" in reasoning_lower:
            return ActionType.NONE, {"result": reasoning}
        else:
            return ActionType.NONE, {}

    async def _execute_action(self, action_type: ActionType, action_input: Dict) -> str:
        """Execute the parsed action."""
        try:
            if action_type == ActionType.READ_FILE:
                path = action_input.get("path", "README.md")
                from pathlib import Path
                if Path(path).exists():
                    return Path(path).read_text()[:500]
                return f"File not found: {path}"

            elif action_type == ActionType.EXECUTE_COMMAND:
                cmd = action_input.get("command", "echo test")
                if self.mcp_client:
                    result = await self.mcp_client.shell_exec(cmd)
                    return result.get("stdout", result.get("stderr", "Command executed"))
                return "No MCP client available"

            elif action_type == ActionType.QUERY_LLM:
                if self.llm_client:
                    return "LLM query response"
                return "No LLM client available"

            elif action_type == ActionType.NONE:
                return action_input.get("result", "Task completed")

            else:
                return "Unknown action type"

        except Exception as e:
            return f"Action failed: {str(e)}"

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of ReAct execution."""
        return {
            "total_turns": len(self.steps),
            "max_turns": self.max_turns,
            "actions": [step.action.value for step in self.steps],
            "final_answer": self.final_answer,
            "success": self.final_answer is not None
        }
