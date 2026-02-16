from pathlib import Path
import os


def get_db_path() -> str:
    """Get path to SQLite database"""
    base_dir = Path.home() / ".az-os"
    base_dir.mkdir(exist_ok=True)
    return str(base_dir / "az_os.db")


def get_config_path() -> str:
    """Get path to configuration file"""
    base_dir = Path.home() / ".az-os"
    base_dir.mkdir(exist_ok=True)
    return str(base_dir / "config.yaml")


def get_logs_dir() -> str:
    """Get path to logs directory"""
    base_dir = Path.home() / ".az-os" / "logs"
    base_dir.mkdir(exist_ok=True, parents=True)
    return str(base_dir)


def get_tasks_dir() -> str:
    """Get path to tasks directory"""
    base_dir = Path.home() / ".az-os" / "tasks"
    base_dir.mkdir(exist_ok=True, parents=True)
    return str(base_dir)


def get_checkpoints_dir() -> str:
    """Get path to checkpoints directory"""
    base_dir = Path.home() / ".az-os" / "checkpoints"
    base_dir.mkdir(exist_ok=True, parents=True)
    return str(base_dir)


def get_cache_dir() -> str:
    """Get path to cache directory"""
    base_dir = Path.home() / ".az-os" / "cache"
    base_dir.mkdir(exist_ok=True, parents=True)
    return str(base_dir)


def get_temp_dir() -> str:
    """Get path to temporary directory"""
    base_dir = Path.home() / ".az-os" / "tmp"
    base_dir.mkdir(exist_ok=True, parents=True)
    return str(base_dir)


def get_storage_path(*parts: str) -> str:
    """Get path to storage location"""
    base_dir = Path.home() / ".az-os" / "storage"
    base_dir.mkdir(exist_ok=True, parents=True)
    return str(base_dir.joinpath(*parts))