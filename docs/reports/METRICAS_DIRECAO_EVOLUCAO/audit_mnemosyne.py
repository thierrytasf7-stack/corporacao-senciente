import os
import re
import json

def audit_protocols():
    base_path = r"c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente\METRICAS_DIRECAO_EVOLUCAO"
    stages_path = os.path.join(base_path, "TASKS-144-ETAPAS")
    
    # 1. Mapear todas as tasks existentes nos 20 protocolos
    protocol_tasks = {}
    protocol_files = [f for f in os.listdir(base_path) if f.startswith(tuple(f"{i:02d}_" for i in range(1, 21)))]
    
    print(f"--- Iniciando Auditoria Mnemosyne ---")
    print(f"Localizando protocolos em: {base_path}")
    
    total_found_in_protocols = 0
    for pf in protocol_files:
        p_id = pf.split("_")[0]
        full_path = os.path.join(base_path, pf)
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Regex para capturar IDs como [1.1.1], [01.1.1], [11.2.3] etc.
            matches = re.findall(r"\[(\d{1,2}\.\d{1,2}\.\d{1,2})\]", content)
            # Também capturar o formato antigo [1.1] se houver
            matches += re.findall(r"\[(\d{1,2}\.\d{1,2})\]", content)
            
            unique_tasks = sorted(list(set(matches)))
            protocol_tasks[p_id] = {task: False for task in unique_tasks}
            total_found_in_protocols += len(unique_tasks)
            print(f"Protocolo {p_id}: {len(unique_tasks)} tasks encontradas.")

    print(f"\nTotal de tasks detectadas nos protocolos: {total_found_in_protocols}")

    # 2. Verificar cobertura nas ETAPAS geradas
    etapa_files = [f for f in os.listdir(stages_path) if f.startswith("ETAPA_") and f.endswith(".md")]
    
    total_mapped = 0
    mapped_details = []
    
    for ef in etapa_files:
        full_path = os.path.join(stages_path, ef)
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Procurar por IDs de tasks originais mapeados nas etapas
            # Geralmente marcados como [1.1.1] ou [Protocolo X] [Y.Z]
            # O padrão atual na ETAPA_002 é [TASKS-X] ... [Y.Z.W]
            matches = re.findall(r"\[(\d{1,2}\.\d{1,2}\.\d{1,2})\]", content)
            matches += re.findall(r"\[(\d{1,2}\.\d{1,2})\]", content)
            
            for m in matches:
                # Tentar encontrar a qual protocolo pertence
                parts = m.split(".")
                p_id_found = parts[0].zfill(2)
                if p_id_found in protocol_tasks and m in protocol_tasks[p_id_found]:
                    if not protocol_tasks[p_id_found][m]:
                        protocol_tasks[p_id_found][m] = True
                        total_mapped += 1
                        mapped_details.append(f"{ef}: Mapeou {m}")

    print(f"Total de tasks mapeadas em etapas: {total_mapped}")
    
    # 3. Gerar Relatório de Lacunas
    lacunas = []
    for p_id, tasks in protocol_tasks.items():
        missing = [t for t, status in tasks.items() if not status]
        if missing:
            lacunas.append({
                "protocolo": p_id,
                "total_missing": len(missing),
                "tasks": missing[:5] # Mostrar apenas as 5 primeiras para brevidade
            })

    print(f"\n--- Relatório de Lacunas Evolutivas ---")
    if not lacunas:
        print("100% de cobertura! O organismo está totalmente mapeado.")
    else:
        for l in lacunas:
            print(f"Protocolo {l['protocolo']}: {l['total_missing']} tasks pendentes. Ex: {l['tasks']}")

    # Salvar log em JSON
    report_path = os.path.join(base_path, "audit_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(protocol_tasks, f, indent=4)
        
    print(f"\nRelatório detalhado salvo em: {report_path}")

if __name__ == "__main__":
    audit_protocols()
