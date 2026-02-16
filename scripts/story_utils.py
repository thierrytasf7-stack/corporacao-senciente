import os
import re
from typing import List

def read_story(filepath: str) -> str:
    """Lê conteúdo de um arquivo .md."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def write_story(filepath: str, content: str) -> None:
    """Escreve conteúdo em um arquivo .md."""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def update_status(content: str, status: str, sub_status: str) -> str:
    """Atualiza campos Status e subStatus no conteúdo."""
    content = re.sub(r'\*\*Status:\*\*\s*\S+', f'**Status:** {status}', content)
    content = re.sub(r'\*\*subStatus:\*\*\s*\S+', f'**subStatus:** {sub_status}', content)
    return content

def extract_target_files(content: str) -> List[str]:
    """Extrai arquivos alvo da seção 'Arquivos Alvo'."""
    files = []
    in_section = False

    for line in content.splitlines():
        stripped = line.strip()

        if stripped.startswith("## Arquivos Alvo"):
            in_section = True
            continue

        if in_section and stripped.startswith("## "):
            break

        if in_section and stripped:
            # Aceita linhas como: - path/to/file.py  ou  * path/to/file.py  ou paths nus
            match = re.match(r"^[-*]\s+(.+)$", stripped)
            if match:
                raw = match.group(1).strip().strip("`")
            elif "/" in stripped or "\\" in stripped or stripped.endswith((".py", ".js", ".ts", ".md", ".tsx", ".jsx")):
                raw = stripped.strip("`")
            else:
                continue

            # Resolve para caminho absoluto
            if os.path.isabs(raw):
                files.append(raw)
            else:
                files.append(os.path.join(os.path.dirname(__file__), "..", raw))

    return files
