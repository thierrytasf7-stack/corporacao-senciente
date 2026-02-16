"""
Tests for GameBridge - AIOS game interface module
"""

import json
import pytest
import tempfile
import time
from pathlib import Path
from unittest.mock import patch, MagicMock

from aios_core.bridges.game_interface import (
    GameBridge,
    initialize,
    shutdown,
    get_bridge
)


class TestGameBridgeInitialization:
    """Test GameBridge initialization and setup"""

    def test_bridge_instantiates(self):
        """Test GameBridge can be instantiated"""
        with tempfile.TemporaryDirectory() as tmpdir:
            bridge = GameBridge(export_path=f"{tmpdir}/test.json")
            assert bridge is not None
            assert bridge.poll_interval == 0.5
            assert bridge.running is False

    def test_creates_export_directory(self):
        """Test GameBridge creates export directory if missing"""
        with tempfile.TemporaryDirectory() as tmpdir:
            nested_path = f"{tmpdir}/new/nested/dir/test.json"
            bridge = GameBridge(export_path=nested_path)
            assert Path(nested_path).parent.exists()

    def test_custom_poll_interval(self):
        """Test custom poll interval can be set"""
        bridge = GameBridge(poll_interval=1.0)
        assert bridge.poll_interval == 1.0


class TestGameBridgeDataGeneration:
    """Test data generation and JSON serialization"""

    def test_build_agent_data_returns_dict(self):
        """Test _build_agent_data returns valid dict"""
        bridge = GameBridge()
        data = bridge._build_agent_data()

        assert isinstance(data, dict)
        assert "timestamp" in data
        assert "agents" in data
        assert "squads" in data
        assert "status" in data

    def test_build_agent_data_json_serializable(self):
        """Test generated data is JSON-serializable"""
        bridge = GameBridge()
        data = bridge._build_agent_data()

        # Should not raise exception
        json_str = json.dumps(data)
        assert isinstance(json_str, str)
        assert len(json_str) > 0

    def test_extract_agents_returns_list(self):
        """Test _extract_agents returns empty list gracefully"""
        bridge = GameBridge()
        agents = bridge._extract_agents()

        assert isinstance(agents, list)
        # Will be empty if AgentRegistry not available
        for agent in agents:
            assert isinstance(agent, dict)
            assert "id" in agent
            assert "name" in agent
            assert "status" in agent

    def test_extract_squads_returns_list(self):
        """Test _extract_squads returns empty list gracefully"""
        bridge = GameBridge()
        squads = bridge._extract_squads()

        assert isinstance(squads, list)
        # Will be empty if SquadRegistry not available
        for squad in squads:
            assert isinstance(squad, dict)
            assert "id" in squad
            assert "name" in squad


class TestGameBridgeFileIO:
    """Test file I/O and atomic writes"""

    def test_write_json_atomic_creates_file(self):
        """Test _write_json_atomic creates JSON file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path)

            test_data = {"test": "data", "count": 42}
            bridge._write_json_atomic(test_data)

            assert Path(export_path).exists()
            with open(export_path) as f:
                loaded = json.load(f)
            assert loaded == test_data

    def test_write_json_atomic_overwrites(self):
        """Test _write_json_atomic overwrites existing file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path)

            bridge._write_json_atomic({"version": 1})
            bridge._write_json_atomic({"version": 2})

            with open(export_path) as f:
                loaded = json.load(f)
            assert loaded["version"] == 2

    def test_write_json_no_temp_files_left(self):
        """Test _write_json_atomic doesn't leave temp files"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path)

            bridge._write_json_atomic({"test": "data"})

            files = list(Path(tmpdir).glob("*.tmp"))
            assert len(files) == 0, "Temp files should be cleaned up"


class TestGameBridgeThreading:
    """Test background thread execution and thread safety"""

    def test_bridge_starts_and_stops(self):
        """Test bridge can start and stop cleanly"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path)

            bridge.start()
            assert bridge.running is True
            assert bridge.thread is not None

            bridge.stop()
            assert bridge.running is False
            # Give thread time to join
            time.sleep(0.2)
            assert bridge.thread is None

    def test_bridge_exports_periodically(self):
        """Test bridge exports JSON periodically"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path, poll_interval=0.1)

            bridge.start()
            time.sleep(0.3)  # Wait for at least 2 exports
            bridge.stop()

            assert Path(export_path).exists()
            with open(export_path) as f:
                data = json.load(f)
            assert "timestamp" in data

    def test_bridge_thread_safe(self):
        """Test bridge is thread-safe under concurrent access"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path, poll_interval=0.1)

            bridge.start()

            # Simulate rapid status updates
            for i in range(10):
                bridge.export_agent_status()
                time.sleep(0.05)

            bridge.stop()

            # File should exist and be readable
            assert Path(export_path).exists()
            with open(export_path) as f:
                data = json.load(f)
            assert isinstance(data, dict)

    def test_export_status_manual_trigger(self):
        """Test export_agent_status can be called manually"""
        with tempfile.TemporaryDirectory() as tmpdir:
            export_path = f"{tmpdir}/test.json"
            bridge = GameBridge(export_path=export_path)

            bridge.export_agent_status()

            assert Path(export_path).exists()
            with open(export_path) as f:
                data = json.load(f)
            assert data["status"] == "active"


class TestGameBridgeSingleton:
    """Test singleton pattern for bridge management"""

    def test_initialize_creates_bridge(self):
        """Test initialize() creates bridge instance"""
        shutdown()  # Clear any existing bridge

        bridge = initialize()
        assert bridge is not None
        assert isinstance(bridge, GameBridge)
        assert bridge.running is True

        shutdown()

    def test_get_bridge_returns_instance(self):
        """Test get_bridge() returns current bridge"""
        shutdown()  # Clear any existing bridge

        initialize()
        bridge = get_bridge()

        assert bridge is not None
        assert isinstance(bridge, GameBridge)

        shutdown()

    def test_shutdown_cleans_up(self):
        """Test shutdown() properly cleans up"""
        initialize()
        shutdown()

        bridge = get_bridge()
        assert bridge is None


class TestGameBridgeErrorHandling:
    """Test error handling and edge cases"""

    def test_bridge_handles_bad_export_path(self):
        """Test bridge handles invalid export paths gracefully"""
        # Use a path that can't be written (e.g., /root/ on Linux)
        # This is platform-specific, so just test error handling exists
        bridge = GameBridge(export_path="/nonexistent/path/file.json")

        # Should not crash when trying to write
        bridge.export_agent_status()

    def test_bridge_handles_registry_import_error(self):
        """Test bridge handles missing registry modules gracefully"""
        bridge = GameBridge()

        # Should return empty lists, not crash
        agents = bridge._extract_agents()
        squads = bridge._extract_squads()

        assert agents == []
        assert squads == []

    def test_bridge_continues_on_extract_error(self):
        """Test bridge continues even if extraction fails"""
        bridge = GameBridge()

        # Monkey-patch to force error
        def bad_extract_agents():
            raise RuntimeError("Intentional test error")

        bridge._extract_agents = bad_extract_agents

        # Should still work and return data with empty agents
        data = bridge._build_agent_data()
        assert data["agents"] == []


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
