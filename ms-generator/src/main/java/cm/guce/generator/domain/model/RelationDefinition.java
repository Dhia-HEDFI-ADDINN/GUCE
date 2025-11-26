package cm.guce.generator.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Définition d'une relation entre entités pour la génération de code.
 */
@Entity
@Table(name = "relation_definition", indexes = {
        @Index(name = "idx_relation_source", columnList = "source_entity_id"),
        @Index(name = "idx_relation_target", columnList = "target_entity_id")
})
@Getter
@Setter
@NoArgsConstructor
public class RelationDefinition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_entity_id", nullable = false)
    private EntityDefinition sourceEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_entity_id", nullable = false)
    private EntityDefinition targetEntity;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "relation_type", nullable = false)
    private RelationType relationType;

    @Column(name = "mapped_by")
    private String mappedBy;

    @Column(name = "join_column")
    private String joinColumn;

    @Column(name = "join_table")
    private String joinTable;

    @Enumerated(EnumType.STRING)
    @Column(name = "fetch_type")
    private FetchType fetchType = FetchType.LAZY;

    @Enumerated(EnumType.STRING)
    @Column(name = "cascade_type")
    private CascadeType cascadeType;

    @Column(name = "orphan_removal")
    private Boolean orphanRemoval = false;

    @Column(name = "is_bidirectional")
    private Boolean isBidirectional = false;

    @Column(name = "inverse_name")
    private String inverseName;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    public enum RelationType {
        ONE_TO_ONE,
        ONE_TO_MANY,
        MANY_TO_ONE,
        MANY_TO_MANY
    }

    public enum FetchType {
        LAZY,
        EAGER
    }

    public enum CascadeType {
        ALL,
        PERSIST,
        MERGE,
        REMOVE,
        REFRESH,
        DETACH
    }

    /**
     * Retourne l'annotation JPA correspondante.
     */
    public String getJpaAnnotation() {
        String annotation = "@" + relationType.name().replace("_", "");
        if (fetchType != null) {
            annotation += "(fetch = FetchType." + fetchType.name();
            if (cascadeType != null) {
                annotation += ", cascade = CascadeType." + cascadeType.name();
            }
            annotation += ")";
        }
        return annotation;
    }
}
