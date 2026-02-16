#!/usr/bin/env python3
"""
AIDER-AIOS Integration Wrapper

Integrates AIOS framework with Aider CLI for cost-optimized development.
This is the core Python wrapper that enables AIOS agents to work through Aider.

Architecture:
    Claude AIOS (orchestrator)
        ↓
    AiderAIOSIntegration (this wrapper)
        ↓
    Aider CLI + OpenRouter + Free Models ($0)

Usage from Claude Code:
    python -m squads.dev-aider.integrations.aider_aios_integration \
        --task "implement function X" \
        --files src/main.py \
        --agent aider-dev

Author: Dev-Aider Squad
Version: 1.0.0
"""

import sys
import os
import subprocess
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)
logger = logging.getLogger('aider-aios')


class ModelTier(Enum):
    """Available free models via OpenRouter"""
    PRIMARY = "openrouter/arcee-ai/trinity-large-preview:free"
    FALLBACK_1 = "openrouter/qwen/qwen3-coder-next"
    FALLBACK_2 = "openrouter/liquid/lfm-2.5-1.2b-instruct:free"
    ESCALATE = "CLAUDE"  # Signal to escalate to Claude


@dataclass
class AiderResult:
    """Result from Aider execution"""
    success: bool
    exit_code: int
    output: str
    files_modified: List[str]
    tokens_used: int
    cost: float  # Always 0 for free models
    model_used: str
    error: Optional[str] = None


@dataclass
class TaskSpec:
    """Specification for an Aider task"""
    message: str
    files: List[str]
    agent_id: str = "aider-dev"
    max_retries: int = 2
    timeout_seconds: int = 300
    auto_commit: bool = False


class AiderAIOSIntegration:
    """
    Main integration class for AIDER-AIOS ecosystem.

    Provides:
    - Subprocess management for Aider CLI
    - Model fallback chain
    - Token optimization
    - Error handling and retries
    - Cost tracking (always $0)
    """

    def __init__(self, working_dir: Optional[str] = None):
        self.working_dir = Path(working_dir) if working_dir else Path.cwd()
        self.api_key = os.environ.get('OPENROUTER_API_KEY')
        self._validate_environment()

        # Fallback chain
        self.model_chain = [
            ModelTier.PRIMARY,
            ModelTier.FALLBACK_1,
            ModelTier.FALLBACK_2,
        ]

        # Stats tracking
        self.stats = {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'total_tokens': 0,
            'total_cost': 0.0,  # Always 0
            'models_used': {}
        }

    def _validate_environment(self) -> None:
        """Validate required environment setup"""
        if not self.api_key:
            raise EnvironmentError(
                "OPENROUTER_API_KEY not set. "
                "Get a free key at https://openrouter.ai"
            )

        # Check Aider installation
        try:
            result = subprocess.run(
                ['aider', '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                raise EnvironmentError("Aider CLI not properly installed")
            logger.info(f"Aider version: {result.stdout.strip()}")
        except FileNotFoundError:
            raise EnvironmentError(
                "Aider not found. Install: pip install aider-chat"
            )

    def execute(self, task: TaskSpec) -> AiderResult:
        """
        Execute a task via Aider CLI with automatic fallback.

        Args:
            task: TaskSpec with message, files, and options

        Returns:
            AiderResult with execution details
        """
        logger.info(f"Executing task for agent: {task.agent_id}")
        logger.info(f"Files: {task.files}")
        logger.info(f"Message: {task.message[:100]}...")

        last_error = None

        for attempt, model in enumerate(self.model_chain):
            if model == ModelTier.ESCALATE:
                break

            logger.info(f"Attempt {attempt + 1}/{len(self.model_chain)} with {model.value}")

            try:
                result = self._run_aider(task, model.value)

                if result.success:
                    self._update_stats(result, model.value)
                    return result
                else:
                    last_error = result.error
                    logger.warning(f"Attempt failed: {last_error}")

            except subprocess.TimeoutExpired:
                last_error = f"Timeout after {task.timeout_seconds}s"
                logger.warning(last_error)
            except Exception as e:
                last_error = str(e)
                logger.error(f"Unexpected error: {e}")

        # All retries exhausted
        return AiderResult(
            success=False,
            exit_code=-1,
            output="",
            files_modified=[],
            tokens_used=0,
            cost=0.0,
            model_used="NONE",
            error=f"All models failed. Last error: {last_error}. ESCALATE TO CLAUDE."
        )

    def _run_aider(self, task: TaskSpec, model: str) -> AiderResult:
        """Run Aider CLI with specified model"""

        cmd = [
            'aider',
            '--model', model,
            '--yes',  # Auto-confirm
        ]

        if not task.auto_commit:
            cmd.append('--no-auto-commits')

        # Add files
        for file in task.files:
            cmd.extend(['--file', file])

        # Add message
        cmd.extend(['--message', task.message])

        logger.debug(f"Command: {' '.join(cmd)}")

        # Execute
        result = subprocess.run(
            cmd,
            cwd=str(self.working_dir),
            capture_output=True,
            text=True,
            timeout=task.timeout_seconds,
            env={**os.environ, 'OPENROUTER_API_KEY': self.api_key}
        )

        # Parse output
        files_modified = self._parse_modified_files(result.stdout)
        tokens_used = self._parse_tokens(result.stdout)

        return AiderResult(
            success=result.returncode == 0,
            exit_code=result.returncode,
            output=result.stdout,
            files_modified=files_modified,
            tokens_used=tokens_used,
            cost=0.0,  # Always free
            model_used=model,
            error=result.stderr if result.returncode != 0 else None
        )

    def _parse_modified_files(self, output: str) -> List[str]:
        """Parse Aider output to find modified files"""
        files = []
        for line in output.split('\n'):
            if 'Applied edit to' in line:
                # Extract filename from "Applied edit to path/to/file.py"
                parts = line.split('Applied edit to')
                if len(parts) > 1:
                    files.append(parts[1].strip())
        return files

    def _parse_tokens(self, output: str) -> int:
        """Parse token usage from Aider output"""
        for line in output.split('\n'):
            if 'Tokens:' in line:
                # Format: "Tokens: 4.8k sent, 58 received"
                try:
                    parts = line.split('Tokens:')[1]
                    sent = parts.split('sent')[0].strip()
                    # Convert 4.8k to 4800
                    if 'k' in sent.lower():
                        return int(float(sent.lower().replace('k', '')) * 1000)
                    return int(sent)
                except:
                    pass
        return 0

    def _update_stats(self, result: AiderResult, model: str) -> None:
        """Update execution statistics"""
        self.stats['tasks_completed'] += 1
        self.stats['total_tokens'] += result.tokens_used
        self.stats['total_cost'] += result.cost

        if model not in self.stats['models_used']:
            self.stats['models_used'][model] = 0
        self.stats['models_used'][model] += 1

    def get_status(self) -> Dict[str, Any]:
        """Get current status and statistics"""
        return {
            'available': True,
            'api_key_set': bool(self.api_key),
            'working_dir': str(self.working_dir),
            'primary_model': ModelTier.PRIMARY.value,
            'fallback_models': [m.value for m in self.model_chain[1:]],
            'stats': self.stats
        }

    def format_cost_report(self) -> str:
        """Format a cost savings report"""
        estimated_claude_cost = self.stats['total_tokens'] * 0.00003  # Rough estimate

        return f"""
═══════════════════════════════════════════════════════════════
💰 AIDER-AIOS COST REPORT
═══════════════════════════════════════════════════════════════
Tasks Completed:    {self.stats['tasks_completed']}
Tasks Failed:       {self.stats['tasks_failed']}
Total Tokens:       {self.stats['total_tokens']:,}

COST BREAKDOWN:
  Aider (Free):     $0.00
  Claude Equivalent: ${estimated_claude_cost:.2f}

SAVINGS:            ${estimated_claude_cost:.2f} (100%)

Models Used:
{self._format_models_used()}
═══════════════════════════════════════════════════════════════
"""

    def _format_models_used(self) -> str:
        lines = []
        for model, count in self.stats['models_used'].items():
            short_name = model.split('/')[-1] if '/' in model else model
            lines.append(f"  {short_name}: {count} tasks")
        return '\n'.join(lines) if lines else "  None yet"


def main():
    """CLI interface for direct invocation"""
    import argparse

    parser = argparse.ArgumentParser(
        description='AIDER-AIOS Integration - Execute tasks via free AI models'
    )
    parser.add_argument('--task', '-t', required=True, help='Task message/prompt')
    parser.add_argument('--files', '-f', nargs='+', required=True, help='Files to edit')
    parser.add_argument('--agent', '-a', default='aider-dev', help='Agent ID')
    parser.add_argument('--timeout', type=int, default=300, help='Timeout in seconds')
    parser.add_argument('--status', action='store_true', help='Show status only')
    parser.add_argument('--working-dir', '-w', help='Working directory')

    args = parser.parse_args()

    try:
        integration = AiderAIOSIntegration(args.working_dir)

        if args.status:
            status = integration.get_status()
            print(json.dumps(status, indent=2))
            return 0

        task = TaskSpec(
            message=args.task,
            files=args.files,
            agent_id=args.agent,
            timeout_seconds=args.timeout
        )

        result = integration.execute(task)

        if result.success:
            print(f"\n✅ Task completed successfully")
            print(f"   Model: {result.model_used}")
            print(f"   Files modified: {', '.join(result.files_modified)}")
            print(f"   Tokens: {result.tokens_used}")
            print(f"   Cost: $0.00 (FREE)")
            return 0
        else:
            print(f"\n❌ Task failed: {result.error}")
            return 1

    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
