"""
AIOS Core - Main Entry Point
Initializes all subsystems including game bridge
"""

import sys
import atexit
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def initialize_bridges():
    """Initialize all system bridges (game interface, etc)"""
    try:
        from aios_core.bridges.game_interface import initialize as init_game_bridge
        print("[AIOS] Initializing game bridge...")
        init_game_bridge()
        print("[AIOS] Game bridge initialized successfully")
    except Exception as e:
        print(f"[AIOS] Warning: Game bridge initialization failed: {e}")


def shutdown_bridges():
    """Shutdown all system bridges on exit"""
    try:
        from aios_core.bridges.game_interface import shutdown as shutdown_game_bridge
        print("[AIOS] Shutting down game bridge...")
        shutdown_game_bridge()
        print("[AIOS] Game bridge shutdown complete")
    except Exception as e:
        print(f"[AIOS] Warning: Game bridge shutdown failed: {e}")


def main():
    """Main entry point for AIOS core"""
    print("[AIOS] Starting AIOS Core...")

    # Register shutdown handlers
    atexit.register(shutdown_bridges)

    # Initialize bridges
    initialize_bridges()

    print("[AIOS] AIOS Core ready")

    # Main loop would go here
    # For now, this is a placeholder for integration
    return 0


if __name__ == "__main__":
    sys.exit(main())
