package cm.guce.referential.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité Bureau de Douane - Référentiel des bureaux et postes douaniers.
 */
@Entity
@Table(name = "ref_customs_office", indexes = {
        @Index(name = "idx_customs_office_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
public class CustomsOffice extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en")
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "office_type", nullable = false)
    private OfficeType officeType;

    @Column(name = "region")
    private String region;

    @Column(name = "city")
    private String city;

    @Column(name = "address")
    private String address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_entry_point")
    private Boolean isEntryPoint = false;

    @Column(name = "is_exit_point")
    private Boolean isExitPoint = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_office_id")
    private CustomsOffice parentOffice;

    public enum OfficeType {
        DIRECTION_GENERALE,
        DIRECTION_REGIONALE,
        BUREAU_PRINCIPAL,
        BUREAU_SECONDAIRE,
        POSTE_FRONTALIER,
        BUREAU_PORT,
        BUREAU_AEROPORT,
        BUREAU_FERROVIAIRE
    }
}
