#!/usr/bin/env python3
"""
Index Truth Base Script
Indexa todos os documentos da Truth Base no Qdrant
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any

# Adicionar backend ao path
backend_path = Path(__file__).parent.parent / "apps" / "backend"
sys.path.insert(0, str(backend_path))

from core.services.qdrant_client import QdrantVectorStore
from core.services.embedder import EmbedderService



class TruthBaseIndexer:
    """Indexador da Truth Base"""

    def __init__(self, truth_base_dir: str = "Axioms/Truth_Base"):
        """
        Inicializar indexador

        Args:
            truth_base_dir: Diretório da Truth Base
        """
        self.truth_base_dir = Path(truth_base_dir)
        self.qdrant = QdrantVectorStore()
        self.embedder = EmbedderService()

        self.stats = {
            "files_processed": 0,
            "chunks_created": 0,
            "chunks_indexed": 0,
            "errors": 0
        }

    def find_markdown_files(self) -> List[Path]:
        """Encontrar todos os arquivos .md na Truth Base"""
        if not self.truth_base_dir.exists():
            print(f"❌ Diretório não encontrado: {self.truth_base_dir}")
            return []

        md_files = list(self.truth_base_dir.rglob("*.md"))
        print(f"📂 Encontrados {len(md_files)} arquivos .md")
        return md_files

    def process_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """
        Processar um arquivo: ler + chunking + embeddings

        Args:
            file_path: Path do arquivo

        Returns:
            Lista de documentos com embeddings
        """
        try:
            # Ler arquivo
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            if not content.strip():
                print(f"⚠️  Arquivo vazio: {file_path}")
                return []

            # Extrair seção do nome do arquivo
            section = file_path.stem

            # Metadata adicional
            metadata = {
                "section": section,
                "directory": str(file_path.parent.relative_to(self.truth_base_dir))
            }

            # Processar documento
            relative_path = str(file_path.relative_to(Path.cwd()))
            documents = self.embedder.embed_document(
                content=content,
                file_path=relative_path,
                chunk_size=512,
                overlap=50,
                metadata=metadata
            )

            print(f"✅ {file_path.name}: {len(documents)} chunks")
            return documents

        except Exception as e:
            print(f"❌ Erro ao processar {file_path}: {e}")
            self.stats["errors"] += 1
            return []

    def index_all(self):
        """Indexar todos os documentos da Truth Base"""
        print("🚀 Iniciando indexação da Truth Base...")
        print(f"📍 Diretório: {self.truth_base_dir.absolute()}")

        # Encontrar arquivos
        md_files = self.find_markdown_files()
        if not md_files:
            print("❌ Nenhum arquivo encontrado")
            return

        # Processar todos os arquivos
        all_documents = []

        for file_path in md_files:
            documents = self.process_file(file_path)
            all_documents.extend(documents)
            self.stats["files_processed"] += 1
            self.stats["chunks_created"] += len(documents)

        # Indexar no Qdrant
        if all_documents:
            print(f"\n📦 Indexando {len(all_documents)} chunks no Qdrant...")
            result = self.qdrant.index_documents(all_documents)
            self.stats["chunks_indexed"] = result.get("indexed", 0)
        else:
            print("⚠️  Nenhum documento para indexar")

        # Exibir estatísticas
        self._print_stats()

    def _print_stats(self):
        """Exibir estatísticas da indexação"""
        print("\n" + "="*60)
        print("📊 ESTATÍSTICAS DA INDEXAÇÃO")
        print("="*60)
        print(f"Arquivos processados: {self.stats['files_processed']}")
        print(f"Chunks criados:       {self.stats['chunks_created']}")
        print(f"Chunks indexados:     {self.stats['chunks_indexed']}")
        print(f"Erros:                {self.stats['errors']}")

        # Stats do Qdrant
        qdrant_stats = self.qdrant.get_stats()
        print(f"\nQdrant Collection:    {qdrant_stats.get('collection', 'N/A')}")
        print(f"Total de vetores:     {qdrant_stats.get('points_count', 0)}")
        print("="*60)


def main():
    """Entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Indexar Truth Base no Qdrant")
    parser.add_argument(
        "--dir",
        default="Axioms/Truth_Base",
        help="Diretório da Truth Base (default: Axioms/Truth_Base)"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Deletar coleção existente antes de indexar"
    )

    args = parser.parse_args()

    # Criar indexador
    indexer = TruthBaseIndexer(truth_base_dir=args.dir)

    # Reset se solicitado
    if args.reset:
        print("🗑️  Deletando coleção existente...")
        indexer.qdrant.delete_collection()
        indexer.qdrant._ensure_collection()

    # Indexar
    indexer.index_all()


if __name__ == "__main__":
    main()
