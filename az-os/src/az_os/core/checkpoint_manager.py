"""Task checkpointing and recovery management."""
from typing import Dict, Optional, Any
from pathlib import Path
from datetime import datetime
import json
import subprocess


class CheckpointManager:
    """Save and restore task execution state with git integration."""

    def __init__(self, db=None):
        """Initialize checkpoint manager."""
        self.db = db
        self.checkpoint_dir = Path.home() / '.az-os' / 'checkpoints'
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

    def create_checkpoint(self, task_id: str, state: Dict[str, Any],
                         commit_message: Optional[str] = None) -> bool:
        """Create a checkpoint and auto-commit to git."""
        try:
            # Save state file
            checkpoint_file = self.checkpoint_dir / f"{task_id}.json"
            checkpoint_file.write_text(json.dumps({
                "task_id": task_id,
                "timestamp": datetime.now().isoformat(),
                "state": state
            }, indent=2))

            # Auto-commit to git if in repo
            msg = commit_message or f"checkpoint: {task_id} completed"
            try:
                subprocess.run(
                    ["git", "add", "-A"],
                    cwd=Path.home() / '.az-os',
                    capture_output=True,
                    timeout=10
                )
                subprocess.run(
                    ["git", "commit", "-m", msg],
                    cwd=Path.home() / '.az-os',
                    capture_output=True,
                    timeout=10
                )
            except Exception:
                pass  # Git not available or not in repo

            return True
        except Exception as e:
            print(f"⚠️  Failed to create checkpoint: {e}")
            return False

    def restore_checkpoint(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Restore task state from checkpoint."""
        try:
            checkpoint_file = self.checkpoint_dir / f"{task_id}.json"
            if not checkpoint_file.exists():
                return None

            data = json.loads(checkpoint_file.read_text())
            return data.get("state")
        except Exception as e:
            print(f"⚠️  Failed to restore checkpoint: {e}")
            return None

    def list_checkpoints(self) -> list:
        """List all available checkpoints."""
        try:
            checkpoints = []
            for file in sorted(self.checkpoint_dir.glob("*.json")):
                data = json.loads(file.read_text())
                checkpoints.append({
                    "task_id": data["task_id"],
                    "timestamp": data["timestamp"],
                    "file": str(file)
                })
            return checkpoints
        except Exception as e:
            print(f"⚠️  Failed to list checkpoints: {e}")
            return []

    def rollback(self, task_id: str, commit_hash: Optional[str] = None) -> bool:
        """Rollback git commits on failure (revert to previous state)."""
        try:
            if commit_hash:
                # Revert specific commit
                subprocess.run(
                    ["git", "revert", "--no-edit", commit_hash],
                    cwd=Path.home() / '.az-os',
                    capture_output=True,
                    timeout=10
                )
            else:
                # Revert last commit for this task
                subprocess.run(
                    ["git", "reset", "--hard", "HEAD~1"],
                    cwd=Path.home() / '.az-os',
                    capture_output=True,
                    timeout=10
                )

            # Delete checkpoint file
            checkpoint_file = self.checkpoint_dir / f"{task_id}.json"
            if checkpoint_file.exists():
                checkpoint_file.unlink()

            return True
        except Exception as e:
            print(f"⚠️  Failed to rollback: {e}")
            return False

    def delete_checkpoint(self, task_id: str) -> bool:
        """Delete a checkpoint file."""
        try:
            checkpoint_file = self.checkpoint_dir / f"{task_id}.json"
            if checkpoint_file.exists():
                checkpoint_file.unlink()
            return True
        except Exception as e:
            print(f"⚠️  Failed to delete checkpoint: {e}")
            return False

    def get_checkpoint_size(self) -> float:
        """Get total size of all checkpoints in MB."""
        try:
            total_size = sum(f.stat().st_size for f in self.checkpoint_dir.glob("*.json"))
            return total_size / (1024 * 1024)  # Convert to MB
        except Exception:
            return 0.0
