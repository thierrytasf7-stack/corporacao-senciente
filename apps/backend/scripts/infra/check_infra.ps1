# Script de verificação rápida da infraestrutura multi-PC

Write-Host "🔍 Verificando infraestrutura multi-PC..." -ForegroundColor Cyan
Write-Host ""

# Verificar WSL
Write-Host "1. Verificando WSL..." -ForegroundColor Yellow
try {
    $wslVersion = wsl --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ WSL instalado" -ForegroundColor Green
        $wslStatus = $true
    } else {
        Write-Host "   ❌ WSL não encontrado" -ForegroundColor Red
        $wslStatus = $false
    }
} catch {
    Write-Host "   ❌ Erro ao verificar WSL" -ForegroundColor Red
    $wslStatus = $false
}

# Verificar Ubuntu
Write-Host "2. Verificando Ubuntu..." -ForegroundColor Yellow
try {
    $distros = wsl -l -q 2>$null
    if ($distros -match "Ubuntu") {
        Write-Host "   ✅ Ubuntu instalado" -ForegroundColor Green
        $ubuntuStatus = $true
    } else {
        Write-Host "   ❌ Ubuntu não encontrado" -ForegroundColor Red
        $ubuntuStatus = $false
    }
} catch {
    Write-Host "   ❌ Erro ao verificar Ubuntu" -ForegroundColor Red
    $ubuntuStatus = $false
}

# Verificar SSH
Write-Host "3. Verificando SSH..." -ForegroundColor Yellow
try {
    $sshResult = wsl -d Ubuntu -- systemctl is-active ssh 2>$null
    if ($sshResult -eq "active") {
        Write-Host "   ✅ SSH ativo" -ForegroundColor Green
        $sshStatus = $true
    } else {
        Write-Host "   ❌ SSH inativo" -ForegroundColor Red
        $sshStatus = $false
    }
} catch {
    Write-Host "   ❌ Erro ao verificar SSH" -ForegroundColor Red
    $sshStatus = $false
}

# Verificar especialização
Write-Host "4. Verificando especialização..." -ForegroundColor Yellow
try {
    $specResult = wsl -d Ubuntu -- cat /etc/specialization 2>$null
    if ($specResult -and ($specResult -match "technical|business|operations")) {
        Write-Host "   ✅ Especialização: $specResult" -ForegroundColor Green
        $specStatus = $true
    } else {
        Write-Host "   ❌ Especialização não configurada" -ForegroundColor Red
        $specStatus = $false
    }
} catch {
    Write-Host "   ❌ Erro ao verificar especialização" -ForegroundColor Red
    $specStatus = $false
}

# Verificar Node.js
Write-Host "5. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeResult = wsl -d Ubuntu -- node --version 2>$null
    if ($nodeResult -match "v\d+") {
        Write-Host "   ✅ Node.js: $nodeResult" -ForegroundColor Green
        $nodeStatus = $true
    } else {
        Write-Host "   ❌ Node.js não encontrado" -ForegroundColor Red
        $nodeStatus = $false
    }
} catch {
    Write-Host "   ❌ Erro ao verificar Node.js" -ForegroundColor Red
    $nodeStatus = $false
}

# Verificar Python
Write-Host "6. Verificando Python..." -ForegroundColor Yellow
try {
    $pythonResult = wsl -d Ubuntu -- python3 --version 2>$null
    if ($pythonResult -match "Python \d+") {
        Write-Host "   ✅ Python: $pythonResult" -ForegroundColor Green
        $pythonStatus = $true
    } else {
        Write-Host "   ❌ Python não encontrado" -ForegroundColor Red
        $pythonStatus = $false
    }
} catch {
    Write-Host "   ❌ Erro ao verificar Python" -ForegroundColor Red
    $pythonStatus = $false
}

# Resumo
Write-Host ""
Write-Host "📊 RESUMO DA VERIFICAÇÃO:" -ForegroundColor Cyan
Write-Host "WSL: $(if ($wslStatus) { "✅" } else { "❌" }) | Ubuntu: $(if ($ubuntuStatus) { "✅" } else { "❌" }) | SSH: $(if ($sshStatus) { "✅" } else { "❌" })"
Write-Host "Especialização: $(if ($specStatus) { "✅" } else { "❌" }) | Node.js: $(if ($nodeStatus) { "✅" } else { "❌" }) | Python: $(if ($pythonStatus) { "✅" } else { "❌" })"

$allGood = $wslStatus -and $ubuntuStatus -and $sshStatus -and $specStatus -and $nodeStatus -and $pythonStatus

if ($allGood) {
    Write-Host ""
    Write-Host "🎉 INFRAESTRUTURA COMPLETA!" -ForegroundColor Green
    Write-Host "✅ Todos os componentes estão funcionando corretamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Execute: node scripts/infra/register_pc.sh" -ForegroundColor White
    Write-Host "2. Configure ZeroTier se necessário" -ForegroundColor White
    Write-Host "3. Teste conectividade com outros PCs" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ INFRAESTRUTURA INCOMPLETA" -ForegroundColor Yellow
    Write-Host "❌ Alguns componentes precisam ser configurados." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Consulte: docs/01-getting-started/INFRAESTRUTURA_MULTI_PC_SETUP.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Para instalar automaticamente: .\scripts\infra\setup_pc_template.ps1" -ForegroundColor Magenta





