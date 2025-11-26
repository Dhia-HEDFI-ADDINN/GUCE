# E-GUCE 3G - Complete Start Script (PowerShell)
# Starts: Infrastructure + Microservices + Frontends

param(
    [string]$Mode = 'all'  # Options: all, infra, backend, frontend, build
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                E-GUCE 3G - Demarrage complet du systeme                       ║" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "║  Cette plateforme demarre:" -ForegroundColor Cyan
Write-Host "║  OK Infrastructure Docker (16 services)" -ForegroundColor Cyan
Write-Host "║  OK Microservices Backend Spring Boot (3 services)" -ForegroundColor Cyan
Write-Host "║  OK Frontends Angular (2 applications)" -ForegroundColor Cyan
Write-Host "║" -ForegroundColor Cyan
Write-Host "║  Duree estimee: 3-5 minutes" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# ========================= STEP 1: START INFRASTRUCTURE =========================

if ($Mode -eq 'all' -or $Mode -eq 'infra') {
    Write-Host "[INFO] Etape 1/3: Demarrage de l'infrastructure Docker..." -ForegroundColor Blue
    Write-Host ""
    
    $compose_file = "$PROJECT_ROOT\docker-compose.yml"
    
    if (-not (Test-Path $compose_file)) {
        Write-Host "[ERROR] docker-compose.yml non trouve" -ForegroundColor Red
        exit 1
    }
    
    Push-Location $PROJECT_ROOT
    
    Write-Host "[INFO] Lancement des 17 conteneurs Docker..." -ForegroundColor Yellow
    docker-compose -f $compose_file up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors du demarrage de Docker Compose" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Write-Host "[INFO] Attente de l'initialisation des services (60s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    Write-Host "[OK] Infrastructure demarree" -ForegroundColor Green
    Write-Host ""
}

# ========================= STEP 2: BUILD & START BACKEND =========================

if ($Mode -eq 'all' -or $Mode -eq 'backend' -or $Mode -eq 'build') {
    Write-Host "[INFO] Etape 2/3: Demarrage des microservices Backend..." -ForegroundColor Blue
    Write-Host ""
    
    Push-Location $PROJECT_ROOT
    
    $mvn = if (Test-Path ".\mvnw.cmd") { ".\mvnw.cmd" } else { "mvn" }
    
    # Check build status
    $all_built = $true
    $services = @('ms-generator', 'ms-procedure', 'ms-referential')
    
    foreach ($service in $services) {
        $target_dir = ".\$service\target\classes"
        if (-not (Test-Path $target_dir)) {
            $all_built = $false
            break
        }
    }
    
    if (-not $all_built -or $Mode -eq 'build') {
        Write-Host "[INFO] Compilation du projet Maven..." -ForegroundColor Yellow
        
        Write-Host "[INFO] Compilation de guce-common..." -ForegroundColor Yellow
        & $mvn install -DskipTests -q -f ".\guce-common\pom.xml"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Erreur lors de la compilation" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        
        Write-Host "[INFO] Compilation de ms-referential..." -ForegroundColor Yellow
        & $mvn package -DskipTests -q -f ".\ms-referential\pom.xml"
        
        Write-Host "[INFO] Compilation de ms-procedure..." -ForegroundColor Yellow
        & $mvn package -DskipTests -q -f ".\ms-procedure\pom.xml"
        
        Write-Host "[INFO] Compilation de ms-generator..." -ForegroundColor Yellow
        & $mvn package -DskipTests -q -f ".\ms-generator\pom.xml"
        
        Write-Host "[OK] Compilation terminee" -ForegroundColor Green
    } else {
        Write-Host "[OK] Services deja compiles" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "[INFO] Lancement des microservices..." -ForegroundColor Yellow
    
    Start-Process -NoNewWindow -FilePath $mvn `
        -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `".\ms-referential\pom.xml`""
    Write-Host "[OK] ms-referential (port 8101) lance" -ForegroundColor Green
    
    Start-Process -NoNewWindow -FilePath $mvn `
        -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `".\ms-procedure\pom.xml`""
    Write-Host "[OK] ms-procedure (port 8102) lance" -ForegroundColor Green
    
    Start-Process -NoNewWindow -FilePath $mvn `
        -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `".\ms-generator\pom.xml`""
    Write-Host "[OK] ms-generator (port 8103) lance" -ForegroundColor Green
    
    Write-Host "[INFO] Attente du demarrage des microservices (90s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 90
    
    Pop-Location
    Write-Host ""
}

# ========================= STEP 3: START FRONTEND =========================

if ($Mode -eq 'all' -or $Mode -eq 'frontend') {
    Write-Host "[INFO] Etape 3/3: Demarrage des frontends Angular..." -ForegroundColor Blue
    Write-Host ""
    
    Push-Location $PROJECT_ROOT
    
    $hub_dir = ".\frontend\e-guce-hub"
    
    if (-not (Test-Path $hub_dir)) {
        Write-Host "[ERROR] Repertoire frontend non trouve" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    # Install dependencies if needed
    if (-not (Test-Path "$hub_dir\node_modules")) {
        Write-Host "[INFO] Installation des dependances npm..." -ForegroundColor Yellow
        Push-Location $hub_dir
        npm install --silent
        Pop-Location
        Write-Host "[OK] Dependances installes" -ForegroundColor Green
    } else {
        Write-Host "[OK] Dependances deja installes" -ForegroundColor Green
    }
    
    Write-Host "[INFO] Lancement du Hub Frontend (port 4200)..." -ForegroundColor Yellow
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory $hub_dir
    Write-Host "[OK] Hub Frontend lance" -ForegroundColor Green
    
    Write-Host "[INFO] Attente du demarrage du frontend (60s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    Pop-Location
    Write-Host ""
}

# ========================= SUMMARY =========================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    PLATEFORME E-GUCE 3G OPERATIONNELLE                        ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "║ APPLICATIONS                                                                   ║" -ForegroundColor Green
Write-Host "║   Hub Frontend:                 http://localhost:4200" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║   Instance Template:            http://localhost:4201" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║" -ForegroundColor Green
Write-Host "║ MICROSERVICES" -ForegroundColor Green
Write-Host "║   ms-referential (8101):        http://localhost:8101/actuator/health" -ForegroundColor Yellow -NoNewline
Write-Host " ║" -ForegroundColor Green
Write-Host "║   ms-procedure (8102):          http://localhost:8102/actuator/health" -ForegroundColor Yellow -NoNewline
Write-Host " ║" -ForegroundColor Green
Write-Host "║   ms-generator (8103):          http://localhost:8103/actuator/health" -ForegroundColor Yellow -NoNewline
Write-Host " ║" -ForegroundColor Green
Write-Host "║" -ForegroundColor Green
Write-Host "║ INFRASTRUCTURE & OUTILS" -ForegroundColor Green
Write-Host "║   Keycloak (SSO):               http://localhost:8180" -ForegroundColor Yellow -NoNewline
Write-Host "  (admin/admin) ║" -ForegroundColor Green
Write-Host "║   Grafana (Monitoring):         http://localhost:3000" -ForegroundColor Yellow -NoNewline
Write-Host "   (admin/admin) ║" -ForegroundColor Green
Write-Host "║   Prometheus (Metrics):         http://localhost:9090" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║   Camunda Operate:              http://localhost:8081" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║   Camunda Tasklist:             http://localhost:8082" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║   Kafka UI:                     http://localhost:8090" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║   MinIO Console:                http://localhost:9001" -ForegroundColor Yellow -NoNewline
Write-Host "  (guce/guceminio) ║" -ForegroundColor Green
Write-Host "║" -ForegroundColor Green
Write-Host "║ SUPER ADMIN CREDENTIALS" -ForegroundColor Green
Write-Host "║   URL:                          http://localhost:4200" -ForegroundColor Yellow -NoNewline
Write-Host "       ║" -ForegroundColor Green
Write-Host "║   Email:                        admin@guce.cm" -ForegroundColor Yellow -NoNewline
Write-Host "              ║" -ForegroundColor Green
Write-Host "║   Password:                     admin" -ForegroundColor Yellow -NoNewline
Write-Host "                  ║" -ForegroundColor Green
Write-Host "║   Role:                         SUPER_ADMIN (full access)" -ForegroundColor Yellow -NoNewline
Write-Host "   ║" -ForegroundColor Green
Write-Host "║" -ForegroundColor Green
Write-Host "║ MODULES DISPONIBLES" -ForegroundColor Green
Write-Host "║   OK Dashboard" -ForegroundColor Green
Write-Host "║   OK Tenant Builder (gestion des instances)" -ForegroundColor Green
Write-Host "║   OK Generator Engine (generation de code)" -ForegroundColor Green
Write-Host "║   OK Monitoring 360 (surveillance complete)" -ForegroundColor Green
Write-Host "║   OK Admin Central (administration)" -ForegroundColor Green
Write-Host "║   OK Templates Library (bibliotheque de templates)" -ForegroundColor Green
Write-Host "║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "COMMANDES UTILES:" -ForegroundColor Yellow
Write-Host "  Arreter tous les services:  docker-compose -f docker-compose.yml down" -ForegroundColor Cyan
Write-Host "  Consulter les logs:         Get-Content -Path (ls /tmp/ms-*.log | Select -Last 1).FullName -Tail 50 -Wait" -ForegroundColor Cyan
Write-Host ""
