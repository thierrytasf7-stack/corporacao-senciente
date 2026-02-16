"""
aider_with_fallback.py - Bridge script to invoke Aider CLI with fallback behavior.
Called by aider_worker_engine.py as part of the Diana worker pipeline.

Usage:
    python aider_with_fallback.py --yes --message "instructions" --read story.md file1.py file2.py

The --read flag passes files as read-only context to aider (aider sees them
but does not edit them). Positional file arguments are the files aider will edit.
"""

import subprocess
import sys
import os
import argparse


def run_aider(args):
    """Execute aider CLI with given arguments."""
    project_root = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"

    # Build aider command
    cmd = ["aider"]

    if args.yes:
        cmd.append("--yes")

    # Read-only context files (e.g. story .md)
    if args.read:
        for read_file in args.read:
            cmd.extend(["--read", read_file])

    if args.message:
        cmd.extend(["--message", args.message])

    # Editable target files (positional)
    if args.files:
        cmd.extend(args.files)

    print("[AIDER-FALLBACK] Executing: " + " ".join(cmd[:6]) + "...")
    print("[AIDER-FALLBACK] Working dir: " + project_root)
    if args.read:
        print("[AIDER-FALLBACK] Read-only context: " + ", ".join(args.read))
    if args.files:
        print("[AIDER-FALLBACK] Files to edit: " + ", ".join(args.files))
    else:
        print("[AIDER-FALLBACK] No explicit files - aider will auto-detect")

    try:
        result = subprocess.run(
            cmd,
            cwd=project_root,
            timeout=120,  # 2 minute timeout
            check=False,
        )
        return result.returncode
    except subprocess.TimeoutExpired:
        print("[AIDER-FALLBACK] Timeout after 120s. Aider took too long.")
        return 1
    except FileNotFoundError:
        print("[AIDER-FALLBACK] ERROR: aider not found in PATH.")
        print("[AIDER-FALLBACK] Install with: pip install aider-chat")
        return 2
    except Exception as e:
        print("[AIDER-FALLBACK] Unexpected error: " + str(e))
        return 3


def main():
    parser = argparse.ArgumentParser(description="Aider CLI wrapper with fallback")
    parser.add_argument("--yes", action="store_true", help="Auto-confirm prompts")
    parser.add_argument("--message", type=str, help="Instructions for aider")
    parser.add_argument(
        "--read",
        type=str,
        action="append",
        help="Read-only context file (can be repeated). Passed to aider as --read.",
    )
    parser.add_argument("files", nargs="*", help="Source files for aider to edit")

    args = parser.parse_args()
    exit_code = run_aider(args)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
