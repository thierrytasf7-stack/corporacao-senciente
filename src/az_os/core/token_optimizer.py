import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import random


@dataclass
class OptimizationResult:
    original_tokens: int
    optimized_tokens: int
    reduction_percent: float
    cache_hit: bool
    cache_key: Optional[str]


class TokenOptimizer:
    def __init__(self):
        self.cache: Dict[str, str] = {}
        self.cache_hits = 0
        self.cache_misses = 0
        self.cache_ttl = 3600  # 1 hour
        
    def optimize_prompt(self, prompt: str, task_type: str = "generic") -> Tuple[str, OptimizationResult]:
        """Optimize prompt by compressing and summarizing"""
        original_tokens = self._count_tokens(prompt)
        
        # Step 1: Check cache
        cache_key = self._generate_cache_key(prompt, task_type)
        cached_result = self._get_from_cache(cache_key)
        
        if cached_result:
            return cached_result, OptimizationResult(
                original_tokens=original_tokens,
                optimized_tokens=self._count_tokens(cached_result),
                reduction_percent=0,
                cache_hit=True,
                cache_key=cache_key
            )
        
        # Step 2: Remove unnecessary whitespace and comments
        optimized = self._remove_whitespace_and_comments(prompt)
        
        # Step 3: Summarize context if too long
        if original_tokens > 1000:
            optimized = self._summarize_context(optimized)
        
        # Step 4: Compress common patterns
        optimized = self._compress_patterns(optimized)
        
        # Step 5: Remove redundant instructions
        optimized = self._remove_redundant_instructions(optimized)
        
        # Store in cache
        self._set_cache(cache_key, optimized)
        
        optimized_tokens = self._count_tokens(optimized)
        reduction_percent = ((original_tokens - optimized_tokens) / original_tokens) * 100 if original_tokens > 0 else 0
        
        return optimized, OptimizationResult(
            original_tokens=original_tokens,
            optimized_tokens=optimized_tokens,
            reduction_percent=reduction_percent,
            cache_hit=False,
            cache_key=cache_key
        )

    def summarize_context(self, context: str) -> str:
        """Summarize long context to reduce tokens"""
        sentences = self._split_into_sentences(context)
        
        if len(sentences) <= 5:
            return context  # No need to summarize
        
        # Keep key sentences (first, last, and important ones)
        important_sentences = [sentences[0]]  # First sentence
        
        # Add sentences with key terms
        key_terms = ["important", "critical", "must", "should", "because", "therefore"]
        for sentence in sentences[1:-1]:  # Skip first and last
            if any(term.lower() in sentence.lower() for term in key_terms):
                important_sentences.append(sentence)
        
        important_sentences.append(sentences[-1])  # Last sentence
        
        return " ".join(important_sentences)

    def get_cache_hit_rate(self) -> float:
        """Calculate cache hit rate"""
        total = self.cache_hits + self.cache_misses
        return (self.cache_hits / total * 100) if total > 0 else 0

    def _count_tokens(self, text: str) -> int:
        """Simple token counting (whitespace-separated)"""
        return len(text.split())

    def _generate_cache_key(self, prompt: str, task_type: str) -> str:
        """Generate cache key based on prompt content and task type"""
        # Use hash of prompt content for semantic deduplication
        import hashlib
        hash_object = hashlib.md5(prompt.encode())
        return f"{task_type}:{hash_object.hexdigest()[:16]}"

    def _get_from_cache(self, key: str) -> Optional[str]:
        """Get item from cache if not expired"""
        if key in self.cache:
            # Check TTL (simplified - in production use actual timestamps)
            self.cache_hits += 1
            return self.cache[key]
        
        self.cache_misses += 1
        return None

    def _set_cache(self, key: str, value: str):
        """Set item in cache"""
        self.cache[key] = value

    def _remove_whitespace_and_comments(self, text: str) -> str:
        """Remove unnecessary whitespace and comments"""
        # Remove comments (lines starting with # or //)
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('//'):
                cleaned_lines.append(line)
        
        # Join with single spaces
        return ' '.join(cleaned_lines)

    def _compress_patterns(self, text: str) -> str:
        """Compress common patterns and redundant phrases"""
        patterns = [
            (r'Please do not', 'Do not'),
            (r'In order to', 'To'),
            (r'Due to the fact that', 'Because'),
            (r'At this point in time', 'Now'),
            (r'In the event that', 'If'),
            (r'With regards to', 'About'),
            (r'Please make sure to', 'Ensure'),
            (r'It is important to note that', ''),  # Remove entirely
            (r'The following', ''),  # Remove entirely
        ]
        
        for pattern, replacement in patterns:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        return text

    def _remove_redundant_instructions(self, text: str) -> str:
        """Remove redundant instructions and clarifications"""
        # Remove duplicate instructions
        instructions = [
            "be concise",
            "be brief",
            "be clear",
            "be detailed",
            "provide examples",
            "explain step by step"
        ]
        
        for instruction in instructions:
            # Remove duplicate occurrences
            pattern = re.compile(rf'({instruction})[^.]*\.?', re.IGNORECASE)
            matches = list(pattern.finditer(text))
            
            if len(matches) > 1:
                # Keep first occurrence, remove others
                for match in matches[1:]:
                    text = text[:match.start()] + text[match.end():]
        
        return text

    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitter (can be improved with NLP)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]


# CLI Command
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Token Optimizer CLI")
    parser.add_argument("command", choices=["optimize", "stats", "cache-stats"], help="Command to execute")
    parser.add_argument("--prompt", type=str, help="Prompt to optimize")
    parser.add_argument("--task-type", type=str, default="generic", help="Task type")
    
    args = parser.parse_args()
    
    optimizer = TokenOptimizer()
    
    if args.command == "optimize":
        if not args.prompt:
            print("Error: --prompt is required")
            exit(1)
        
        optimized, result = optimizer.optimize_prompt(args.prompt, args.task_type)
        print(f"Original tokens: {result.original_tokens}")
        print(f"Optimized tokens: {result.optimized_tokens}")
        print(f"Reduction: {result.reduction_percent:.1f}%")
        print(f"Cache hit: {result.cache_hit}")
        print(f"\nOptimized prompt:\n{optimized}")
    
    elif args.command == "stats":
        print(f"Cache hit rate: {optimizer.get_cache_hit_rate():.1f}%")
    
    elif args.command == "cache-stats":
        print(f"Cache size: {len(optimizer.cache)} items")
        print(f"Cache hits: {optimizer.cache_hits}")
        print(f"Cache misses: {optimizer.cache_misses}")