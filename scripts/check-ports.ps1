# check-ports.ps1 - Check Diana server ports
# Portas definidas em .env.ports (faixa 21300-21399)
$ports = @(
    @{ Port = 21300; Name = "AIOS Dashboard (Next.js)" },
    @{ Port = 21301; Name = "Backend API (Express)" },
    @{ Port = 21302; Name = "Monitor Server (Bun)" },
    @{ Port = 21303; Name = "Corp Frontend (Vite)" },
    @{ Port = 21310; Name = "Hive Health" },
    @{ Port = 21311; Name = "Hive Dashboard" },
    @{ Port = 21312; Name = "Hive Metrics" },
    @{ Port = 21340; Name = "Binance Bot Frontend (Vite)" },
    @{ Port = 21341; Name = "Binance Bot Backend (Express)" }
)

Write-Host "=== DIANA SERVER PORTS ==="
foreach ($entry in $ports) {
    $port = $entry.Port
    $name = $entry.Name
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $procId = $conn.OwningProcess | Select-Object -First 1
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        Write-Host ("{0,-6} LISTENING  PID={1,-6} ({2}) - {3}" -f $port, $procId, $proc.ProcessName, $name)
    } else {
        Write-Host ("{0,-6} NOT LISTENING - {1}" -f $port, $name)
    }
}
