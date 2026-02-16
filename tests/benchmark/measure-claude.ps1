$files = @(
    "C:\Users\User\Desktop\Diana-Corporacao-Senciente\tests\benchmark\claude-results\string-utils.ts",
    "C:\Users\User\Desktop\Diana-Corporacao-Senciente\tests\benchmark\claude-results\array-utils.ts",
    "C:\Users\User\Desktop\Diana-Corporacao-Senciente\tests\benchmark\claude-results\math-utils.ts"
)
foreach ($f in $files) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($f)
    $content = Get-Content $f
    $lines = $content.Count
    $size = (Get-Item $f).Length
    $funcs = ($content | Select-String "export (const|function)").Count
    $jsdoc = ($content | Select-String "/\*\*").Count
    $tests = ($content | Select-String "console\.assert").Count
    Write-Host "[$name] Lines:$lines Size:${size}b Functions:$funcs JSDoc:$jsdoc TestCases:$tests"
}
