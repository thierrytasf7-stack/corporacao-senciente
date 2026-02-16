# AIOS Bridges

System bridges that connect AIOS Core with external systems (games, services, etc).

## Game Interface Bridge

The Game Interface Bridge exports real-time AIOS agent and squad status to Software Inc game via JSON file.

### Overview

- **Purpose:** Provide Software Inc game with live AIOS agent/squad metrics
- **Export Format:** JSON to `C:/AIOS/agent_status.json`
- **Update Frequency:** 500ms (configurable)
- **Thread Model:** Background daemon thread
- **File Safety:** Atomic writes (write to .tmp, then move)

### Usage

#### Automatic Initialization

The bridge initializes automatically when AIOS starts:

```python
# In aios-core/src/main.py
from aios_core.bridges.game_interface import initialize
initialize()  # Starts background export thread
```

#### Manual Usage

```python
from aios_core.bridges.game_interface import GameBridge

# Create bridge instance
bridge = GameBridge(
    export_path="C:/AIOS/agent_status.json",
    poll_interval=0.5  # seconds
)

# Start background export thread
bridge.start()

# Manually trigger export
bridge.export_agent_status()

# Stop when done
bridge.stop()
```

#### Singleton Pattern

```python
from aios_core.bridges.game_interface import initialize, get_bridge, shutdown

# Initialize (creates bridge if needed)
init = initialize()

# Get existing bridge
bridge = get_bridge()

# Shutdown when done
shutdown()
```

### JSON Schema

**File:** `C:/AIOS/agent_status.json`

```json
{
  "timestamp": "2026-02-04T14:30:45.123456",
  "agents": [
    {
      "id": "dev-1",
      "name": "Dex (Builder)",
      "status": "active",
      "skill_level": 1.0,
      "current_task": "Story 1.1.1",
      "persona": "Developer",
      "cost": 0.0
    }
  ],
  "squads": [
    {
      "id": "squad-dev",
      "name": "Dev Squad",
      "status": "active",
      "agents_count": 3,
      "agents": ["dev-1", "qa-1", "architect-1"],
      "total_tasks": 10,
      "completed_tasks": 7,
      "cost_accumulated": 0.0
    }
  ],
  "status": "active"
}
```

### Agent Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique agent identifier |
| `name` | string | Agent display name |
| `status` | string | "active", "idle", "error", "standby" |
| `skill_level` | float | 0.0-1.0 (relative skill rating) |
| `current_task` | string \| null | ID of current task, if any |
| `persona` | string | Agent role/persona |
| `cost` | float | Cost per use (0.0 for Aider agents) |

### Squad Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique squad identifier |
| `name` | string | Squad display name |
| `status` | string | "active", "paused", "error" |
| `agents_count` | int | Number of agents in squad |
| `agents` | array | List of agent IDs |
| `total_tasks` | int | Total tasks assigned to squad |
| `completed_tasks` | int | Number of completed tasks |
| `cost_accumulated` | float | Total AI compute cost for squad |

### Configuration

**Environment Variables:**

```bash
AIOS_GAME_BRIDGE_PATH=C:/AIOS/agent_status.json  # Export path
AIOS_GAME_BRIDGE_INTERVAL=0.5                     # Poll interval (seconds)
AIOS_GAME_BRIDGE_ENABLED=true                     # Enable/disable bridge
```

### Thread Safety

The bridge uses `threading.RLock` to ensure thread-safe access:

```python
# Safe to call from multiple threads
bridge.export_agent_status()  # Thread-safe write
```

### Error Handling

- **Missing registry:** Returns empty agents/squads arrays gracefully
- **File write errors:** Logs error, cleans up temp files, continues
- **Registry import errors:** Logs warning, continues with empty data
- **Extraction errors:** Logs error, continues with available data

All errors are non-fatal and logged to console.

### Performance

- **Background thread overhead:** ~0.1% CPU at 500ms interval
- **File I/O:** ~1-5ms per write operation
- **JSON serialization:** ~0.5-2ms for typical agent/squad data
- **Target:** < 2ms per frame in game

### Testing

Run tests with pytest:

```bash
pytest tests/bridges/test_game_interface.py -v
```

**Test Coverage:**

- Bridge initialization and configuration
- Data generation and JSON serialization
- File I/O and atomic writes
- Background threading and thread safety
- Error handling and graceful degradation
- Singleton pattern behavior

### Integration with Software Inc

**C# Mod - File Watcher:**

```csharp
// In Software Inc mod
FileSystemWatcher watcher = new FileSystemWatcher("C:/AIOS");
watcher.Filter = "agent_status.json";
watcher.Changed += (s, e) => LoadAgentStatus();

void LoadAgentStatus()
{
    string json = File.ReadAllText("C:/AIOS/agent_status.json");
    var data = JsonConvert.DeserializeObject<GameData>(json);
    // Update employees/UI with agent data
}
```

### Troubleshooting

**Bridge not exporting files:**
- Check `C:/AIOS/` directory exists and is writable
- Verify AIOS core is running
- Check logs for initialization errors

**Stale JSON file:**
- Verify bridge thread is running
- Check poll interval setting
- Look for write permission errors in logs

**Game not reading updates:**
- Ensure `agent_status.json` exists
- Verify JSON structure matches schema
- Check file timestamp updates every 500ms

### Future Extensions

- WebSocket real-time updates instead of file polling
- Compression for large agent/squad lists
- Versioning for schema evolution
- Selective field export (reduce file size)
- Caching layer for high-frequency reads
