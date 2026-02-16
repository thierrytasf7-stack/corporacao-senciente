from pathlib import Path
import json
from typing import Dict, Any

class FileManager:
    """Manages file operations for AZ-OS."""
    
    def __init__(self, base_dir: str = '.az-os'):
        self.base_dir = Path.home() / base_dir
        self.base_dir.mkdir(exist_ok=True)
    
    def read_file(self, filename: str) -> str:
        """Read file content."""
        path = self.base_dir / filename
        if path.exists():
            return path.read_text()
        return ''
    
    def write_file(self, filename: str, content: str) -> None:
        """Write content to file."""
        path = self.base_dir / filename
        path.write_text(content)
    
    def list_files(self) -> list[str]:
        """List all files in base directory."""
        return [f.name for f in self.base_dir.iterdir() if f.is_file()]
    
    def delete_file(self, filename: str) -> bool:
        """Delete file."""
        path = self.base_dir / filename
        if path.exists():
            path.unlink()
            return True
        return False