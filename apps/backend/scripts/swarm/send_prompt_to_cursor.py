#!/usr/bin/env python3
"""
Script Python para enviar prompt ao Cursor

Este script preenche o campo de texto no frontend do Cursor com o prompt.
Futuramente será via AutoHotkey para pressionar botão automaticamente.
Por enquanto, apenas preenche o campo (botão sem função, apenas visual).
"""

import sys
import json
import os
from pathlib import Path

def read_prompt_file(file_path):
    """Lê o prompt do arquivo temporário"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Erro ao ler arquivo: {e}", file=sys.stderr)
        return None

def send_to_cursor(prompt):
    """
    Envia prompt ao Cursor
    
    Por enquanto, apenas imprime o prompt.
    Futuramente:
    - Preencher campo de texto no frontend via API/DOM
    - Usar AutoHotkey para pressionar botão automaticamente
    """
    print(f"Prompt recebido ({len(prompt)} caracteres)")
    print("=" * 80)
    print(prompt)
    print("=" * 80)
    print("\n[NOTA] Por enquanto, este script apenas exibe o prompt.")
    print("[FUTURO] Será implementado:")
    print("  - Preenchimento automático do campo de texto no Cursor")
    print("  - AutoHotkey para pressionar botão de envio")
    print("\nPor favor, copie o prompt acima e cole no chat do Cursor manualmente.")
    
    return {
        "success": True,
        "message": "Prompt exibido (incorporação automática em desenvolvimento)",
        "prompt_length": len(prompt)
    }

def main():
    """Função principal"""
    if len(sys.argv) < 2:
        print("Uso: python send_prompt_to_cursor.py <arquivo_prompt>", file=sys.stderr)
        sys.exit(1)
    
    prompt_file = sys.argv[1]
    
    if not os.path.exists(prompt_file):
        print(f"Arquivo não encontrado: {prompt_file}", file=sys.stderr)
        sys.exit(1)
    
    prompt = read_prompt_file(prompt_file)
    
    if prompt is None:
        print("Erro ao ler prompt", file=sys.stderr)
        sys.exit(1)
    
    result = send_to_cursor(prompt)
    
    # Retornar resultado como JSON no stdout
    print("\n" + json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()



