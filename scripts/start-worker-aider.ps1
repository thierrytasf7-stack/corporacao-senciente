# start-worker-aider.ps1 - Launch Aider worker in Windows Terminal
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

$sentinela = "nt -d `"$root`" --title AIDER-SENTINEL cmd /c `"$root\scripts\run-sentinela-aider.bat`""
$worker = "; sp -d `"$root`" -H --title AIDER-EXEC cmd /c `"$root\scripts\run-aider-listener.bat`""

Start-Process wt -ArgumentList ($sentinela + $worker)
