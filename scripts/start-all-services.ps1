# AI Load Balancer - Complete Services Launcher
# Starts all services: Redis, Prometheus, Loki, Promtail, NGINX, Backend, Dashboard

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$BinDir = Join-Path $PSScriptRoot "bin"
$RootDir = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[START] AI Load Balancer - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $BinDir)) {
    Write-Host "[ERROR] 'bin' folder not found!" -ForegroundColor Red
    Write-Host "Please run 'setup-tools.ps1' first to download services." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "[INFO] Services to start:" -ForegroundColor Green
Write-Host "  1. Redis (6379)" -ForegroundColor White
Write-Host "  2. Prometheus (9090)" -ForegroundColor White
Write-Host "  3. Loki (3100)" -ForegroundColor White
Write-Host "  4. Promtail" -ForegroundColor White
Write-Host "  5. NGINX (80)" -ForegroundColor White
Write-Host "  6. Backend API (8000)" -ForegroundColor White
Write-Host "  7. Dashboard (3000)" -ForegroundColor White
Write-Host ""

# Function to start service
function Start-Service-Tool {
    param ($Name, $ExePath, $Args, $ProcName, $Port)
    
    if (-not (Test-Path $ExePath)) {
        Write-Host "⚠️  $Name not found at: $ExePath" -ForegroundColor Yellow
        return
    }

    $running = Get-Process $ProcName -ErrorAction SilentlyContinue
    if ($running) {
        Write-Host "[OK] $Name already running" -ForegroundColor Green
    }
    else {
        Write-Host "[>>] Starting $Name..." -ForegroundColor Yellow
        # Run from BinDir to avoid path issues with config files
        if ($Args -and $Args.Length -gt 0) {
            Start-Process -FilePath $ExePath -ArgumentList $Args -WindowStyle Minimized -WorkingDirectory $BinDir
        } else {
            Start-Process -FilePath $ExePath -WindowStyle Minimized -WorkingDirectory $BinDir
        }
        Start-Sleep -Seconds 1
        Write-Host "[OK] $Name started" -ForegroundColor Green
    }
}

# Clear old ports and processes
Write-Host ""
Write-Host "[CLEANUP] Clearing previous processes..." -ForegroundColor Yellow
$ServicesToKill = @("redis-server", "prometheus", "loki-windows-amd64", "promtail-windows-amd64", "nginx", "node")
foreach ($svc in $ServicesToKill) {
    Get-Process $svc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Clear any abandoned ports
@(8000, 3000, 3100, 9090, 6379, 80, 9080) | ForEach-Object {
    $proc = Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($proc) { Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue }
}

# Ensure critical directories exist
$DataDirs = @(
    "$BinDir\loki-data",
    "$BinDir\loki-data\chunks",
    "$BinDir\loki-data\boltdb-shipper-active",
    "$BinDir\loki-data\boltdb-shipper-cache",
    "$BinDir\loki-data\boltdb-shipper-compactor",
    "$BinDir\tmp"
)
foreach ($dir in $DataDirs) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

Write-Host "[OK] Environment cleaned and ready" -ForegroundColor Green
Write-Host ""

# Start External Services
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[EXTERNAL] Starting External Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Start-Service-Tool -Name "Redis" -ExePath "$BinDir\redis-server.exe" -Args "redis.windows.conf" -ProcName "redis-server" -Port 6379

Start-Service-Tool -Name "Prometheus" -ExePath "$BinDir\prometheus.exe" -Args "--config.file=prometheus.yml" -ProcName "prometheus" -Port 9090

if (Test-Path "$BinDir\loki-windows-amd64.exe") {
    Start-Service-Tool -Name "Loki" -ExePath "$BinDir\loki-windows-amd64.exe" -Args "--config.file=loki-config.yaml" -ProcName "loki-windows-amd64" -Port 3100
}

if (Test-Path "$BinDir\promtail-windows-amd64.exe") {
    Start-Service-Tool -Name "Promtail" -ExePath "$BinDir\promtail-windows-amd64.exe" -Args "--config.file=promtail-config.yaml" -ProcName "promtail-windows-amd64" -Port "-"
}

if (Test-Path "$BinDir\nginx.exe") {
    # NGINX needs to run from its own directory
    Write-Host "[>>] Starting NGINX..." -ForegroundColor Yellow
    $nginxProc = Get-Process "nginx" -ErrorAction SilentlyContinue
    if (-not $nginxProc) {
        Start-Process -FilePath "$BinDir\nginx.exe" -ArgumentList "-c nginx.conf" -WindowStyle Minimized -WorkingDirectory "$BinDir"
        Start-Sleep -Seconds 1
        Write-Host "[OK] NGINX started" -ForegroundColor Green
    } else {
        Write-Host "[OK] NGINX already running" -ForegroundColor Green
    }
}

Start-Sleep -Seconds 2

# Start Node.js Services
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[NODEJS] Starting Node.js Applications..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[>>] Starting Backend API..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$RootDir'; npm start" -WindowStyle Normal
Write-Host "[OK] Backend started (Port 8000)" -ForegroundColor Green

Start-Sleep -Seconds 3

Write-Host "[>>] Starting Dashboard..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$RootDir\AI Load Balancing Dashboard'; npm run dev" -WindowStyle Normal
Write-Host "[OK] Dashboard started (Port 3000)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[SUCCESS] All Services Online!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[ENDPOINTS] Service Endpoints:" -ForegroundColor Cyan
Write-Host "  Backend API:    http://localhost:8000" -ForegroundColor White
Write-Host "  Dashboard:      http://localhost:3000" -ForegroundColor White
Write-Host "  Redis:          localhost:6379" -ForegroundColor White
Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor White
Write-Host "  Loki:           http://localhost:3100" -ForegroundColor White
Write-Host "  NGINX:          http://localhost:80" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Tips:" -ForegroundColor Yellow
Write-Host "  - Monitor services: .\start-services-monitor.ps1" -ForegroundColor White
Write-Host "  - Stop all services: .\stop-all-services.ps1" -ForegroundColor White
Write-Host ""
Write-Host "[WAIT] Waiting for services to stabilize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[READY] System ready to use!" -ForegroundColor Green
Write-Host "   Opening Dashboard..." -ForegroundColor Green

# Dashboard will open automatically via npm run dev
# No need to open it again manually

