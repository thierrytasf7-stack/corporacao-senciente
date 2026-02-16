"""
ChromaDB RAG Engine for semantic search and document retrieval.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple

import chromadb
from chromadb.config import Settings
from chromadb.persistence.models import Document
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class RAGEngine:
    """ChromaDB-based RAG engine for semantic document search."""
    
    def __init__(self, collection_name: str = "az_os_docs"):
        self.collection_name = collection_name
        self.embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        self.chroma_settings = Settings(
            chroma_db_impl=chromadb.persistence.SQLiteImpl,
            persist_directory=str(Path(".az-os/chroma")),
            verbose=True
        )
        self.client = chromadb.PersistentClient(settings=self.chroma_settings)
        self.collection = self._get_or_create_collection()
    
    def _get_or_create_collection(self) -> chromadb.Collection:
        """Get or create ChromaDB collection."""
        try:
            return self.client.get_collection(name=self.collection_name)
        except chromadb.errors.CollectionNotFoundError:
            return self.client.create_collection(
                name=self.collection_name,
                metadata={}
            )
    
    def _chunk_document(self, content: str, chunk_size: int = 512) -> List[str]:
        """Split document into chunks of approximately chunk_size tokens."""
        chunks = []
        words = content.split()
        current_chunk = []
        current_length = 0
        
        for word in words:
            current_chunk.append(word)
            current_length += len(word) + 1  # +1 for space
            
            if current_length >= chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_length = 0
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def _embed_text(self, text: str) -> List[float]:
        """Generate embeddings for text using pre-trained model."""
        return self.embedding_model.encode(text, convert_to_numpy=True).tolist()
    
    def index_documents(self, documents: List[Dict[str, str]]) -> None:
        """Index multiple documents into ChromaDB collection."""
        for doc in documents:
            self.index_document(
                title=doc.get("title", "Untitled"),
                content=doc.get("content", ""),
                metadata=doc.get("metadata", {})
            )
    
    def index_document(self, title: str, content: str, metadata: Dict = None) -> None:
        """Index a single document into ChromaDB collection."""
        if metadata is None:
            metadata = {}
        
        chunks = self._chunk_document(content)
        
        for i, chunk in enumerate(chunks):
            embeddings = self._embed_text(chunk)
            
            document = Document(
                ids=f"{title}_chunk_{i}",
                texts=chunk,
                metadatas={
                    "title": title,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    **metadata
                },
                embeddings=embeddings
            )
            
            self.collection.add([document])
    
    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search documents using semantic similarity."""
        query_embedding = self._embed_text(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where="",
            include=["metadatas", "texts"]
        )
        
        return [
            {
                "title": doc.metadatas["title"],
                "content": doc.texts,
                "metadata": doc.metadatas,
                "score": 1.0  # ChromaDB doesn't return scores directly
            }
            for doc in results.documents
        ]
    
    def get_context(self, task_id: str) -> List[Dict]:
        """Get context for a specific task using task metadata."""
        # This would integrate with task storage to get task context
        # For now, return empty context
        return []
    
    def auto_index_project_docs(self, project_root: str = ".") -> None:
        """Auto-index project documentation files."""
        project_path = Path(project_root)
        
        # Index README files
        readme_paths = [
            project_path / "README.md",
            project_path / "README.rst",
            project_path / "readme.md"
        ]
        
        for readme_path in readme_paths:
            if readme_path.exists():
                with open(readme_path, "r", encoding="utf-8") as f:
                    content = f.read()
                self.index_document(
                    title=f"README_{readme_path.name}",
                    content=content,
                    metadata={"type": "README"}
                )
        
        # Index architecture files
        arch_patterns = ["ARCHITECTURE.md", "ARCHITECTURE.rst", "docs/**/*.md"]
        for pattern in arch_patterns:
            for arch_file in project_path.rglob(pattern):
                if arch_file.is_file():
                    with open(arch_file, "r", encoding="utf-8") as f:
                        content = f.read()
                    self.index_document(
                        title=f"ARCH_{arch_file.name}",
                        content=content,
                        metadata={"type": "ARCHITECTURE"}
                    )
    
    def clear_collection(self) -> None:
        """Clear all documents from the collection."""
        self.collection.clear()
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the collection."""
        return {
            "document_count": len(self.collection.get()),
            "collection_name": self.collection_name
        }


if __name__ == "__main__":
    # Example usage
    rag = RAGEngine()
    
    # Auto-index project docs
    rag.auto_index_project_docs()
    
    # Test search
    results = rag.search("how to implement task checkpointing")
    for result in results:
        print(f"Title: {result['title']}")
        print(f"Content preview: {result['content'][:200]}...")
        print(f"Score: {result['score']}")
        print("---")