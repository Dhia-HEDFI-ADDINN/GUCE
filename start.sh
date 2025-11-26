#!/bin/bash

# =============================================================================
# E-GUCE 3G - Script de démarrage global
# =============================================================================
# Ce script démarre toutes les briques du projet:
# - Infrastructure (Docker Compose)
# - Backend (Microservices Spring Boot)
# - Frontend (Angular Hub et Instance)
# =============================================================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Répertoire racine du projet
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
WAIT_TIMEOUT=120

# =============================================================================
# Fonctions utilitaires
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 n'est pas installé. Veuillez l'installer."
        exit 1
    fi
}

wait_for_service() {
    local url=$1
    local name=$2
    local timeout=${3:-60}
    local counter=0

    log_info "Attente de $name..."
    while [ $counter -lt $timeout ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            log_success "$name est prêt"
            return 0
        fi
        counter=$((counter + 2))
        sleep 2
        printf "."
    done
    echo ""
    log_warning "$name n'a pas répondu dans le délai imparti"
    return 1
}

# =============================================================================
# Vérification des prérequis
# =============================================================================

check_prerequisites() {
    log_section "Vérification des prérequis"

    check_command docker
    check_command docker-compose
    check_command java
    check_command node
    check_command npm

    log_success "Tous les prérequis sont installés"
}

# =============================================================================
# Démarrage de l'infrastructure Docker
# =============================================================================

start_infrastructure() {
    log_section "Démarrage de l'infrastructure Docker"

    cd "$PROJECT_ROOT"

    log_info "Démarrage des conteneurs Docker..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    # Attendre que les services soient prêts
    log_info "Attente des services..."
    echo ""

    # PostgreSQL
    wait_for_service "http://localhost:5432" "PostgreSQL" 30 || true

    # Redis
    wait_for_service "http://localhost:6379" "Redis" 30 || true

    # MongoDB
    wait_for_service "http://localhost:27017" "MongoDB" 30 || true

    # Elasticsearch
    wait_for_service "http://localhost:9200" "Elasticsearch" 60

    # Keycloak
    wait_for_service "http://localhost:8180" "Keycloak" 90

    # Kafka
    wait_for_service "http://localhost:9092" "Kafka" 60 || true

    # Zeebe (Camunda)
    wait_for_service "http://localhost:9600/ready" "Zeebe" 60 || true

    # Grafana
    wait_for_service "http://localhost:3000" "Grafana" 30

    # Prometheus
    wait_for_service "http://localhost:9090" "Prometheus" 30

    log_success "Infrastructure Docker démarrée"
}

# =============================================================================
# Démarrage des microservices Backend
# =============================================================================

start_backend() {
    log_section "Démarrage des microservices Backend"

    cd "$PROJECT_ROOT"

    # Vérifier si Maven wrapper existe
    if [ -f "./mvnw" ]; then
        MVN="./mvnw"
    else
        MVN="mvn"
    fi

    # Compiler le projet si nécessaire
    if [ ! -d "./ms-generator/target" ] || [ "$1" == "--build" ]; then
        log_info "Compilation du projet Maven..."
        $MVN clean install -DskipTests -q
    fi

    # Démarrer les microservices en arrière-plan
    log_info "Démarrage de ms-generator..."
    cd "$PROJECT_ROOT/ms-generator"
    $MVN spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/ms-generator.log 2>&1 &
    echo $! > /tmp/ms-generator.pid

    log_info "Démarrage de ms-procedure..."
    cd "$PROJECT_ROOT/ms-procedure"
    $MVN spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/ms-procedure.log 2>&1 &
    echo $! > /tmp/ms-procedure.pid

    log_info "Démarrage de ms-referential..."
    cd "$PROJECT_ROOT/ms-referential"
    $MVN spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/ms-referential.log 2>&1 &
    echo $! > /tmp/ms-referential.pid

    cd "$PROJECT_ROOT"

    # Attendre que les APIs soient disponibles
    sleep 10
    wait_for_service "http://localhost:8080/actuator/health" "API Gateway" 60 || true

    log_success "Microservices Backend démarrés"
}

# =============================================================================
# Démarrage des frontends Angular
# =============================================================================

start_frontend() {
    log_section "Démarrage des frontends Angular"

    # Installer les dépendances si nécessaire
    if [ ! -d "$PROJECT_ROOT/frontend/e-guce-hub/node_modules" ]; then
        log_info "Installation des dépendances Hub..."
        cd "$PROJECT_ROOT/frontend/e-guce-hub"
        npm install
    fi

    if [ ! -d "$PROJECT_ROOT/frontend/guce-instance-template/node_modules" ]; then
        log_info "Installation des dépendances Instance Template..."
        cd "$PROJECT_ROOT/frontend/guce-instance-template"
        npm install
    fi

    # Démarrer le Hub frontend (port 4200)
    log_info "Démarrage du Hub Frontend (port 4200)..."
    cd "$PROJECT_ROOT/frontend/e-guce-hub"
    npm start > /tmp/hub-frontend.log 2>&1 &
    echo $! > /tmp/hub-frontend.pid

    # Démarrer l'Instance Template frontend (port 4201)
    log_info "Démarrage de l'Instance Template Frontend (port 4201)..."
    cd "$PROJECT_ROOT/frontend/guce-instance-template"
    npm start -- --port 4201 > /tmp/instance-frontend.log 2>&1 &
    echo $! > /tmp/instance-frontend.pid

    cd "$PROJECT_ROOT"

    # Attendre que les frontends soient disponibles
    wait_for_service "http://localhost:4200" "Hub Frontend" 60
    wait_for_service "http://localhost:4201" "Instance Frontend" 60 || true

    log_success "Frontends Angular démarrés"
}

# =============================================================================
# Affichage du résumé
# =============================================================================

print_summary() {
    log_section "E-GUCE 3G - Système démarré"

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    SERVICES DISPONIBLES                         ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║${NC}                                                                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC} ${CYAN}APPLICATIONS${NC}                                                     ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Hub Frontend:          ${YELLOW}http://localhost:4200${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Instance Frontend:     ${YELLOW}http://localhost:4201${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC} ${CYAN}OUTILS INTÉGRÉS (Interface Unique)${NC}                                ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Grafana:               ${YELLOW}http://localhost:3000${NC}  (admin/admin)   ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Kibana:                ${YELLOW}http://localhost:5601${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Keycloak Admin:        ${YELLOW}http://localhost:8180${NC}  (admin/admin)   ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Camunda Operate:       ${YELLOW}http://localhost:8081${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Camunda Tasklist:      ${YELLOW}http://localhost:8082${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Prometheus:            ${YELLOW}http://localhost:9090${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Kafka UI:              ${YELLOW}http://localhost:8090${NC}                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   MinIO Console:         ${YELLOW}http://localhost:9001${NC}  (guce/guceminio)${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC} ${CYAN}BASES DE DONNÉES${NC}                                                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   PostgreSQL:            ${YELLOW}localhost:5432${NC}  (guce/guce)            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   MongoDB:               ${YELLOW}localhost:27017${NC} (guce/guce)            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Redis:                 ${YELLOW}localhost:6379${NC}                         ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Elasticsearch:         ${YELLOW}localhost:9200${NC}                         ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                                  ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC} ${CYAN}SUPER ADMIN HUB${NC}                                                    ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   URL:      ${YELLOW}http://localhost:4200${NC}                                ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Login:    ${YELLOW}hub-admin${NC}                                            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Password: ${YELLOW}hubadmin${NC} (à changer à la première connexion)         ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}   Rôle:     ${YELLOW}SUPER_ADMIN${NC} (accès total)                            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                                  ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Pour arrêter tous les services: ${YELLOW}./stop.sh${NC}"
    echo ""
}

# =============================================================================
# Menu principal
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all           Démarrer tout (infra + backend + frontend) [défaut]"
    echo "  --infra         Démarrer uniquement l'infrastructure Docker"
    echo "  --backend       Démarrer uniquement les microservices"
    echo "  --frontend      Démarrer uniquement les frontends"
    echo "  --build         Forcer la recompilation du backend"
    echo "  --help          Afficher cette aide"
    echo ""
}

main() {
    local start_infra=false
    local start_back=false
    local start_front=false
    local build_flag=""

    # Parser les arguments
    if [ $# -eq 0 ]; then
        start_infra=true
        start_back=true
        start_front=true
    else
        for arg in "$@"; do
            case $arg in
                --all)
                    start_infra=true
                    start_back=true
                    start_front=true
                    ;;
                --infra)
                    start_infra=true
                    ;;
                --backend)
                    start_back=true
                    ;;
                --frontend)
                    start_front=true
                    ;;
                --build)
                    build_flag="--build"
                    ;;
                --help)
                    show_help
                    exit 0
                    ;;
                *)
                    log_error "Option inconnue: $arg"
                    show_help
                    exit 1
                    ;;
            esac
        done
    fi

    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          E-GUCE 3G - Démarrage du système                        ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    check_prerequisites

    if [ "$start_infra" = true ]; then
        start_infrastructure
    fi

    if [ "$start_back" = true ]; then
        start_backend $build_flag
    fi

    if [ "$start_front" = true ]; then
        start_frontend
    fi

    print_summary
}

# Exécuter le script principal
main "$@"
