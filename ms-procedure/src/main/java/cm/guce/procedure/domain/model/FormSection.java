package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité Section de Formulaire - Regroupement logique de champs.
 */
@Entity
@Table(name = "form_section", indexes = {
        @Index(name = "idx_form_section_form", columnList = "form_id")
})
@Getter
@Setter
@NoArgsConstructor
public class FormSection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private FormDefinition form;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "title_fr", nullable = false)
    private String titleFr;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "is_collapsible")
    private Boolean isCollapsible = false;

    @Column(name = "is_collapsed")
    private Boolean isCollapsed = false;

    @Column(name = "visibility_condition")
    private String visibilityCondition;

    @Column(name = "columns")
    private Integer columns = 2;

    @Column(name = "icon")
    private String icon;

    @Column(name = "css_class")
    private String cssClass;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<FormField> fields = new ArrayList<>();
}
