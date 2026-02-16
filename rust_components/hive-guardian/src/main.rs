use std::fs;
use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::Duration;
use serde::{Deserialize, Serialize};
use glob::glob;
use std::net::TcpStream;
use std::collections::{HashMap, HashSet};
use std::time::SystemTime;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct HiveConfig {
    project_root: String,
    agents_dir: String,
    nu_path: String,
    max_pool_size: usize,
    polling_interval: u64,
    cleanup_interval_cycles: u64,
    ui_width: usize,
    dashboard_url: String,
}

impl HiveConfig {
    fn load() -> Self {
        let config_str = fs::read_to_string("config.json").expect("Failed to read config.json");
        serde_json::from_str(&config_str).expect("Failed to parse config.json")
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct WorkerStatus {
    status: String,
    timestamp: String,
    last_activity: String,
    #[serde(default = "default_task")]
    task: String,
    #[serde(default)]
    pid: u32,
}

fn default_task() -> String {
    "idle".to_string()
}

#[derive(Debug, Clone)]
struct TaskInfo {
    title: String,
    filename: String,
    status: String,
    sub_status: String,
    revisions: u32,
    modified: SystemTime,
}

fn check_dashboard_status(url: &str) -> (bool, String) {
    match TcpStream::connect(url) {
        Ok(_) => (true, "ONLINE! 🎉".to_string()),
        Err(e) => (false, format!("OFFLINE ({})", e)),
    }
}

fn clear_git_lock(project_root: &str) {
    let lock_path = Path::new(project_root).join(".git").join("index.lock");
    if lock_path.exists() {
        let _ = fs::remove_file(lock_path);
    }
}

fn is_process_alive(pid: u32) -> bool {
    if pid == 0 { return false; }
    let output = Command::new("tasklist")
        .arg("/FI")
        .arg(format!("PID eq {}", pid))
        .arg("/NH")
        .output();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        stdout.contains(&pid.to_string())
    } else {
        false
    }
}

fn get_active_agents(agents_dir_path: &str) -> HashMap<String, WorkerStatus> {
    let mut agents = HashMap::new();
    let agents_dir = Path::new(agents_dir_path);
    if agents_dir.exists() {
        if let Ok(entries) = fs::read_dir(agents_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    if let Ok(content) = fs::read_to_string(&path) {
                        if let Ok(status) = serde_json::from_str::<WorkerStatus>(&content) {
                            if is_process_alive(status.pid) {
                                let id = path.file_stem().unwrap().to_string_lossy().to_string();
                                agents.insert(id, status);
                            } else { let _ = fs::remove_file(&path); }
                        }
                    }
                }
            }
        }
    }
    agents
}

fn scan_stories(dir: &str) -> Vec<TaskInfo> {
    let mut tasks = Vec::new();
    let pattern = format!("{}/*.md", dir);
    if let Ok(entries) = glob(&pattern) {
        for entry in entries.flatten() {
            let metadata = fs::metadata(&entry);
            let modified = metadata.map(|m| m.modified().unwrap_or(SystemTime::now())).unwrap_or(SystemTime::now());
            if let Ok(content) = fs::read_to_string(&entry) {
                let mut status = String::from("NONE");
                let mut sub_status = String::from("NONE");
                let mut title = String::from("Sem Título");
                let mut revisions = 0;
                let filename = entry.file_name().unwrap().to_string_lossy().to_string();
                for line in content.lines() {
                    let l = line.to_uppercase();
                    if l.starts_with("# STORY:") { title = line.replace("# Story:", "").replace("# Story :", "").trim().to_string(); }
                    if l.contains("STATUS:") && !l.contains("SUBSTATUS:") { status = l.split("STATUS:").nth(1).unwrap_or("").replace("*", "").trim().to_string(); }
                    if l.contains("SUBSTATUS:") { sub_status = l.split("SUBSTATUS:").nth(1).unwrap_or("").replace("*", "").trim().to_string(); }
                    if l.contains("REVISIONS:") { revisions = l.split("REVISIONS:").nth(1).unwrap_or("0").trim().parse::<u32>().unwrap_or(0); }
                }
                tasks.push(TaskInfo { title, filename, status, sub_status, revisions, modified });
            }
        }
    }
    tasks
}

fn get_all_tasks_classified(config: &HiveConfig) -> (Vec<TaskInfo>, Vec<TaskInfo>, Vec<TaskInfo>, Vec<TaskInfo>, Vec<TaskInfo>) {
    let mut pending = Vec::new(); let mut running = Vec::new(); let mut review = Vec::new(); 
    let mut completed = Vec::new(); let mut errors = Vec::new();
    let stories_path = format!("{}/docs/stories", config.project_root);
    let active_tasks = scan_stories(&stories_path);
    for t in active_tasks {
        if t.status.contains("ERROR") { errors.push(t); }
        else if t.status.contains("WAITING_REVIEW") { review.push(t); }
        else if t.status.contains("TODO") && (t.sub_status.contains("PENDING_WORKER") || t.sub_status.contains("NONE")) { pending.push(t); }
        else if t.status.contains("IN_PROGRESS") || t.sub_status.contains("WORKING") || t.sub_status.contains("ACCEPTED") { running.push(t); }
        else if t.status.contains("COMPLETED") || t.status.contains("DONE") { completed.push(t); }
    }
    let archive_path = format!("{}/_archive", stories_path);
    let archived_tasks = scan_stories(&archive_path);
    for t in archived_tasks { if t.status.contains("COMPLETED") || t.status.contains("DONE") { completed.push(t); } }
    completed.sort_by(|a, b| b.modified.cmp(&a.modified));
    (pending, running, review, completed, errors)
}

fn launch_worker_window(config: &HiveConfig, worker_id: &str, is_observer: bool, mission_file: &str) {
    let nu_path = &config.nu_path;
    let project_root = &config.project_root;
    clear_git_lock(project_root);
    let _ = Command::new("git").args(&["add", "-u"]).current_dir(project_root).status();
    let _ = Command::new("cmd").args(&["/c", &format!("icacls \"{}\" /grant Todos:F /T /C /Q >nul 2>&1", project_root)]).status();

    let script_name = if is_observer { "scripts/observer-engine.nu" } else { "scripts/aider-worker-engine.nu" };
    let worker_type = if is_observer { "👁️ Auditor" } else { "👷‍♂️ Ajudante" };
    let script_path = format!("{}/{}", project_root, script_name);

    let inner_ps_command = format!(
        "Set-Location -Path '{}'; [console]::Title = '{} {}'; & '{}' '{}' '{}' '{}'",
        project_root, worker_type, worker_id, nu_path, script_path, worker_id, mission_file
    );

    let _ = Command::new("powershell")
        .arg("-Command")
        .arg(format!("Start-Process powershell.exe -ArgumentList '-Command', \"{}\" -WindowStyle Normal", inner_ps_command))
        .spawn();
}

fn create_genesis_meta_task(project_root: &str) {
    if std::env::var("NO_GENESIS").is_ok() { return; }

    let meta_task_path = Path::new(project_root).join("docs/stories/activate_genesis_observer.md");
    
    if meta_task_path.exists() {
        if let Ok(content) = fs::read_to_string(&meta_task_path) {
            let c = content.to_uppercase();
            if c.contains("STATUS: TODO") || c.contains("SUBSTATUS: WORKING") || c.contains("SUBSTATUS: PENDING_WORKER") {
                return;
            }
        }
    }

    let content = "# Story: Ativar Genesis Observer\nStatus: TODO\nsubStatus: pending_worker\nRevisions: 0\n\n## Contexto\n[EVOLUÇÃO] Gatilho automático de evolução sistêmica.\n\n## Critérios\n- [ ] Executar cérebro do Genesis.\n- [ ] Gerar novo lote de tarefas.\n\n## Aider Prompt\n> ```text\n> EXECUTE_COMMAND: node tools/agents/squads/genesis-observer/scripts/genesis-brain.js\n> ```\n";
    let _ = fs::write(meta_task_path, content);
}

fn sanitize_worker_id(title: &str) -> String {
    title.replace(" ", "_").replace("?", "").replace(":", "").replace("*", "").replace("\"", "").replace("<", "").replace(">", "").replace("|", "").replace("/", "").replace("\\", "")
}

fn run_cleanup_script(project_root: &str) {
    let script_path = format!("{}/scripts/cleanup-stuck-stories.ps1", project_root);
    let _ = Command::new("powershell")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg(&script_path)
        .output();
}

fn get_genesis_status(project_root: &str) -> String {
    let path = Path::new(project_root).join("docs/stories/activate_genesis_observer.md");
    if path.exists() {
        if let Ok(content) = fs::read_to_string(path) {
            for line in content.lines() {
                if line.to_uppercase().starts_with("SUBSTATUS:") {
                    return line.split(':').nth(1).unwrap_or("Unknown").trim().to_uppercase();
                }
            }
        }
    }
    "INATIVO".to_string()
}

fn main() {
    let config = HiveConfig::load();
    let project_root = &config.project_root;
    // ... (rest of setup)

    let mut cycle_count: u64 = 0;
    loop {
        cycle_count += 1;
        clear_git_lock(project_root);
        let (mut pending, mut running, mut review, completed, errors) = get_all_tasks_classified(&config);
        let active_agents = get_active_agents(&config.agents_dir);
        let genesis_status = get_genesis_status(project_root);
        let (_dash_online, dash_msg) = check_dashboard_status(&config.dashboard_url);
        
        let real_active_count = active_agents.len();
        let available_slots = if real_active_count < config.max_pool_size { config.max_pool_size - real_active_count } else { 0 };

        let mut file_locks = HashSet::new();
        for status in active_agents.values() { file_locks.insert(status.task.clone()); }

        // Protocolo de Espelhamento
        for (id, _status) in &active_agents {
            let is_in_lists = running.iter().any(|t| sanitize_worker_id(&t.title) == *id) || review.iter().any(|t| sanitize_worker_id(&t.title) == *id);
            if !is_in_lists {
                if let Some(pos) = pending.iter().position(|t| sanitize_worker_id(&t.title) == *id) {
                    let task = pending.remove(pos);
                    if id.contains("Onboarding") || id.contains("Evolução") || id.contains("Ativar") { running.push(task); }
                    else { review.push(task); }
                }
            }
        }

        let load_pct = (real_active_count as f32 / config.max_pool_size as f32) * 100.0;
        let load_status = if load_pct > 90.0 { "CRÍTICO" } else if load_pct > 50.0 { "ALTO" } else { "NORMAL" };

        // Limpar mensagem de erro feia do Dashboard
        let clean_dash_msg = if dash_msg.contains("refused") || dash_msg.contains("os error") {
            "OFFLINE (Tentando reconectar...)".to_string()
        } else {
            dash_msg
        };

        // Limpeza de tela robusta para Windows
        let _ = Command::new("cmd").args(&["/C", "cls"]).status();
        
        let line = "═".repeat(config.ui_width - 2);
        println!("╔{}╗", line);
        println!("║{:^width$}║", "🛡️  HIVE GUARDIAN COMMAND CENTER v5.1 (GENESIS UI)", width = config.ui_width - 2);
        println!("╠{}╣", line);
        let genesis_color = if genesis_status == "ERROR" { "🔴" } else { "🧬" };
        println!("║ {} GENESIS: {:<20} | 🟢 Dash: {:<45} ║", genesis_color, genesis_status, clean_dash_msg);
        println!("╠{}╣", line);
        println!("║ ⚙️  CARGA DO SISTEMA: {:<10} [{:<3.0}%] {:<width$}║", load_status, load_pct, "", width = config.ui_width - 35);
        println!("╠{}╣", line);
        if !errors.is_empty() {
            println!("║ ❌ ERROS: {:<width$} ║", errors.len(), width = config.ui_width - 12);
            for t in &errors { println!("║ ⚠️  {:<width$} ║", t.title, width = config.ui_width - 6); }
            println!("╠{}╣", line);
        }
        println!("║ 👷 TERMINAIS ATIVOS (KANBAN): {:<width$} ║", active_agents.len(), width = config.ui_width - 33);
        let mut sorted_agents: Vec<_> = active_agents.iter().collect();
        sorted_agents.sort_by(|a, b| a.1.timestamp.cmp(&b.1.timestamp));
        for (id, status) in sorted_agents {
            let start_time = status.timestamp.split('T').nth(1).unwrap_or("00:00:00");
            println!("║ > [{}] {:<30} | {:<10} | {:<75} ║", start_time, id, status.status.to_uppercase(), status.task);
        }
        println!("╠{}╣", line);
        println!("║ 🧠 REVISÃO IA: {:<width$} ║", review.len(), width = config.ui_width - 18);
        if review.is_empty() { println!("║    (Nenhuma tarefa para auditar) {:<width$}║", "", width = config.ui_width - 36); }
        else { for t in &review { println!("║ 🔍 {:<width$} ║", format!("{} [R{}]", t.title, t.revisions), width = config.ui_width - 6); } }
        println!("╠{}╣", line);
        println!("║ ⚙️  EXECUTANDO: {:<width$} ║", running.len(), width = config.ui_width - 18);
        if running.is_empty() { println!("║    (Nenhum agente em campo) {:<width$}║", "", width = config.ui_width - 31); }
        else { for t in &running { println!("║ 🔨 {:<width$} ║", t.title, width = config.ui_width - 6); } }
        println!("╠{}╣", line);
        println!("║ 📋 BACKLOG / FILA: {:<width$} ║", pending.len(), width = config.ui_width - 22);
        if pending.len() + running.len() + review.len() < 3 { create_genesis_meta_task(project_root); } 
        for t in &pending { println!("║ 📄 {:<width$} ║", t.title, width = config.ui_width - 6); }
        println!("╠{}╣", line);
        println!("║ ✅ FINALIZADAS (HISTÓRICO 20+): {:<width$} ║", completed.len(), width = config.ui_width - 35);
        for t in completed.iter().take(20) { println!("║ 👤 {:<width$} ║", t.title, width = config.ui_width - 6); }
        println!("╚{}╝", line);
        
        if cycle_count % config.cleanup_interval_cycles == 0 {
            run_cleanup_script(project_root);
        }
        
        if available_slots > 0 {
            let mut slots_left = available_slots;
            for task in &review {
                if slots_left == 0 { break; }
                if !file_locks.contains(&task.filename) {
                    let id = sanitize_worker_id(&task.title);
                    launch_worker_window(&config, &id, true, &task.filename);
                    file_locks.insert(task.filename.clone()); slots_left -= 1; thread::sleep(Duration::from_millis(2000));
                }
            }
            for task in &running {
                if slots_left == 0 { break; }
                if !file_locks.contains(&task.filename) {
                    let id = sanitize_worker_id(&task.title);
                    launch_worker_window(&config, &id, false, &task.filename);
                    file_locks.insert(task.filename.clone()); slots_left -= 1; thread::sleep(Duration::from_millis(2000));
                }
            }
            for task in &pending {
                if slots_left == 0 { break; }
                if !file_locks.contains(&task.filename) {
                    let id = sanitize_worker_id(&task.title);
                    launch_worker_window(&config, &id, false, &task.filename);
                    file_locks.insert(task.filename.clone()); slots_left -= 1; thread::sleep(Duration::from_millis(2000));
                }
            }
        }
                thread::sleep(Duration::from_secs(config.polling_interval));
            }
        }
        
        #[cfg(test)]
        mod tests {
            use super::*;
            use proptest::prelude::*;
        
            #[test]
            fn test_sanitize_simple() {
                assert_eq!(sanitize_worker_id("Story: Test"), "Story_Test");
                assert_eq!(sanitize_worker_id("File?* Name"), "File_Name");
            }
        
            proptest! {
                #[test]
                fn test_sanitize_property(s in ".*") {
                    let sanitized = sanitize_worker_id(&s);
                    // Sanitized string should not contain Windows-forbidden characters
                    let forbidden = [' ', '?', ':', '*', '"', '<', '>', '|', '/', '\\'];
                    for &c in &forbidden {
                        assert!(!sanitized.contains(c), "Sanitized string contains forbidden char: {}", c);
                    }
                }
            }
        }
        