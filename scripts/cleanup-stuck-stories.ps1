# cleanup-stuck-stories.ps1 - Resets stories stuck in processing states
# Called by hive-guardian Rust binary on cleanup cycles

$PROJECT_ROOT = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
$STORIES_DIR = Join-Path $PROJECT_ROOT "docs/stories"
$STUCK_THRESHOLD_MINUTES = 30
$cleaned = 0

if (-not (Test-Path $STORIES_DIR)) {
    exit 0
}

$stories = Get-ChildItem -Path $STORIES_DIR -Filter "*.md" -ErrorAction SilentlyContinue

foreach ($story in $stories) {
    try {
        $content = [System.IO.File]::ReadAllText($story.FullName, [System.Text.Encoding]::UTF8)
        $lastWrite = $story.LastWriteTime
        $minutesAgo = ((Get-Date) - $lastWrite).TotalMinutes

        # Check if stuck in processing states for too long
        $isStuck = $false
        if ($content -match "Status:\*\*\s*EM_EXECUCAO" -and $minutesAgo -gt $STUCK_THRESHOLD_MINUTES) {
            $isStuck = $true
        }
        if ($content -match "subStatus:\*\*\s*processing_by_" -and $minutesAgo -gt $STUCK_THRESHOLD_MINUTES) {
            $isStuck = $true
        }

        if ($isStuck) {
            # Check if the corresponding lock file exists (worker still running)
            $hasAiderLock = Test-Path (Join-Path $PROJECT_ROOT ".worker_aider.lock")
            $hasRevisorLock = Test-Path (Join-Path $PROJECT_ROOT ".worker_revisor.lock")

            if (-not $hasAiderLock -and -not $hasRevisorLock) {
                # No lock = worker crashed, reset to TODO
                $newContent = $content -replace "Status:\*\*\s*EM_EXECUCAO", "Status:** TODO"
                $newContent = $newContent -replace "Status:\*\*\s*EM_REVISAO", "Status:** TODO"
                $newContent = $newContent -replace "subStatus:\*\*\s*processing_by_\w+", "subStatus:** pending_worker"
                $newContent = $newContent -replace "subStatus:\*\*\s*reviewing_by_\w+", "subStatus:** pending_worker"
                [System.IO.File]::WriteAllText($story.FullName, $newContent, [System.Text.Encoding]::UTF8)
                $cleaned++
                Write-Host "[CLEANUP] Reset stuck story: $($story.Name) (inactive for $([math]::Round($minutesAgo))min)" -ForegroundColor Yellow
            }
        }
    }
    catch {
        continue
    }
}

if ($cleaned -gt 0) {
    Write-Host "[CLEANUP] Reset $cleaned stuck stories." -ForegroundColor Green
}
