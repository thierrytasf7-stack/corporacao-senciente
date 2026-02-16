# Restart Binance Bot Backend
$port = 21341

# Find process on port
$connections = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
foreach ($conn in $connections) {
    $parts = $conn -split '\s+'
    $procId = $parts[$parts.Length - 1]
    if ($procId -and $procId -ne '0') {
        Write-Output "Killing PID $procId on port $port"
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

# Start backend with ts-node
Set-Location "C:\Users\User\Desktop\Diana-Corporacao-Senciente\modules\binance-bot\backend"
Write-Output "Starting backend..."
Start-Process -FilePath "npx" -ArgumentList "ts-node", "-r", "tsconfig-paths/register", "src/real-server.ts" -NoNewWindow
