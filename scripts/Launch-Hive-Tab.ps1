# Launch-Hive-Tab.ps1
$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
$hiveExe = "$projectRoot/rust_components/hive-guardian/target/release/hive-guardian.exe"
$hiveCwd = "$projectRoot/rust_components/hive-guardian"

Set-Location $hiveCwd
Write-Host "🛡️ Starting Hive Core..." -ForegroundColor Cyan

if (Test-Path $hiveExe) {
    & $hiveExe
} else {
    Write-Error "Hive Binary not found at: $hiveExe"
    Read-Host "Press Enter to exit..."
}
