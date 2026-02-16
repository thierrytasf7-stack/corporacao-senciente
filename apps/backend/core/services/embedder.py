"""
Embedder Service
Gera embeddings para documentos usando OpenAI ou modelos locais
"""

import os
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime
import tiktoken

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  openai não instalado. Execute: pip install openai")


class EmbedderService:
    """Serviço de geração de embeddings"""

    def __init__(
        self,
        model: str = "text-embedding-ada-002",
        api_key: Optional[str] = None,
        max_tokens: int = 8191
    ):
        """
        Inicializar embedder

        Args:
            model: Modelo de embedding (ada-002, text-embedding-3-small, etc)
            api_key: OpenAI API key (lê de env se não fornecido)
            max_tokens: Tamanho máximo do chunk em tokens
        """
        self.model = model
        self.max_tokens = max_tokens
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            print("⚠️  OPENAI_API_KEY não configurada. Embeddings não funcionarão.")
            self.available = False
        else:
            self.available = OPENAI_AVAILABLE
            if OPENAI_AVAILABLE:
                openai.api_key = self.api_key

        # Encoding para contar tokens
        try:
            self.encoding = tiktoken.encoding_for_model(model)
        except:
            self.encoding = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        """Contar tokens em um texto"""
        return len(self.encoding.encode(text))

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 512,
        overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Dividir texto em chunks com overlap

        Args:
            text: Texto para dividir
            chunk_size: Tamanho do chunk em tokens
            overlap: Overlap entre chunks em tokens

        Returns:
            Lista de chunks com metadata
        """
        tokens = self.encoding.encode(text)
        chunks = []
        start = 0

        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text = self.encoding.decode(chunk_tokens)

            chunks.append({
                "text": chunk_text,
                "start_token": start,
                "end_token": end,
                "token_count": len(chunk_tokens),
                "chunk_index": len(chunks)
            })

            # Avançar com overlap
            start += chunk_size - overlap

        return chunks

    async def embed_text(self, text: str) -> List[float]:
        """
        Gerar embedding para um texto

        Args:
            text: Texto para embedar

        Returns:
            Vetor de embedding
        """
        if not self.available:
            raise RuntimeError("Embedder não disponível (OpenAI não configurado)")

        try:
            # Limitar tamanho
            tokens = self.encoding.encode(text)
            if len(tokens) > self.max_tokens:
                tokens = tokens[:self.max_tokens]
                text = self.encoding.decode(tokens)

            # Gerar embedding
            response = await openai.Embedding.acreate(
                model=self.model,
                input=text
            )

            embedding = response["data"][0]["embedding"]
            return embedding

        except Exception as e:
            print(f"❌ Erro ao gerar embedding: {e}")
            raise

    def embed_text_sync(self, text: str) -> List[float]:
        """Versão síncrona de embed_text"""
        if not self.available:
            raise RuntimeError("Embedder não disponível (OpenAI não configurado)")

        try:
            # Limitar tamanho
            tokens = self.encoding.encode(text)
            if len(tokens) > self.max_tokens:
                tokens = tokens[:self.max_tokens]
                text = self.encoding.decode(tokens)

            # Gerar embedding
            response = openai.Embedding.create(
                model=self.model,
                input=text
            )

            embedding = response["data"][0]["embedding"]
            return embedding

        except Exception as e:
            print(f"❌ Erro ao gerar embedding: {e}")
            raise

    async def embed_batch(
        self,
        texts: List[str],
        batch_size: int = 20
    ) -> List[List[float]]:
        """
        Gerar embeddings em batch (mais eficiente)

        Args:
            texts: Lista de textos
            batch_size: Tamanho do batch

        Returns:
            Lista de embeddings
        """
        if not self.available:
            raise RuntimeError("Embedder não disponível")

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]

            try:
                response = await openai.Embedding.acreate(
                    model=self.model,
                    input=batch
                )

                batch_embeddings = [item["embedding"] for item in response["data"]]
                embeddings.extend(batch_embeddings)

            except Exception as e:
                print(f"❌ Erro no batch {i}-{i+batch_size}: {e}")
                # Adicionar embeddings vazios para manter índices
                embeddings.extend([[] for _ in batch])

        return embeddings

    def embed_document(
        self,
        content: str,
        file_path: str,
        chunk_size: int = 512,
        overlap: int = 50,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Processar documento completo: chunking + embeddings

        Args:
            content: Conteúdo do documento
            file_path: Path do arquivo (para metadata)
            chunk_size: Tamanho dos chunks
            overlap: Overlap entre chunks
            metadata: Metadata adicional

        Returns:
            Lista de chunks com embeddings
        """
        # Dividir em chunks
        chunks = self.chunk_text(content, chunk_size, overlap)

        # Gerar embeddings
        texts = [chunk["text"] for chunk in chunks]
        embeddings = []

        for text in texts:
            try:
                emb = self.embed_text_sync(text)
                embeddings.append(emb)
            except Exception as e:
                print(f"❌ Erro ao embedar chunk: {e}")
                embeddings.append([])

        # Combinar chunks com embeddings
        documents = []
        for i, chunk in enumerate(chunks):
            # Gerar ID único
            content_hash = hashlib.md5(chunk["text"].encode()).hexdigest()
            doc_id = f"{file_path}_{i}_{content_hash[:8]}"

            documents.append({
                "id": doc_id,
                "content": chunk["text"],
                "vector": embeddings[i],
                "file": file_path,
                "chunk_index": i,
                "token_count": chunk["token_count"],
                "metadata": {
                    **(metadata or {}),
                    "start_token": chunk["start_token"],
                    "end_token": chunk["end_token"],
                    "timestamp": datetime.utcnow().isoformat()
                }
            })

        return documents

    def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas do embedder"""
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "available": self.available,
            "api_key_configured": bool(self.api_key),
            "openai_installed": OPENAI_AVAILABLE
        }
