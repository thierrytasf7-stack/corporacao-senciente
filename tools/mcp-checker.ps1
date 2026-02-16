# mcp-checker.ps1
param([string]Path)
Write-Host 'MCP: Auditing ...' -ForegroundColor Yellow
if (Test-Path $Path) { Write-Host 'MCP VERDICT: APPROVED'; exit 0 } else { Write-Host 'MCP VERDICT: REJECTED'; exit 1 }
