"""
Checkpoint Manager for task execution state persistence and Git integration.
"""

import json
import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

import git
from git import Repo


class CheckpointManager:
    """Manages task checkpoints with Git integration for rollback support."""
    
    def __init__(self, checkpoint_dir: str = ".az-os/checkpoints"):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.git_repo = self._get_git_repo()
    
    def _get_git_repo(self) -> Optional[Repo]:
        """Get the Git repository if available."""
        try:
            repo_path = Path(".").resolve()
            while repo_path != repo_path.root:
                if (repo_path / ".git").exists():
                    return Repo(str(repo_path))
                repo_path = repo_path.parent
            return None
        except Exception:
            return None
    
    def _create_checkpoint_path(self, task_id: str, checkpoint_id: str) -> Path:
        """Create checkpoint file path."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return self.checkpoint_dir / f"{task_id}_{checkpoint_id}_{timestamp}.json"
    
    def create_checkpoint(self, task_id: str, state: Dict[str, Any], checkpoint_type: str = "auto") -> str:
        """Create a new checkpoint for a task."""
        checkpoint_id = f"{checkpoint_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}"
        checkpoint_path = self._create_checkpoint_path(task_id, checkpoint_id)
        
        checkpoint_data = {
            "task_id": task_id,
            "checkpoint_id": checkpoint_id,
            "checkpoint_type": checkpoint_type,
            "timestamp": datetime.now().isoformat(),
            "state": state,
            "git_commit": self._get_current_commit() if self.git_repo else None
        }
        
        with open(checkpoint_path, "w", encoding="utf-8") as f:
            json.dump(checkpoint_data, f, indent=2)
        
        # Auto-commit if Git repo available
        if self.git_repo and checkpoint_type == "auto":
            self._auto_commit_checkpoint(checkpoint_data)
        
        return str(checkpoint_path)
    
    def _get_current_commit(self) -> Optional[str]:
        """Get current Git commit hash."""
        if self.git_repo and self.git_repo.head.is_detached or self.git_repo.head.commit:
            return str(self.git_repo.head.commit.hexsha)
        return None
    
    def _auto_commit_checkpoint(self, checkpoint_data: Dict) -> bool:
        """Auto-commit checkpoint to Git."""
        try:
            if not self.git_repo:
                return False
            
            # Add checkpoint file to Git
            checkpoint_path = self.checkpoint_dir / checkpoint_data["checkpoint_id"].replace(":", "_")
            self.git_repo.index.add([str(checkpoint_path)])
            
            # Commit with message
            commit_message = f"[AUTO] Checkpoint for task {checkpoint_data["task_id"]}"
            self.git_repo.index.commit(commit_message)
            
            return True
        except Exception as e:
            print(f"Warning: Failed to auto-commit checkpoint: {e}")
            return False
    
    def restore_checkpoint(self, checkpoint_path: str) -> Dict[str, Any]:
        """Restore task state from a checkpoint."""
        checkpoint_path = Path(checkpoint_path)
        
        if not checkpoint_path.exists():
            raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")
        
        with open(checkpoint_path, "r", encoding="utf-8") as f:
            checkpoint_data = json.load(f)
        
        return checkpoint_data["state"]
    
    def list_checkpoints(self, task_id: Optional[str] = None) -> List[Dict]:
        """List all checkpoints, optionally filtered by task_id."""
        checkpoints = []
        
        for checkpoint_file in self.checkpoint_dir.glob("*.json"):
            with open(checkpoint_file, "r", encoding="utf-8") as f:
                checkpoint_data = json.load(f)
                
                if task_id is None or checkpoint_data["task_id"] == task_id:
                    checkpoints.append({
                        "task_id": checkpoint_data["task_id"],
                        "checkpoint_id": checkpoint_data["checkpoint_id"],
                        "checkpoint_type": checkpoint_data["checkpoint_type"],
                        "timestamp": checkpoint_data["timestamp"],
                        "file": str(checkpoint_file),
                        "git_commit": checkpoint_data.get("git_commit")
                    })
        
        return sorted(checkpoints, key=lambda x: x["timestamp"], reverse=True)
    
    def rollback(self, task_id: str) -> bool:
        """Rollback task to previous checkpoint by reverting Git commits."""
        try:
            if not self.git_repo:
                return False
            
            # Get checkpoints for this task
            checkpoints = self.list_checkpoints(task_id)
            
            if len(checkpoints) < 2:
                print(f"No previous checkpoint to rollback for task {task_id}")
                return False
            
            # Get the previous checkpoint's git commit
            previous_checkpoint = checkpoints[1]  # Second most recent
            
            if not previous_checkpoint["git_commit"]:
                print(f"Previous checkpoint for task {task_id} has no git commit")
                return False
            
            # Reset to previous commit
            self.git_repo.git.reset("--hard", previous_checkpoint["git_commit"])
            
            print(f"Rolled back task {task_id} to checkpoint: {previous_checkpoint["checkpoint_id"]}")
            return True
            
        except Exception as e:
            print(f"Error during rollback: {e}")
            return False
    
    def clear_checkpoints(self, task_id: Optional[str] = None) -> int:
        """Clear checkpoints, optionally for a specific task."""
        deleted_count = 0
        
        for checkpoint_file in self.checkpoint_dir.glob("*.json"):
            if task_id is None:
                checkpoint_file.unlink()
                deleted_count += 1
            else:
                with open(checkpoint_file, "r", encoding="utf-8") as f:
                    checkpoint_data = json.load(f)
                    
                    if checkpoint_data["task_id"] == task_id:
                        checkpoint_file.unlink()
                        deleted_count += 1
        
        return deleted_count
    
    def get_checkpoint_stats(self) -> Dict:
        """Get statistics about checkpoints."""
        checkpoints = self.list_checkpoints()
        
        return {
            "total_checkpoints": len(checkpoints),
            "tasks_with_checkpoints": len(set(cp["task_id"] for cp in checkpoints)),
            "latest_checkpoint": checkpoints[0]["timestamp"] if checkpoints else None
        }


if __name__ == "__main__":
    # Example usage
    manager = CheckpointManager()
    
    # Create a test checkpoint
    test_state = {"progress": 50, "data": [1, 2, 3]}
    checkpoint_path = manager.create_checkpoint("test_task", test_state, "manual")
    print(f"Created checkpoint: {checkpoint_path}")
    
    # List checkpoints
    checkpoints = manager.list_checkpoints()
    print(f"Checkpoints: {checkpoints}")
    
    # Restore checkpoint
    restored_state = manager.restore_checkpoint(checkpoint_path)
    print(f"Restored state: {restored_state}")