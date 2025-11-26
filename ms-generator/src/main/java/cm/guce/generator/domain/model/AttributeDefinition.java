package cm.guce.generator.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Définition d'un attribut d'entité pour la génération de code.
 */
@Entity
@Table(name = "attribute_definition", indexes = {
        @Index(name = "idx_attribute_definition_entity", columnList = "entity_id")
})
@Getter
@Setter
@NoArgsConstructor
public class AttributeDefinition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    private EntityDefinition entity;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "column_name", length = 100)
    private String columnName;

    @Column(name = "label_fr", nullable = false)
    private String labelFr;

    @Column(name = "label_en")
    private String labelEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private DataType dataType;

    @Column(name = "java_type")
    private String javaType;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "is_unique")
    private Boolean isUnique = false;

    @Column(name = "is_searchable")
    private Boolean isSearchable = false;

    @Column(name = "is_sortable")
    private Boolean isSortable = false;

    @Column(name = "is_list_visible")
    private Boolean isListVisible = true;

    @Column(name = "is_detail_visible")
    private Boolean isDetailVisible = true;

    @Column(name = "is_form_visible")
    private Boolean isFormVisible = true;

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

    @Column(name = "precision_value")
    private Integer precisionValue;

    @Column(name = "scale_value")
    private Integer scaleValue;

    @Column(name = "enum_values", columnDefinition = "TEXT")
    private String enumValues;

    @Column(name = "reference_entity")
    private String referenceEntity;

    @Column(name = "reference_display_field")
    private String referenceDisplayField;

    @Column(name = "un_cefact_element")
    private String unCefactElement;

    @Column(name = "help_text_fr", columnDefinition = "TEXT")
    private String helpTextFr;

    public enum DataType {
        // Types simples
        STRING,
        TEXT,
        INTEGER,
        LONG,
        DECIMAL,
        BOOLEAN,
        DATE,
        TIME,
        DATETIME,
        UUID,

        // Types spéciaux
        EMAIL,
        PHONE,
        URL,
        CURRENCY,
        PERCENTAGE,

        // Types fichier
        FILE,
        IMAGE,

        // Types référence
        ENUM,
        REFERENCE,
        MULTI_REFERENCE,

        // Types JSON
        JSON,
        JSON_ARRAY
    }

    /**
     * Retourne le type Java correspondant.
     */
    public String getJavaTypeResolved() {
        if (javaType != null && !javaType.isBlank()) {
            return javaType;
        }
        return switch (dataType) {
            case STRING, TEXT, EMAIL, PHONE, URL -> "String";
            case INTEGER -> "Integer";
            case LONG -> "Long";
            case DECIMAL, CURRENCY, PERCENTAGE -> "java.math.BigDecimal";
            case BOOLEAN -> "Boolean";
            case DATE -> "java.time.LocalDate";
            case TIME -> "java.time.LocalTime";
            case DATETIME -> "java.time.LocalDateTime";
            case UUID -> "java.util.UUID";
            case FILE, IMAGE -> "String";
            case ENUM -> getEnumClassName();
            case REFERENCE -> referenceEntity;
            case MULTI_REFERENCE -> "java.util.List<" + referenceEntity + ">";
            case JSON, JSON_ARRAY -> "String";
        };
    }

    /**
     * Retourne le nom de la colonne en snake_case.
     */
    public String getSnakeCaseColumnName() {
        if (columnName != null && !columnName.isBlank()) {
            return columnName;
        }
        return name.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    private String getEnumClassName() {
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}
