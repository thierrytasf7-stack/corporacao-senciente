# AIOS Aider Worker Engine - ULTRA-RESILIENT STARTUP

def write_log [worker_id: string, msg: string] {
    let aios_path = "C:/AIOS"
    let hive_memory_path = ($aios_path + "/hive_memory.log")
    let timestamp = (date now | format date "%H:%M:%S")
    let entry = ("[" + $timestamp + "] Worker " + $worker_id + ": " + $msg + "\n")
    try { print $entry } catch { } 
    if not ($aios_path | path exists) { mkdir $aios_path }
    try { $entry | save --append $hive_memory_path } catch { }
}

def register_on_dashboard [worker_id: string, task: string = "idle"] {
    let agents_dir = "C:/AIOS/agents"
    try { if not ($agents_dir | path exists) { mkdir $agents_dir } } catch { }
    let timestamp = (date now | format date "%Y-%m-%dT%H:%M:%S")
    let new_worker = { status: "online", timestamp: $timestamp, last_activity: $timestamp, task: $task, pid: $nu.pid }
    let agent_file = ($agents_dir + "/" + $worker_id + ".json")
    try { $new_worker | save --force $agent_file } catch { }
}

def remove_self_from_dashboard [worker_id: string] {
    let agent_file = ("C:/AIOS/agents/" + $worker_id + ".json")
    try { if ($agent_file | path exists) { rm $agent_file } } catch { }
}

def read_file_safely [path: string] {
    try { open --raw $path | decode utf-8 } catch { try { open $path | into string } catch { "" } }
}

def main [worker_id: string, mission_file: string] {
    # 1. LOG DE SEGURANÇA (Primeira ação)
    write_log $worker_id "--- WORKER AWAKENED ---"

    # 2. CARREGAMENTO DE AMBIENTE RESILIENTE
    let config_path = "config/environment-config.json"
    let default_env = {
        OPENROUTER_API_KEY: "MISSING",
        PROJECT_ROOT: "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
    }
    let default_model = "openrouter/arcee-ai/trinity-large-preview:free"

    let env_vars = try {
        if ($config_path | path exists) {
            let cfg = (open $config_path)
            write_log $worker_id "Environment loaded from config.json"
            $cfg.global_vars
        } else {
            write_log $worker_id "WARNING: config.json not found, using fallback defaults"
            $default_env
        }
    } catch {
        write_log $worker_id "CRITICAL: Failed to parse config.json, using defaults"
        $default_env
    }

    let aider_model = try {
        if ($config_path | path exists) {
            let cfg = (open $config_path)
            ($cfg.worker_specific.aider.AIDER_MODEL | default $default_model)
        } else {
            $default_model
        }
    } catch {
        $default_model
    }

    # 3. EXECUÇÃO PROTEGIDA
    with-env {
        OPENROUTER_API_KEY: $env_vars.OPENROUTER_API_KEY,
        PROJECT_ROOT: $env_vars.PROJECT_ROOT,
        TERM: "dumb",
        AIDER_NO_PRETTY: "1",
        PYTHONIOENCODING: "utf-8"
    } {
        register_on_dashboard $worker_id $mission_file
        
        let project_root = $env_vars.PROJECT_ROOT
        let story_path = ($project_root + "/docs/stories/" + $mission_file)
        write_log $worker_id $"Starting Mission: ($mission_file)"

        try {
            if not ($story_path | path exists) {
                write_log $worker_id $"ERROR: Story not found at ($story_path)"
                remove_self_from_dashboard $worker_id
                return
            }

            let content = (read_file_safely $story_path)
            (read_file_safely $story_path | str replace "subStatus: pending_worker" "subStatus: working" | save --force $story_path)

            # Extração de Prompt
            let prompt_parts = ($content | split row "Aider Prompt")
            let prompt_raw = (if ($prompt_parts | length) > 1 { 
                $prompt_parts | get 1 | split row "```" | get -o 0 | str trim | lines | each { |l| $l | str replace -r '^>\s*' '' } | str join "\n" | str trim
            } else { "Check system status" })

            # DELEGAÇÃO
            if ($prompt_raw | str contains "EXECUTE_COMMAND:") {
                let cmd_clean = ($prompt_raw | str replace "EXECUTE_COMMAND:" "" | str trim | str replace -r "```[a-z]*\n?" "" | str replace -r "```" "" | str trim | str replace -r "^['\"]|['\"]$" "")
                write_log $worker_id $"Delegating to Agent Zero: ($cmd_clean)"
                let handoff_res = (do { ^powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/Invoke-WorkerHandoff.ps1 -TaskId $worker_id -TestCommand $cmd_clean } | complete)
                if ($handoff_res.exit_code == 0) {
                    (read_file_safely $story_path | str replace "subStatus: working" "subStatus: delegated" | save --force $story_path)
                }
                remove_self_from_dashboard $worker_id
                return
            }

            # EXECUÇÃO AIDER CLI
            write_log $worker_id "Invoking Aider CLI (Headless)..."
            let log_dir = ($project_root + "/logs/terminal")
            if not ($log_dir | path exists) { mkdir $log_dir }
            let log_file = ($log_dir + "/" + $worker_id + ".log")

            # Comando via CMD para estabilidade de console
            let aider_cmd = $"aider --model ($aider_model) --no-auto-commits --yes --no-pretty --message \"($prompt_raw)\""
            let res = (do { ^cmd.exe /c $"($aider_cmd) > ($log_file) 2>&1" } | complete)
            
            if ($res.exit_code == 0) {
                write_log $worker_id "SUCCESS!"
                (read_file_safely $story_path | str replace "Status: TODO" "Status: WAITING_REVIEW" | str replace "subStatus: working" "subStatus: ready_for_review" | save --force $story_path)
            } else {
                write_log $worker_id $"FAILED (Exit Code: ($res.exit_code))"
                (read_file_safely $story_path | str replace "subStatus: working" "subStatus: error" | save --force $story_path)
            }
        } catch { |err| 
            write_log $worker_id $"🔥 CRASH: ($err | to nuon)"
        }

        remove_self_from_dashboard $worker_id
        write_log $worker_id "--- WORKER FINISHED ---"
    }
}
