-- GUCE Platform - Base de données initialisation
-- Création des schémas et bases pour chaque microservice

-- Créer les bases de données pour chaque microservice
CREATE DATABASE guce_referential;
CREATE DATABASE guce_procedure;
CREATE DATABASE guce_document;
CREATE DATABASE guce_payment;
CREATE DATABASE guce_notification;
CREATE DATABASE guce_audit;
CREATE DATABASE guce_generator;

-- Créer le schéma Keycloak
CREATE SCHEMA IF NOT EXISTS keycloak;

-- Accorder les permissions
GRANT ALL PRIVILEGES ON DATABASE guce_referential TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_procedure TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_document TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_payment TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_notification TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_audit TO guce;
GRANT ALL PRIVILEGES ON DATABASE guce_generator TO guce;

-- Extensions utiles
\c guce_referential
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c guce_procedure
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c guce_document
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c guce_payment
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c guce_notification
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c guce_audit
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c guce_generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
