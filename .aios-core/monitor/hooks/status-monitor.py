#!/usr/bin/env python3
"""
Status Monitor Hook - Real-time economy/consumption display for Dev-Aider

Captures dev-aider executions and accumulates cost/token savings.
Updates statusline display and persistent storage.
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Add lib to path
sys.path.insert(0, os.path.dirname(__file__))

from lib.send_event import send_event
from lib.enrich import enrich_event


class StatusMonitor:
    def __init__(self):
        self.data_dir = Path.home() / '.aios' / 'monitor'
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.stats_file = self.data_dir / 'dev-aider-stats.json'
        self.load_stats()

    def load_stats(self):
        """Load existing stats or initialize new"""
        if self.stats_file.exists():
            try:
                with open(self.stats_file, 'r') as f:
                    self.stats = json.load(f)
            except (json.JSONDecodeError, IOError):
                self.stats = self._init_stats()
        else:
            self.stats = self._init_stats()

    def _init_stats(self):
        """Initialize empty stats"""
        return {
            'total_tasks': 0,
            'aider_tasks': 0,
            'claude_tasks': 0,
            'total_tokens': 0,
            'total_saved': 0.0,
            'last_updated': None,
            'last_task': None,
            'session_start': datetime.now().isoformat(),
            'breakdown': {
                'implementation': 0,
                'refactoring': 0,
                'testing': 0,
                'documentation': 0,
                'other': 0
            }
        }

    def save_stats(self):
        """Persist stats to file"""
        self.stats['last_updated'] = datetime.now().isoformat()
        try:
            with open(self.stats_file, 'w') as f:
                json.dump(self.stats, f, indent=2)
        except IOError as e:
            print(f"⚠️  Failed to save stats: {e}", file=sys.stderr)

    def process_aider_execution(self, data):
        """Process dev-aider squad execution"""
        task_type = data.get('task_type', 'other')
        tokens = data.get('tokens', 0)
        savings = data.get('cost_savings', 0.0)

        # Update counters
        self.stats['total_tasks'] += 1
        self.stats['aider_tasks'] += 1
        self.stats['total_tokens'] += tokens
        self.stats['total_saved'] += savings

        # Update breakdown
        if task_type in self.stats['breakdown']:
            self.stats['breakdown'][task_type] += 1
        else:
            self.stats['breakdown']['other'] += 1

        # Store last task info
        self.stats['last_task'] = {
            'timestamp': datetime.now().isoformat(),
            'type': task_type,
            'tokens': tokens,
            'savings': savings,
            'status': 'completed'
        }

        self.save_stats()
        return self.format_status()

    def process_claude_execution(self, data):
        """Process escalated Claude execution"""
        tokens = data.get('tokens', 0)

        # Update counters
        self.stats['total_tasks'] += 1
        self.stats['claude_tasks'] += 1
        self.stats['total_tokens'] += tokens

        # Store last task info
        self.stats['last_task'] = {
            'timestamp': datetime.now().isoformat(),
            'type': 'claude_escalation',
            'tokens': tokens,
            'savings': 0.0,
            'status': 'completed'
        }

        self.save_stats()
        return self.format_status()

    def format_status(self):
        """Format status for display in statusline"""
        saved_display = f"${self.stats['total_saved']:.2f}" if self.stats['total_saved'] > 0 else "$0"

        return f"💰 {saved_display} saved | 🤖 {self.stats['aider_tasks']} Aider | 🧠 {self.stats['claude_tasks']} Claude"

    def get_full_status(self):
        """Get detailed status for /aios:status-monitor command"""
        return {
            'summary': self.format_status(),
            'stats': self.stats,
            'breakdown': self._get_breakdown_text()
        }

    def _get_breakdown_text(self):
        """Generate breakdown text for display"""
        breakdown = self.stats['breakdown']
        items = []
        for task_type, count in breakdown.items():
            if count > 0:
                items.append(f"  • {task_type.capitalize()}: {count}")

        return "\n".join(items) if items else "  No tasks yet"


def main():
    """Main hook entry point"""
    try:
        # Read event from stdin
        data = json.load(sys.stdin)

        monitor = StatusMonitor()

        # Determine event source
        if 'aider_execution' in data or data.get('agent') == 'aider-dev':
            result = monitor.process_aider_execution(data)
        elif 'claude_execution' in data or data.get('agent') == 'dev':
            result = monitor.process_claude_execution(data)
        else:
            # Unknown event, just pass through
            result = monitor.format_status()

        # Enrich and send event
        data = enrich_event(data)
        data['status_display'] = result

        # Send to monitor server
        send_event("StatusMonitor", data)

        # Output to stderr for statusline display
        print(result, file=sys.stderr)

    except Exception as e:
        print(f"❌ Status Monitor Error: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
