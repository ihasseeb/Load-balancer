# AI Load Balancer - Services Monitoring
# Checks all services: Redis, Prometheus, Loki, Promtail, NGINX, Backend, Dashboard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Services Health Monitor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check port and process
function Check-Port {
    param ($Port, $Name, $ProcName)
    
    # Check by Port
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($connection) {
        Write-Host "[OK] $Name (Port $Port) - Running" -ForegroundColor Green
        return $true
    }

    # Fallback: Check by Process Name if ProcName provided
    if ($ProcName) {
        $proc = Get-Process $ProcName -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "[OK] $Name ($ProcName) - Running (Port pending)" -ForegroundColor Green
            return $true
        }
    }
    
    Write-Host "[X] $Name - Not Running" -ForegroundColor Red
    return $false
}

# Function to check HTTP endpoint
function Check-Endpoint {
    param ($Url, $Name)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] $Name - Responding" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[X] $Name - Not Responding" -ForegroundColor Red
        return $false
    }
}

Write-Host "Checking External Services..." -ForegroundColor Yellow
Write-Host ""

$Status = @{}
$Status["Redis"] = Check-Port 6379 "Redis" "redis-server"
$Status["Prometheus"] = Check-Port 9090 "Prometheus" "prometheus"
$Status["Loki"] = Check-Port 3100 "Loki" "loki-windows-amd64"
$Status["Promtail"] = Check-Port 9080 "Promtail" "promtail-windows-amd64"
$Status["NGINX"] = Check-Port 80 "NGINX" "nginx"

Write-Host ""
Write-Host "Checking Node.js Applications..." -ForegroundColor Yellow
Write-Host ""

$Status["Backend"] = Check-Endpoint "http://localhost:8000/api/v1/health" "Backend API (8000)"
$Status["Dashboard"] = Check-Endpoint "http://localhost:3000" "Dashboard (3000)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Running = ($Status.Values | Where-Object { $_ -eq $true }).Count
$Total = $Status.Count

Write-Host "Services Running: $Running / $Total" -ForegroundColor Yellow
Write-Host ""

Write-Host "Status Details:" -ForegroundColor Cyan
foreach ($Service in $Status.GetEnumerator()) {
    $Icon = if ($Service.Value) { "[OK]" } else { "[X]" }
    $Color = if ($Service.Value) { "Green" } else { "Red" }
    Write-Host "  $Icon $($Service.Name)" -ForegroundColor $Color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Access:" -ForegroundColor Yellow
Write-Host "  Dashboard:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:    http://localhost:8000" -ForegroundColor White
Write-Host "  Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  Loki:       http://localhost:3100" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask user what to do
Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  1. Open Dashboard in Browser" -ForegroundColor White
Write-Host "  2. Check Service Details" -ForegroundColor White
Write-Host "  3. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1-3)"

if ($choice -eq "1") {
    Write-Host "Opening Dashboard..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "To view services from Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Open http://localhost:3000" -ForegroundColor White
    Write-Host "  2. Login with credentials" -ForegroundColor White
    Write-Host "  3. Navigate to 'Services' tab" -ForegroundColor White
} else {
    Write-Host "Exiting..." -ForegroundColor Yellow
}

Write-Host ""

