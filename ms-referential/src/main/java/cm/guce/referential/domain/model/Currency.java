package cm.guce.referential.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Entité Devise - Référentiel des devises conformes ISO 4217.
 */
@Entity
@Table(name = "ref_currency", indexes = {
        @Index(name = "idx_currency_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
public class Currency extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 3)
    private String code;

    @Column(name = "code_numeric", length = 3)
    private String codeNumeric;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "symbol", length = 10)
    private String symbol;

    @Column(name = "decimal_places")
    private Integer decimalPlaces = 2;

    @Column(name = "exchange_rate_to_xaf", precision = 18, scale = 6)
    private BigDecimal exchangeRateToXaf;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_reference")
    private Boolean isReference = false;
}
