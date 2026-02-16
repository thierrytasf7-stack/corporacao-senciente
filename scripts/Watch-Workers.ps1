# Watch-Workers.ps1 - Specialized Dashboard (Fixed for Windows JSON bug)

$workerNames = @("agent-zero", "guardian-hive", "maestro")

while ($true) {
    Clear-Host
    Write-Host "WORKER POOL STATUS (Nativo)" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Gray
    
    # Use Node to fetch and clean PM2 data (Avoids Duplicate Key bug)
    $nodeCmd = "const {execSync} = require('child_process'); try { const data = JSON.parse(execSync('pm2 jlist').toString()); const clean = data.map(p => ({name: p.name, status: p.pm2_env.status, cpu: p.monit.cpu, mem: p.monit.memory})); console.log(JSON.stringify(clean)); } catch(e) { console.log('[]'); }"
    $pm2Data = node -e $nodeCmd | ConvertFrom-Json
    
    foreach ($w in $workerNames) {
        $proc = $pm2Data | Where-Object { $_.name -eq $w }
        if ($proc) {
            $statusColor = if ($proc.status -eq "online") { "Green" } else { "Red" }
            $cpu = $proc.cpu
            $mem = [math]::round($proc.mem / 1MB, 1)
            
            Write-Host "[$($w.ToUpper())]" -ForegroundColor Yellow -NoNewline
            Write-Host "`tSTATUS: " -NoNewline
            Write-Host "$($proc.status.ToUpper())" -ForegroundColor $statusColor -NoNewline
            Write-Host "`tCPU: $cpu%`tMEM: ${mem}MB"
        } else {
            Write-Host "[$($w.ToUpper())] NOT FOUND" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "`n----------------------------------"
    Write-Host "Last Update: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGray
    Start-Sleep -Seconds 2
}
