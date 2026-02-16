import os, glob, re, time

STORIES_DIR = "docs/stories"

def process_tasks():
    tasks = glob.glob(os.path.join(STORIES_DIR, "*.md"))
    processed = False

    for t in tasks:
        try:
            with open(t, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            # 1. Processar TODOs do Agente Zero
            if "**Agente Sugerido:** @agente-zero" in content and re.search(r"Status:.*TODO", content, re.IGNORECASE):
                print(f"\n[ZERO] Avaliando: {os.path.basename(t)}")

                # Zero worker nao implementa codigo - marca como pendente para worker real
                # Honestamente sinaliza que precisa de implementacao humana ou por AI capaz
                new_c = re.sub(r"Status:.*", "Status:** PENDING_IMPLEMENTATION", content)
                new_c = re.sub(r"subStatus:.*", "subStatus:** needs_capable_worker", new_c)
                with open(t, "w", encoding="utf-8") as f:
                    f.write(new_c)

                print(f"[SKIP] Story mantida como PENDING_IMPLEMENTATION (zero worker nao implementa codigo)")
                processed = True
                break

            # 2. Processar Revisoes (vindas do Aider)
            elif re.search(r"Status:.*PARA_REVISAO", content, re.IGNORECASE):
                print(f"\n[ZERO] Iniciando Revisao: {os.path.basename(t)}")

                # Muda para EM_REVISAO
                new_c = re.sub(r"Status:.*", "Status:** EM_REVISAO", content)
                new_c = re.sub(r"subStatus:.*", "subStatus:** reviewing_by_zero", new_c)
                with open(t, "w", encoding="utf-8") as f:
                    f.write(new_c)

                print("[REV] Verificando se story tem mudancas de codigo reais...")

                # Verifica se existem arquivos modificados listados na story
                has_file_changes = bool(re.search(r"File List|Files Changed|Arquivos", content, re.IGNORECASE))

                with open(t, "r", encoding="utf-8") as f:
                    final_c = f.read()

                if has_file_changes:
                    # Story tem evidencia de mudancas -> pode marcar como revisado
                    final_c = re.sub(r"Status:.*", "Status:** REVISADO", final_c)
                    final_c = re.sub(r"subStatus:.*", "subStatus:** waiting_human_approval", final_c)
                    print("[DONE] Revisao aprovada - mudancas de codigo detectadas.")
                else:
                    # Story nao tem evidencia de mudancas -> nao pode aprovar
                    final_c = re.sub(r"Status:.*", "Status:** REVIEW_FAILED", final_c)
                    final_c = re.sub(r"subStatus:.*", "subStatus:** no_code_changes_found", final_c)
                    print("[FAIL] Revisao rejeitada - nenhuma mudanca de codigo encontrada.")

                with open(t, "w", encoding="utf-8") as f:
                    f.write(final_c)
                processed = True
                break

        except Exception as e:
            print(f"Erro em {t}: {e}")
            continue

    return processed

if __name__ == "__main__":
    if process_tasks():
        print(">>> Ciclo de trabalho finalizado.")
    else:
        print(">>> Nenhum trabalho pendente encontrado.")
