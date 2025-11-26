-- =============================================================================
-- E-GUCE 3G - Initialisation Base de Donnees
-- =============================================================================
--
-- ARCHITECTURE:
-- Ce script initialise les bases de donnees pour DEUX types de systemes:
--
-- 1. E-GUCE 3G GENERATOR HUB (Multi-Tenant)
--    - guce_hub_tenants    : Registre des instances GUCE
--    - guce_hub_templates  : Templates de procedures, workflows, formulaires
--    - guce_hub_monitoring : Metriques et logs agreges
--    - guce_hub_admin      : Utilisateurs et configuration du Hub
--
-- 2. INSTANCES GUCE (Single-Tenant)
--    - guce_referential    : Referentiels (pays, devises, codes SH)
--    - guce_procedure      : Procedures et declarations
--    - guce_generator      : Generateur Low-Code
--    - guce_document       : GED - Documents
--    - guce_payment        : Paiements
--    - guce_notification   : Notifications
--    - guce_audit          : Tracabilite
--
-- En production:
-- - Le Hub a ses propres bases dediees
-- - Chaque instance a ses propres bases isolees
--
-- =============================================================================

-- =====================================================
-- BASES DE DONNEES HUB (Multi-Tenant)
-- =====================================================

-- Registre des tenants (instances GUCE)
CREATE DATABASE guce_hub_tenants;

-- Templates centralises
CREATE DATABASE guce_hub_templates;

-- Monitoring 360 - Metriques agregees
CREATE DATABASE guce_hub_monitoring;

-- Administration Hub
CREATE DATABASE guce_hub_admin;

-- =====================================================
-- BASES DE DONNEES INSTANCE (Single-Tenant)
-- =====================================================
-- En production, ces bases sont creees sur l'infrastructure
-- dediee de chaque instance

-- Referentiels
CREATE DATABASE guce_referential;

-- Procedures et declarations
CREATE DATABASE guce_procedure;

-- Generateur Low-Code
CREATE DATABASE guce_generator;

-- GED - Documents
CREATE DATABASE guce_document;

-- Paiements
CREATE DATABASE guce_payment;

-- Notifications
CREATE DATABASE guce_notification;

-- Audit et tracabilite
CREATE DATABASE guce_audit;

-- Reporting et statistiques
CREATE DATABASE guce_reporting;

-- =====================================================
-- SCHEMA KEYCLOAK
-- =====================================================
CREATE SCHEMA IF NOT EXISTS keycloak;

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Permissions Hub
GRANT ALL PRIVILEGES ON DATABASE guce_hub_tenants TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_hub_templates TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_hub_monitoring TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_hub_admin TO guce;

-- Permissions Instance
GRANT ALL PRIVILEGES ON DATABASE guce_referential TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_procedure TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_generator TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_document TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_payment TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_notification TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_audit TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_reporting TO guce;

-- =====================================================
-- EXTENSIONS - BASES HUB
-- =====================================================

\c guce_hub_tenants
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schema pour les tenants
CREATE SCHEMA IF NOT EXISTS tenants;
COMMENT ON SCHEMA tenants IS 'Registre des instances GUCE generees';

\c guce_hub_templates
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour les templates
CREATE SCHEMA IF NOT EXISTS templates;
COMMENT ON SCHEMA templates IS 'Templates de procedures, workflows, formulaires, regles';

\c guce_hub_monitoring
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- Schema pour le monitoring
CREATE SCHEMA IF NOT EXISTS monitoring;
COMMENT ON SCHEMA monitoring IS 'Metriques et health checks des instances';

\c guce_hub_admin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour l'administration
CREATE SCHEMA IF NOT EXISTS admin;
COMMENT ON SCHEMA admin IS 'Utilisateurs, organisations et audit du Hub';

-- =====================================================
-- EXTENSIONS - BASES INSTANCE
-- =====================================================

\c guce_referential
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schema pour les referentiels
CREATE SCHEMA IF NOT EXISTS referential;
COMMENT ON SCHEMA referential IS 'Referentiels: pays, devises, codes SH, bureaux, regimes';

\c guce_procedure
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schema pour les procedures
CREATE SCHEMA IF NOT EXISTS procedure;
COMMENT ON SCHEMA procedure IS 'Procedures, declarations, workflows, formulaires';

\c guce_generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour le generateur
CREATE SCHEMA IF NOT EXISTS generator;
COMMENT ON SCHEMA generator IS 'Generateur Low-Code: entites, templates, generations';

\c guce_document
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour les documents
CREATE SCHEMA IF NOT EXISTS document;
COMMENT ON SCHEMA document IS 'GED: documents, versions, metadonnees';

\c guce_payment
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour les paiements
CREATE SCHEMA IF NOT EXISTS payment;
COMMENT ON SCHEMA payment IS 'Paiements: transactions, factures, recus';

\c guce_notification
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour les notifications
CREATE SCHEMA IF NOT EXISTS notification;
COMMENT ON SCHEMA notification IS 'Notifications: email, SMS, push, templates';

\c guce_audit
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour l'audit
CREATE SCHEMA IF NOT EXISTS audit;
COMMENT ON SCHEMA audit IS 'Audit: actions, connexions, modifications';

\c guce_reporting
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema pour le reporting
CREATE SCHEMA IF NOT EXISTS reporting;
COMMENT ON SCHEMA reporting IS 'Reporting: statistiques, tableaux de bord, rapports';

-- =====================================================
-- FIN DE L'INITIALISATION
-- =====================================================
