# E-GUCE 3G - Start Script (PowerShell)

Write-Host "E-GUCE 3G - Demarrage du systeme" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[INFO] Verification des prerequis..." -ForegroundColor Blue

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Docker n'est pas installe" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Docker est installe" -ForegroundColor Green

# Step 2: Start infrastructure
Write-Host "[INFO] Demarrage de l'infrastructure Docker..." -ForegroundColor Blue

$compose_file = "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\docker-compose.yml"

if (-not (Test-Path $compose_file)) {
    Write-Host "[ERROR] docker-compose.yml non trouve" -ForegroundColor Red
    exit 1
}

Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "[INFO] Lancement des conteneurs Docker..." -ForegroundColor Blue
docker-compose -f $compose_file up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Erreur lors du demarrage de Docker Compose" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "[OK] Infrastructure Docker demarree" -ForegroundColor Green

# Step 3: Wait for services
Write-Host "[INFO] Attente des services (30s)..." -ForegroundColor Blue
Start-Sleep -Seconds 30

# Step 4: Build backend if needed
Write-Host "[INFO] Verification du build..." -ForegroundColor Blue

$all_built = $true
$services = @('ms-generator', 'ms-procedure', 'ms-referential')

foreach ($service in $services) {
    $target_dir = ".\$service\target\classes"
    if (Test-Path $target_dir) {
        Write-Host "[OK] $service est compile" -ForegroundColor Green
    } else {
        Write-Host "[WARN] $service n'est pas compile" -ForegroundColor Yellow
        $all_built = $false
    }
}

if (-not $all_built) {
    Write-Host "[INFO] Compilation du projet Maven..." -ForegroundColor Blue
    
    $mvn = if (Test-Path ".\mvnw.cmd") { ".\mvnw.cmd" } else { "mvn" }
    
    Write-Host "[INFO] Compilation de guce-common..." -ForegroundColor Blue
    & $mvn install -DskipTests -q -f ".\guce-common\pom.xml"
    
    Write-Host "[INFO] Compilation de ms-generator..." -ForegroundColor Blue
    & $mvn package -DskipTests -q -f ".\ms-generator\pom.xml"
    
    Write-Host "[INFO] Compilation de ms-procedure..." -ForegroundColor Blue
    & $mvn package -DskipTests -q -f ".\ms-procedure\pom.xml"
    
    Write-Host "[INFO] Compilation de ms-referential..." -ForegroundColor Blue
    & $mvn package -DskipTests -q -f ".\ms-referential\pom.xml"
    
    Write-Host "[OK] Compilation terminee" -ForegroundColor Green
}

# Step 5: Start backend services
Write-Host "[INFO] Demarrage des microservices Backend..." -ForegroundColor Blue

$mvn = if (Test-Path ".\mvnw.cmd") { ".\mvnw.cmd" } else { "mvn" }

Start-Process -NoNewWindow -FilePath $mvn -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `".\ms-generator\pom.xml`""
Write-Host "[INFO] ms-generator demarrage lance (port 8103)" -ForegroundColor Blue

Start-Process -NoNewWindow -FilePath $mvn -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `".\ms-procedure\pom.xml`""
Write-Host "[INFO] ms-procedure demarrage lance (port 8102)" -ForegroundColor Blue

Start-Process -NoNewWindow -FilePath $mvn -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `".\ms-referential\pom.xml`""
Write-Host "[INFO] ms-referential demarrage lance (port 8101)" -ForegroundColor Blue

Start-Sleep -Seconds 5

# Step 6: Start frontend
Write-Host "[INFO] Demarrage du frontend Angular..." -ForegroundColor Blue

$hub_dir = ".\frontend\e-guce-hub"

if (-not (Test-Path $hub_dir)) {
    Write-Host "[ERROR] Repertoire frontend non trouve" -ForegroundColor Red
    Pop-Location
    exit 1
}

if (-not (Test-Path "$hub_dir\node_modules")) {
    Write-Host "[INFO] Installation des dependances npm..." -ForegroundColor Blue
    Push-Location $hub_dir
    npm install
    Pop-Location
}

Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory $hub_dir
Write-Host "[INFO] Frontend angular demarrage lance (port 4200)" -ForegroundColor Blue

Pop-Location

# Step 7: Display summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "E-GUCE 3G - Systeme demarre" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "SERVICES DISPONIBLES:" -ForegroundColor Green
Write-Host ""
Write-Host "Applications:" -ForegroundColor Cyan
Write-Host "  Hub Frontend:        http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "Outils:" -ForegroundColor Cyan
Write-Host "  Keycloak Admin:      http://localhost:8180 (admin/admin)" -ForegroundColor Yellow
Write-Host "  Grafana:             http://localhost:3000 (admin/admin)" -ForegroundColor Yellow
Write-Host "  Prometheus:          http://localhost:9090" -ForegroundColor Yellow
Write-Host "  Camunda Operate:     http://localhost:8081" -ForegroundColor Yellow
Write-Host ""
Write-Host "Super Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Login:    admin@guce.cm" -ForegroundColor Yellow
Write-Host "  Password: admin" -ForegroundColor Yellow
Write-Host "  Role:     SUPER_ADMIN (full access)" -ForegroundColor Yellow
Write-Host ""
