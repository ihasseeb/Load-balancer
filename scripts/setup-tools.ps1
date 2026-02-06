# AI Load Balancer - Services Setup (Portable Mode)
# Downloads and sets up all required services locally
# Services: Redis, Prometheus, Loki, Promtail, NGINX

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$BinDir = Join-Path $PSScriptRoot "bin"
if (-not (Test-Path $BinDir)) { New-Item -ItemType Directory -Path $BinDir | Out-Null }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Load Balancer - Services Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Tools in: $BinDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Services to be installed:" -ForegroundColor Green
Write-Host "  [*] Redis (Port 6379) - Cache/Session Store" -ForegroundColor White
Write-Host "  [*] Prometheus (Port 9090) - Metrics Collection" -ForegroundColor White
Write-Host "  [*] Loki (Port 3100) - Log Aggregation" -ForegroundColor White
Write-Host "  [*] Promtail (Port -) - Log Shipper" -ForegroundColor White
Write-Host "  [*] NGINX (Port 80) - Reverse Proxy" -ForegroundColor White
Write-Host ""

function Download-Tool {
    param ($Name, $Url, $ZipName, $ExeName, $IsExe)

    $ZipPath = Join-Path $BinDir $ZipName
    $DestExe = Join-Path $BinDir $ExeName

    # Cleanup broken downloads (less than 1MB)
    if (Test-Path $DestExe) {
        $Size = (Get-Item $DestExe).Length
        if ($Size -lt 1000000) { # 1MB
            $SizeStr = $Size
            Write-Host "Found broken file $Name ($SizeStr bytes). Deleting..." -ForegroundColor Red
            Remove-Item $DestExe -Force
        }
    }

    if (-not (Test-Path $DestExe)) {
        Write-Host "Downloading $Name..." -ForegroundColor Yellow
        try {
            # Try using curl.exe first (better for GitHub redirects/TLS)
            $curlCommand = "curl.exe"
            if (Get-Command $curlCommand -ErrorAction SilentlyContinue) {
                # Use & operator to run command directly
                & $curlCommand -L "$Url" -o "$ZipPath"
                
                if (-not (Test-Path $ZipPath) -or (Get-Item $ZipPath).Length -eq 0) { 
                    throw "curl download produced empty or missing file" 
                }
            } else {
                # Fallback to Invoke-WebRequest
                $UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                Invoke-WebRequest -Uri $Url -OutFile $ZipPath -UseBasicParsing -UserAgent $UserAgent
            }
        } catch {
            Write-Host "Download Failed for $Name : $_" -ForegroundColor Red
            if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
            return
        }

        if ($IsExe -eq $true) {
            Move-Item -Path $ZipPath -Destination $DestExe -Force
        } else {
            Write-Host "Extracting $Name..." -ForegroundColor Magenta
            try {
                Expand-Archive -Path $ZipPath -DestinationPath $BinDir -Force
                Remove-Item $ZipPath -Force
                Start-Sleep -Seconds 1
                
                if ($Name -eq "Prometheus") {
                    $Sub = Get-ChildItem $BinDir -Directory | Where-Object { $_.Name -like "prometheus-*" } | Select-Object -First 1
                    if ($Sub) { 
                        Get-ChildItem $Sub.FullName -Recurse -File | Move-Item -Destination $BinDir -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Seconds 1
                        Remove-Item $Sub.FullName -Force -Recurse -ErrorAction SilentlyContinue
                    }
                }
                if ($Name -eq "Nginx") {
                    Stop-Process -Name "nginx" -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 2
                    $Sub = Get-ChildItem $BinDir -Directory | Where-Object { $_.Name -like "nginx-*" } | Select-Object -First 1
                    if ($Sub) { 
                        Get-ChildItem $Sub.FullName -Recurse -File | Move-Item -Destination $BinDir -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Seconds 1
                        Remove-Item $Sub.FullName -Force -Recurse -ErrorAction SilentlyContinue
                    }
                }
            } catch {
                Write-Host "Extraction Failed for $Name : $_" -ForegroundColor Red
                if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
            }
        }
        if (Test-Path $DestExe) {
            Write-Host "$Name Ready!" -ForegroundColor Green
        }
    } else {
        Write-Host "$Name already exists." -ForegroundColor Green
    }
}

# Run Downloads
Download-Tool "Redis" "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip" "redis.zip" "redis-server.exe" $false

Download-Tool "Prometheus" "https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.windows-amd64.zip" "prometheus.zip" "prometheus.exe" $false

Download-Tool "Loki" "https://github.com/grafana/loki/releases/download/v2.9.2/loki-windows-amd64.exe.zip" "loki.zip" "loki-windows-amd64.exe" $false

Download-Tool "Promtail" "https://github.com/grafana/loki/releases/download/v2.9.2/promtail-windows-amd64.exe.zip" "promtail.zip" "promtail-windows-amd64.exe" $false

Download-Tool "Nginx" "http://nginx.org/download/nginx-1.24.0.zip" "nginx.zip" "nginx.exe" $false

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] All Services Downloaded Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Initialize SQLite Database
Write-Host "Initializing SQLite Database..." -ForegroundColor Yellow
$LogsDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogsDir)) { 
    New-Item -ItemType Directory -Path $LogsDir | Out-Null 
    Write-Host "Created logs directory" -ForegroundColor Green
}

# Test database initialization by running a simple node script
$DbInitScript = @"
const { db } = require('./config/sqlite');
console.log('✅ SQLite Database initialized successfully');
console.log('📁 Database location: logs/monitoring.db');
process.exit(0);
"@

$DbInitPath = Join-Path $PSScriptRoot "init-db-temp.js"
$DbInitScript | Out-File -FilePath $DbInitPath -Encoding UTF8

try {
    node $DbInitPath 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQLite Database Ready!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Database will be initialized on first server start" -ForegroundColor Yellow
} finally {
    if (Test-Path $DbInitPath) {
        Remove-Item $DbInitPath -Force
    }
}

Write-Host ""
Write-Host "[INFO] Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run: .\start-all-services.ps1" -ForegroundColor White
Write-Host "  2. Services will start in separate windows" -ForegroundColor White
Write-Host "  3. Dashboard will be available at http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] To monitor services:" -ForegroundColor Yellow
Write-Host "  - Run: .\start-services-monitor.ps1" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] To stop all services:" -ForegroundColor Yellow
Write-Host "  - Run: .\stop-all-services.ps1" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] SQLite Database:" -ForegroundColor Yellow
Write-Host "  - Location: logs/monitoring.db" -ForegroundColor White
Write-Host "  - Auto-saves all API requests every 3 seconds" -ForegroundColor White
Write-Host "  - Dashboard fetches data from SQLite" -ForegroundColor White
Write-Host ""

