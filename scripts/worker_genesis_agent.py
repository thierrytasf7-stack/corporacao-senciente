import os, json, time, random, sys, glob, re
from datetime import datetime

BASE_DIR = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
STORIES_DIR = os.path.join(BASE_DIR, "docs/stories")

INTENTS = [
    {"type": "optimization", "title": "Otimizar Performance DB", "desc": "Indices Postgres.", "agent": "@aider", "difficulty": "MEDIUM"},
    {"type": "feature", "title": "Websocket Notificacoes", "desc": "Alertas trades.", "agent": "@agente-zero", "difficulty": "HARD"},
    {"type": "refactor", "title": "Middleware Auth", "desc": "Refactor JWT.", "agent": "@aider", "difficulty": "LOW"},
    {"type": "security", "title": "Auditoria de Deps", "desc": "npm audit fix.", "agent": "@agente-zero", "difficulty": "MEDIUM"}
]

def get_existing_titles():
    """Scan all existing stories and extract their titles to prevent duplicates."""
    titles = set()
    story_files = glob.glob(os.path.join(STORIES_DIR, "*.md"))
    for filepath in story_files:
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                first_line = f.readline().strip()
            # Extract title from "# [STORY-...] Title" format
            match = re.search(r'\]\s*(.+)$', first_line)
            if match:
                titles.add(match.group(1).strip().lower())
            # Also match plain "# Title" format
            elif first_line.startswith("# "):
                titles.add(first_line[2:].strip().lower())
        except Exception:
            continue
    return titles

def create_story(index, intent):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{intent['type']}_genesis_{timestamp}_{index}.md"
    filepath = os.path.join(STORIES_DIR, filename)

    content = f"""# [STORY-{timestamp}-{index}] {intent['title']}
> **Status:** TODO
> **subStatus:** pending_worker
> **Agente Sugerido:** {intent['agent']}
> **Dificuldade:** {intent['difficulty']}
> **Prioridade:** Alta

## 1. Objetivo
{intent['desc']}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"   [+] {datetime.now().strftime('%H:%M:%S')} | CRIANDO: {filename} | AGENTE: {intent['agent']}")
    sys.stdout.flush()

def main():
    print("----------------------------------------------------")
    print(f"[{datetime.now()}] GENESIS OBSERVER: INICIANDO ANALISE...")
    print("----------------------------------------------------")

    if not os.path.exists(STORIES_DIR):
        os.makedirs(STORIES_DIR)

    # DEDUP CHECK: load existing story titles
    existing_titles = get_existing_titles()
    print(f"   [i] {len(existing_titles)} stories existentes detectadas")

    created = 0
    skipped = 0
    agents = ["@aider", "@agente-zero", "@aider", "@agente-zero", "@aider"]

    for i in range(1, 6):
        intent = random.choice(INTENTS)
        intent = dict(intent)  # copy to avoid mutating original
        intent['agent'] = agents[i-1]

        # DEDUP: skip if title already exists
        if intent['title'].strip().lower() in existing_titles:
            print(f"   [=] {datetime.now().strftime('%H:%M:%S')} | SKIP (duplicata): {intent['title']}")
            skipped += 1
            continue

        create_story(i, intent)
        existing_titles.add(intent['title'].strip().lower())
        created += 1
        time.sleep(1)

    print("----------------------------------------------------")
    print(f"[{datetime.now()}] ANALISE CONCLUIDA. Criadas: {created} | Skipped: {skipped}")
    print("----------------------------------------------------")

if __name__ == "__main__":
    main()
