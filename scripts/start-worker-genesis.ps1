# start-worker-genesis.ps1 - Launch Genesis worker in Windows Terminal
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

$sentinela = "nt -d `"$root`" --title GENESIS-SENTINEL cmd /c `"$root\scripts\run-sentinela.bat`""
$worker = "; sp -d `"$root`" -H --title GENESIS-EXEC cmd /c `"$root\scripts\run-worker-listener.bat`""

Start-Process wt -ArgumentList ($sentinela + $worker)
