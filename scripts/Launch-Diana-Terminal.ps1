# Launch-Diana-Terminal.ps1 - SERVERS + ALEX + CORP
# Launches Windows Terminal with 3 tabs
# Workers de evolucao (Genesis/Trabalhador/Revisador) rodam via Start-Evolucao.bat separado
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

Write-Host "[+] Sincronizando Canais de Comunicacao Diana (STABLE)..." -ForegroundColor Green

# Build WT command line
# Tab 1: SERVERS - PM2 monitoring
# Tab 2: ALEX - WhatsApp sentinel + worker
# Tab 3: CORP - Corp sentinel + claude

$wtCmd = @(
    # Tab 1: SERVERS - PM2 status monitoring
    "nt", "-d", $root, "--title", "SERVERS-PM2", "cmd", "/k", "pm2 monit"

    # Tab 2: ALEX (2 panes - WhatsApp)
    ";", "nt", "-d", $root, "--title", "ALEX-SENTINEL", "cmd", "/k", "$root\scripts\run-sentinela-whatsapp.bat"
    ";", "sp", "-d", $root, "-H", "--title", "ALEX-WORKER", "cmd", "/k", "$root\scripts\run-whatsapp-listener.bat"

    # Tab 3: CORP (2 panes - Corp senciente)
    ";", "nt", "-d", $root, "--title", "CORP-SENTINEL", "cmd", "/k", "$root\scripts\run-sentinela-corp.bat"
    ";", "sp", "-d", $root, "-H", "--title", "CORP-CLAUDE", "cmd", "/k", "$root\scripts\run-corp-claude.bat"
)

Start-Process wt -ArgumentList $wtCmd

Write-Host "[OK] Windows Terminal lancado!" -ForegroundColor Green
