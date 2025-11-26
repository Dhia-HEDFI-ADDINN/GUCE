package cm.guce.referential.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité Pays - Référentiel des pays conformes ISO 3166.
 */
@Entity
@Table(name = "ref_country", indexes = {
        @Index(name = "idx_country_code_iso2", columnList = "code_iso2"),
        @Index(name = "idx_country_code_iso3", columnList = "code_iso3")
})
@Getter
@Setter
@NoArgsConstructor
public class Country extends BaseEntity {

    @Column(name = "code_iso2", nullable = false, unique = true, length = 2)
    private String codeIso2;

    @Column(name = "code_iso3", nullable = false, unique = true, length = 3)
    private String codeIso3;

    @Column(name = "code_numeric", length = 3)
    private String codeNumeric;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "nationality_fr")
    private String nationalityFr;

    @Column(name = "nationality_en")
    private String nationalityEn;

    @Column(name = "region")
    private String region;

    @Column(name = "sub_region")
    private String subRegion;

    @Enumerated(EnumType.STRING)
    @Column(name = "economic_zone")
    private EconomicZone economicZone;

    @Column(name = "is_cemac")
    private Boolean isCemac = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_currency_id")
    private Currency defaultCurrency;

    public enum EconomicZone {
        CEMAC,
        UEMOA,
        EU,
        NAFTA,
        ASEAN,
        MERCOSUR,
        OTHER
    }
}
