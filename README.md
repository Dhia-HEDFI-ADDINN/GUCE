# E-GUCE 3G - Architecture Globale

## E-GUCE 3G GENERATOR HUB & Instances GUCE Single-Tenant

Version 1.0 - Novembre 2025

---

## Vision et Architecture Globale

Cette plateforme est composee de **DEUX systemes distincts mais interconnectes** :

### 1. E-GUCE 3G GENERATOR HUB (Multi-Tenant)

| Caracteristique | Description |
|-----------------|-------------|
| **URL** | https://e-guce-hub.com |
| **Architecture** | Multi-Tenant |
| **Role** | Plateforme centrale de generation et d'administration |
| **Fonction** | Creer des "tenants GUCE" (instances pays), monitoring 360 de toutes les instances |

### 2. Instances GUCE Generees (Single-Tenant)

| Caracteristique | Description |
|-----------------|-------------|
| **URL** | https://guce-{pays}.com (ex: https://guce-cameroun.com) |
| **Architecture** | Single-Tenant |
| **Deploiement** | EN DEHORS du Hub sur infrastructure dediee |
| **Autonomie** | Peut fonctionner meme si le Hub est indisponible |
| **Modules** | e-Force, e-Gov, e-Business, e-Payment, Procedure Builder |

---

## Principes Fondamentaux

1. **ISOLATION TOTALE** : Chaque instance GUCE est physiquement separee
2. **AUTONOMIE** : Une instance fonctionne independamment du Hub apres deploiement
3. **CENTRALISATION MONITORING** : Le Hub supervise toutes les instances a distance
4. **TEMPLATES PARTAGES** : Le Hub fournit les templates, chaque instance les personnalise
5. **GENERATION AUTOMATISEE** : Le Hub genere le code et deploie l'infrastructure

---

## Schema d'Architecture Globale

```
+-----------------------------------------------------------------------------------+
|                           E-GUCE 3G GENERATOR HUB                                 |
|                         https://e-guce-hub.com                                    |
|                           (MULTI-TENANT)                                          |
|                                                                                   |
|  +--------------+ +--------------+ +--------------+ +--------------+ +----------+ |
|  |   TENANT     | |  GENERATOR   | |  MONITORING  | |    ADMIN     | | TEMPLATES| |
|  |   BUILDER    | |    ENGINE    | |     360      | |   CENTRAL    | |  LIBRARY | |
|  |              | |              | |              | |              | |          | |
|  | - Creer      | | - Code Gen   | | - Health     | | - Users Hub  | | - Proced.| |
|  | - Configurer | | - IaC Gen    | | - Ressources | | - Habilitat. | | - Workfl.| |
|  | - Deployer   | | - Deploy     | | - Alertes    | | - Audit      | | - Forms  | |
|  | - Supprimer  | | - Update     | | - Dashboards | | - Billing    | | - Regles | |
|  +--------------+ +--------------+ +--------------+ +--------------+ +----------+ |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                    BASE DE DONNEES HUB (Multi-Tenant)                       |  |
|  |  Tenants Registry | Templates | Users Hub | Configs | Metrics | Logs        |  |
|  +-----------------------------------------------------------------------------+  |
+----------------------------------------+------------------------------------------+
                                         |
                     +-------------------+-------------------+
                     |                   |                   |
          +----------v------+  +--------v--------+  +-------v---------+
          | Agent Monitoring |  | Agent Monitoring |  | Agent Monitoring |
          +----------+------+  +--------+--------+  +-------+---------+
                     |                   |                   |
+--------------------v-------------------v-------------------v----------------------+
|                                                                                   |
|    +-------------------------+  +-------------------------+  +------------------+ |
|    |    GUCE CAMEROUN        |  |    GUCE TCHAD           |  |    GUCE RCA      | |
|    |  https://guce-cm.com    |  |  https://guce-td.com    |  | https://guce-cf  | |
|    |     (SINGLE-TENANT)     |  |     (SINGLE-TENANT)     |  |  (SINGLE-TENANT) | |
|    |                         |  |                         |  |                  | |
|    |  +-------+ +-------+    |  |  +-------+ +-------+    |  | +------+ +-----+ | |
|    |  |e-Force| |e-Gov  |    |  |  |e-Force| |e-Gov  |    |  | |e-For | |e-Gov| | |
|    |  +-------+ +-------+    |  |  +-------+ +-------+    |  | +------+ +-----+ | |
|    |  +-------+ +-------+    |  |  +-------+ +-------+    |  | +------+ +-----+ | |
|    |  |e-Bus  | |e-Pay  |    |  |  |e-Bus  | |e-Pay  |    |  | |e-Bus | |e-Pay| | |
|    |  +-------+ +-------+    |  |  +-------+ +-------+    |  | +------+ +-----+ | |
|    |  +-------------------+  |  |  +-------------------+  |  | +-------------+  | |
|    |  |Procedure Builder  |  |  |  |Procedure Builder  |  |  | |Proc. Builder|  | |
|    |  +-------------------+  |  |  +-------------------+  |  | +-------------+  | |
|    |  +-------------------+  |  |  +-------------------+  |  | +-------------+  | |
|    |  |  Admin Local      |  |  |  |  Admin Local      |  |  | | Admin Local |  | |
|    |  +-------------------+  |  |  +-------------------+  |  | +-------------+  | |
|    |  +-------------------+  |  |  +-------------------+  |  | +-------------+  | |
|    |  |   DB Dediee       |  |  |  |   DB Dediee       |  |  | |  DB Dediee  |  | |
|    |  +-------------------+  |  |  +-------------------+  |  | +-------------+  | |
|    +-------------------------+  +-------------------------+  +------------------+ |
|                                                                                   |
|                    INFRASTRUCTURES DEDIEES (Cloud ou On-Premise)                  |
+-----------------------------------------------------------------------------------+
```

---

## E-GUCE 3G GENERATOR HUB (Multi-Tenant)

### Interface Unique du Hub

**IMPORTANT**: Le Hub dispose d'une **INTERFACE UNIQUE** accessible via une seule URL.

```
+-----------------------------------------------------------------------------------+
|                    E-GUCE 3G GENERATOR HUB - INTERFACE UNIQUE                     |
|                          https://e-guce-hub.com                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +---------------------------+  Une seule application frontend Angular           |
|  |     APPLICATION WEB      |  qui integre TOUS les modules :                    |
|  |       UNIFIEE            |                                                    |
|  |                          |  - /tenants/*     -> Tenant Builder                |
|  |  Client Keycloak:        |  - /generator/*   -> Generator Engine              |
|  |  "e-guce-hub"            |  - /monitoring/*  -> Monitoring 360                |
|  |                          |  - /admin/*       -> Administration Centrale       |
|  +---------------------------+  - /templates/*   -> Templates Library             |
|              |                                                                    |
|              v                                                                    |
|  +---------------------------+                                                    |
|  |     APIs BACKEND         |  Client Keycloak: "hub-api"                        |
|  |     /api/v1/*            |  Bearer Token authentication                       |
|  +---------------------------+                                                    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

**Caracteristiques de l'interface unique:**
- **Une seule URL** : https://e-guce-hub.com
- **Un seul client Keycloak** : `e-guce-hub` pour le frontend
- **Navigation interne** : Tous les modules accessibles via le menu lateral
- **Authentification unique** : Une seule connexion pour acceder a tous les modules
- **Autorisation par roles** : Les menus sont filtres selon les roles de l'utilisateur

### URL de base : https://e-guce-hub.com

### Modules du Hub (accessibles via l'interface unique)

#### MODULE 1 : TENANT BUILDER (Creation d'instances GUCE)

| Route | Description |
|-------|-------------|
| `/tenants/dashboard` | Vue d'ensemble tous les tenants |
| `/tenants/create` | Wizard creation nouveau tenant |
| `/tenants/create/step-1-info` | Infos generales (pays, nom, logo) |
| `/tenants/create/step-2-config` | Configuration technique |
| `/tenants/create/step-3-modules` | Selection modules (e-Force, e-Gov...) |
| `/tenants/create/step-4-users` | Admins initiaux |
| `/tenants/create/step-5-infra` | Choix infrastructure cible |
| `/tenants/create/step-6-deploy` | Lancement deploiement |
| `/tenants/{tenant-id}/overview` | Vue generale d'un tenant |
| `/tenants/{tenant-id}/config` | Configuration |
| `/tenants/{tenant-id}/modules` | Modules actives |
| `/tenants/{tenant-id}/users` | Admins du tenant |
| `/tenants/{tenant-id}/resources` | Ressources allouees |
| `/tenants/{tenant-id}/updates` | Mises a jour disponibles |
| `/tenants/{tenant-id}/backup` | Sauvegardes |
| `/tenants/{tenant-id}/logs` | Logs centralises |
| `/tenants/{tenant-id}/actions` | Start/Stop/Restart/Delete |
| `/tenants/compare` | Comparer les tenants |

#### MODULE 2 : GENERATOR ENGINE (Generation de code)

| Route | Description |
|-------|-------------|
| `/generator/dashboard` | Statut des generations |
| `/generator/procedures` | Generer code procedure |
| `/generator/entities` | Generer entites/APIs |
| `/generator/frontends` | Generer composants UI |
| `/generator/infrastructure` | Generer IaC (Terraform/Helm) |
| `/generator/history` | Historique des generations |
| `/generator/queue` | File d'attente |

#### MODULE 3 : MONITORING 360

| Route | Description |
|-------|-------------|
| `/monitoring/dashboard` | Dashboard 360 tous tenants |
| `/monitoring/health/overview` | Vue synthetique (UP/DOWN) |
| `/monitoring/health/{tenant-id}` | Detail sante d'un tenant |
| `/monitoring/resources/cpu` | Utilisation CPU |
| `/monitoring/resources/memory` | Utilisation RAM |
| `/monitoring/resources/storage` | Espace disque |
| `/monitoring/resources/network` | Bande passante |
| `/monitoring/resources/by-tenant` | Ressources par tenant |
| `/monitoring/metrics/transactions` | Nombre de transactions |
| `/monitoring/metrics/users-active` | Utilisateurs actifs |
| `/monitoring/metrics/performance` | Temps de reponse |
| `/monitoring/alerts/active` | Alertes actives |
| `/monitoring/alerts/history` | Historique |
| `/monitoring/alerts/rules` | Regles d'alerte |
| `/monitoring/reports/daily` | Rapport journalier |
| `/monitoring/reports/weekly` | Rapport hebdomadaire |
| `/monitoring/reports/custom` | Rapport personnalise |

#### MODULE 4 : ADMINISTRATION CENTRALE

| Route | Description |
|-------|-------------|
| `/admin/users/list` | Liste des utilisateurs Hub |
| `/admin/users/create` | Creer utilisateur |
| `/admin/users/{user-id}/edit` | Modifier |
| `/admin/users/{user-id}/permissions` | Permissions |
| `/admin/roles/list` | Liste des roles |
| `/admin/roles/create` | Creer role |
| `/admin/roles/{role-id}/permissions` | Permissions du role |
| `/admin/organizations` | Organisations (clients) |
| `/admin/audit/actions` | Actions utilisateurs |
| `/admin/audit/logins` | Connexions |
| `/admin/audit/changes` | Modifications |
| `/admin/billing/subscriptions` | Abonnements |
| `/admin/billing/invoices` | Factures |
| `/admin/billing/usage` | Consommation |
| `/admin/settings/general` | Parametres generaux |
| `/admin/settings/security` | Securite |
| `/admin/settings/notifications` | Notifications |
| `/admin/settings/integrations` | Integrations tierces |

#### MODULE 5 : BIBLIOTHEQUE DE TEMPLATES

| Route | Description |
|-------|-------------|
| `/templates/procedures/import` | Procedures import |
| `/templates/procedures/export` | Procedures export |
| `/templates/procedures/transit` | Procedures transit |
| `/templates/procedures/custom` | Procedures personnalisees |
| `/templates/workflows` | Templates BPMN |
| `/templates/forms` | Templates formulaires |
| `/templates/rules` | Templates regles DMN |
| `/templates/reports` | Templates rapports |
| `/templates/marketplace` | Marketplace (futur) |

### APIs Hub

| Endpoint | Description |
|----------|-------------|
| `/api/v1/tenants/...` | API gestion tenants |
| `/api/v1/generator/...` | API generation |
| `/api/v1/monitoring/...` | API monitoring |
| `/api/v1/admin/...` | API administration |
| `/api/v1/templates/...` | API templates |

---

## Tenant Builder - Wizard de Creation

Le Tenant Builder est le module central permettant de creer une nouvelle instance GUCE.
Il genere automatiquement le code, l'infrastructure et deploie l'instance.

### Etape 1 : Informations Generales

```json
{
  "tenant": {
    "code": "CM",
    "name": "GUCE Cameroun",
    "shortName": "GUCE-CM",
    "domain": "guce-cameroun.com",
    "logo": "base64://...",
    "primaryColor": "#1E5631",
    "secondaryColor": "#CE1126",
    "timezone": "Africa/Douala",
    "locale": "fr-CM",
    "supportedLocales": ["fr", "en"],
    "currency": "XAF"
  }
}
```

### Etape 2 : Configuration Technique

```json
{
  "technical": {
    "environment": "production",
    "highAvailability": true,
    "autoScaling": {
      "enabled": true,
      "minReplicas": 2,
      "maxReplicas": 10
    },
    "backup": {
      "enabled": true,
      "frequency": "daily",
      "retention": 30
    },
    "ssl": {
      "provider": "letsencrypt",
      "autoRenew": true
    }
  }
}
```

### Etape 3 : Modules a Activer

```json
{
  "modules": {
    "eForce": {
      "enabled": true,
      "features": ["declarations", "documents", "payments", "tracking"]
    },
    "eGov": {
      "enabled": true,
      "features": ["inbox", "processing", "decisions", "statistics"]
    },
    "eBusiness": {
      "enabled": true,
      "features": ["clients", "declarations", "billing"]
    },
    "ePayment": {
      "enabled": true,
      "providers": ["mobileMoney", "card", "bankTransfer"]
    },
    "procedureBuilder": {
      "enabled": true,
      "features": ["workflowDesigner", "formBuilder", "dataModeler", "rulesEditor"]
    },
    "admin": {
      "enabled": true,
      "features": ["users", "roles", "audit", "settings"]
    }
  }
}
```

### Etape 4 : Administrateurs Initiaux

```json
{
  "initialAdmins": [
    {
      "email": "admin@guce-cameroun.com",
      "firstName": "Admin",
      "lastName": "Principal",
      "role": "SUPER_ADMIN_INSTANCE",
      "tempPassword": true
    }
  ]
}
```

### Etape 5 : Infrastructure Cible

```json
{
  "infrastructure": {
    "provider": "ovh",
    "region": "eu-west-paris",
    "kubernetes": {
      "version": "1.28",
      "nodePool": {
        "machineType": "b2-30",
        "nodeCount": 3,
        "autoScale": true
      }
    },
    "database": {
      "type": "postgresql",
      "version": "16",
      "size": "db1-15",
      "replicas": 2
    },
    "storage": {
      "type": "object-storage",
      "size": "500Gi"
    }
  }
}
```

### Etape 6 : Deploiement

Le Tenant Builder execute automatiquement :
1. Generation du code source personnalise
2. Generation des fichiers IaC (Terraform + Helm)
3. Provisionnement de l'infrastructure (Kubernetes, DB, Storage)
4. Deploiement des microservices
5. Configuration du DNS et certificats SSL
6. Creation des utilisateurs initiaux (Keycloak)
7. Import des templates de procedures selectionnes
8. Configuration des agents de monitoring
9. Tests de sante automatiques
10. Notification de fin de deploiement

---

## Instance GUCE (Single-Tenant)

### Caracteristiques

- URL dediee : https://guce-{pays}.com (ex: https://guce-cameroun.com)
- Infrastructure isolee (Kubernetes cluster dedie ou namespace isole)
- Base de donnees dediee (pas de partage avec d'autres instances)
- Keycloak Realm dedie (ou Keycloak instance dediee)
- Peut fonctionner OFFLINE si le Hub est indisponible
- Communique avec le Hub uniquement pour :
  - Envoi des metriques de monitoring
  - Reception des mises a jour
  - Synchronisation des templates

### Schema d'une Instance

```
+-----------------------------------------------------------------------------------+
|                         INSTANCE GUCE - CAMEROUN                                  |
|                       https://guce-cameroun.com                                   |
|                           (SINGLE-TENANT)                                         |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           LOAD BALANCER (NGINX)                             |  |
|  |                    SSL Termination + Rate Limiting                          |  |
|  +--------------------------------+--------------------------------------------+  |
|                                   |                                               |
|  +--------------------------------v--------------------------------------------+  |
|  |                           API GATEWAY LOCAL                                 |  |
|  +--------------------------------+--------------------------------------------+  |
|                                   |                                               |
|  +-----------------------------------------------------------------------------+  |
|  |                              PORTAILS WEB                                   |  |
|  |                                                                             |  |
|  |  +-----------+ +-----------+ +-----------+ +-----------+                   |  |
|  |  | e-FORCE   | | e-GOV     | | e-BUSINESS| | e-PAYMENT |                   |  |
|  |  | /e-force  | | /e-gov    | | /e-business| | /e-payment|                   |  |
|  |  |           | |           | |           | |           |                   |  |
|  |  | Operateurs| | Administr.| | Intermedia| | Paiement  |                   |  |
|  |  | Econom.   | | Publiques | | Agrees    | | en Ligne  |                   |  |
|  |  +-----------+ +-----------+ +-----------+ +-----------+                   |  |
|  |                                                                             |  |
|  |  +---------------------------+ +---------------------------+               |  |
|  |  | PROCEDURE BUILDER         | | ADMIN LOCAL               |               |  |
|  |  |       /config             | |       /admin              |               |  |
|  |  |                           | |                           |               |  |
|  |  | - Workflow Designer       | | - Gestion Utilisateurs    |               |  |
|  |  | - Form Builder            | | - Roles & Habilitations   |               |  |
|  |  | - Data Modeler            | | - Organisations           |               |  |
|  |  | - Rules Editor            | | - Audit Logs              |               |  |
|  |  | - Referentiels            | | - Parametres Instance     |               |  |
|  |  +---------------------------+ +---------------------------+               |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                            MICROSERVICES                                    |  |
|  |                                                                             |  |
|  |  +--------+ +--------+ +--------+ +--------+ +--------+ +--------+         |  |
|  |  |ms-decl | |ms-workf| |ms-rules| |ms-docs | |ms-pay  | |ms-notif|         |  |
|  |  +--------+ +--------+ +--------+ +--------+ +--------+ +--------+         |  |
|  |  +--------+ +--------+ +--------+ +--------+ +--------+ +--------+         |  |
|  |  |ms-repor| |ms-inter| |ms-refer| |ms-audit| |ms-ident| |ms-confi|         |  |
|  |  +--------+ +--------+ +--------+ +--------+ +--------+ +--------+         |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                              MIDDLEWARE                                     |  |
|  |                                                                             |  |
|  |  +-----------+ +-----------+ +-----------+ +-------------------+           |  |
|  |  | Camunda 8 | | Drools 8  | |Apache Kafka| |     Keycloak     |           |  |
|  |  | (Workflow)| | (Regles)  | |  (Events)  | |      (IAM)       |           |  |
|  |  +-----------+ +-----------+ +-----------+ +-------------------+           |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                               DONNEES                                       |  |
|  |                                                                             |  |
|  |  +-----------+ +-----------+ +-----------+ +-----------+                   |  |
|  |  | PostgreSQL| |  MongoDB  | |   MinIO   | |   Redis   |                   |  |
|  |  |   (SGBD)  | |  (NoSQL)  | |   (GED)   | |  (Cache)  |                   |  |
|  |  +-----------+ +-----------+ +-----------+ +-----------+                   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                      AGENT MONITORING (vers Hub)                            |  |
|  |  +-----------+ +-----------+ +-------------+                               |  |
|  |  | Prometheus| |   Loki    | | Health Agent| ---------> E-GUCE HUB         |  |
|  |  | (Metrics) | |  (Logs)   | |  (Checks)   |                               |  |
|  |  +-----------+ +-----------+ +-------------+                               |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### URLs d'une Instance GUCE Single-Tenant

Exemple pour l'instance Cameroun : https://guce-cameroun.com

#### PORTAIL e-FORCE (Operateurs Economiques)

| Route | Description |
|-------|-------------|
| `/e-force/dashboard` | Tableau de bord |
| `/e-force/declarations/import` | Declarations import |
| `/e-force/declarations/import/new` | Nouvelle declaration |
| `/e-force/declarations/import/{id}` | Detail declaration |
| `/e-force/declarations/import/{id}/edit` | Modifier |
| `/e-force/declarations/export` | Declarations export |
| `/e-force/declarations/transit` | Declarations transit |
| `/e-force/procedures/{procedure-code}/new` | Nouvelle demande |
| `/e-force/procedures/{procedure-code}/{id}` | Suivi demande |
| `/e-force/documents` | Mes documents (GED) |
| `/e-force/payments` | Historique paiements |
| `/e-force/notifications` | Notifications |
| `/e-force/profile` | Mon profil |

#### PORTAIL e-GOV (Administrations)

| Route | Description |
|-------|-------------|
| `/e-gov/dashboard` | Tableau de bord |
| `/e-gov/inbox` | Corbeille de taches |
| `/e-gov/processing` | Dossiers en cours |
| `/e-gov/processing/{dossier-id}` | Traitement dossier |
| `/e-gov/decisions` | Decisions rendues |
| `/e-gov/statistics` | Statistiques |
| `/e-gov/settings` | Parametres service |

#### PORTAIL e-BUSINESS (Intermediaires)

| Route | Description |
|-------|-------------|
| `/e-business/dashboard` | Tableau de bord |
| `/e-business/clients` | Gestion clients |
| `/e-business/declarations` | Declarations pour clients |
| `/e-business/billing` | Facturation |

#### MODULE e-PAYMENT

| Route | Description |
|-------|-------------|
| `/e-payment/checkout/{reference}` | Processus paiement |
| `/e-payment/methods` | Moyens de paiement |
| `/e-payment/history` | Historique |
| `/e-payment/receipts/{id}` | Recu |

#### PROCEDURE BUILDER (Configuration)

| Route | Description |
|-------|-------------|
| `/config/dashboard` | Vue d'ensemble |
| `/config/procedures/list` | Liste |
| `/config/procedures/create` | Creer procedure |
| `/config/procedures/{id}/edit` | Modifier |
| `/config/workflow-designer/{workflow-id}` | Editeur BPMN |
| `/config/form-builder/{form-id}` | Editeur formulaires |
| `/config/data-modeler/{entity-id}` | Editeur donnees |
| `/config/rules-editor/{rule-id}` | Editeur regles DMN |
| `/config/referentials/countries` | Pays |
| `/config/referentials/currencies` | Devises |
| `/config/referentials/products` | Produits (SH) |
| `/config/referentials/custom/{ref-code}` | Referentiels custom |
| `/config/integrations` | Connecteurs |

#### ADMINISTRATION LOCALE

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Vue d'ensemble |
| `/admin/users/list` | Liste |
| `/admin/users/create` | Creer |
| `/admin/users/{id}` | Detail |
| `/admin/users/import` | Import en masse |
| `/admin/roles/list` | Liste |
| `/admin/roles/create` | Creer |
| `/admin/roles/{id}/permissions` | Permissions |
| `/admin/organizations/administrations` | Administrations |
| `/admin/organizations/companies` | Entreprises |
| `/admin/organizations/banks` | Banques |
| `/admin/audit/actions` | Actions |
| `/admin/audit/logins` | Connexions |
| `/admin/audit/changes` | Modifications |
| `/admin/monitoring/health` | Sante services |
| `/admin/monitoring/metrics` | Metriques |
| `/admin/monitoring/logs` | Logs |
| `/admin/settings/general` | Generaux |
| `/admin/settings/branding` | Logo, couleurs |
| `/admin/settings/notifications` | Notifications |
| `/admin/settings/integrations` | Integrations |

#### APIs Backend Instance

| Endpoint | Description |
|----------|-------------|
| `/api/v1/declarations/...` | API declarations |
| `/api/v1/procedures/...` | API procedures |
| `/api/v1/workflow/...` | API workflow |
| `/api/v1/documents/...` | API documents |
| `/api/v1/payments/...` | API paiements |
| `/api/v1/users/...` | API utilisateurs |
| `/api/v1/referentials/...` | API referentiels |
| `/api/v1/admin/...` | API admin |

---

## Communication Hub <-> Instances

### Types de Communication

```
+------------------+                              +------------------+
|   E-GUCE HUB     |                              | INSTANCE GUCE    |
|                  |                              |                  |
|                  |  <---- Metrics (Push) ------ |                  |
|  Prometheus      |        (chaque minute)       |  Agent Monitor   |
|  AlertManager    |                              |  Prometheus      |
|                  |                              |                  |
|                  |  <---- Health Check -------- |                  |
|  Health Service  |        (chaque 30s)          |  Health Agent    |
|                  |                              |                  |
|                  |  <---- Logs (Push) --------- |                  |
|  Loki            |        (temps reel)          |  Loki Agent      |
|                  |                              |                  |
|                  |  -----> Updates (Pull) ----> |                  |
|  Update Service  |        (a la demande)        |  Update Agent    |
|                  |                              |                  |
|                  |  -----> Templates Sync ----> |                  |
|  Template Svc    |        (a la demande)        |  Sync Agent      |
|                  |                              |                  |
|                  |  -----> Commands ----------> |                  |
|  Control Plane   |        (restart, config...)  |  Control Agent   |
|                  |                              |                  |
+------------------+                              +------------------+
```

### Mode Autonome

L'instance continue de fonctionner meme si le Hub est down :
- Stockage local des metriques en attente
- Envoi differe lors de la reconnexion au Hub
- Toutes les fonctionnalites metier restent disponibles

---

## Tableau Recapitulatif

### Comparaison Hub vs Instance

| Aspect | E-GUCE 3G GENERATOR HUB | INSTANCE GUCE |
|--------|-------------------------|---------------|
| Architecture | Multi-Tenant | Single-Tenant |
| URL | https://e-guce-hub.com | https://guce-{pays}.com |
| Infrastructure | Centralisee (1 cluster) | Dediee par instance |
| Base de donnees | Partagee (multi-tenant) | Dediee (isolee) |
| Keycloak | 1 Realm (Hub admins) | 1 Realm dedie par instance |
| Fonction principale | Generer et superviser | Operer les procedures |
| Utilisateurs | Admins plateforme BNS-ADDINN | Operateurs, Admins, Agents |
| Disponibilite | Critique pour creation/monitoring | Autonome (fonctionne sans Hub) |
| Procedure Builder | Templates centralises | Creation procedures locales |
| Monitoring | 360 de toutes instances | Local uniquement |

### URLs Resumees

| Systeme | URL | Modules |
|---------|-----|---------|
| E-GUCE 3G GENERATOR HUB | https://e-guce-hub.com | /tenants, /generator, /monitoring, /admin, /templates |
| INSTANCE GUCE (ex: Cameroun) | https://guce-cameroun.com | /e-force, /e-gov, /e-business, /e-payment, /config, /admin |

---

## Securite et Isolation

### Authentification Instance -> Hub

Chaque instance possede une cle API unique pour communiquer avec le Hub :

```yaml
guce:
  hub:
    url: https://e-guce-hub.com
    enabled: true
  instance:
    id: CM-GUCE-001
    apiKey: ${E_GUCE_HUB_API_KEY}
    country: CM
    name: GUCE Cameroun
```

### Isolation des Donnees

- Chaque instance a SA PROPRE base de donnees (pas de schema partage)
- Chaque instance a SON PROPRE Keycloak Realm (ou instance)
- Chaque instance a SON PROPRE stockage (MinIO/S3 bucket dedie)
- Les donnees d'une instance NE TRANSITENT JAMAIS par le Hub

### Keycloak Separe par Instance

**Option A** : Keycloak partage avec Realms separes
```
+------------------------------------------+
|           Keycloak Server                |
|                                          |
|  +----------+ +----------+ +----------+  |
|  |Realm: Hub| |Realm: CM | |Realm: TD |  |
|  +----------+ +----------+ +----------+  |
+------------------------------------------+
```

**Option B** : Keycloak dedie par instance (Recommande pour isolation totale)
```
+--------------+ +--------------+ +--------------+
| Keycloak Hub | | Keycloak CM  | | Keycloak TD  |
|              | |              | |              |
| Realm: hub   | | Realm: local | | Realm: local |
+--------------+ +--------------+ +--------------+
```

### Roles et Habilitations

#### Roles Hub

| Role | Description |
|------|-------------|
| SUPER_ADMIN | Acces total au Hub |
| TENANT_MANAGER | Creer/gerer les instances |
| MONITORING_VIEWER | Voir le monitoring seulement |
| TEMPLATE_MANAGER | Gerer les templates |

#### Roles Instance

| Role | Description |
|------|-------------|
| SUPER_ADMIN_INSTANCE | Admin total de l'instance |
| ADMIN_FONCTIONNEL | Configurer les procedures |
| ADMIN_TECHNIQUE | Gerer l'infrastructure |
| USER_MANAGER | Gerer les utilisateurs |
| OPERATEUR_ECONOMIQUE | Utilisateur e-Force |
| AGENT_ADMINISTRATION | Utilisateur e-Gov |
| INTERMEDIAIRE_AGREE | Utilisateur e-Business |

---

## Stack Technologique

| Couche | Composant | Version | Role |
|--------|-----------|---------|------|
| **Orchestration** | Camunda 8 / Zeebe | 8.x | Moteur BPMN - Workflow |
| **Regles** | Drools | 8.x | Moteur DMN - Validation, calculs |
| **Messaging** | Apache Kafka | 4.x | Event Streaming |
| **Backend** | Spring Boot | 3.x | Microservices Java 21 |
| **Frontend** | Angular | 20 | Applications Web |
| **IAM** | Keycloak | 23.x | SSO, Multi-tenant |
| **Database** | PostgreSQL | 16 | Base relationnelle |
| **Cache** | Redis | 7 | Cache distribue |
| **Stockage** | MinIO | Latest | GED S3-compatible |
| **Search** | Elasticsearch | 8.x | Recherche full-text |
| **Monitoring** | Prometheus | Latest | Metriques |
| **Logs** | Loki | Latest | Agregation logs |
| **Dashboards** | Grafana | Latest | Visualisation |

---

## Microservices

```
guce-platform/
+-- guce-common/           # Librairie partagee
+-- ms-referential/        # Referentiels (pays, devises, codes SH)
+-- ms-procedure/          # Procedures et workflows
+-- ms-generator/          # Generateur Low-Code
+-- ms-document/           # GED - Gestion des documents
+-- ms-payment/            # Paiements (mobile money, carte)
+-- ms-notification/       # Notifications (email, SMS, push)
+-- ms-audit/              # Tracabilite et journalisation
+-- ms-reporting/          # Statistiques et tableaux de bord
+-- ms-interoperability/   # Echanges partenaires externes
+-- guce-gateway/          # API Gateway
+-- infrastructure/        # Docker Compose, K8s configs
```

---

## Demarrage Rapide

### Prerequis

- Java 21
- Maven 3.9+
- Docker & Docker Compose
- Node.js 20+ (pour le frontend)

### Lancement de l'environnement local

```bash
# Demarrer l'infrastructure
docker-compose up -d

# Compiler le projet
mvn clean install

# Lancer un microservice (exemple: ms-referential)
cd ms-referential
mvn spring-boot:run
```

### URLs de developpement

| Service | URL |
|---------|-----|
| Keycloak | http://localhost:8180 |
| Kafka UI | http://localhost:8090 |
| Camunda Operate | http://localhost:8081 |
| Camunda Tasklist | http://localhost:8082 |
| MinIO Console | http://localhost:9001 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

### Credentials par defaut

| Service | User | Password |
|---------|------|----------|
| Keycloak Admin | admin | admin |
| PostgreSQL | guce | guce |
| MinIO | guce | guceminio |
| Grafana | admin | admin |

---

## Procedure Builder (Low-Code)

Le coeur du systeme permet de creer des procedures sans code :

### 1. Workflow Designer
- Modelisation graphique BPMN 2.0
- User Tasks avec assignation dynamique
- Service Tasks pour appels API
- Gateways et Timer Events

### 2. Form Builder
- Formulaires dynamiques par glisser-deposer
- 50+ types de champs supportes
- Validations et champs conditionnels
- Mapping UN/CEFACT automatique

### 3. Data Modeler
- Creation d'entites metier sans SQL
- Generation automatique des migrations
- Relations entre entites

### 4. Rules Editor
- Tables de decision visuelles (DMN)
- Regles de validation et calcul
- Hot-reload sans redemarrage

---

## Contribution

1. Creez une branche feature (`git checkout -b feature/ma-fonctionnalite`)
2. Committez vos changements (`git commit -m 'Ajout fonctionnalite'`)
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
