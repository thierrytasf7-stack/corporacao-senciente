// claude-wrapper - Rust wrapper para executar Claude CLI com env correto
// Uso: claude-wrapper sentinela

use std::env;
use std::process::Command;
use std::fs;
use std::thread;
use std::time::Duration;

fn main() {
    let args: Vec<String> = env::args().collect();
    let worker_name = args.get(1).unwrap_or(&"sentinela".to_string()).clone();

    println!("[WRAPPER-{}] Iniciando...", worker_name);

    // IDENTITY CHECK - Verifica identidade corporativa antes de iniciar
    if !check_identity() {
        eprintln!("[WRAPPER-{}] ERRO: Identidade corporativa não configurada!", worker_name);
        eprintln!("[WRAPPER-{}] Execute: node scripts/identity-injector.js --check", worker_name);
        std::process::exit(1);
    }

    // Setup paths
    let root = env::current_dir().unwrap();
    let queue_dir = root.join(".queue").join(&worker_name);
    let output_dir = root.join(".output").join(&worker_name);

    // Create directories
    fs::create_dir_all(&queue_dir).ok();
    fs::create_dir_all(&output_dir).ok();

    // Set environment - Remove ALL Claude Code session variables
    env::remove_var("CLAUDECODE");
    env::remove_var("CLAUDECODE_SESSION_ID");
    env::remove_var("CLAUDECODE_PROJECT_PATH");
    env::remove_var("CLAUDECODE_WORKSPACE");
    env::remove_var("CLAUDE_CODE_SESSION");
    env::remove_var("CLAUDE_CODE_WORKSPACE");

    env::set_var("CLAUDE_CODE_GIT_BASH_PATH", r"D:\Git\usr\bin\bash.exe");

    // Add Git paths to PATH for cygpath and other utilities
    if let Ok(current_path) = env::var("PATH") {
        let new_path = format!(r"D:\Git\usr\bin;D:\Git\bin;{}", current_path);
        env::set_var("PATH", new_path);
    }

    println!("[WRAPPER-{}] Monitorando: {:?}", worker_name, queue_dir);
    println!("[WRAPPER-{}] Output: {:?}", worker_name, output_dir);
    println!();

    let mut task_count = 0u32;

    loop {
        // Find next prompt file (FIFO)
        let mut prompt_files: Vec<_> = fs::read_dir(&queue_dir)
            .ok()
            .into_iter()
            .flat_map(|entries| entries)
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry.path()
                    .extension()
                    .map(|ext| ext == "prompt")
                    .unwrap_or(false)
            })
            .collect();

        prompt_files.sort_by_key(|e| e.path());

        if let Some(prompt_file) = prompt_files.first() {
            task_count += 1;
            let prompt_path = prompt_file.path();

            println!("[WRAPPER-{}] TASK #{}: {:?}", worker_name, task_count, prompt_path.file_name().unwrap());

            // Read prompt
            let prompt = match fs::read_to_string(&prompt_path) {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("[WRAPPER-{}] Erro ao ler prompt: {}", worker_name, e);
                    thread::sleep(Duration::from_secs(1));
                    continue;
                }
            };

            println!("[WRAPPER-{}] Invocando CEO-ZERO ({} chars)...", worker_name, prompt.len());

            // Write prompt to temp file for PowerShell intermediary
            let prompt_temp_file = output_dir.join(format!("task_{}.prompt-temp", task_count));
            if let Err(e) = fs::write(&prompt_temp_file, &prompt) {
                eprintln!("[WRAPPER-{}] Erro ao salvar prompt temp: {}", worker_name, e);
                continue;
            }

            let output_file = output_dir.join(format!("task_{}.txt", task_count));

            // INVOKE CEO-ZERO via PowerShell intermediary (fully isolated)
            let ps_script = root.join("workers").join("claude-wrapper").join("invoke-ceo-isolated.ps1");

            let mut cmd = Command::new("powershell.exe");
            cmd.current_dir(&root);
            cmd.arg("-NoProfile");
            cmd.arg("-ExecutionPolicy").arg("Bypass");
            cmd.arg("-File").arg(&ps_script);
            cmd.arg("-PromptFile").arg(&prompt_temp_file);
            cmd.arg("-OutputFile").arg(&output_file);

            println!("[WRAPPER-{}] Invocando CEO-ZERO via PowerShell isolado ({} chars)...", worker_name, prompt.len());
            match cmd.output() {
                Ok(output) => {
                    let stdout_str = String::from_utf8_lossy(&output.stdout).to_string();
                    let stderr_str = String::from_utf8_lossy(&output.stderr).to_string();

                    println!("[WRAPPER-{}] Status: {} | stdout: {} bytes | stderr: {} bytes",
                        worker_name, output.status, stdout_str.len(), stderr_str.len());

                    // Save stdout to file
                    if let Err(e) = fs::write(&output_file, &stdout_str) {
                        eprintln!("[WRAPPER-{}] Erro ao salvar output: {}", worker_name, e);
                    }

                    // Also save stderr for debugging
                    if !stderr_str.is_empty() {
                        let stderr_file = output_dir.join(format!("task_{}.stderr", task_count));
                        fs::write(&stderr_file, &stderr_str).ok();
                    }

                    if output.status.success() && !stdout_str.is_empty() {
                        // Update latest
                        let latest_file = output_dir.join("latest.txt");
                        fs::write(&latest_file, &stdout_str).ok();

                        println!("[WRAPPER-{}] TASK #{} CONCLUIDA via CEO-ZERO ({} bytes)",
                            worker_name, task_count, stdout_str.len());

                        // Mark as done
                        let done_file = output_dir.join(format!("task_{}.done", task_count));
                        fs::write(&done_file, "").ok();

                        // Remove processed prompt
                        fs::remove_file(&prompt_path).ok();
                    } else {
                        eprintln!("[WRAPPER-{}] CEO-ZERO falhou: {}", worker_name, output.status);
                        if !stderr_str.is_empty() {
                            eprintln!("[WRAPPER-{}] Stderr: {}", worker_name, stderr_str);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("[WRAPPER-{}] Erro ao executar CEO-ZERO: {}", worker_name, e);
                    thread::sleep(Duration::from_secs(5));
                }
            }

            // No session management needed - each task is fresh CEO-ZERO invocation
        } else {
            // No prompts, wait
            thread::sleep(Duration::from_secs(1));
        }
    }
}

/// Verifica se identidade corporativa está configurada
fn check_identity() -> bool {
    let root = env::current_dir().unwrap();
    let identity_path = root.join(".aios-core").join("config").join("identity.json");

    if !identity_path.exists() {
        return false;
    }

    // Tenta ler e validar JSON
    match fs::read_to_string(&identity_path) {
        Ok(content) => {
            // Valida que tem campos obrigatórios
            content.contains("\"name\"") &&
            content.contains("\"mission\"") &&
            content.contains("\"vision\"") &&
            content.contains("\"tone\"") &&
            content.contains("\"restrictions\"")
        },
        Err(_) => false
    }
}
