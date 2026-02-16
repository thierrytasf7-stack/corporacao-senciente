# Script para corrigir o problema de timeout do frontend
Write-Host "🔧 Corrigindo problema de timeout do frontend..." -ForegroundColor Yellow

# 1. Parar todos os processos
Write-Host "1️⃣ Parando processos..." -ForegroundColor Cyan
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Limpar cache do npm
Write-Host "2️⃣ Limpando cache do npm..." -ForegroundColor Cyan
npm cache clean --force

# 3. Remover node_modules e reinstalar
Write-Host "3️⃣ Reinstalando dependências..." -ForegroundColor Cyan
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install

# 4. Limpar cache do Vite
Write-Host "4️⃣ Limpando cache do Vite..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 5. Verificar se o backend está rodando
Write-Host "5️⃣ Verificando backend..." -ForegroundColor Cyan
$backendRunning = Get-NetTCPConnection -LocalPort 13001 -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "✅ Backend rodando na porta 13001" -ForegroundColor Green
}
else {
    Write-Host "❌ Backend não está rodando na porta 13001" -ForegroundColor Red
    Write-Host "   Execute: cd backend" -ForegroundColor Yellow
    Write-Host "   Execute: npm run dev:real" -ForegroundColor Yellow
}

# 6. Iniciar frontend
Write-Host "6️⃣ Iniciando frontend..." -ForegroundColor Cyan
Write-Host "   Execute: npm run dev:13000" -ForegroundColor Yellow

Write-Host "✅ Script concluído!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Execute: npm run dev:13000" -ForegroundColor White
Write-Host "   2. Abra: http://localhost:13000" -ForegroundColor White
Write-Host "   3. Pressione Ctrl+F5 para hard refresh" -ForegroundColor White
