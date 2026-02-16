# Script simples para instalar WSL2 + Ubuntu no Windows

Write-Host "🏗️ Instalando WSL2 + Ubuntu..." -ForegroundColor Cyan

# Verificar se já está instalado
try {
    $wslCheck = wsl --version
    Write-Host "✅ WSL2 já está instalado" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "🔧 WSL2 não encontrado. Instalando..." -ForegroundColor Yellow
}

# Habilitar features necessárias
Write-Host "📦 Habilitando features do Windows..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Instalar WSL2
Write-Host "🚀 Instalando WSL2 com Ubuntu..." -ForegroundColor Yellow
wsl --install -d Ubuntu

Write-Host "✅ Instalação concluída!" -ForegroundColor Green
Write-Host "🔄 Reinicie o computador e execute o script novamente." -ForegroundColor Yellow





