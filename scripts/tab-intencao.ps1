# tab-intencao.ps1 - Aba INTENCAO: exibe e permite editar INTENCAO-GENESIS.md
$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

$arquivo = Join-Path $ROOT "INTENCAO-GENESIS.md"

while ($true) {
    Clear-Host
    Write-Host ("=" * 50) -ForegroundColor Magenta
    Write-Host "  INTENCAO GENESIS - Direcao de Evolucao" -ForegroundColor Magenta
    Write-Host ("=" * 50) -ForegroundColor Magenta
    Write-Host ""

    if (Test-Path $arquivo) {
        Get-Content $arquivo | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "(INTENCAO-GENESIS.md nao encontrado)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "[E] Editar no Notepad   [R] Recarregar   [Q] Fechar" -ForegroundColor Yellow

    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

    if ($key.Character -eq 'e' -or $key.Character -eq 'E') {
        Start-Process notepad.exe $arquivo
    } elseif ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
        break
    }
    # qualquer outra tecla = reload (R ou Enter)
}
