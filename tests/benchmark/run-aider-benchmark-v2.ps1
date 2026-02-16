# Benchmark v2: Run 3 Aiders in parallel with working free model
$benchDir = "C:\Users\User\Desktop\Diana-Corporacao-Senciente\tests\benchmark"
$metricsDir = "$benchDir\metrics"
$resultsDir = "$benchDir\aider-results"

# Clean previous results
Remove-Item "$resultsDir\*.ts" -ErrorAction SilentlyContinue

# Load OpenRouter key
$envFile = "C:\Users\User\.aider\oauth-keys.env"
if (Test-Path $envFile) {
    $lines = Get-Content $envFile
    foreach ($line in $lines) {
        if ($line -match 'OPENROUTER_API_KEY="(.+)"') {
            $env:OPENROUTER_API_KEY = $Matches[1]
        }
    }
}

$model = "openrouter/arcee-ai/trinity-large-preview:free"
$startTime = Get-Date
Write-Host "=== BENCHMARK AIDER x3 PARALLEL v2 START: $startTime ===" -ForegroundColor Green
Write-Host "  Model: $model" -ForegroundColor Cyan

$tasks = @(
    @{
        Name = "string-utils"
        Prompt = Get-Content "$benchDir\prompts\task1-string-utils.txt" -Raw
        File = "$resultsDir\string-utils.ts"
    },
    @{
        Name = "array-utils"
        Prompt = Get-Content "$benchDir\prompts\task2-array-utils.txt" -Raw
        File = "$resultsDir\array-utils.ts"
    },
    @{
        Name = "math-utils"
        Prompt = Get-Content "$benchDir\prompts\task3-math-utils.txt" -Raw
        File = "$resultsDir\math-utils.ts"
    }
)

$jobs = @()
foreach ($task in $tasks) {
    $taskName = $task.Name
    $taskPrompt = $task.Prompt
    $taskFile = $task.File
    $logFile = "$metricsDir\aider-v2-$taskName.log"

    Write-Host "  Launching Aider for: $taskName" -ForegroundColor Cyan

    $job = Start-Job -ScriptBlock {
        param($prompt, $file, $log, $modelName, $apiKey)

        $env:OPENROUTER_API_KEY = $apiKey
        $sw = [System.Diagnostics.Stopwatch]::StartNew()

        # Create empty file for aider to edit
        "" | Out-File -FilePath $file -Encoding utf8

        # Run aider
        $output = & aider --model $modelName `
            --no-auto-commits `
            --yes `
            --no-git `
            --file $file `
            --message $prompt 2>&1 | Out-String

        $sw.Stop()
        $output | Out-File -FilePath $log -Encoding utf8

        @{
            ElapsedMs = $sw.ElapsedMilliseconds
            OutputLen = $output.Length
            FileExists = (Test-Path $file)
            FileSize = if (Test-Path $file) { (Get-Item $file).Length } else { 0 }
            FileLines = if (Test-Path $file) { (Get-Content $file | Measure-Object -Line).Lines } else { 0 }
        }
    } -ArgumentList $taskPrompt, $taskFile, $logFile, $model, $env:OPENROUTER_API_KEY

    $jobs += @{ Job = $job; Name = $taskName }
}

Write-Host "`n  Waiting for all 3 Aiders to complete..." -ForegroundColor Yellow

$results = @{}
foreach ($entry in $jobs) {
    $result = Receive-Job -Job $entry.Job -Wait
    $results[$entry.Name] = $result
    Write-Host "  Completed: $($entry.Name) in $($result.ElapsedMs)ms | Lines: $($result.FileLines) | Size: $($result.FileSize)b" -ForegroundColor Green
    Remove-Job -Job $entry.Job
}

$endTime = Get-Date
$totalMs = ($endTime - $startTime).TotalMilliseconds

$metricsOutput = @"
# Aider Benchmark Metrics v2
# Date: $startTime
# Model: $model
# Total Wall Time: ${totalMs}ms

"@

foreach ($name in $results.Keys) {
    $r = $results[$name]
    $metricsOutput += @"

## $name
- Elapsed: $($r.ElapsedMs)ms
- File Exists: $($r.FileExists)
- File Size: $($r.FileSize) bytes
- File Lines: $($r.FileLines)
- Log Output Length: $($r.OutputLen) chars

"@
}

$metricsOutput += "`nTotal Wall Clock: ${totalMs}ms`n"
$metricsOutput | Out-File -FilePath "$metricsDir\aider-metrics-v2.md" -Encoding utf8

Write-Host "`n=== BENCHMARK v2 COMPLETE ===" -ForegroundColor Green
Write-Host "Total wall time: $([math]::Round($totalMs/1000,1))s"
Write-Host "Metrics saved to: $metricsDir\aider-metrics-v2.md"
