# watcher.ps1 - Monitora triggers e copia para clipboard
param([string]$WorkerName)
Set-Location "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

$trig = ".trigger_$WorkerName"
$prompt = ".prompt_$WorkerName.txt"
$counter = ".counter_$WorkerName.txt"

function Log($msg) { Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $msg" -ForegroundColor Cyan }

Clear-Host
Log "WATCHER $WorkerName - Iniciando..."

# Delay
$d = @{"sentinela"=90;"escrivao"=210;"revisador"=330}[$WorkerName]
if ($d) { Log "Aguardando $d segundos..."; Start-Sleep -S $d }

# CEO-ZERO
Set-Clipboard "Voce e o worker $WorkerName. Ative CEO-ZERO. Confirme: WORKER $($WorkerName.ToUpper()) ONLINE"
Log "CEO-ZERO copiado! Cole no Claude (Ctrl+V + Enter)"
[Console]::Beep(800,200)
Start-Sleep -S 30

Log "Monitorando triggers..."
$n = 0

while (1) {
    if (Test-Path $trig) {
        if (Test-Path $prompt) {
            $n++
            Log "TRIGGER #$n!"
            Set-Clipboard (Get-Content $prompt -Raw -Encoding utf8)
            [Console]::Beep(800,200)
            Log "COPIADO! Cole no Claude"
            Remove-Item $trig -Force -EA SilentlyContinue
            $n | Out-File $counter -Encoding utf8 -NoNewline
        }
    }
    Start-Sleep -S 2
}
