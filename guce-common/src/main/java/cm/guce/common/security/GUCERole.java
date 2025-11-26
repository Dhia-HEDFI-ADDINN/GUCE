package cm.guce.common.security;

import lombok.Getter;

/**
 * Rôles métier GUCE.
 * Correspondance avec les rôles Keycloak.
 */
@Getter
public enum GUCERole {

    // =====================
    // Opérateurs économiques
    // =====================
    OPERATEUR_ECONOMIQUE("Opérateur économique", "Entreprise importatrice/exportatrice"),
    DECLARANT("Déclarant", "Agent déclarant d'une entreprise"),
    COMMISSIONNAIRE_AGREE("Commissionnaire agréé en douane", "CAD - Représentant en douane"),

    // =====================
    // Administrations - Douane
    // =====================
    AGENT_DOUANE("Agent des douanes", "Agent de traitement"),
    CHEF_SECTION_DOUANE("Chef de section douanes", "Superviseur de section"),
    CHEF_BUREAU_DOUANE("Chef de bureau douanes", "Responsable de bureau"),
    INSPECTEUR_DOUANE("Inspecteur des douanes", "Inspecteur vérificateur"),
    CONTROLEUR_DOUANE("Contrôleur des douanes", "Contrôleur supérieur"),

    // =====================
    // Administrations - Agriculture
    // =====================
    AGENT_PHYTOSANITAIRE("Agent phytosanitaire", "Agent MINADER"),
    INSPECTEUR_PHYTOSANITAIRE("Inspecteur phytosanitaire", "Inspecteur MINADER"),
    CHEF_SERVICE_PHYTO("Chef service phytosanitaire", "Responsable phytosanitaire"),

    // =====================
    // Administrations - Commerce
    // =====================
    AGENT_COMMERCE("Agent du commerce", "Agent MINCOMMERCE"),
    CHEF_SERVICE_COMMERCE("Chef service commerce", "Responsable commerce"),

    // =====================
    // Administrations - Transport
    // =====================
    AGENT_TRANSPORT("Agent transport", "Agent MINTRANSPORT"),
    CHEF_SERVICE_TRANSPORT("Chef service transport", "Responsable transport"),

    // =====================
    // Intermédiaires - Banques
    // =====================
    AGENT_BANQUE("Agent banque", "Agent domiciliation"),
    SUPERVISEUR_BANQUE("Superviseur banque", "Superviseur domiciliation"),
    CORRESPONDANT_BANQUE("Correspondant banque", "Correspondant GUCE"),

    // =====================
    // Intermédiaires - SGS/Inspection
    // =====================
    AGENT_SGS("Agent SGS", "Agent société d'inspection"),
    INSPECTEUR_SGS("Inspecteur SGS", "Inspecteur société d'inspection"),
    SUPERVISEUR_SGS("Superviseur SGS", "Superviseur inspection"),

    // =====================
    // Intermédiaires - Maritime/Aérien
    // =====================
    AGENT_COMPAGNIE_MARITIME("Agent compagnie maritime", "Agent shipping"),
    AGENT_COMPAGNIE_AERIENNE("Agent compagnie aérienne", "Agent cargo aérien"),
    AGENT_MANUTENTION("Agent manutention", "Agent acconier"),

    // =====================
    // Administration système
    // =====================
    ADMIN_FONCTIONNEL("Administrateur fonctionnel", "Gestionnaire des procédures"),
    ADMIN_TECHNIQUE("Administrateur technique", "Gestionnaire technique"),
    SUPER_ADMIN("Super administrateur", "Administrateur global"),

    // =====================
    // GUCE Staff
    // =====================
    AGENT_GUCE("Agent GUCE", "Agent du guichet unique"),
    SUPERVISEUR_GUCE("Superviseur GUCE", "Superviseur guichet unique"),
    DIRECTEUR_GUCE("Directeur GUCE", "Direction du guichet unique");

    private final String label;
    private final String description;

    GUCERole(String label, String description) {
        this.label = label;
        this.description = description;
    }

    public String getRoleName() {
        return "ROLE_" + this.name();
    }
}
