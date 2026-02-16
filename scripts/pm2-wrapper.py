#!/usr/bin/env python3
"""
PM2 Wrapper - Wrapper para scripts PowerShell no PM2
"""

import sys
import os
import subprocess
from pathlib import Path

# Get arguments: script path is the first arg
script_path = sys.argv[1] if len(sys.argv) > 1 else None
script_name = Path(script_path).name if script_path else None

if not script_path:
    print('Error: No script path provided to wrapper.', file=sys.stderr)
    sys.exit(1)

print(f"PM2 Wrapper starting PowerShell script: {script_name}")
print(f"Path: {script_path}")

# Spawn PowerShell process
try:
    ps = subprocess.Popen(
        ['powershell.exe',
         '-NoProfile',
         '-ExecutionPolicy', 'Bypass',
         '-File', script_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Pipe output to parent
    for line in ps.stdout:
        print(line, end='')

    # Wait for process to complete
    ps.wait()

    if ps.returncode != 0:
        print(f"Subprocess exited with code {ps.returncode}", file=sys.stderr)
        sys.exit(ps.returncode)
    else:
        print(f"Subprocess exited with code {ps.returncode}")

except Exception as e:
    print(f"Failed to start subprocess: {e}", file=sys.stderr)
    sys.exit(1)
