package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité Champ de Formulaire - Définition d'un champ dynamique.
 *
 * Supporte tous les types de champs définis dans le Form Builder.
 */
@Entity
@Table(name = "form_field", indexes = {
        @Index(name = "idx_form_field_form", columnList = "form_id"),
        @Index(name = "idx_form_field_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
public class FormField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private FormDefinition form;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private FormSection section;

    @Column(name = "code", nullable = false, length = 100)
    private String code;

    @Column(name = "label_fr", nullable = false)
    private String labelFr;

    @Column(name = "label_en")
    private String labelEn;

    @Column(name = "placeholder_fr")
    private String placeholderFr;

    @Column(name = "placeholder_en")
    private String placeholderEn;

    @Column(name = "help_text_fr", columnDefinition = "TEXT")
    private String helpTextFr;

    @Column(name = "help_text_en", columnDefinition = "TEXT")
    private String helpTextEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false)
    private FieldType fieldType;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "is_readonly")
    private Boolean isReadonly = false;

    @Column(name = "is_hidden")
    private Boolean isHidden = false;

    @Column(name = "is_disabled")
    private Boolean isDisabled = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "min_length")
    private Integer minLength;

    @Column(name = "max_length")
    private Integer maxLength;

    @Column(name = "min_value")
    private String minValue;

    @Column(name = "max_value")
    private String maxValue;

    @Column(name = "pattern")
    private String pattern;

    @Column(name = "pattern_error_message_fr")
    private String patternErrorMessageFr;

    @Column(name = "pattern_error_message_en")
    private String patternErrorMessageEn;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "options_source")
    private String optionsSource;

    @Column(name = "options_api_url")
    private String optionsApiUrl;

    @Column(name = "depends_on")
    private String dependsOn;

    @Column(name = "visibility_condition")
    private String visibilityCondition;

    @Column(name = "calculation_formula")
    private String calculationFormula;

    @Column(name = "validation_api_url")
    private String validationApiUrl;

    @Column(name = "col_span")
    private Integer colSpan = 12;

    @Column(name = "css_class")
    private String cssClass;

    @Column(name = "data_binding")
    private String dataBinding;

    @Column(name = "un_cefact_mapping")
    private String unCefactMapping;

    public enum FieldType {
        // Champs texte
        TEXT,
        TEXTAREA,
        RICH_TEXT,
        EMAIL,
        PHONE,
        URL,
        PASSWORD,

        // Champs numériques
        NUMBER,
        INTEGER,
        DECIMAL,
        CURRENCY,
        PERCENTAGE,

        // Champs date/heure
        DATE,
        TIME,
        DATETIME,
        DATE_RANGE,
        YEAR,
        MONTH,

        // Champs de sélection
        SELECT,
        MULTI_SELECT,
        AUTOCOMPLETE,
        CASCADING_SELECT,
        RADIO,
        CHECKBOX,
        SWITCH,

        // Champs fichier
        FILE,
        MULTI_FILE,
        IMAGE,
        SIGNATURE,

        // Champs spéciaux
        HIDDEN,
        CALCULATED,
        LABEL,
        DIVIDER,
        SPACER,

        // Champs composites
        TABLE,
        REPEATER,
        GROUP,

        // Champs métier GUCE
        COUNTRY_SELECT,
        CURRENCY_SELECT,
        HS_CODE_SELECT,
        CUSTOMS_OFFICE_SELECT,
        OPERATOR_SELECT
    }
}
