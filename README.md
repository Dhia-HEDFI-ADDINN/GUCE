# Plateforme GUCE - Guichet Unique du Commerce Extérieur

## e-GUCE 3G - Architecture Low-Code Multi-Instance

Version 1.0 - Novembre 2025

---

## Vision

Plateforme socle générique pour les Guichets Uniques du Commerce Extérieur, capable d'être instanciée pour différents pays (Cameroun, Tchad, RCA, autres pays CEMAC) avec un minimum de développement spécifique.

**Principes fondamentaux :**
- **Configuration vs Développement** : 80% des procédures créées par configuration, 20% par code
- **Multi-Instance** : Une plateforme socle unique, plusieurs déploiements pays
- **Conformité Internationale** : Alignement UN/CEFACT, OMD, Recommandation 33 ONU
- **Time-to-Market** : Réduction de 70% du temps de développement d'une procédure

---

## Architecture

### Stack Technologique

| Couche | Composant | Version | Rôle |
|--------|-----------|---------|------|
| **Orchestration** | Camunda 8 / Zeebe | 8.x | Moteur BPMN - Workflow |
| **Règles** | Drools | 8.x | Moteur DMN - Validation, calculs |
| **Messaging** | Apache Kafka | 4.x | Event Streaming |
| **Backend** | Spring Boot | 3.x | Microservices Java 21 |
| **Frontend** | Angular | 20 | Applications Web |
| **IAM** | Keycloak | 23.x | SSO, Multi-tenant |
| **Database** | PostgreSQL | 16 | Base relationnelle |
| **Cache** | Redis | 7 | Cache distribué |
| **Stockage** | MinIO | Latest | GED S3-compatible |
| **Search** | Elasticsearch | 8.x | Recherche full-text |

### Microservices

```
guce-platform/
├── guce-common/           # Librairie partagée
├── ms-referential/        # Référentiels (pays, devises, codes SH)
├── ms-procedure/          # Procédures et workflows
├── ms-generator/          # Générateur Low-Code
├── ms-document/           # GED - Gestion des documents
├── ms-payment/            # Paiements (mobile money, carte)
├── ms-notification/       # Notifications (email, SMS, push)
├── ms-audit/              # Traçabilité et journalisation
├── ms-reporting/          # Statistiques et tableaux de bord
├── ms-interoperability/   # Échanges partenaires externes
└── guce-gateway/          # API Gateway
```

### Composantes Métier

| Composante | Description |
|------------|-------------|
| **e-FORCE** | Portail Opérateurs Économiques |
| **e-GOV** | Portail Administrations |
| **e-BUSINESS** | Portail Intermédiaires (banques, SGS, etc.) |

---

## Démarrage Rapide

### Prérequis

- Java 21
- Maven 3.9+
- Docker & Docker Compose
- Node.js 20+ (pour le frontend)

### Lancement de l'environnement local

```bash
# Démarrer l'infrastructure
docker-compose up -d

# Compiler le projet
mvn clean install

# Lancer un microservice (exemple: ms-referential)
cd ms-referential
mvn spring-boot:run
```

### URLs de développement

| Service | URL |
|---------|-----|
| Keycloak | http://localhost:8180 |
| Kafka UI | http://localhost:8090 |
| Camunda Operate | http://localhost:8081 |
| Camunda Tasklist | http://localhost:8082 |
| MinIO Console | http://localhost:9001 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

### Credentials par défaut

| Service | User | Password |
|---------|------|----------|
| Keycloak Admin | admin | admin |
| PostgreSQL | guce | guce |
| MinIO | guce | guceminio |
| Grafana | admin | admin |

---

## Procedure Builder (Low-Code)

Le cœur du système permet de créer des procédures sans code :

### 1. Workflow Designer
- Modélisation graphique BPMN 2.0
- User Tasks avec assignation dynamique
- Service Tasks pour appels API
- Gateways et Timer Events

### 2. Form Builder
- Formulaires dynamiques par glisser-déposer
- 50+ types de champs supportés
- Validations et champs conditionnels
- Mapping UN/CEFACT automatique

### 3. Data Modeler
- Création d'entités métier sans SQL
- Génération automatique des migrations
- Relations entre entités

### 4. Rules Editor
- Tables de décision visuelles (DMN)
- Règles de validation et calcul
- Hot-reload sans redémarrage

---

## API REST

### Convention des endpoints

```
GET    /api/v1/{composante}/{module}/{ressource}
GET    /api/v1/{composante}/{module}/{ressource}/{id}
POST   /api/v1/{composante}/{module}/{ressource}
PUT    /api/v1/{composante}/{module}/{ressource}/{id}
DELETE /api/v1/{composante}/{module}/{ressource}/{id}
POST   /api/v1/{composante}/{module}/{ressource}/{id}/submit
```

### Format des réponses

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "meta": {
    "timestamp": "2025-11-26T10:30:00",
    "requestId": "uuid"
  }
}
```

---

## Sécurité

### Rôles métier

| Catégorie | Rôles |
|-----------|-------|
| **Opérateurs** | OPERATEUR_ECONOMIQUE, DECLARANT, COMMISSIONNAIRE_AGREE |
| **Douanes** | AGENT_DOUANE, CHEF_BUREAU_DOUANE, INSPECTEUR_DOUANE |
| **Agriculture** | AGENT_PHYTOSANITAIRE, INSPECTEUR_PHYTOSANITAIRE |
| **Commerce** | AGENT_COMMERCE, CHEF_SERVICE_COMMERCE |
| **Banques** | AGENT_BANQUE, SUPERVISEUR_BANQUE |
| **Inspection** | AGENT_SGS, INSPECTEUR_SGS |
| **GUCE** | AGENT_GUCE, SUPERVISEUR_GUCE, DIRECTEUR_GUCE |
| **Admin** | ADMIN_FONCTIONNEL, ADMIN_TECHNIQUE, SUPER_ADMIN |

### Multi-tenant

Chaque pays dispose de son propre Realm Keycloak :
- `guce-cameroun`
- `guce-tchad`
- `guce-rca`
- etc.

---

## Procédures Types

### 1. Déclaration d'Importation
- Acteurs : Déclarant → Douane → Banque → SGS
- Workflow : Soumission → Vérification → Contrôle → Liquidation → Paiement → Mainlevée

### 2. Certificat d'Origine
- Acteurs : Exportateur → Chambre de Commerce
- Workflow : Demande → Instruction → Paiement → Délivrance

### 3. Autorisation Phytosanitaire
- Acteurs : Importateur → MINADER
- Workflow : Demande → Analyse → Inspection → Autorisation

---

## Contribution

1. Créez une branche feature (`git checkout -b feature/ma-fonctionnalite`)
2. Committez vos changements (`git commit -m 'Ajout fonctionnalité'`)
3. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
4. Ouvrez une Pull Request

### Conventions de code

- Java : Google Java Style Guide
- Angular : Angular Style Guide
- Commits : Conventional Commits

---

## Support

- Documentation : https://docs.guce.cm
- Support : support@guce.cm
- Issues : https://github.com/guce/platform/issues

---

**Groupement BNS-ADDINN - Projet e-GUCE 3G**

*Novembre 2025*
