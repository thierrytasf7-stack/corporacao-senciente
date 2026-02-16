#!/usr/bin/env python3
"""
Script para geração automática de documentos usando o template Diana Corporação Senciente.
"""

import argparse
import hashlib
import os
import sys
from datetime import datetime
from pathlib import Path


def generate_sha256(content: str) -> str:
    """Gera hash SHA256 do conteúdo do documento."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def load_template(template_path: str) -> str:
    """Carrega o template Markdown do arquivo."""
    try:
        with open(template_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"Erro: Template não encontrado em {template_path}")
        sys.exit(1)


def generate_report(title: str, author: str, report_type: str, template_path: str = "docs/brand/report-template.md") -> str:
    """Gera um novo documento baseado no template."""
    
    # Carrega o template
    template = load_template(template_path)
    
    # Dados dinâmicos
    current_date = datetime.now().strftime("%Y-%m-%d")
    version = "1.0"
    
    # Substituições no template
    content = template.replace(
        "$(echo -n \"$CONTENT\" | sha256sum | cut -d' ' -f1)",
        generate_sha256(template)
    )
    content = content.replace("$(date +%Y-%m-%d)", current_date)
    content = content.replace("**Status:** EM_DESENVOLVIMENTO", f"**Status:** PRONTO")
    content = content.replace("**Versão:** 1.0", f"**Versão:** {version}")
    content = content.replace("**Autor:** Diana Corporação Senciente", f"**Autor:** {author}")
    content = content.replace("**Tipo:** Template", f"**Tipo:** {report_type.capitalize()}")
    content = content.replace("🎯 Título do Relatório", f"🎯 {title}")
    
    return content


def save_document(content: str, title: str, author: str, report_type: str) -> str:
    """Salva o documento gerado em um arquivo .md"""
    
    # Cria diretório se não existir
    output_dir = "docs/reports"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Gera nome do arquivo
    safe_title = title.lower().replace(' ', '-').replace('/', '-').replace('\\', '-')
    filename = f"{safe_title}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
    filepath = os.path.join(output_dir, filename)
    
    # Salva o arquivo
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    
    return filepath


def main():
    parser = argparse.ArgumentParser(
        description="Gera documentos usando o template Diana Corporação Senciente"
    )
    parser.add_argument("--title", required=True, help="Título do documento")
    parser.add_argument("--author", required=True, help="Autor do documento")
    parser.add_argument("--type", required=True, choices=["relatório", "técnico", "briefing", "análise"], 
                       help="Tipo de documento")
    parser.add_argument("--template", default="docs/brand/report-template.md", 
                       help="Caminho para o template (padrão: docs/brand/report-template.md)")
    
    args = parser.parse_args()
    
    # Gera o conteúdo
    content = generate_report(args.title, args.author, args.type, args.template)
    
    # Salva o documento
    filepath = save_document(content, args.title, args.author, args.type)
    
    print(f"📄 Documento gerado com sucesso: {filepath}")
    print(f"🔑 Hash SHA256: {generate_sha256(content)}")
    print(f"📅 Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📝 Tipo: {args.type.capitalize()}")
    print(f"👤 Autor: {args.author}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())