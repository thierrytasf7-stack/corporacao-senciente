"""
AIOS Game Interface Bridge
Exports real-time agent and squad status to Software Inc game via JSON
"""

import json
import threading
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional


class GameBridge:
    """Bridge between AIOS core and Software Inc game interface"""

    def __init__(self,
                 export_path: str = "C:/AIOS/agent_status.json",
                 poll_interval: float = 0.5):
        """
        Initialize GameBridge

        Args:
            export_path: Path where JSON status is written (default: C:/AIOS/)
            poll_interval: How often to update JSON in seconds (default: 500ms)
        """
        self.export_path = Path(export_path)
        self.poll_interval = poll_interval
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self._lock = threading.RLock()

        # Create directory if missing
        self.export_path.parent.mkdir(parents=True, exist_ok=True)

    def start(self) -> None:
        """Start the background export thread"""
        with self._lock:
            if self.running:
                print("[GameBridge] Already running")
                return

            self.running = True
            self.thread = threading.Thread(target=self._export_loop, daemon=True)
            self.thread.start()
            print(f"[GameBridge] Started exporting to {self.export_path}")

    def stop(self) -> None:
        """Stop the background export thread"""
        with self._lock:
            self.running = False
            if self.thread:
                self.thread.join(timeout=2.0)
                self.thread = None
        print("[GameBridge] Stopped")

    def _export_loop(self) -> None:
        """Background thread: continuously export agent status"""
        while self.running:
            try:
                data = self._build_agent_data()
                self._write_json_atomic(data)
            except Exception as e:
                print(f"[GameBridge] Export error: {e}")

            time.sleep(self.poll_interval)

    def _build_agent_data(self) -> Dict[str, Any]:
        """
        Build JSON-serializable agent/squad status dictionary

        Extracts from AIOS registries and formats for game consumption.

        Returns:
            Dict with agents and squads arrays
        """
        try:
            agents = self._extract_agents()
            squads = self._extract_squads()
        except Exception as e:
            print(f"[GameBridge] Error extracting data: {e}")
            agents = []
            squads = []

        return {
            "timestamp": datetime.now().isoformat(),
            "agents": agents,
            "squads": squads,
            "status": "active"
        }

    def _extract_agents(self) -> List[Dict[str, Any]]:
        """
        Extract all active agents from AIOS registry

        Returns:
            List of agent dicts with required fields
        """
        agents = []

        # Try to import AIOS registry
        try:
            from aios_core.core.registry import AgentRegistry
            registry = AgentRegistry()

            # Get all registered agents
            for agent_id, agent in registry.get_all_agents().items():
                try:
                    agent_data = {
                        "id": str(agent_id),
                        "name": getattr(agent, "name", agent_id),
                        "status": getattr(agent, "status", "active"),
                        "skill_level": float(getattr(agent, "skill_level", 1.0)),
                        "current_task": getattr(agent, "current_task", None),
                        "persona": getattr(agent, "persona", "Developer"),
                        "cost": float(getattr(agent, "cost_per_use", 0.0))
                    }
                    agents.append(agent_data)
                except Exception as e:
                    print(f"[GameBridge] Error extracting agent {agent_id}: {e}")
                    continue

        except ImportError:
            print("[GameBridge] AgentRegistry not available, returning empty agents")
            agents = []

        return agents

    def _extract_squads(self) -> List[Dict[str, Any]]:
        """
        Extract all active squads from AIOS registry

        Returns:
            List of squad dicts with members and status
        """
        squads = []

        try:
            from aios_core.core.registry import SquadRegistry
            registry = SquadRegistry()

            for squad_id, squad in registry.get_all_squads().items():
                try:
                    squad_data = {
                        "id": str(squad_id),
                        "name": getattr(squad, "name", squad_id),
                        "status": getattr(squad, "status", "active"),
                        "agents_count": len(getattr(squad, "agents", [])),
                        "agents": [str(a) for a in getattr(squad, "agents", [])],
                        "total_tasks": int(getattr(squad, "total_tasks", 0)),
                        "completed_tasks": int(getattr(squad, "completed_tasks", 0)),
                        "cost_accumulated": float(getattr(squad, "cost_accumulated", 0.0))
                    }
                    squads.append(squad_data)
                except Exception as e:
                    print(f"[GameBridge] Error extracting squad {squad_id}: {e}")
                    continue

        except ImportError:
            print("[GameBridge] SquadRegistry not available, returning empty squads")
            squads = []

        return squads

    def _write_json_atomic(self, data: Dict[str, Any]) -> None:
        """
        Write JSON atomically (write to temp, then move)
        Prevents partial writes if process crashes

        Args:
            data: Dictionary to serialize as JSON
        """
        temp_path = self.export_path.with_suffix('.json.tmp')

        try:
            # Write to temp file
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)

            # Atomic move to final path
            temp_path.replace(self.export_path)

        except IOError as e:
            print(f"[GameBridge] Failed to write JSON: {e}")
            # Clean up temp file on error
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except:
                    pass

    def export_agent_status(self) -> None:
        """
        Trigger immediate export of agent status
        Called when agent status changes in real-time
        """
        try:
            data = self._build_agent_data()
            self._write_json_atomic(data)
        except Exception as e:
            print(f"[GameBridge] Error exporting status: {e}")


# Singleton instance for module-level access
_bridge: Optional[GameBridge] = None


def initialize() -> GameBridge:
    """Initialize and start the game bridge (call from AIOS main)"""
    global _bridge
    if _bridge is None:
        _bridge = GameBridge()
        _bridge.start()
    return _bridge


def get_bridge() -> Optional[GameBridge]:
    """Get the current bridge instance"""
    return _bridge


def shutdown() -> None:
    """Shutdown the bridge (call from AIOS shutdown)"""
    global _bridge
    if _bridge:
        _bridge.stop()
        _bridge = None


if __name__ == "__main__":
    # Test the module
    bridge = GameBridge()
    bridge.start()

    print("Bridge running... press Ctrl+C to stop")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        bridge.stop()
        print("Bridge stopped")
