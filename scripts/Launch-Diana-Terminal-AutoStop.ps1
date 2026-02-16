# Launch-Diana-Terminal-AutoStop.ps1
# Lança Windows Terminal e monitora - executa shutdown total ao fechar
# STABLE ARCHITECTURE: Claude runs IN terminal (no external spawn)
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

Write-Host "[+] Sincronizando Canais de Comunicacao Diana (STABLE)..." -ForegroundColor Green
Write-Host "    AUTO-STOP ativado: Shutdown total ao fechar Windows Terminal" -ForegroundColor Yellow

# Build WT command
$wtCmd = @(
    "nt", "-d", $root, "--title", "SERVERS", "cmd", "/k", "$root\scripts\run-servers.bat"
    ";", "nt", "-d", $root, "--title", "SENTINELA-WATCH", "cmd", "/k", "$root\scripts\run-sentinela-genesis.bat"
    ";", "sp", "-d", $root, "-H", "--title", "SENTINELA-CLAUDE", "cmd", "/k", "$root\scripts\run-claude-sentinela-stable.bat"
    ";", "nt", "-d", $root, "--title", "ESCRIVAO-WATCH", "cmd", "/k", "$root\scripts\run-sentinela-escrivao.bat"
    ";", "sp", "-d", $root, "-H", "--title", "ESCRIVAO-CLAUDE", "cmd", "/k", "$root\scripts\run-claude-escrivao-stable.bat"
    ";", "nt", "-d", $root, "--title", "REVISADOR-WATCH", "cmd", "/k", "$root\scripts\run-sentinela-revisador.bat"
    ";", "sp", "-d", $root, "-H", "--title", "REVISADOR-CLAUDE", "cmd", "/k", "$root\scripts\run-claude-revisador-stable.bat"
    ";", "nt", "-d", $root, "--title", "ALEX-SENTINEL", "cmd", "/k", "$root\scripts\run-sentinela-whatsapp.bat"
    ";", "sp", "-d", $root, "-H", "--title", "ALEX-WORKER", "cmd", "/k", "$root\scripts\run-whatsapp-listener.bat"
    ";", "nt", "-d", $root, "--title", "CORP-SENTINEL", "cmd", "/k", "$root\scripts\run-sentinela-corp.bat"
    ";", "sp", "-d", $root, "-H", "--title", "CORP-CLAUDE", "cmd", "/k", "$root\scripts\run-corp-claude.bat"
)

# Launch Windows Terminal e captura processo
$wt = Start-Process wt -ArgumentList $wtCmd -PassThru

Write-Host "[OK] Windows Terminal lancado (PID: $($wt.Id))!" -ForegroundColor Green
Write-Host "[*] Monitorando... ao fechar, executara shutdown automatico" -ForegroundColor Cyan

# Monitora ate Windows Terminal fechar
try {
    $wt.WaitForExit()
    Write-Host ""
    Write-Host "[!] Windows Terminal fechado. Executando shutdown total..." -ForegroundColor Yellow
    & "$root\scripts\Stop-Diana-Complete.ps1"
} catch {
    Write-Host "[WARN] Erro ao monitorar WT: $_" -ForegroundColor Yellow
}
