package cm.guce.common.domain.model;

/**
 * Statuts génériques pour les entités GUCE.
 */
public enum EntityStatus {

    // Statuts de cycle de vie
    DRAFT("Brouillon"),
    PENDING("En attente"),
    SUBMITTED("Soumis"),
    IN_PROGRESS("En cours de traitement"),
    VALIDATED("Validé"),
    APPROVED("Approuvé"),
    REJECTED("Rejeté"),
    CANCELLED("Annulé"),
    COMPLETED("Terminé"),
    ARCHIVED("Archivé"),

    // Statuts spécifiques workflow
    PENDING_PAYMENT("En attente de paiement"),
    PENDING_DOCUMENTS("En attente de documents"),
    PENDING_INSPECTION("En attente d'inspection"),
    PENDING_SIGNATURE("En attente de signature"),

    // Statuts système
    ACTIVE("Actif"),
    INACTIVE("Inactif"),
    SUSPENDED("Suspendu"),
    EXPIRED("Expiré");

    private final String label;

    EntityStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
