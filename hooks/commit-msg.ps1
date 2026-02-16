#!/usr/bin/env pwsh
# Valida mensagem de commit: requer tag de referência [PRD-XXX] ou [SEC]/[OBS]/[TASK-123].

param([string]$commitMsgFile)

$msg = Get-Content $commitMsgFile -Raw
$pattern = '\[(PRD-[A-Za-z0-9]+|SEC|OBS|TASK-\d+|ISSUE-\d+)\]'

if ($msg -notmatch $pattern) {
  Write-Host "Commit message must contain a reference tag like [PRD-XYZ] or [SEC]/[OBS]/[TASK-123]." -ForegroundColor Red
  exit 1
}
exit 0





































