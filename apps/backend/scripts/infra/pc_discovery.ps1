# PC Discovery - Descoberta Automática de PCs (PowerShell)
# Corporação Senciente - Fase 0.5

param(
    [string]$NetworkRange = "192.168.1.0/24",
    [string]$BrainHost = "localhost",
    [int]$BrainPort = 3001,
    [int]$SSHPort = 2222,
    [switch]$Continuous,
    [int]$IntervalMinutes = 30
)

# Configurações
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogFile = Join-Path $ScriptPath "discovery.log"

# Função de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

# Obter interfaces de rede ativas
function Get-NetworkInterfaces {
    $interfaces = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
        $ip = Get-NetIPAddress -InterfaceAlias $_.Name -AddressFamily IPv4 | Select-Object -First 1
        if ($ip) {
            @{
                Name         = $_.Name
                IPAddress    = $ip.IPAddress
                PrefixLength = $ip.PrefixLength
            }
        }
    }
    return $interfaces | Where-Object { $_ -ne $null }
}

# Calcular range de IP
function Get-IPRange {
    param([string]$IPAddress, [int]$PrefixLength)

    $ipBytes = $IPAddress -split '\.'
    $subnetMask = [math]::Pow(2, 32) - [math]::Pow(2, 32 - $PrefixLength)

    $networkInt = 0
    for ($i = 0; $i -lt 4; $i++) {
        $networkInt = $networkInt * 256 + [int]$ipBytes[$i]
    }
    $networkInt = $networkInt -band $subnetMask

    $startIP = @()
    $endIP = @()
    for ($i = 3; $i -ge 0; $i--) {
        $startIP = @(($networkInt -shr ($i * 8) -band 255)) + $startIP
        $endIP = @((($networkInt -shr ($i * 8) -band 255) + (255 -shr ($i * 8) -band 255))) + $endIP
    }

    return @{
        StartIP = $startIP -join '.'
        EndIP   = $endIP -join '.'
        Network = "$($startIP[0]).$($startIP[1]).$($startIP[2]).$($startIP[3])"
    }
}

# Escanear hosts ativos com ping
function Scan-Network {
    param([string]$StartIP, [string]$EndIP, [int]$MaxHosts = 50)

    Write-Log "Escaneando rede: $StartIP - $EndIP"

    $startBytes = $StartIP -split '\.'
    $endBytes = $EndIP -split '\.'

    $activeHosts = @()
    $scanned = 0

    for ($a = [int]$startBytes[0]; $a -le [int]$endBytes[0] -and $scanned -lt $MaxHosts; $a++) {
        for ($b = [int]$startBytes[1]; $b -le [int]$endBytes[1] -and $scanned -lt $MaxHosts; $b++) {
            for ($c = [int]$startBytes[2]; $c -le [int]$endBytes[2] -and $scanned -lt $MaxHosts; $c++) {
                for ($d = [int]$startBytes[3]; $d -le [int]$endBytes[3] -and $scanned -lt $MaxHosts; $d++) {
                    $ip = "$a.$b.$c.$d"

                    try {
                        $ping = Test-Connection -ComputerName $ip -Count 1 -TimeoutSeconds 1 -ErrorAction Stop
                        if ($ping) {
                            $activeHosts += $ip
                            $scanned++
                            Write-Log "Host ativo encontrado: $ip" "DEBUG"
                        }
                    }
                    catch {
                        # Host não responde, continuar
                    }
                }
            }
        }
    }

    Write-Log "Encontrados $($activeHosts.Count) hosts ativos"
    return $activeHosts
}

# Verificar se host é PC da corporação
function Test-CorporationPC {
    param([string]$IPAddress)

    try {
        # Tentar conectar via SSH e verificar marcadores
        $sshCommand = "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p $SSHPort brain@$IPAddress"

        # Verificar arquivo de configuração
        $checkCommand = "$sshCommand `"test -f /home/brain/.corporacao-senciente && echo 'found' || echo 'not-found'`""
        $result = cmd /c $checkCommand 2>$null

        if ($result -match "found") {
            Write-Log "PC da corporação encontrado: $IPAddress"
            return $true
        }

        # Verificar hostname
        $hostnameCommand = "$sshCommand `"hostname`""
        $hostnameResult = cmd /c $hostnameCommand 2>$null

        if ($hostnameResult -match "corporacao|brain") {
            Write-Log "PC da corporação encontrado (hostname): $IPAddress - $hostnameResult"
            return $true
        }

    }
    catch {
        Write-Log "Erro ao verificar $IPAddress : $($_.Exception.Message)" "DEBUG"
    }

    return $false
}

# Coletar informações do PC
function Get-PCInfo {
    param([string]$IPAddress)

    $pcInfo = @{
        ip             = $IPAddress
        hostname       = $null
        os             = $null
        specialization = $null
        status         = "active"
        ssh_status     = "online"
    }

    try {
        $sshCommand = "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p $SSHPort brain@$IPAddress"

        # Obter hostname
        $hostnameCommand = "$sshCommand `"hostname`""
        $hostnameResult = cmd /c $hostnameCommand 2>$null
        if ($hostnameResult) {
            $pcInfo.hostname = $hostnameResult.Trim()
        }

        # Obter sistema operacional
        $osCommand = "$sshCommand `"uname -s`""
        $osResult = cmd /c $osCommand 2>$null
        if ($osResult) {
            $pcInfo.os = $osResult.Trim()
        }

        # Obter especialização
        $configCommand = "$sshCommand `"cat pc_config.json 2>/dev/null`""
        $configResult = cmd /c $configCommand 2>$null
        if ($configResult -and $configResult -notmatch "not-found") {
            try {
                $config = $configResult | ConvertFrom-Json
                $pcInfo.specialization = $config.pc_info.specialization
            }
            catch {
                # Configuração inválida
            }
        }

    }
    catch {
        Write-Log "Erro ao coletar info de $IPAddress : $($_.Exception.Message)"
        $pcInfo.ssh_status = "offline"
    }

    return $pcInfo
}

# Registrar PC no sistema central
function Register-PC {
    param([hashtable]$PCInfo)

    try {
        $registrationData = $PCInfo.Clone()
        $registrationData.registered_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        $registrationData.last_seen = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")

        $jsonData = $registrationData | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "http://$BrainHost`:$BrainPort/api/pcs/register" `
            -Method POST `
            -Body $jsonData `
            -ContentType "application/json"

        if ($response.success) {
            Write-Log "PC $($PCInfo.hostname) registrado com sucesso"
            return $true
        }
        else {
            Write-Log "Falha ao registrar $($PCInfo.hostname): $($response.error)" "ERROR"
            return $false
        }

    }
    catch {
        Write-Log "Erro ao registrar $($PCInfo.hostname): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Função principal de descoberta
function Start-Discovery {
    Write-Log "=========================================="
    Write-Log "🔍 INICIANDO DESCOBERTA DE PCs"
    Write-Log "=========================================="

    # Obter interfaces de rede
    $interfaces = Get-NetworkInterfaces

    if ($interfaces.Count -eq 0) {
        Write-Log "Nenhuma interface de rede ativa encontrada" "ERROR"
        return
    }

    Write-Log "Interfaces ativas encontradas: $($interfaces.Count)"

    $allActiveHosts = @()

    # Escanear cada interface
    foreach ($iface in $interfaces) {
        Write-Log "Escaneando interface: $($iface.Name) ($($iface.IPAddress))"

        $range = Get-IPRange -IPAddress $iface.IPAddress -PrefixLength $iface.PrefixLength
        $activeHosts = Scan-Network -StartIP $range.StartIP -EndIP $range.EndIP

        $allActiveHosts += $activeHosts
    }

    # Remover duplicatas
    $allActiveHosts = $allActiveHosts | Select-Object -Unique

    Write-Log "Total de hosts ativos encontrados: $($allActiveHosts.Count)"

    if ($allActiveHosts.Count -eq 0) {
        Write-Log "Nenhum host ativo encontrado"
        return
    }

    # Verificar PCs da corporação
    Write-Log "Verificando PCs da corporação..."
    $corporationPCs = @()

    foreach ($ip in $allActiveHosts) {
        if (Test-CorporationPC -IPAddress $ip) {
            $corporationPCs += $ip
        }
    }

    Write-Log "PCs da corporação encontrados: $($corporationPCs.Count)"

    if ($corporationPCs.Count -eq 0) {
        Write-Log "Nenhum PC novo da corporação encontrado"
        return
    }

    # Coletar informações
    Write-Log "Coletando informações dos PCs..."
    $pcDetails = @()

    foreach ($ip in $corporationPCs) {
        $info = Get-PCInfo -IPAddress $ip
        if ($info.hostname) {
            $pcDetails += $info
        }
    }

    # Registrar PCs
    Write-Log "Registrando PCs no sistema central..."
    $registered = 0

    foreach ($pc in $pcDetails) {
        if (Register-PC -PCInfo $pc) {
            $registered++
        }
    }

    # Resumo
    Write-Log "=========================================="
    Write-Log "✅ DESCOBERTA CONCLUÍDA"
    Write-Log "=========================================="
    Write-Log "Hosts escaneados: $($allActiveHosts.Count)"
    Write-Log "PCs da corporação: $($corporationPCs.Count)"
    Write-Log "PCs registrados: $registered"
    Write-Log "=========================================="
}

# Execução principal
try {
    if ($Continuous) {
        Write-Log "Iniciando descoberta contínua (intervalo: $IntervalMinutes minutos)"

        # Descoberta inicial
        Start-Discovery

        # Loop contínuo
        while ($true) {
            Start-Sleep -Seconds ($IntervalMinutes * 60)
            Write-Log "Executando descoberta programada..."
            Start-Discovery
        }
    }
    else {
        Start-Discovery
    }

}
catch {
    Write-Log "Erro fatal: $($_.Exception.Message)" "ERROR"
    exit 1
}






