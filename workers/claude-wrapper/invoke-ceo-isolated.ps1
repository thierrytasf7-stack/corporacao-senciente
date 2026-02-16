# invoke-ceo-isolated.ps1 - Spawns Claude CLI in isolated process
param(
    [string]$PromptFile,
    [string]$OutputFile
)

$prompt = Get-Content $PromptFile -Raw -Encoding UTF8
$ceoInvocation = "/CEOs:CEO-ZERO $prompt"

# Remove ALL Claude session vars
Remove-Item Env:CLAUDECODE -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDECODE_SESSION_ID -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDECODE_PROJECT_PATH -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDECODE_WORKSPACE -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_SESSION -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_WORKSPACE -ErrorAction SilentlyContinue

# Set git-bash path (REQUIRED for Claude Code on Windows)
$env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\usr\bin\bash.exe"

# Execute Claude CLI in NEW isolated process (not child)
$output = & "$env:USERPROFILE\.local\bin\claude.exe" --dangerously-skip-permissions --model claude-haiku-4-5-20251001 --print $ceoInvocation 2>&1

# Save output
$output | Out-File -FilePath $OutputFile -Encoding UTF8 -Force
