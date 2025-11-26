#!/bin/bash

# =============================================================================
# E-GUCE 3G - Script d'arrêt global
# =============================================================================
# Ce script arrête toutes les briques du projet:
# - Frontend (Angular Hub et Instance)
# - Backend (Microservices Spring Boot)
# - Infrastructure (Docker Compose)
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

kill_process_by_pid_file() {
    local pid_file=$1
    local name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_info "Arrêt de $name (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 2
            # Force kill si encore vivant
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -9 "$pid" 2>/dev/null || true
            fi
            log_success "$name arrêté"
        else
            log_warning "$name n'était pas en cours d'exécution"
        fi
        rm -f "$pid_file"
    fi
}

kill_process_by_port() {
    local port=$1
    local name=$2

    local pid=$(lsof -t -i:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        log_info "Arrêt de $name sur le port $port (PID: $pid)..."
        kill $pid 2>/dev/null || true
        sleep 2
        # Force kill si encore vivant
        pid=$(lsof -t -i:$port 2>/dev/null || true)
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null || true
        fi
        log_success "$name arrêté"
    fi
}

# =============================================================================
# Arrêt des frontends Angular
# =============================================================================

stop_frontend() {
    log_section "Arrêt des frontends Angular"

    # Arrêter le Hub Frontend
    kill_process_by_pid_file "/tmp/hub-frontend.pid" "Hub Frontend"
    kill_process_by_port 4200 "Hub Frontend"

    # Arrêter l'Instance Template Frontend
    kill_process_by_pid_file "/tmp/instance-frontend.pid" "Instance Template Frontend"
    kill_process_by_port 4201 "Instance Template Frontend"

    # Arrêter tous les processus Angular dev server
    pkill -f "ng serve" 2>/dev/null || true
    pkill -f "@angular/cli" 2>/dev/null || true

    log_success "Frontends Angular arrêtés"
}

# =============================================================================
# Arrêt des microservices Backend
# =============================================================================

stop_backend() {
    log_section "Arrêt des microservices Backend"

    # Arrêter les microservices via PID files
    kill_process_by_pid_file "/tmp/ms-generator.pid" "ms-generator"
    kill_process_by_pid_file "/tmp/ms-procedure.pid" "ms-procedure"
    kill_process_by_pid_file "/tmp/ms-referential.pid" "ms-referential"

    # Arrêter par ports (backup)
    kill_process_by_port 8080 "API Gateway"
    kill_process_by_port 8081 "ms-generator"
    kill_process_by_port 8082 "ms-procedure"
    kill_process_by_port 8083 "ms-referential"

    # Arrêter tous les processus Spring Boot
    pkill -f "spring-boot:run" 2>/dev/null || true
    pkill -f "guce.*\.jar" 2>/dev/null || true

    log_success "Microservices Backend arrêtés"
}

# =============================================================================
# Arrêt de l'infrastructure Docker
# =============================================================================

stop_infrastructure() {
    log_section "Arrêt de l'infrastructure Docker"

    cd "$PROJECT_ROOT"

    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        log_info "Arrêt des conteneurs Docker..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down

        log_success "Infrastructure Docker arrêtée"
    else
        log_warning "Fichier docker-compose.yml non trouvé"
    fi
}

# =============================================================================
# Nettoyage complet
# =============================================================================

cleanup() {
    log_section "Nettoyage"

    # Supprimer les fichiers PID
    rm -f /tmp/hub-frontend.pid
    rm -f /tmp/instance-frontend.pid
    rm -f /tmp/ms-generator.pid
    rm -f /tmp/ms-procedure.pid
    rm -f /tmp/ms-referential.pid

    # Supprimer les fichiers de log temporaires
    rm -f /tmp/hub-frontend.log
    rm -f /tmp/instance-frontend.log
    rm -f /tmp/ms-generator.log
    rm -f /tmp/ms-procedure.log
    rm -f /tmp/ms-referential.log

    log_success "Nettoyage terminé"
}

# =============================================================================
# Nettoyage complet avec volumes Docker
# =============================================================================

deep_cleanup() {
    log_section "Nettoyage complet (avec volumes Docker)"

    cleanup

    cd "$PROJECT_ROOT"

    log_warning "Cette action va supprimer toutes les données Docker (volumes)!"
    read -p "Êtes-vous sûr? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Suppression des volumes Docker..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down -v

        # Supprimer les images inutilisées
        log_info "Nettoyage des images Docker inutilisées..."
        docker image prune -f

        log_success "Nettoyage complet terminé"
    else
        log_info "Nettoyage complet annulé"
    fi
}

# =============================================================================
# Affichage du statut
# =============================================================================

show_status() {
    log_section "Statut des services"

    echo ""
    echo "Services Docker:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps 2>/dev/null || echo "  Docker Compose non disponible"

    echo ""
    echo "Processus actifs:"

    # Frontend
    if lsof -i:4200 > /dev/null 2>&1; then
        echo -e "  Hub Frontend (4200):      ${GREEN}En cours${NC}"
    else
        echo -e "  Hub Frontend (4200):      ${RED}Arrêté${NC}"
    fi

    if lsof -i:4201 > /dev/null 2>&1; then
        echo -e "  Instance Frontend (4201): ${GREEN}En cours${NC}"
    else
        echo -e "  Instance Frontend (4201): ${RED}Arrêté${NC}"
    fi

    # Infrastructure
    for service in postgres:5432 redis:6379 mongodb:27017 elasticsearch:9200 keycloak:8180 grafana:3000; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        if lsof -i:$port > /dev/null 2>&1; then
            echo -e "  $name ($port):      ${GREEN}En cours${NC}"
        else
            echo -e "  $name ($port):      ${RED}Arrêté${NC}"
        fi
    done

    echo ""
}

# =============================================================================
# Menu principal
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all           Arrêter tout (frontend + backend + infra) [défaut]"
    echo "  --frontend      Arrêter uniquement les frontends"
    echo "  --backend       Arrêter uniquement les microservices"
    echo "  --infra         Arrêter uniquement l'infrastructure Docker"
    echo "  --clean         Nettoyage complet avec suppression des volumes Docker"
    echo "  --status        Afficher le statut des services"
    echo "  --help          Afficher cette aide"
    echo ""
}

main() {
    local stop_front=false
    local stop_back=false
    local stop_infra=false
    local do_cleanup=false
    local deep_clean=false

    # Parser les arguments
    if [ $# -eq 0 ]; then
        stop_front=true
        stop_back=true
        stop_infra=true
        do_cleanup=true
    else
        for arg in "$@"; do
            case $arg in
                --all)
                    stop_front=true
                    stop_back=true
                    stop_infra=true
                    do_cleanup=true
                    ;;
                --frontend)
                    stop_front=true
                    ;;
                --backend)
                    stop_back=true
                    ;;
                --infra)
                    stop_infra=true
                    ;;
                --clean)
                    stop_front=true
                    stop_back=true
                    stop_infra=true
                    deep_clean=true
                    ;;
                --status)
                    show_status
                    exit 0
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
    echo -e "${CYAN}║          E-GUCE 3G - Arrêt du système                            ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ "$stop_front" = true ]; then
        stop_frontend
    fi

    if [ "$stop_back" = true ]; then
        stop_backend
    fi

    if [ "$stop_infra" = true ]; then
        stop_infrastructure
    fi

    if [ "$deep_clean" = true ]; then
        deep_cleanup
    elif [ "$do_cleanup" = true ]; then
        cleanup
    fi

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          E-GUCE 3G - Système arrêté                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Pour redémarrer: ${YELLOW}./start.sh${NC}"
    echo ""
}

# Exécuter le script principal
main "$@"
