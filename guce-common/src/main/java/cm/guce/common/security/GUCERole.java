package cm.guce.common.security;

import lombok.Getter;

/**
 * Roles metier E-GUCE 3G.
 *
 * ARCHITECTURE:
 * - E-GUCE 3G GENERATOR HUB (Multi-Tenant): Roles prefixes HUB_
 * - INSTANCES GUCE (Single-Tenant): Roles pour les utilisateurs des instances
 *
 * Correspondance avec les rôles Keycloak.
 */
@Getter
public enum GUCERole {

    // =====================================================
    // ROLES HUB - E-GUCE 3G GENERATOR HUB (Multi-Tenant)
    // =====================================================
    // Ces roles sont utilises uniquement sur le Hub central
    // URL: https://e-guce-hub.com
    // =====================================================

    /** Acces total au Hub - Toutes les fonctionnalites */
    HUB_SUPER_ADMIN("Super Admin Hub", "Acces total au Hub"),

    /** Creer et gerer les instances GUCE (tenants) */
    HUB_TENANT_MANAGER("Tenant Manager", "Creer et gerer les instances GUCE"),

    /** Voir le monitoring et les metriques de toutes les instances */
    HUB_MONITORING_VIEWER("Monitoring Viewer", "Consulter le monitoring 360"),

    /** Gerer les templates de procedures, workflows, formulaires et regles */
    HUB_TEMPLATE_MANAGER("Template Manager", "Gerer les templates"),

    /** Operer le generateur de code et d'infrastructure */
    HUB_GENERATOR_OPERATOR("Generator Operator", "Operer le generateur"),

    /** Gerer la facturation et les abonnements */
    HUB_BILLING_MANAGER("Billing Manager", "Gerer la facturation"),

    /** Consulter les logs d'audit du Hub */
    HUB_AUDIT_VIEWER("Audit Viewer", "Consulter les logs d'audit"),

    // =====================================================
    // ROLES INSTANCE - Administration locale
    // =====================================================
    // Ces roles sont utilises sur chaque instance GUCE
    // URL: https://guce-{pays}.com
    // =====================================================

    /** Admin total de l'instance - Acces complet */
    SUPER_ADMIN_INSTANCE("Super Admin Instance", "Admin total de l'instance"),

    /** Configurer les procedures et workflows */
    ADMIN_FONCTIONNEL("Administrateur fonctionnel", "Configurer les procedures"),

    /** Gerer l'infrastructure et les parametres techniques */
    ADMIN_TECHNIQUE("Administrateur technique", "Gerer l'infrastructure"),

    /** Gerer les utilisateurs et les organisations */
    USER_MANAGER("User Manager", "Gerer les utilisateurs"),

    // =====================================================
    // ROLES INSTANCE - Portail e-FORCE (Operateurs Economiques)
    // =====================================================

    /** Utilisateur e-Force - Operateur economique */
    OPERATEUR_ECONOMIQUE("Operateur economique", "Entreprise importatrice/exportatrice"),

    /** Declarant en douane */
    DECLARANT("Declarant", "Agent declarant d'une entreprise"),

    /** Commissionnaire agree en douane */
    COMMISSIONNAIRE_AGREE("Commissionnaire agree en douane", "CAD - Representant en douane"),

    // =====================================================
    // ROLES INSTANCE - Portail e-GOV (Administrations)
    // =====================================================

    /** Utilisateur e-Gov - Agent d'une administration */
    AGENT_ADMINISTRATION("Agent Administration", "Agent d'une administration publique"),

    // --- Douane ---
    /** Agent des douanes */
    AGENT_DOUANE("Agent des douanes", "Agent de traitement"),

    /** Chef de section douanes */
    CHEF_SECTION_DOUANE("Chef de section douanes", "Superviseur de section"),

    /** Chef de bureau douanes */
    CHEF_BUREAU_DOUANE("Chef de bureau douanes", "Responsable de bureau"),

    /** Inspecteur des douanes */
    INSPECTEUR_DOUANE("Inspecteur des douanes", "Inspecteur verificateur"),

    /** Controleur des douanes */
    CONTROLEUR_DOUANE("Controleur des douanes", "Controleur superieur"),

    // --- Agriculture (MINADER) ---
    /** Agent phytosanitaire */
    AGENT_PHYTOSANITAIRE("Agent phytosanitaire", "Agent MINADER"),

    /** Inspecteur phytosanitaire */
    INSPECTEUR_PHYTOSANITAIRE("Inspecteur phytosanitaire", "Inspecteur MINADER"),

    /** Chef service phytosanitaire */
    CHEF_SERVICE_PHYTO("Chef service phytosanitaire", "Responsable phytosanitaire"),

    // --- Commerce (MINCOMMERCE) ---
    /** Agent du commerce */
    AGENT_COMMERCE("Agent du commerce", "Agent MINCOMMERCE"),

    /** Chef service commerce */
    CHEF_SERVICE_COMMERCE("Chef service commerce", "Responsable commerce"),

    // --- Transport (MINTRANSPORT) ---
    /** Agent transport */
    AGENT_TRANSPORT("Agent transport", "Agent MINTRANSPORT"),

    /** Chef service transport */
    CHEF_SERVICE_TRANSPORT("Chef service transport", "Responsable transport"),

    // =====================================================
    // ROLES INSTANCE - Portail e-BUSINESS (Intermediaires)
    // =====================================================

    /** Utilisateur e-Business - Intermediaire agree */
    INTERMEDIAIRE_AGREE("Intermediaire agree", "Intermediaire agree en douane"),

    // --- Banques ---
    /** Agent banque */
    AGENT_BANQUE("Agent banque", "Agent domiciliation"),

    /** Superviseur banque */
    SUPERVISEUR_BANQUE("Superviseur banque", "Superviseur domiciliation"),

    /** Correspondant banque */
    CORRESPONDANT_BANQUE("Correspondant banque", "Correspondant GUCE"),

    // --- SGS/Inspection ---
    /** Agent SGS */
    AGENT_SGS("Agent SGS", "Agent societe d'inspection"),

    /** Inspecteur SGS */
    INSPECTEUR_SGS("Inspecteur SGS", "Inspecteur societe d'inspection"),

    /** Superviseur SGS */
    SUPERVISEUR_SGS("Superviseur SGS", "Superviseur inspection"),

    // --- Maritime/Aerien ---
    /** Agent compagnie maritime */
    AGENT_COMPAGNIE_MARITIME("Agent compagnie maritime", "Agent shipping"),

    /** Agent compagnie aerienne */
    AGENT_COMPAGNIE_AERIENNE("Agent compagnie aerienne", "Agent cargo aerien"),

    /** Agent manutention */
    AGENT_MANUTENTION("Agent manutention", "Agent acconier"),

    // =====================================================
    // ROLES INSTANCE - Staff GUCE
    // =====================================================

    /** Agent GUCE */
    AGENT_GUCE("Agent GUCE", "Agent du guichet unique"),

    /** Superviseur GUCE */
    SUPERVISEUR_GUCE("Superviseur GUCE", "Superviseur guichet unique"),

    /** Directeur GUCE */
    DIRECTEUR_GUCE("Directeur GUCE", "Direction du guichet unique"),

    // =====================================================
    // ROLES DEPRECATED - Pour retrocompatibilite
    // =====================================================

    /** @deprecated Utiliser SUPER_ADMIN_INSTANCE pour les instances ou HUB_SUPER_ADMIN pour le Hub */
    @Deprecated
    SUPER_ADMIN("Super administrateur", "Administrateur global - DEPRECATED");

    private final String label;
    private final String description;

    GUCERole(String label, String description) {
        this.label = label;
        this.description = description;
    }

    /**
     * Retourne le nom du role avec le prefixe ROLE_ pour Spring Security.
     * @return Le nom du role prefixe
     */
    public String getRoleName() {
        return "ROLE_" + this.name();
    }

    /**
     * Verifie si ce role est un role du Hub.
     * @return true si c'est un role Hub
     */
    public boolean isHubRole() {
        return this.name().startsWith("HUB_");
    }

    /**
     * Verifie si ce role est un role d'administration (Hub ou Instance).
     * @return true si c'est un role admin
     */
    public boolean isAdminRole() {
        return this == HUB_SUPER_ADMIN
            || this == HUB_TENANT_MANAGER
            || this == SUPER_ADMIN_INSTANCE
            || this == ADMIN_FONCTIONNEL
            || this == ADMIN_TECHNIQUE
            || this == USER_MANAGER;
    }

    /**
     * Verifie si ce role peut acceder au portail e-FORCE.
     * @return true si acces e-FORCE autorise
     */
    public boolean canAccessEForce() {
        return this == OPERATEUR_ECONOMIQUE
            || this == DECLARANT
            || this == COMMISSIONNAIRE_AGREE
            || isAdminRole();
    }

    /**
     * Verifie si ce role peut acceder au portail e-GOV.
     * @return true si acces e-GOV autorise
     */
    public boolean canAccessEGov() {
        return this == AGENT_ADMINISTRATION
            || this.name().startsWith("AGENT_DOUANE")
            || this.name().startsWith("CHEF_")
            || this.name().startsWith("INSPECTEUR_")
            || this.name().startsWith("CONTROLEUR_")
            || this.name().contains("GUCE")
            || isAdminRole();
    }

    /**
     * Verifie si ce role peut acceder au portail e-BUSINESS.
     * @return true si acces e-BUSINESS autorise
     */
    public boolean canAccessEBusiness() {
        return this == INTERMEDIAIRE_AGREE
            || this.name().contains("BANQUE")
            || this.name().contains("SGS")
            || this.name().contains("MARITIME")
            || this.name().contains("AERIEN")
            || this == AGENT_MANUTENTION
            || isAdminRole();
    }
}
