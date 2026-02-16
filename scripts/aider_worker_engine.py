import os, glob, re, subprocess, sys

STORIES_DIR = "docs/stories"
AIDER_FALLBACK_SCRIPT = "scripts/aider_with_fallback.py"

def extract_instructions(content):
    # Tenta extrair o que está após "Instruções para o Aider:" ou similar
    match = re.search(r"Instruções.*?:\s*(.*)", content, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return "Refactor according to story requirements."

def process():
    tasks = glob.glob(os.path.join(STORIES_DIR, "*.md"))
    for t in tasks:
        try:
            with open(t, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            # Regex robusta para detectar tasks do Aider pendentes (APENAS TODO)
            if "**Agente Sugerido:** @aider" in content and re.search(r"Status:.*TODO", content, re.IGNORECASE):
                filename = os.path.basename(t)
                print(f"\n[TASK] Processando: {filename}")
                
                instructions = extract_instructions(content)
                print(f"[INFO] Instruções extraídas ({len(instructions)} caracteres).")
                
                # Atualizar Status para EM_EXECUCAO antes de começar
                print("[PRE] Atualizando status para EM_EXECUCAO...")
                new_c = re.sub(r"Status:.*", "Status:** EM_EXECUCAO", content)
                new_c = re.sub(r"subStatus:.*", "subStatus:** processing_by_aider", new_c)
                with open(t, "w", encoding="utf-8") as f:
                    f.write(new_c)
                
                # Executar o Aider real via script de fallback
                print(f"[AIDER] Iniciando execução verbosa (YOLO MODE - AUTO CONFIRM)...\n")
                
                # Argumentos para o aider: 
                # --yes: Aceita prompts automaticamente
                # --no-auto-commits: Deixa o commit para o fluxo do git ou do usuário (opcional, mas seguro)
                # --message: As instruções
                cmd = [sys.executable, AIDER_FALLBACK_SCRIPT, "--yes", "--message", instructions, t]
                
                # subprocess.run sem capturar output para que apareça no terminal do usuário (verboso)
                result = subprocess.run(cmd, check=False)
                
                if result.returncode == 0:
                    print(f"\n[POST] Aider finalizou com SUCESSO.")
                    # Atualizar para Status finalizado pelo Aider
                    with open(t, "r", encoding="utf-8") as f:
                        final_c = f.read()
                    final_c = re.sub(r"Status:.*", "Status:** PARA_REVISAO", final_c)
                    final_c = re.sub(r"subStatus:.*", "subStatus:** awaiting_reviewer_sentinel", final_c)
                    with open(t, "w", encoding="utf-8") as f:
                        f.write(final_c)
                else:
                    print(f"\n[ERROR] Aider falhou com código: {result.returncode}")
                
                return True # Processa uma por vez
        except Exception as e:
            print(f"[!] Erro ao processar {t}: {e}")
            continue
    return False

if __name__ == "__main__":
    process()
