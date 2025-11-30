package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité document attaché à une demande d'inscription FIMEX.
 */
@Entity
@Table(name = "fimex_document", indexes = {
        @Index(name = "idx_fimex_doc_inscription", columnList = "fimex_inscription_id"),
        @Index(name = "idx_fimex_doc_type", columnList = "document_type")
})
@Getter
@Setter
@NoArgsConstructor
public class FimexDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fimex_inscription_id", nullable = false)
    private FimexInscription fimexInscription;

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

    /**
     * Types de documents pour une inscription FIMEX.
     */
    public enum DocumentType {
        ATTESTATION_CONFORMITE_FISCALE("Attestation de conformité fiscale", true),
        REGISTRE_COMMERCE("Registre du commerce (RCCM)", true),
        CARTE_CONTRIBUABLE("Carte de contribuable", true),
        CNI_REPRESENTANT("CNI du représentant légal", true),
        STATUTS("Statuts de la société", false),
        PV_NOMINATION("PV de nomination du représentant", false),
        PLAN_LOCALISATION("Plan de localisation", false),
        QUITTANCE_CNCC("Quittance CNCC", false),
        QUITTANCE_MINCOM("Quittance MINCOMMERCE", false),
        CERTIFICAT_PRECEDENT("Certificat FIMEX précédent (renouvellement)", false),
        AUTRES("Autres documents", false);

        private final String label;
        private final boolean mandatory;

        DocumentType(String label, boolean mandatory) {
            this.label = label;
            this.mandatory = mandatory;
        }

        public String getLabel() {
            return label;
        }

        public boolean isMandatory() {
            return mandatory;
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
