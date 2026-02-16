# AIOS Observer Engine - DIRECT MISSION MODE

def write_log [observer_id: string, msg: string] {
    let aios_path = "C:/AIOS"
    let hive_memory_path = $"($aios_path)/hive_memory.log"
    let timestamp = (date now | format date "%H:%M:%S")
    let entry = ("[" + $timestamp + "] 👁️ " + $observer_id + ": " + $msg + "\n")
    try { print $entry } catch { } 
    if not ($aios_path | path exists) { mkdir $aios_path }
    $entry | save --append $hive_memory_path
}

def register_on_dashboard [observer_id: string, task: string = "idle"] {
    let agents_dir = "C:/AIOS/agents"
    if not ($agents_dir | path exists) { mkdir $agents_dir }
    let timestamp = (date now | format date "%Y-%m-%dT%H:%M:%S")
    let new_observer = { status: "online", timestamp: $timestamp, last_activity: $timestamp, task: $task, pid: $nu.pid }
    let agent_file = ($agents_dir + "/" + $observer_id + ".json")
    try { $new_observer | save --force $agent_file } catch { }
}

def remove_self_from_dashboard [observer_id: string] {
    let agent_file = ("C:/AIOS/agents/" + $observer_id + ".json")
    if ($agent_file | path exists) { rm $agent_file }
}

def read_file_safely [path: string] {
    try { open --raw $path | decode utf-8 } catch { try { open $path | into string } catch { "" } }
}

def main [observer_id: string, mission_file: string] {
    register_on_dashboard $observer_id $mission_file
    
    let project_root = (pwd)
    let story_path = ("docs/stories/" + $mission_file)
    write_log $observer_id ("🧐 Iniciando Auditoria: " + $mission_file)

    try {
        if not ($story_path | path exists) {
            write_log $observer_id ("❌ ERRO: Arquivo não encontrado: " + $story_path)
            return
        }

        # VALIDAÇÃO DE TAMANHO DE ARQUIVO
        let file_size = (ls $story_path | get size | first | into int)
        let max_size = 100000  # 100 KB
        if ($file_size > $max_size) {
            write_log $observer_id ("🚨 ERRO: Arquivo muito grande (" + ($file_size | into string) + " bytes)")
            write_log $observer_id ("   Limite: 100 KB. Marcando como ERROR...")
            (read_file_safely $story_path | str replace "Status: WAITING_REVIEW" "Status: ERROR" | str replace "subStatus: ready_for_review" "subStatus: file_too_large" | save --force $story_path)
            remove_self_from_dashboard $observer_id
            return
        }

        let content = (read_file_safely $story_path)
        
        write_log $observer_id "--------------------------------------------------"
        write_log $observer_id "📦 RESUMO DA AUDITORIA - QA PAYLOAD:"
        
        let aider_env = { 
            PYTHONIOENCODING: "utf-8",
            PYTHONUNBUFFERED: "1",
            TERM: "dumb",
            AIDER_NO_PRETTY: "1",
            AIDER_NO_SUGGEST_SHELL_COMMANDS: "1"
        }
        
        # A chave deve vir do ambiente
        if not ("OPENROUTER_API_KEY" in $env) {
            write_log $observer_id "🚨 ERRO: OPENROUTER_API_KEY não encontrada!"
            (read_file_safely $story_path | str replace "subStatus: ready_for_review" "subStatus: error" | save --force $story_path)
            remove_self_from_dashboard $observer_id
            return
        }
        
        write_log $observer_id "🔍 INVOCANDO LEAD QA (HEADLESS)..."
        try { if (".git/index.lock" | path exists) { rm -f .git/index.lock } } catch { }

        let log_dir = ("logs/terminal")
        if not ($log_dir | path exists) { mkdir $log_dir }
        let terminal_log = ($log_dir + "/" + $observer_id + ".log")

        let rules_file = ($project_root + "/.agent/rules/AIDER_CONSTITUTION.md")
        let base_qa_prompt = ("Você é o QA Lead (@qa). Sua missão é auditar o arquivo que acabei de adicionar a este chat. Verifique se os ACs foram atendidos. Última linha deve ser 'VEREDICTO: APROVADO' ou 'VEREDICTO: REPROVADO'.")
        let qa_prompt = (if ($base_qa_prompt | str length) > 6000 { $base_qa_prompt | str substring 0..6000 } else { $base_qa_prompt })

        # EXECUÇÃO COM INJEÇÃO DO ARQUIVO DA STORY
        with-env $aider_env {
            if ($rules_file | path exists) {
                aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --no-pretty --verbose --file $rules_file --file $story_path --message $qa_prompt | tee { save --force $terminal_log }
            } else {
                aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --no-pretty --verbose --file $story_path --message $qa_prompt | tee { save --force $terminal_log }
            }
        }
        
        # LÊ O RESULTADO DO LOG PARA PROCESSAR O VEREDICTO
        let output = (read_file_safely $terminal_log)
        write_log $observer_id "📝 Relatório QA Processado."

        let revisions_match = ($content | lines | where $it =~ "(?i)Revisions:" | first | default "Revisions: 0")
        let current_revisions = ($revisions_match | str replace -r "(?i)Revisions: " "" | into int)
        let next_revisions = ($current_revisions + 1)

        if ($output | str contains "VEREDICTO: APROVADO") {
            write_log $observer_id "✅ APROVADO!"
            (read_file_safely $story_path | str replace "Status: WAITING_REVIEW" "Status: COMPLETED" | str replace "subStatus: ready_for_review" "subStatus: done" | save --force $story_path)
        } else {
            if ($next_revisions >= 7) {
                write_log $observer_id "🚨 LIMITE DE REVISÕES ATINGIDO."
                (read_file_safely $story_path | str replace "Status: WAITING_REVIEW" "Status: ERROR" | str replace "subStatus: ready_for_review" "subStatus: human_review_required" | save --force $story_path)
            } else {
                write_log $observer_id "❌ REPROVADO. Devolvendo para fila..."
                let feedback_entry = ("\n\n## 🚨 Feedback (R" + ($next_revisions | into string) + ")\n\n### Relatório do QA:\n" + $output + "\n\n---\n")
                
                let updated_content = ($content + $feedback_entry 
                    | str replace "Status: WAITING_REVIEW" "Status: TODO" 
                    | str replace "subStatus: ready_for_review" "subStatus: pending_worker")
                
                let final_content = (if ($updated_content | str contains "Revisions:") {
                    $updated_content | str replace -r '(?i)Revisions: \d+' ("Revisions: " + ($next_revisions | into string))
                } else {
                    $updated_content
                })

                $final_content | save --force $story_path
            }
        }
    } catch { |err| 
        let err_msg = ($err | into string)
        
        # DETECÇÃO DE I/O ERROR
        if ($err_msg | str contains "I/O error") {
            write_log $observer_id ("🚨 I/O ERROR DETECTADO - Marcando story como ERROR")
            try {
                (read_file_safely $story_path | str replace "Status: WAITING_REVIEW" "Status: ERROR" | str replace "subStatus: ready_for_review" "subStatus: io_error" | save --force $story_path)
            } catch { }
        } else {
            write_log $observer_id ("🔥 FALHA: " + $err_msg)
        }
    }

    remove_self_from_dashboard $observer_id
    write_log $observer_id "🏁 Finalizado. Fechando em 2s..."
    sleep 2sec
}
