package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité document attaché à une Déclaration d'Importation.
 */
@Entity
@Table(name = "import_declaration_document", indexes = {
        @Index(name = "idx_import_doc_decl", columnList = "import_declaration_id"),
        @Index(name = "idx_import_doc_type", columnList = "document_type")
})
@Getter
@Setter
@NoArgsConstructor
public class ImportDeclarationDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_declaration_id", nullable = false)
    private ImportDeclaration importDeclaration;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "document_name", nullable = false, length = 200)
    private String documentName;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "checksum", length = 64)
    private String checksum;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = false;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Types de documents pour une Déclaration d'Importation.
     */
    public enum DocumentType {
        FACTURE_PROFORMA("Facture proforma", true),
        FACTURE_DEFINITIVE("Facture définitive", false),
        AMM("Autorisation de Mise sur le Marché", false),
        DEROGATION_MINSANTE("Dérogation MINSANTE", false),
        CERTIFICAT_ORIGINE("Certificat d'origine", false),
        CONNAISSEMENT("Connaissement / Bill of Lading", false),
        LTA("Lettre de Transport Aérien", false),
        CMR("Lettre de voiture CMR", false),
        LISTE_COLISAGE("Liste de colisage / Packing List", false),
        CERTIFICAT_SANITAIRE("Certificat sanitaire", false),
        CERTIFICAT_PHYTOSANITAIRE("Certificat phytosanitaire", false),
        CERTIFICAT_CONFORMITE("Certificat de conformité", false),
        LICENCE_IMPORT("Licence d'importation", false),
        AUTORISATION_SPECIALE("Autorisation spéciale", false),
        CARTE_GRISE("Carte grise véhicule", false),
        EXPERTISE_VEHICULE("Rapport d'expertise véhicule", false),
        DI_VALIDEE("DI validée (pour amendement)", false),
        FIMEX_CERTIFICATE("Certificat d'inscription FIMEX", true),
        AUTRES("Autres documents", false);

        private final String label;
        private final boolean mandatoryForSubmission;

        DocumentType(String label, boolean mandatoryForSubmission) {
            this.label = label;
            this.mandatoryForSubmission = mandatoryForSubmission;
        }

        public String getLabel() {
            return label;
        }

        public boolean isMandatoryForSubmission() {
            return mandatoryForSubmission;
        }
    }

    /**
     * Marque le document comme vérifié.
     */
    public void verify(String verifier) {
        this.isVerified = true;
        this.verifiedBy = verifier;
        this.verifiedAt = LocalDateTime.now();
        this.rejectionReason = null;
    }

    /**
     * Rejette le document.
     */
    public void reject(String verifier, String reason) {
        this.isVerified = false;
        this.verifiedBy = verifier;
        this.verifiedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }
}
