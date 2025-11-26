#!/bin/bash

# =============================================================================
# E-GUCE 3G - Instance Generation Script
# =============================================================================
# This script generates a new GUCE instance from the template.
#
# Usage:
#   ./generate-instance.sh --code CM --name "GUCE Cameroun" --domain guce-cameroun.com
#
# Required parameters:
#   --code       Instance code (2-3 chars, e.g., CM, TD, CF)
#   --name       Instance name (e.g., "GUCE Cameroun")
#   --domain     Instance domain (e.g., guce-cameroun.com)
#
# Optional parameters:
#   --country    Country code (defaults to --code)
#   --currency   Currency code (default: XAF)
#   --locale     Locale (default: fr-XX)
#   --timezone   Timezone (default: Africa/Douala)
#   --primary    Primary color (default: #1A237E)
#   --secondary  Secondary color (default: #FF5722)
#   --output     Output directory (default: ./instances/<code>)
#   --deploy     Deploy after generation (docker/k8s/none)
#   --hub-url    Hub API URL (default: http://localhost:8080)
#   --hub-key    Hub API Key
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$PROJECT_ROOT/frontend/guce-instance-template"
INSTANCES_DIR="$PROJECT_ROOT/instances"

# Default values
CURRENCY="XAF"
TIMEZONE="Africa/Douala"
PRIMARY_COLOR="#1A237E"
SECONDARY_COLOR="#FF5722"
ACCENT_COLOR="#FFC107"
DEPLOY_MODE="none"
HUB_URL="http://localhost:8080"
HUB_API_KEY=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --code)
            INSTANCE_CODE="$2"
            shift 2
            ;;
        --name)
            INSTANCE_NAME="$2"
            shift 2
            ;;
        --domain)
            INSTANCE_DOMAIN="$2"
            shift 2
            ;;
        --country)
            COUNTRY_CODE="$2"
            shift 2
            ;;
        --currency)
            CURRENCY="$2"
            shift 2
            ;;
        --locale)
            LOCALE="$2"
            shift 2
            ;;
        --timezone)
            TIMEZONE="$2"
            shift 2
            ;;
        --primary)
            PRIMARY_COLOR="$2"
            shift 2
            ;;
        --secondary)
            SECONDARY_COLOR="$2"
            shift 2
            ;;
        --accent)
            ACCENT_COLOR="$2"
            shift 2
            ;;
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --deploy)
            DEPLOY_MODE="$2"
            shift 2
            ;;
        --hub-url)
            HUB_URL="$2"
            shift 2
            ;;
        --hub-key)
            HUB_API_KEY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 --code CODE --name NAME --domain DOMAIN [options]"
            echo ""
            echo "Required:"
            echo "  --code       Instance code (2-3 chars)"
            echo "  --name       Instance name"
            echo "  --domain     Instance domain"
            echo ""
            echo "Optional:"
            echo "  --country    Country code (defaults to --code)"
            echo "  --currency   Currency code (default: XAF)"
            echo "  --locale     Locale (default: fr-XX)"
            echo "  --timezone   Timezone (default: Africa/Douala)"
            echo "  --primary    Primary color (default: #1A237E)"
            echo "  --secondary  Secondary color (default: #FF5722)"
            echo "  --output     Output directory"
            echo "  --deploy     Deploy mode (docker/k8s/none)"
            echo "  --hub-url    Hub API URL"
            echo "  --hub-key    Hub API Key"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$INSTANCE_CODE" ]]; then
    echo -e "${RED}Error: --code is required${NC}"
    exit 1
fi

if [[ -z "$INSTANCE_NAME" ]]; then
    echo -e "${RED}Error: --name is required${NC}"
    exit 1
fi

if [[ -z "$INSTANCE_DOMAIN" ]]; then
    echo -e "${RED}Error: --domain is required${NC}"
    exit 1
fi

# Set defaults
INSTANCE_CODE_LOWER=$(echo "$INSTANCE_CODE" | tr '[:upper:]' '[:lower:]')
INSTANCE_CODE_UPPER=$(echo "$INSTANCE_CODE" | tr '[:lower:]' '[:upper:]')
COUNTRY_CODE="${COUNTRY_CODE:-$INSTANCE_CODE_UPPER}"
LOCALE="${LOCALE:-fr-$COUNTRY_CODE}"
OUTPUT_DIR="${OUTPUT_DIR:-$INSTANCES_DIR/$INSTANCE_CODE_LOWER}"
KEYCLOAK_REALM="guce-$INSTANCE_CODE_LOWER"
KEYCLOAK_CLIENT_ID="guce-$INSTANCE_CODE_LOWER"
DATABASE_NAME="guce_$INSTANCE_CODE_LOWER"

# Generate random API key if not provided
if [[ -z "$HUB_API_KEY" ]]; then
    HUB_API_KEY=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 64)
fi

# Banner
echo -e "${CYAN}"
echo "=============================================="
echo "  E-GUCE 3G Instance Generator"
echo "=============================================="
echo -e "${NC}"

echo -e "${BLUE}Configuration:${NC}"
echo "  Code:        $INSTANCE_CODE_UPPER"
echo "  Name:        $INSTANCE_NAME"
echo "  Domain:      $INSTANCE_DOMAIN"
echo "  Country:     $COUNTRY_CODE"
echo "  Currency:    $CURRENCY"
echo "  Locale:      $LOCALE"
echo "  Timezone:    $TIMEZONE"
echo "  Realm:       $KEYCLOAK_REALM"
echo "  Database:    $DATABASE_NAME"
echo "  Output:      $OUTPUT_DIR"
echo "  Deploy:      $DEPLOY_MODE"
echo ""

# Check if template exists
if [[ ! -d "$TEMPLATE_DIR" ]]; then
    echo -e "${RED}Error: Template directory not found: $TEMPLATE_DIR${NC}"
    exit 1
fi

# Create output directory
echo -e "${YELLOW}[1/7] Creating output directory...${NC}"
mkdir -p "$OUTPUT_DIR"

# Copy template
echo -e "${YELLOW}[2/7] Copying template files...${NC}"
cp -r "$TEMPLATE_DIR"/* "$OUTPUT_DIR/"

# Replace placeholders in all files
echo -e "${YELLOW}[3/7] Replacing configuration placeholders...${NC}"

# Find all text files and replace placeholders
find "$OUTPUT_DIR" -type f \( -name "*.ts" -o -name "*.json" -o -name "*.html" -o -name "*.yaml" -o -name "*.yml" -o -name "*.md" \) | while read file; do
    sed -i \
        -e "s|{{INSTANCE_CODE}}|$INSTANCE_CODE_UPPER|g" \
        -e "s|{{INSTANCE_NAME}}|$INSTANCE_NAME|g" \
        -e "s|{{INSTANCE_DOMAIN}}|$INSTANCE_DOMAIN|g" \
        -e "s|{{INSTANCE_COUNTRY}}|$INSTANCE_NAME|g" \
        -e "s|{{INSTANCE_COUNTRY_CODE}}|$COUNTRY_CODE|g" \
        -e "s|{{INSTANCE_CURRENCY}}|$CURRENCY|g" \
        -e "s|{{INSTANCE_LOCALE}}|$LOCALE|g" \
        -e "s|{{INSTANCE_TIMEZONE}}|$TIMEZONE|g" \
        -e "s|{{PRIMARY_COLOR}}|$PRIMARY_COLOR|g" \
        -e "s|{{SECONDARY_COLOR}}|$SECONDARY_COLOR|g" \
        -e "s|{{ACCENT_COLOR}}|$ACCENT_COLOR|g" \
        -e "s|{{KEYCLOAK_REALM}}|$KEYCLOAK_REALM|g" \
        -e "s|{{KEYCLOAK_CLIENT_ID}}|$KEYCLOAK_CLIENT_ID|g" \
        -e "s|{{DATABASE_NAME}}|$DATABASE_NAME|g" \
        -e "s|{{HUB_API_KEY}}|$HUB_API_KEY|g" \
        -e "s|{{HUB_URL}}|$HUB_URL|g" \
        "$file" 2>/dev/null || true
done

# Generate Keycloak realm configuration
echo -e "${YELLOW}[4/7] Generating Keycloak realm configuration...${NC}"
mkdir -p "$OUTPUT_DIR/infrastructure/keycloak"

cat > "$OUTPUT_DIR/infrastructure/keycloak/$KEYCLOAK_REALM-realm.json" << EOF
{
  "realm": "$KEYCLOAK_REALM",
  "enabled": true,
  "displayName": "$INSTANCE_NAME",
  "displayNameHtml": "<b>GUCE</b> $INSTANCE_NAME",
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "rememberMe": true,
  "internationalizationEnabled": true,
  "supportedLocales": ["fr", "en"],
  "defaultLocale": "fr",
  "accessTokenLifespan": 3600,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 36000,
  "roles": {
    "realm": [
      {"name": "ADMIN", "description": "Administrateur de l'instance"},
      {"name": "OPERATOR", "description": "Operateur"},
      {"name": "USER", "description": "Utilisateur standard"},
      {"name": "OE_DECLARANT", "description": "Declarant Operateur Economique"},
      {"name": "OE_ADMIN", "description": "Administrateur OE"},
      {"name": "GOV_AGENT", "description": "Agent Gouvernemental"},
      {"name": "GOV_SUPERVISOR", "description": "Superviseur Gouvernemental"},
      {"name": "INTERMEDIARY", "description": "Intermediaire"},
      {"name": "PROCEDURE_DESIGNER", "description": "Concepteur de Procedures"},
      {"name": "WORKFLOW_ADMIN", "description": "Administrateur Workflow"},
      {"name": "RULES_ADMIN", "description": "Administrateur Regles"}
    ]
  },
  "clients": [
    {
      "clientId": "$KEYCLOAK_CLIENT_ID",
      "name": "$INSTANCE_NAME Frontend",
      "enabled": true,
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": true,
      "webOrigins": ["*"],
      "redirectUris": [
        "https://$INSTANCE_DOMAIN/*",
        "http://localhost:4200/*"
      ],
      "attributes": {
        "pkce.code.challenge.method": "S256"
      }
    },
    {
      "clientId": "$KEYCLOAK_CLIENT_ID-backend",
      "name": "$INSTANCE_NAME Backend",
      "enabled": true,
      "publicClient": false,
      "serviceAccountsEnabled": true
    }
  ]
}
EOF

# Generate Docker Compose for the instance
echo -e "${YELLOW}[5/7] Generating Docker Compose configuration...${NC}"

cat > "$OUTPUT_DIR/docker-compose.yml" << EOF
version: '3.8'

# $INSTANCE_NAME - Docker Compose
# Generated by E-GUCE 3G Instance Generator

services:
  # Frontend
  ${INSTANCE_CODE_LOWER}-frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    image: guce-${INSTANCE_CODE_LOWER}-frontend:latest
    container_name: guce-${INSTANCE_CODE_LOWER}-frontend
    ports:
      - "4${INSTANCE_CODE:0:2}00:80"
    environment:
      - TENANT_CODE=$INSTANCE_CODE_UPPER
      - TENANT_NAME=$INSTANCE_NAME
    networks:
      - guce-network
    depends_on:
      - ${INSTANCE_CODE_LOWER}-gateway

  # API Gateway
  ${INSTANCE_CODE_LOWER}-gateway:
    image: guce-gateway:latest
    container_name: guce-${INSTANCE_CODE_LOWER}-gateway
    ports:
      - "8${INSTANCE_CODE:0:2}1:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - TENANT_CODE=$INSTANCE_CODE_UPPER
      - DATABASE_URL=jdbc:postgresql://postgres:5432/$DATABASE_NAME
      - KEYCLOAK_REALM=$KEYCLOAK_REALM
    networks:
      - guce-network

networks:
  guce-network:
    external: true
EOF

# Generate Frontend Dockerfile
cat > "$OUTPUT_DIR/Dockerfile.frontend" << EOF
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build -- --configuration=production

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/guce-instance/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Generate nginx config
cat > "$OUTPUT_DIR/nginx.conf" << EOF
server {
    listen 80;
    server_name $INSTANCE_DOMAIN localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Angular routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://${INSTANCE_CODE_LOWER}-gateway:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # Tools proxy
    location /tools/ {
        proxy_pass http://${INSTANCE_CODE_LOWER}-gateway:8080/tools/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # Health check
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

# Update package.json with instance name
echo -e "${YELLOW}[6/7] Updating package.json...${NC}"
if [[ -f "$OUTPUT_DIR/package.json" ]]; then
    # Update name in package.json
    sed -i "s/\"name\": \"guce-instance-template\"/\"name\": \"guce-$INSTANCE_CODE_LOWER\"/" "$OUTPUT_DIR/package.json"
fi

# Generate instance info file
echo -e "${YELLOW}[7/7] Generating instance info...${NC}"

cat > "$OUTPUT_DIR/instance.json" << EOF
{
  "code": "$INSTANCE_CODE_UPPER",
  "name": "$INSTANCE_NAME",
  "domain": "$INSTANCE_DOMAIN",
  "country": "$COUNTRY_CODE",
  "currency": "$CURRENCY",
  "locale": "$LOCALE",
  "timezone": "$TIMEZONE",
  "keycloak": {
    "realm": "$KEYCLOAK_REALM",
    "clientId": "$KEYCLOAK_CLIENT_ID"
  },
  "database": {
    "name": "$DATABASE_NAME"
  },
  "hub": {
    "url": "$HUB_URL",
    "apiKey": "$HUB_API_KEY"
  },
  "branding": {
    "primaryColor": "$PRIMARY_COLOR",
    "secondaryColor": "$SECONDARY_COLOR",
    "accentColor": "$ACCENT_COLOR"
  },
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "generatorVersion": "1.0.0"
}
EOF

echo -e "${GREEN}"
echo "=============================================="
echo "  Instance Generated Successfully!"
echo "=============================================="
echo -e "${NC}"

echo -e "${BLUE}Instance Location:${NC} $OUTPUT_DIR"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. cd $OUTPUT_DIR"
echo "  2. npm install"
echo "  3. npm run build"
echo ""
echo -e "${BLUE}To deploy with Docker:${NC}"
echo "  docker-compose up -d"
echo ""
echo -e "${BLUE}Instance Configuration:${NC}"
echo "  Keycloak Realm:  $KEYCLOAK_REALM"
echo "  Database:        $DATABASE_NAME"
echo "  Hub API Key:     ${HUB_API_KEY:0:16}..."
echo ""

# Deploy if requested
if [[ "$DEPLOY_MODE" == "docker" ]]; then
    echo -e "${YELLOW}Deploying instance with Docker...${NC}"
    cd "$OUTPUT_DIR"
    docker-compose up -d --build
    echo -e "${GREEN}Instance deployed!${NC}"
elif [[ "$DEPLOY_MODE" == "k8s" ]]; then
    echo -e "${YELLOW}Kubernetes deployment not yet implemented${NC}"
fi

echo -e "${GREEN}Done!${NC}"
