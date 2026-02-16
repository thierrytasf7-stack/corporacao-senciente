import typer
from typing import Optional, List
from pathlib import Path
from ..core.memory_manager import MemoryManager
from ..storage import Storage

app = typer.Typer()

storage = Storage()
memory_manager = MemoryManager(storage)


@app.command()
def list(limit: int = 20, tag: Optional[str] = None):
    """List memory entries"""
    try:
        memories = memory_manager.memories
        
        if tag:
            memories = [m for m in memories if tag in m.get('tags', [])]
        
        if not memories:
            typer.echo("No memories found")
            return
        
        typer.echo(f"\nMemory Entries ({len(memories)} total)")
        typer.echo("=" * 50)
        
        for i, memory in enumerate(memories[:limit]):
            typer.echo(f"\n[{i+1}] Memory ID: {memory['memory_id'][:12]}...")
            typer.echo(f"    Content: {memory['content'][:100]}...")
            typer.echo(f"    Context: {memory['context'][:50]}...")
            typer.echo(f"    Tags: {', '.join(memory['tags'])}")
            typer.echo(f"    Priority: {memory['priority']}")
            typer.echo(f"    Usage: {memory['usage_count']}")
            typer.echo(f"    Relevance: {memory['relevance_score']:.3f}")
            typer.echo(f"    Source: {memory['source']}")
            typer.echo(f"    Created: {memory['created_at']}")
        
        if len(memories) > limit:
            typer.echo(f"\n... and {len(memories) - limit} more")
            
    except Exception as e:
        typer.echo(f"Error listing memories: {e}")
        raise typer.Exit(1)


@app.command()
def search(query: str, limit: int = 5):
    """Search memories"""
    try:
        results = memory_manager.search_memories(query, top_k=limit)
        
        if not results:
            typer.echo("No matching memories found")
            return
        
        typer.echo(f"\nSearch Results for: {query}")
        typer.echo("=" * 50)
        
        for i, memory in enumerate(results):
            typer.echo(f"\n[{i+1}] Score: {memory['relevance_score']:.3f}")
            typer.echo(f"    Content: {memory['content'][:150]}...")
            typer.echo(f"    Context: {memory['context'][:75]}...")
            typer.echo(f"    Tags: {', '.join(memory['tags'])}")
            typer.echo(f"    Priority: {memory['priority']}")
            typer.echo(f"    Usage: {memory['usage_count']}")
            typer.echo(f"    Source: {memory['source']}")
            typer.echo(f"    Created: {memory['created_at']}")
        
    except Exception as e:
        typer.echo(f"Error searching memories: {e}")
        raise typer.Exit(1)


@app.command()
def add(content: str, 
        context: str = "", 
        tags: List[str] = [], 
        priority: int = 1, 
        source: str = "user"):
    """Add a new memory entry"""
    try:
        memory_id = memory_manager.add_memory(
            content=content,
            context=context,
            tags=tags,
            priority=priority,
            source=source
        )
        typer.echo(f"Memory added successfully: {memory_id}")
        
    except Exception as e:
        typer.echo(f"Error adding memory: {e}")
        raise typer.Exit(1)


@app.command()
def consolidate(similarity_threshold: float = 0.8):
    """Consolidate similar memories"""
    try:
        consolidated_count = memory_manager.consolidate_memories(similarity_threshold)
        typer.echo(f"Consolidated {consolidated_count} memories")
        
    except Exception as e:
        typer.echo(f"Error consolidating memories: {e}")
        raise typer.Exit(1)


@app.command()
def clear():
    """Clear all memories"""
    try:
        confirm = typer.confirm("Are you sure you want to clear all memories? This action cannot be undone.")
        if not confirm:
            typer.echo("Operation cancelled")
            return
        
        deleted_count = memory_manager.clear_memories()
        typer.echo(f"Deleted {deleted_count} memories")
        
    except Exception as e:
        typer.echo(f"Error clearing memories: {e}")
        raise typer.Exit(1)


@app.command()
def stats():
    """Show memory statistics"""
    try:
        stats = memory_manager.get_memory_stats()
        
        typer.echo(f"\nMemory Statistics")
        typer.echo("=" * 50)
        typer.echo(f"Total Memories: {stats['total_memories']}")
        typer.echo(f"Total Usage: {stats['total_usage']}")
        typer.echo(f"Avg Usage/Memory: {stats['avg_usage_per_memory']:.2f}")
        typer.echo(f"Priority Distribution: {stats['priority_distribution']}")
        typer.echo(f"Top Tags: {stats['top_tags']}")
        
    except Exception as e:
        typer.echo(f"Error getting memory stats: {e}")
        raise typer.Exit(1)
