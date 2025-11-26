package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité Procédure - Définition d'une procédure du commerce extérieur.
 *
 * Une procédure représente un processus métier complet (ex: Déclaration d'importation,
 * Certificat d'origine, Autorisation phytosanitaire).
 */
@Entity
@Table(name = "procedure", indexes = {
        @Index(name = "idx_procedure_code", columnList = "code"),
        @Index(name = "idx_procedure_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
public class Procedure extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
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
    @Column(name = "category", nullable = false)
    private ProcedureCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "procedure_type", nullable = false)
    private ProcedureType procedureType;

    @Column(name = "bpmn_process_id")
    private String bpmnProcessId;

    @Column(name = "bpmn_definition", columnDefinition = "TEXT")
    private String bpmnDefinition;

    @Column(name = "dmn_decision_id")
    private String dmnDecisionId;

    @Column(name = "icon")
    private String icon;

    @Column(name = "color")
    private String color;

    @Column(name = "expected_duration_hours")
    private Integer expectedDurationHours;

    @Column(name = "max_duration_hours")
    private Integer maxDurationHours;

    @Column(name = "requires_payment")
    private Boolean requiresPayment = false;

    @Column(name = "requires_signature")
    private Boolean requiresSignature = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "version_number")
    private Integer versionNumber = 1;

    @Column(name = "published_version")
    private Integer publishedVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProcedureStatus status = ProcedureStatus.DRAFT;

    @OneToMany(mappedBy = "procedure", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<ProcedureStep> steps = new ArrayList<>();

    @OneToMany(mappedBy = "procedure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormDefinition> forms = new ArrayList<>();

    @OneToMany(mappedBy = "procedure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProcedureDocument> requiredDocuments = new ArrayList<>();

    public enum ProcedureCategory {
        IMPORT,
        EXPORT,
        TRANSIT,
        AUTORISATION,
        CERTIFICAT,
        DOMICILIATION,
        INSPECTION,
        AUTRE
    }

    public enum ProcedureType {
        STANDARD,           // Procédure standard avec workflow
        SIMPLIFIED,         // Procédure simplifiée (déclaration directe)
        URGENT,            // Procédure urgente (fast track)
        PERIODIC           // Procédure périodique (déclaration récapitulative)
    }

    public enum ProcedureStatus {
        DRAFT,              // En cours de configuration
        TESTING,            // En test
        PUBLISHED,          // Publiée et active
        DEPRECATED,         // Dépréciée (non visible pour nouvelles demandes)
        ARCHIVED           // Archivée
    }

    public void addStep(ProcedureStep step) {
        steps.add(step);
        step.setProcedure(this);
    }

    public void removeStep(ProcedureStep step) {
        steps.remove(step);
        step.setProcedure(null);
    }
}
