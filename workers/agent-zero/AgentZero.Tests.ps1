# AgentZero.Tests.ps1 - Unit tests for infrastructure worker scripts

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Describe "Agent Zero Infrastructure Scripts" {
    
    Context "Report-Error" {
        It "Should create a JSON error log file" {
            $taskId = "test-task-$(Get-Random)"
            $errorMsg = "Testing error reporting"
            
            & "$scriptRoot\Report-Error.ps1" -ErrorMessage $errorMsg -TaskId $taskId
            
            $logPath = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/workers/agent-zero/logs"
            $logFile = Get-ChildItem $logPath -Filter "error-$taskId-*.json" | Select-Object -First 1
            
            $logFile | Should Not Be $null
            $content = Get-Content $logFile.FullName | ConvertFrom-Json
            $content.message | Should Be $errorMsg
            
            # Cleanup
            Remove-Item $logFile.FullName
        }
    }

    Context "Initialize-Environment" {
        It "Should set environment variables in the current process" {
            $testVars = @{ "DIANA_TEST_VAR" = "Verified" }
            & "$scriptRoot\Initialize-Environment.ps1" -EnvVars $testVars
            
            $envValue = [System.Environment]::GetEnvironmentVariable("DIANA_TEST_VAR", "Process")
            $envValue | Should Be "Verified"
        }
    }
}
