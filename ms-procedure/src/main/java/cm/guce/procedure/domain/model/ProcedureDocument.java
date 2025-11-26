package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Entité Document Requis - Définition des pièces jointes requises pour une procédure.
 */
@Entity
@Table(name = "procedure_document", indexes = {
        @Index(name = "idx_procedure_document_procedure", columnList = "procedure_id")
})
@Getter
@Setter
@NoArgsConstructor
public class ProcedureDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @Column(name = "document_type_code", nullable = false)
    private String documentTypeCode;

    @Column(name = "document_type_id")
    private UUID documentTypeId;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = false;

    @Column(name = "mandatory_condition")
    private String mandatoryCondition;

    @Column(name = "max_files")
    private Integer maxFiles = 1;

    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb = 10;

    @Column(name = "allowed_extensions")
    private String allowedExtensions = "pdf,jpg,jpeg,png";

    @Column(name = "validation_rules_json", columnDefinition = "TEXT")
    private String validationRulesJson;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "step_code")
    private String stepCode;

    @Column(name = "help_text_fr", columnDefinition = "TEXT")
    private String helpTextFr;

    @Column(name = "help_text_en", columnDefinition = "TEXT")
    private String helpTextEn;
}
