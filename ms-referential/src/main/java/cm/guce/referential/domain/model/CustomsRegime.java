package cm.guce.referential.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité Régime Douanier - Référentiel des régimes douaniers.
 * Conforme au Code des Douanes CEMAC.
 */
@Entity
@Table(name = "ref_customs_regime", indexes = {
        @Index(name = "idx_customs_regime_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
public class CustomsRegime extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 4)
    private String code;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime_category")
    private RegimeCategory category;

    @Column(name = "requires_guarantee")
    private Boolean requiresGuarantee = false;

    @Column(name = "max_duration_days")
    private Integer maxDurationDays;

    @Column(name = "is_suspensive")
    private Boolean isSuspensive = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public enum RegimeCategory {
        IMPORT_DEFINITIF,        // Mise à la consommation
        EXPORT_DEFINITIF,        // Exportation définitive
        TRANSIT,                 // Transit douanier
        ENTREPOT,               // Entrepôt de douane
        ADMISSION_TEMPORAIRE,    // Admission temporaire
        PERFECTIONNEMENT_ACTIF,  // Perfectionnement actif
        PERFECTIONNEMENT_PASSIF, // Perfectionnement passif
        ZONE_FRANCHE,           // Zone franche
        REEXPORTATION,          // Réexportation
        REIMPORTATION           // Réimportation
    }
}
