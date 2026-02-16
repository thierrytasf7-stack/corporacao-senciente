"""RAG Engine for semantic search via ChromaDB."""
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import json


class RAGEngine:
    """Semantic search and context retrieval via embeddings."""

    def __init__(self, db=None, embedding_model: str = "all-MiniLM-L6-v2"):
        """Initialize RAG engine."""
        self.db = db
        self.embedding_model = embedding_model
        self.documents = []
        self.embeddings_cache = {}
        self.initialized = False

    def initialize(self):
        """Initialize RAG engine and index documents."""
        try:
            import chromadb
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.get_or_create_collection(
                name="az-os-docs",
                metadata={"hnsw:space": "cosine"}
            )
            self.initialized = True
        except ImportError:
            print("⚠️  ChromaDB not installed. RAG disabled. Install: pip install chromadb")
            self.initialized = False
            return

        # Auto-index project docs
        self._index_project_docs()

    def _index_project_docs(self):
        """Auto-index README and architecture docs."""
        docs_to_index = [
            Path("az-os/README.md"),
            Path("docs/architecture/az-os-system-architecture.md"),
            Path("docs/architecture/az-os-api-design.md"),
        ]

        for doc_path in docs_to_index:
            if doc_path.exists():
                try:
                    content = doc_path.read_text()
                    self.index_document(str(doc_path), content)
                except Exception as e:
                    print(f"⚠️  Failed to index {doc_path}: {e}")

    def index_document(self, doc_id: str, content: str, metadata: Optional[Dict] = None):
        """Index a document with embeddings."""
        if not self.initialized:
            return

        try:
            # Simple chunking (512 chars per chunk)
            chunk_size = 512
            chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]

            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}#chunk-{i}"
                self.collection.add(
                    ids=[chunk_id],
                    documents=[chunk],
                    metadatas=[{
                        "doc_id": doc_id,
                        "chunk_index": i,
                        **(metadata or {})
                    }]
                )
        except Exception as e:
            print(f"⚠️  Failed to index document: {e}")

    def search(self, query: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """Search for relevant documents (returns top K with similarity scores)."""
        if not self.initialized:
            return []

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k
            )

            # Format results as (content, similarity_score)
            if results and results['documents']:
                return list(zip(
                    results['documents'][0],
                    [1.0 - d for d in (results['distances'][0] if results['distances'] else [])]
                ))
            return []
        except Exception as e:
            print(f"⚠️  Search failed: {e}")
            return []

    def get_context(self, task_id: str, query: Optional[str] = None) -> str:
        """Get relevant context for a task (for prompt injection)."""
        if not self.initialized:
            return ""

        # Use task description or custom query
        search_query = query or f"task {task_id}"

        # Get top 3 documents
        results = self.search(search_query, top_k=3)

        # Format as markdown context
        context = "## Relevant Documentation\n\n"
        for content, score in results:
            context += f"- (Relevance: {score:.2%})\n{content[:200]}...\n\n"

        return context if len(results) > 0 else ""

    def clear_collection(self):
        """Clear all indexed documents."""
        if self.initialized:
            try:
                self.chroma_client.delete_collection(name="az-os-docs")
                self.collection = self.chroma_client.get_or_create_collection(
                    name="az-os-docs"
                )
            except Exception as e:
                print(f"⚠️  Failed to clear collection: {e}")

    def get_stats(self) -> Dict:
        """Get RAG engine statistics."""
        if not self.initialized:
            return {"status": "disabled", "reason": "ChromaDB not installed"}

        try:
            count = self.collection.count()
            return {
                "status": "initialized",
                "indexed_documents": count,
                "model": self.embedding_model,
                "collection": "az-os-docs"
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
