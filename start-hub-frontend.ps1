# Start Hub Frontend with Keycloak integration

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$hubDir = "$projectRoot\frontend\e-guce-hub"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "E-GUCE Hub Frontend Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if directory exists
if (-not (Test-Path $hubDir)) {
    Write-Host "[ERROR] Hub directory not found: $hubDir" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Hub directory: $hubDir" -ForegroundColor Blue

# Check if node_modules exist
if (-not (Test-Path "$hubDir\node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    Push-Location $hubDir
    npm install
    Pop-Location
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Green
}

# Start the frontend
Write-Host "[INFO] Starting Hub Frontend on port 4200..." -ForegroundColor Yellow
Write-Host "[INFO] Keycloak config:" -ForegroundColor Blue
Write-Host "  - URL: http://localhost:8180" -ForegroundColor Yellow
Write-Host "  - Realm: e-guce-hub" -ForegroundColor Yellow
Write-Host "  - Client: e-guce-hub" -ForegroundColor Yellow
Write-Host ""

Push-Location $hubDir
npm start
Pop-Location
