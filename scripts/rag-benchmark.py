#!/usr/bin/env python3
"""
RAG Benchmark Script - Analisa performance do pipeline RAG
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

backend_path = Path(__file__).parent.parent / "apps" / "backend"
sys.path.insert(0, str(backend_path))

from core.services.rag_pipeline import RAGPipeline

class RAGBenchmark:
    def __init__(self):
        self.pipeline = RAGPipeline()
        self.results = {"timestamp": datetime.utcnow().isoformat(), "queries": [], "metrics": {}}
    
    def run_test_queries(self) -> List[Dict[str, Any]]:
        test_queries = [
            {"query": "O que é a Diana?", "expected_sources": ["README", "axioms"], "topic": "sistema"},
            {"query": "Qual é a arquitetura da Diana?", "expected_sources": ["architecture", "FACT-001"], "topic": "arquitetura"},
            {"query": "Como funciona o sistema de workers?", "expected_sources": ["workers", "harmonization"], "topic": "workers"}
        ]
        results = []
        print("🧪 Executando queries de teste...")
        for test in test_queries:
            print(f"\n📝 Query: {test['query']}")
            start_time = datetime.utcnow()
            result = self.pipeline.retrieve_then_generate(query=test["query"], top_k=5, score_threshold=0.8)
            latency = (datetime.utcnow() - start_time).total_seconds() * 1000
            sources = [s["file"] for s in result.get("sources", [])]
            expected = test["expected_sources"]
            found = sum(1 for exp in expected if any(exp.lower() in s.lower() for s in sources))
            recall = (found / len(expected) * 100) if expected else 0
            test_result = {"query": test["query"], "topic": test["topic"], "latency_ms": latency, "num_sources": len(sources), "sources": sources, "recall_percent": recall}
            results.append(test_result)
            print(f"  ⏱️  Latency: {latency:.0f}ms | 📚 Fontes: {len(sources)} | ✅ Recall: {recall:.0f}%")
        return results
    
    def run_benchmark(self):
        print("🚀 Iniciando benchmark RAG...")
        if not self.pipeline.qdrant.health_check():
            return {"error": "Qdrant unavailable"}
        query_results = self.run_test_queries()
        latencies = [r["latency_ms"] for r in query_results]
        recalls = [r["recall_percent"] for r in query_results]
        pipeline_stats = self.pipeline.get_stats()
        self.results["queries"] = query_results
        self.results["metrics"] = {
            "avg_latency_ms": sum(latencies) / len(latencies),
            "max_latency_ms": max(latencies),
            "avg_recall_percent": sum(recalls) / len(recalls),
            "cache_hit_rate_percent": pipeline_stats.get("cache_hit_rate_percent", 0),
            "qdrant_points": pipeline_stats.get("qdrant_stats", {}).get("points_count", 0)
        }
        print(f"\n📊 RESULTADOS: Latency={self.results['metrics']['avg_latency_ms']:.0f}ms | Recall={self.results['metrics']['avg_recall_percent']:.1f}%")
        return self.results

if __name__ == "__main__":
    benchmark = RAGBenchmark()
    results = benchmark.run_benchmark()
    if "error" not in results:
        with open("data/rag_benchmark_report.json", "w") as f:
            json.dump(results, f, indent=2)
        print("💾 Relatório salvo em data/rag_benchmark_report.json")
