# Shim to run Rust binary via PowerShell wrapper
$bin = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/rust_components/hive-guardian/target/release/hive-guardian.exe"
$cwd = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/rust_components/hive-guardian"
Start-Process $bin -WorkingDirectory $cwd -Wait -NoNewWindow
