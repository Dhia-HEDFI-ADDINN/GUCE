package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité Définition de Formulaire - Structure d'un formulaire dynamique.
 *
 * Permet la création de formulaires sans code via le Form Builder.
 */
@Entity
@Table(name = "form_definition", indexes = {
        @Index(name = "idx_form_definition_code", columnList = "code"),
        @Index(name = "idx_form_definition_procedure", columnList = "procedure_id")
})
@Getter
@Setter
@NoArgsConstructor
public class FormDefinition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id")
    private Procedure procedure;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Enumerated(EnumType.STRING)
    @Column(name = "form_type", nullable = false)
    private FormType formType;

    @Column(name = "schema_json", columnDefinition = "TEXT")
    private String schemaJson;

    @Column(name = "ui_schema_json", columnDefinition = "TEXT")
    private String uiSchemaJson;

    @Column(name = "validation_rules_json", columnDefinition = "TEXT")
    private String validationRulesJson;

    @Column(name = "default_values_json", columnDefinition = "TEXT")
    private String defaultValuesJson;

    @Column(name = "version_number")
    private Integer versionNumber = 1;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<FormField> fields = new ArrayList<>();

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<FormSection> sections = new ArrayList<>();

    public enum FormType {
        CREATE,         // Formulaire de création (soumission initiale)
        EDIT,           // Formulaire de modification
        REVIEW,         // Formulaire de revue (lecture seule + commentaires)
        APPROVAL,       // Formulaire d'approbation (avec décision)
        INSPECTION,     // Formulaire d'inspection (avec checklist)
        PAYMENT,        // Formulaire de paiement
        SIGNATURE       // Formulaire de signature
    }

    public void addField(FormField field) {
        fields.add(field);
        field.setForm(this);
    }

    public void addSection(FormSection section) {
        sections.add(section);
        section.setForm(this);
    }
}
