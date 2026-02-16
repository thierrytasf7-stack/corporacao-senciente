# start-worker-zero.ps1 - Launch Zero/Revisador worker in Windows Terminal
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

$sentinela = "nt -d `"$root`" --title REVISOR-SENTINEL cmd /c `"$root\scripts\run-sentinela-revisor.bat`""
$worker = "; sp -d `"$root`" -H --title REVISOR-EXEC cmd /c `"$root\scripts\run-revisor-listener.bat`""

Start-Process wt -ArgumentList ($sentinela + $worker)
