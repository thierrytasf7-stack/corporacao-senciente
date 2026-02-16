# AZ-OS Performance Architecture

## Performance Targets
- **CLI Response Time**: <100ms for interactive commands
- **UI Responsiveness**: 60 FPS (16.67ms frame budget)
- **Memory Usage**: <500MB baseline, <1GB under load
- **Startup Time**: <2 seconds cold start

## Async Patterns

### Core Async Strategy
```python
# Event-driven architecture with asyncio
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AsyncExecutor:
    def __init__(self):
        self.loop = asyncio.get_event_loop()
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        
    async def run_async(self, func, *args, **kwargs):
        return await self.loop.run_in_executor(self.thread_pool, func, *args, **kwargs)
```

### Concurrent Execution Patterns
```python
# Batch processing with asyncio.gather
async def process_batch(tasks):
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if not isinstance(r, Exception)]

# Streaming results for large datasets
async def stream_results(query, chunk_size=100):
    async for chunk in query.yield_per(chunk_size):
        yield chunk
```

### Task Prioritization
```python
# Priority-based task queue
import heapq

class PriorityTaskQueue:
    def __init__(self):
        self.heap = []
        self.counter = 0
    
    def add_task(self, priority, task):
        heapq.heappush(self.heap, (priority, self.counter, task))
        self.counter += 1
    
    async def process_tasks(self):
        while self.heap:
            _, _, task = heapq.heappop(self.heap)
            await task()
```

## Caching Strategies

### K-LRU Cache Implementation
```python
# K-LRU (K-Recently Used) for CLI results
from collections import OrderedDict
import time

class KLRUCache:
    def __init__(self, capacity=100, k=5):
        self.capacity = capacity
        self.k = k
        self.cache = OrderedDict()
        self.access_times = {}
    
    def get(self, key):
        if key in self.cache:
            self.access_times[key] = time.time()
            self.cache.move_to_end(key)
            return self.cache[key]
        return None
    
    def set(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        self.access_times[key] = time.time()
        
        # Evict if over capacity
        if len(self.cache) > self.capacity:
            self._evict()
    
    def _evict(self):
        # Evict least recently used, but keep last K items
        items_to_evict = len(self.cache) - self.capacity + self.k
        for _ in range(items_to_evict):
            oldest = next(iter(self.cache))
            del self.cache[oldest]
            del self.access_times[oldest]
```

### Cache Invalidation Strategies
```python
# Time-based invalidation
class TimeBasedCache:
    def __init__(self, ttl=300):
        self.ttl = ttl
        self.cache = {}
        self.timestamps = {}
    
    def get(self, key):
        if key in self.cache and (time.time() - self.timestamps[key] < self.ttl):
            return self.cache[key]
        return None
    
    def set(self, key, value):
        self.cache[key] = value
        self.timestamps[key] = time.time()
```

## Connection Pooling

### SQLite Connection Pool
```python
# Thread-safe SQLite connection pool
import sqlite3
from queue import Queue

class SQLitePool:
    def __init__(self, db_path, max_connections=10):
        self.db_path = db_path
        self.pool = Queue(maxsize=max_connections)
        
        # Pre-create connections
        for _ in range(max_connections):
            conn = sqlite3.connect(db_path, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            self.pool.put(conn)
    
    def get_connection(self):
        return self.pool.get()
    
    def release_connection(self, conn):
        self.pool.put(conn)
    
    def execute(self, query, params=()):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            result = cursor.fetchall()
            conn.commit()
            return result
        finally:
            self.release_connection(conn)
```

### LLM Connection Pool
```python
# LLM API connection pool with rate limiting
import time
from collections import deque

class LLMConnectionPool:
    def __init__(self, max_connections=5, rate_limit=60):
        self.max_connections = max_connections
        self.rate_limit = rate_limit
        self.connections = deque()
        self.request_times = deque()
    
    async def get_connection(self):
        # Wait if rate limit exceeded
        current_time = time.time()
        while len(self.request_times) >= self.rate_limit:
            oldest = self.request_times[0]
            if current_time - oldest < 60:
                await asyncio.sleep(1)
                current_time = time.time()
            else:
                self.request_times.popleft()
        
        # Create new connection if available
        if len(self.connections) < self.max_connections:
            conn = await self._create_llm_connection()
            self.connections.append(conn)
        
        self.request_times.append(current_time)
        return self.connections[0]
    
    async def _create_llm_connection(self):
        # Implementation-specific connection setup
        pass
```

## Performance Monitoring

### Metrics Collection
```python
# Performance metrics collection
import time
from contextlib import contextmanager

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {}
    
    @contextmanager
    def timed_operation(self, operation_name):
        start_time = time.perf_counter()
        try:
            yield
        finally:
            duration = time.perf_counter() - start_time
            self.metrics[operation_name] = self.metrics.get(operation_name, []) + [duration]
    
    def get_stats(self):
        stats = {}
        for op, durations in self.metrics.items):
            stats[op] = {
                'count': len(durations),
                'avg': sum(durations) / len(durations),
                'max': max(durations),
                'min': min(durations)
            }
        return stats
```

### Memory Profiling
```python
# Memory usage monitoring
import tracemalloc

class MemoryProfiler:
    def __init__(self):
        tracemalloc.start()
        self.snapshots = []
    
    def take_snapshot(self):
        self.snapshots.append(tracemalloc.take_snapshot())
    
    def get_memory_stats(self):
        if len(self.snapshots) < 2:
            return None
        
        stats = self.snapshots[-1].compare_to(self.snapshots[-2], 'lineno')
        return {
            'total': sum(stat.size_diff for stat in stats),
            'top_consumers': [stat for stat in stats[:10]]
        }
```

## Optimization Strategies

### Lazy Loading
```python
# Lazy loading for expensive operations
class LazyLoader:
    def __init__(self, loader_func):
        self.loader_func = loader_func
        self._value = None
        self._loaded = False
    
    @property
    def value(self):
        if not self._loaded:
            self._value = self.loader_func()
            self._loaded = True
        return self._value
```

### Prefetching
```python
# Predictive prefetching
class Prefetcher:
    def __init__(self):
        self.prefetch_queue = asyncio.Queue()
    
    async def prefetch(self, predictor_func):
        while True:
            # Predict next needed data
            next_data = predictor_func()
            if next_data:
                await self.prefetch_queue.put(next_data)
            await asyncio.sleep(0.1)
```

## Error Handling & Recovery

### Circuit Breaker Pattern
```python
# Circuit breaker for external dependencies
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    async def call(self, func, *args, **kwargs):
        if self.state == 'OPEN':
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = 'HALF_OPEN'
            else:
                raise Exception('Circuit breaker is OPEN')
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _on_success(self):
        self.failure_count = 0
        self.state = 'CLOSED'
    
    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = 'OPEN'
```