# run-claude.ps1 - Executa Claude em processo isolado
param(
    [string]$PromptFile,
    [string]$SessionId = "",
    [string]$Model = "claude-sonnet-4-5-20250929"
)

# Limpar TODAS as variáveis Claude Code
$env:CLAUDECODE = $null
$env:CLAUDECODE_SESSION_ID = $null
$env:CLAUDECODE_PROJECT_PATH = $null
$env:CLAUDECODE_WORKSPACE = $null
$env:CLAUDE_CODE_SESSION = $null
$env:CLAUDE_CODE_WORKSPACE = $null
$env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\usr\bin\bash.exe"

# Ler prompt do arquivo
$promptContent = Get-Content $PromptFile -Raw -Encoding UTF8

# Construir comando
$claudePath = "$env:USERPROFILE\.local\bin\claude.exe"
$args = @("--dangerously-skip-permissions", "--print", "--model", $Model)

if ($SessionId) {
    $args += @("--resume", $SessionId)
}

$args += $promptContent

# Executar Claude e capturar output
& $claudePath $args 2>&1
