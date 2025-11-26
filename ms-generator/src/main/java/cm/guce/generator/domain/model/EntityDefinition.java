package cm.guce.generator.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Définition d'une entité métier pour la génération de code.
 */
@Entity
@Table(name = "entity_definition", indexes = {
        @Index(name = "idx_entity_definition_name", columnList = "name"),
        @Index(name = "idx_entity_definition_module", columnList = "module_name")
})
@Getter
@Setter
@NoArgsConstructor
public class EntityDefinition extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "table_name", length = 100)
    private String tableName;

    @Column(name = "module_name", nullable = false, length = 50)
    private String moduleName;

    @Column(name = "package_name", length = 200)
    private String packageName;

    @Column(name = "description_fr")
    private String descriptionFr;

    @Column(name = "description_en")
    private String descriptionEn;

    @Column(name = "extends_base_entity")
    private Boolean extendsBaseEntity = true;

    @Column(name = "generate_crud")
    private Boolean generateCrud = true;

    @Column(name = "generate_search")
    private Boolean generateSearch = true;

    @Column(name = "generate_audit")
    private Boolean generateAudit = true;

    @Column(name = "generate_soft_delete")
    private Boolean generateSoftDelete = true;

    @Column(name = "un_cefact_mapping")
    private String unCefactMapping;

    @Column(name = "omd_mapping")
    private String omdMapping;

    @Column(name = "api_path", length = 200)
    private String apiPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "generation_status")
    private GenerationStatus generationStatus = GenerationStatus.PENDING;

    @Column(name = "last_generated_at")
    private java.time.LocalDateTime lastGeneratedAt;

    @Column(name = "last_generation_hash")
    private String lastGenerationHash;

    @OneToMany(mappedBy = "entity", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<AttributeDefinition> attributes = new ArrayList<>();

    @OneToMany(mappedBy = "sourceEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RelationDefinition> relations = new ArrayList<>();

    @Column(name = "procedure_id")
    private UUID procedureId;

    public enum GenerationStatus {
        PENDING,
        GENERATING,
        GENERATED,
        ERROR,
        OUTDATED
    }

    public void addAttribute(AttributeDefinition attribute) {
        attributes.add(attribute);
        attribute.setEntity(this);
    }

    public void addRelation(RelationDefinition relation) {
        relations.add(relation);
        relation.setSourceEntity(this);
    }

    /**
     * Retourne le nom de la classe en PascalCase.
     */
    public String getClassName() {
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }

    /**
     * Retourne le nom en camelCase.
     */
    public String getCamelCaseName() {
        return name.substring(0, 1).toLowerCase() + name.substring(1);
    }

    /**
     * Retourne le nom de table en snake_case.
     */
    public String getSnakeCaseTableName() {
        if (tableName != null && !tableName.isBlank()) {
            return tableName;
        }
        return name.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
}
