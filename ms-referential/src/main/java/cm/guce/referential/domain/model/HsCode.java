package cm.guce.referential.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité Code SH - Système Harmonisé de désignation et de codification des marchandises.
 * Conforme à la nomenclature OMD (Organisation Mondiale des Douanes).
 */
@Entity
@Table(name = "ref_hs_code", indexes = {
        @Index(name = "idx_hs_code", columnList = "code"),
        @Index(name = "idx_hs_chapter", columnList = "chapter")
})
@Getter
@Setter
@NoArgsConstructor
public class HsCode extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 12)
    private String code;

    @Column(name = "chapter", length = 2)
    private String chapter;

    @Column(name = "heading", length = 4)
    private String heading;

    @Column(name = "subheading", length = 6)
    private String subheading;

    @Column(name = "tariff_line", length = 12)
    private String tariffLine;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "duty_rate", precision = 10, scale = 4)
    private BigDecimal dutyRate;

    @Column(name = "vat_rate", precision = 10, scale = 4)
    private BigDecimal vatRate;

    @Column(name = "excise_rate", precision = 10, scale = 4)
    private BigDecimal exciseRate;

    @Column(name = "statistical_unit")
    private String statisticalUnit;

    @Column(name = "requires_license")
    private Boolean requiresLicense = false;

    @Column(name = "requires_phytosanitary")
    private Boolean requiresPhytosanitary = false;

    @Column(name = "requires_veterinary")
    private Boolean requiresVeterinary = false;

    @Column(name = "is_prohibited")
    private Boolean isProhibited = false;

    @Column(name = "is_restricted")
    private Boolean isRestricted = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private HsCode parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HsCode> children = new ArrayList<>();

    /**
     * Retourne le niveau hiérarchique du code (2, 4, 6, 8 ou 10 chiffres).
     */
    public int getLevel() {
        return code.length();
    }

    /**
     * Vérifie si c'est un chapitre (2 chiffres).
     */
    public boolean isChapter() {
        return code.length() == 2;
    }

    /**
     * Vérifie si c'est une position (4 chiffres).
     */
    public boolean isHeading() {
        return code.length() == 4;
    }

    /**
     * Vérifie si c'est une sous-position (6 chiffres).
     */
    public boolean isSubheading() {
        return code.length() == 6;
    }
}
