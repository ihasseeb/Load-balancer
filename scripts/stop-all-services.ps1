# AI Load Balancer - Shutdown Script
# Stops all running services related to the project

Write-Host "🛑 Stopping AI Load Balancer Services..." -ForegroundColor Yellow

# List of process names to kill
$Processes = @(
    "redis-server",
    "prometheus",
    "loki-windows-amd64",
    "promtail-windows-amd64",
    "grafana-server",
    "nginx",
    "node"  # This will stop Backend and Dashboard
)

foreach ($Proc in $Processes) {
    $Running = Get-Process $Proc -ErrorAction SilentlyContinue
    if ($Running) {
        Write-Host "   Killing $Proc..." -ForegroundColor Gray
        Stop-Process -Name $Proc -Force -ErrorAction SilentlyContinue
    }
}

# Also try to close any PowerShell windows that might have been spawned (Optional/Partial)
# It's hard to distinguish specific PS windows, so we rely on killing the child processes (node, etc.) above.
# The windows might remain open but empty/erroring. You can close them manually.

Write-Host "✅ All services stopped." -ForegroundColor Green
