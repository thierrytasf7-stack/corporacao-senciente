# Benchmark: Run 3 Aiders in parallel
# Records timing and output metrics

$benchDir = "C:\Users\User\Desktop\Diana-Corporacao-Senciente\tests\benchmark"
$projectDir = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
$metricsDir = "$benchDir\metrics"
$resultsDir = "$benchDir\aider-results"

# Clean previous results
Remove-Item "$resultsDir\*.ts" -ErrorAction SilentlyContinue

$startTime = Get-Date
Write-Host "=== BENCHMARK AIDER x3 PARALLEL START: $startTime ===" -ForegroundColor Green

# Define tasks
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

# Launch 3 Aiders in parallel
$jobs = @()
foreach ($task in $tasks) {
    $taskName = $task.Name
    $taskPrompt = $task.Prompt
    $taskFile = $task.File
    $logFile = "$metricsDir\aider-$taskName.log"

    Write-Host "  Launching Aider for: $taskName" -ForegroundColor Cyan

    $job = Start-Job -ScriptBlock {
        param($prompt, $file, $log, $projDir)

        $sw = [System.Diagnostics.Stopwatch]::StartNew()

        # Create empty file for aider to edit
        "" | Out-File -FilePath $file -Encoding utf8

        # Run aider with free model
        $env:AIDER_YES = "true"
        $output = & aider --model "openrouter/google/gemini-2.0-flash-exp:free" `
            --no-auto-commits `
            --yes `
            --no-git `
            --file $file `
            --message $prompt 2>&1 | Out-String

        $sw.Stop()

        # Save log
        $output | Out-File -FilePath $log -Encoding utf8

        # Return metrics
        @{
            ElapsedMs = $sw.ElapsedMilliseconds
            OutputLen = $output.Length
            FileExists = (Test-Path $file)
            FileSize = if (Test-Path $file) { (Get-Item $file).Length } else { 0 }
            FileLines = if (Test-Path $file) { (Get-Content $file | Measure-Object -Line).Lines } else { 0 }
        }
    } -ArgumentList $taskPrompt, $taskFile, $logFile, $projectDir

    $jobs += @{ Job = $job; Name = $taskName }
}

Write-Host "`n  Waiting for all 3 Aiders to complete..." -ForegroundColor Yellow

# Wait and collect results
$results = @{}
foreach ($entry in $jobs) {
    $result = Receive-Job -Job $entry.Job -Wait
    $results[$entry.Name] = $result
    Write-Host "  Completed: $($entry.Name) in $($result.ElapsedMs)ms" -ForegroundColor Green
    Remove-Job -Job $entry.Job
}

$endTime = Get-Date
$totalMs = ($endTime - $startTime).TotalMilliseconds

# Save metrics
$metricsOutput = @"
# Aider Benchmark Metrics
# Date: $startTime
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
$metricsOutput | Out-File -FilePath "$metricsDir\aider-metrics.md" -Encoding utf8

Write-Host "`n=== BENCHMARK COMPLETE ===" -ForegroundColor Green
Write-Host "Total time: ${totalMs}ms"
Write-Host "Metrics saved to: $metricsDir\aider-metrics.md"
