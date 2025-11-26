package cm.guce.referential.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité Type de Document - Référentiel des types de documents du commerce extérieur.
 */
@Entity
@Table(name = "ref_document_type", indexes = {
        @Index(name = "idx_document_type_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
public class DocumentType extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 20)
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
    @Column(name = "category")
    private DocumentCategory category;

    @Column(name = "issuing_authority")
    private String issuingAuthority;

    @Column(name = "validity_days")
    private Integer validityDays;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = false;

    @Column(name = "is_electronic")
    private Boolean isElectronic = true;

    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb = 10;

    @Column(name = "allowed_extensions")
    private String allowedExtensions = "pdf,jpg,jpeg,png";

    @Column(name = "is_active")
    private Boolean isActive = true;

    public enum DocumentCategory {
        COMMERCIAL,          // Facture, contrat, liste de colisage
        TRANSPORT,           // Connaissement, LTA, CMR
        DOUANIER,           // Déclaration, DAU
        FINANCIER,          // Domiciliation, LC, garantie
        SANITAIRE,          // Certificat phytosanitaire, vétérinaire
        TECHNIQUE,          // Certificat de conformité, inspection
        ORIGINE,            // Certificat d'origine
        AUTORISATION,       // Licences, permis
        IDENTIFICATION      // Registre commerce, NIU
    }
}
