$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    filename = "LOGS-CONSOLE-FRONTEND.JSON"
    content = '{"test": "data", "timestamp": "' + (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ') + '"}'
    timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    sourceUrl = "http://localhost:13000/dashboard"
} | ConvertTo-Json -Depth 10

Write-Host "Body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/logs/update-frontend" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
