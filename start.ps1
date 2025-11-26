param(
    [ValidateSet('all', 'infra', 'backend', 'frontend', 'build')]
    [string]$Mode = 'all'
)

# =============================================================================
# E-GUCE 3G - Script de démarrage global (PowerShell)
# =============================================================================

$ErrorActionPreference = "Stop"

# Couleurs pour les logs
$Colors = @{
    Red    = "Red"
    Green  = "Green"
    Yellow = "Yellow"
    Blue   = "Blue"
    Cyan   = "Cyan"
}

# Répertoire racine du projet
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# =============================================================================
# Fonctions utilitaires
# =============================================================================

function Log-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor $Colors.Blue
}

function Log-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor $Colors.Green
}

function Log-Warning($message) {
    Write-Host "[WARN] $message" -ForegroundColor $Colors.Yellow
}

function Log-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor $Colors.Red
}

function Log-Section($message) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
    Write-Host " $message" -ForegroundColor $Colors.Cyan
    Write-Host "========================================" -ForegroundColor $Colors.Cyan
}

function Check-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Wait-ForService($url, $name, $timeout = 60) {
    Log-Info "Attente de $name..."
    $counter = 0
    
    while ($counter -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Log-Success "$name est prêt"
                return $true
            }
        } catch {
            # Continuer
        }
        
        Start-Sleep -Seconds 2
        $counter += 2
        Write-Host "." -NoNewline
    }
    
    Write-Host ""
    Log-Warning "$name n'a pas répondu dans le délai imparti"
    return $false
}

# =============================================================================
# Vérification des prérequis
# =============================================================================

function Check-Prerequisites {
    Log-Section "Vérification des prérequis"
    
    $required = @('docker', 'java', 'node', 'npm')
    $missing = @()
    
    foreach ($cmd in $required) {
        if (Check-Command $cmd) {
            Log-Success "$cmd est installé"
        } else {
            $missing += $cmd
            Log-Warning "$cmd n'est pas installé"
        }
    }
    
    if ($missing.Count -gt 0) {
        Log-Error "Commandes manquantes: $($missing -join ', ')"
        exit 1
    }
    
    Log-Success "Tous les prérequis sont installés"
}

# =============================================================================
# Démarrage de l'infrastructure Docker
# =============================================================================

function Start-Infrastructure {
    Log-Section "Démarrage de l'infrastructure Docker"
    
    $compose_file = "$PROJECT_ROOT\docker-compose.yml"
    
    if (-not (Test-Path $compose_file)) {
        Log-Error "docker-compose.yml non trouvé"
        exit 1
    }
    
    Log-Info "Démarrage des conteneurs Docker..."
    & docker-compose -f $compose_file up -d
    
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Erreur lors du démarrage de Docker Compose"
        exit 1
    }
    
    Log-Info "Attente des services..."
    
    # Attendre les services clés
    Wait-ForService "http://localhost:9200" "Elasticsearch" 60 | Out-Null
    Wait-ForService "http://localhost:8180" "Keycloak" 90 | Out-Null
    Wait-ForService "http://localhost:3000" "Grafana" 30 | Out-Null
    Wait-ForService "http://localhost:9090" "Prometheus" 30 | Out-Null
    
    Log-Success "Infrastructure Docker démarrée"
}

# =============================================================================
# Vérification du build
# =============================================================================

function Check-BuildStatus {
    Log-Info "Vérification des builds existants..."
    
    $all_built = $true
    
    $services = @('ms-generator', 'ms-procedure', 'ms-referential')
    
    foreach ($service in $services) {
        $target_dir = "$PROJECT_ROOT\$service\target\classes"
        
        if (Test-Path $target_dir) {
            Log-Success "$service est buildé"
        } else {
            Log-Warning "$service n'est pas buildé"
            $all_built = $false
        }
    }
    
    return $all_built
}

# =============================================================================
# Build des microservices
# =============================================================================

function Build-Backend {
    Log-Section "Compilation du projet Maven"
    
    $mvn = if (Test-Path "$PROJECT_ROOT\mvnw.cmd") { "$PROJECT_ROOT\mvnw.cmd" } else { "mvn" }
    
    # Vérifier que Maven est disponible
    if (-not (Check-Command $mvn)) {
        Log-Error "Maven n'est pas disponible"
        exit 1
    }
    
    Log-Info "Nettoyage des builds précédents..."
    & $mvn clean -q -f "$PROJECT_ROOT\pom.xml" 2>&1 | Out-Null
    
    Log-Info "Compilation de guce-common..."
    & $mvn install -DskipTests -q -f "$PROJECT_ROOT\guce-common\pom.xml"
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Erreur lors de la compilation de guce-common"
        exit 1
    }
    
    Log-Info "Compilation de ms-generator..."
    & $mvn package -DskipTests -q -f "$PROJECT_ROOT\ms-generator\pom.xml"
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Erreur lors de la compilation de ms-generator"
        exit 1
    }
    
    Log-Info "Compilation de ms-procedure..."
    & $mvn package -DskipTests -q -f "$PROJECT_ROOT\ms-procedure\pom.xml"
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Erreur lors de la compilation de ms-procedure"
        exit 1
    }
    
    Log-Info "Compilation de ms-referential..."
    & $mvn package -DskipTests -q -f "$PROJECT_ROOT\ms-referential\pom.xml"
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Erreur lors de la compilation de ms-referential"
        exit 1
    }
    
    Log-Success "Compilation terminée avec succès"
}

# =============================================================================
# Démarrage des microservices
# =============================================================================

function Start-Backend {
    Log-Section "Démarrage des microservices Backend"
    
    $mvn = if (Test-Path "$PROJECT_ROOT\mvnw.cmd") { "$PROJECT_ROOT\mvnw.cmd" } else { "mvn" }
    
    # Vérifier si build est nécessaire
    if (-not (Check-BuildStatus)) {
        Log-Warning "Compilation requise avant de démarrer..."
        Build-Backend
    } else {
        Log-Success "Services déjà buildés"
    }
    
    # Démarrer les services
    Log-Info "Démarrage de ms-generator (port 8103)..."
    Start-Process -NoNewWindow -FilePath $mvn `
        -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `"$PROJECT_ROOT\ms-generator\pom.xml`""
    
    Log-Info "Démarrage de ms-procedure (port 8102)..."
    Start-Process -NoNewWindow -FilePath $mvn `
        -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `"$PROJECT_ROOT\ms-procedure\pom.xml`""
    
    Log-Info "Démarrage de ms-referential (port 8101)..."
    Start-Process -NoNewWindow -FilePath $mvn `
        -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev -f `"$PROJECT_ROOT\ms-referential\pom.xml`""
    
    Start-Sleep -Seconds 10
    Log-Success "Microservices Backend démarrés"
}

# =============================================================================
# Démarrage du frontend
# =============================================================================

function Start-Frontend {
    Log-Section "Démarrage du frontend Angular"
    
    $hub_dir = "$PROJECT_ROOT\frontend\e-guce-hub"
    
    if (-not (Test-Path $hub_dir)) {
        Log-Error "Répertoire frontend non trouvé"
        exit 1
    }
    
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "$hub_dir\node_modules")) {
        Log-Info "Installation des dépendances..."
        Push-Location $hub_dir
        & npm install
        Pop-Location
    }
    
    Log-Info "Démarrage du Hub Frontend (port 4200)..."
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory $hub_dir
    
    Wait-ForService "http://localhost:4200" "Hub Frontend" 60 | Out-Null
    
    Log-Success "Frontend Angular démarré"
}

# =============================================================================
# Affichage du résumé
# =============================================================================

function Print-Summary {
    Log-Section "E-GUCE 3G - Système démarré"
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Green
    Write-Host "║                    SERVICES DISPONIBLES                         ║" -ForegroundColor $Colors.Green
    Write-Host "╠══════════════════════════════════════════════════════════════════╣" -ForegroundColor $Colors.Green
    Write-Host "║                                                                  ║" -ForegroundColor $Colors.Green
    Write-Host "║ APPLICATIONS                                                     ║" -ForegroundColor $Colors.Green
    Write-Host "║   Hub Frontend:          http://localhost:4200                   ║" -ForegroundColor $Colors.Green
    Write-Host "║                                                                  ║" -ForegroundColor $Colors.Green
    Write-Host "║ OUTILS INTÉGRÉS                                                  ║" -ForegroundColor $Colors.Green
    Write-Host "║   Grafana:               http://localhost:3000 (admin/admin)    ║" -ForegroundColor $Colors.Green
    Write-Host "║   Keycloak Admin:        http://localhost:8180 (admin/admin)    ║" -ForegroundColor $Colors.Green
    Write-Host "║   Camunda Operate:       http://localhost:8081                  ║" -ForegroundColor $Colors.Green
    Write-Host "║   Prometheus:            http://localhost:9090                  ║" -ForegroundColor $Colors.Green
    Write-Host "║   Kafka UI:              http://localhost:8090                  ║" -ForegroundColor $Colors.Green
    Write-Host "║                                                                  ║" -ForegroundColor $Colors.Green
    Write-Host "║ SUPER ADMIN HUB                                                  ║" -ForegroundColor $Colors.Green
    Write-Host "║   URL:      http://localhost:4200                               ║" -ForegroundColor $Colors.Green
    Write-Host "║   Login:    admin@guce.cm                                        ║" -ForegroundColor $Colors.Green
    Write-Host "║   Password: admin                                               ║" -ForegroundColor $Colors.Green
    Write-Host "║   Rôle:     SUPER_ADMIN (accès total)                           ║" -ForegroundColor $Colors.Green
    Write-Host "║                                                                  ║" -ForegroundColor $Colors.Green
    Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Green
    Write-Host ""
}

# =============================================================================
# Main
# =============================================================================

function Main {
    Write-Host ""
    Write-Host "E-GUCE 3G - Demarrage du systeme" -ForegroundColor $Colors.Cyan
    Write-Host ""
    
    try {
        Check-Prerequisites
        
        switch ($Mode) {
            'all' {
                Start-Infrastructure
                Start-Backend
                Start-Frontend
            }
            'infra' {
                Start-Infrastructure
            }
            'backend' {
                Start-Backend
            }
            'frontend' {
                Start-Frontend
            }
            'build' {
                Build-Backend
            }
        }
        
        Print-Summary
    }
    catch {
        Log-Error "Erreur: $_"
        exit 1
    }
}

# Execute
Main
