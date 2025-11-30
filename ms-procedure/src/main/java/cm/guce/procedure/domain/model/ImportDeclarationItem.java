package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Entité ligne de marchandise pour une Déclaration d'Importation.
 * Conforme au dictionnaire de données GUCE.
 */
@Entity
@Table(name = "import_declaration_item", indexes = {
        @Index(name = "idx_import_item_decl", columnList = "import_declaration_id"),
        @Index(name = "idx_import_item_hs", columnList = "hs_code")
})
@Getter
@Setter
@NoArgsConstructor
public class ImportDeclarationItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_declaration_id", nullable = false)
    private ImportDeclaration importDeclaration;

    @Column(name = "item_number", nullable = false)
    private Integer itemNumber;

    @Column(name = "hs_code", nullable = false, length = 12)
    private String hsCode;

    @Column(name = "hs_code_description", length = 500)
    private String hsCodeDescription;

    @Column(name = "designation", nullable = false, length = 200)
    private String designation;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_of_measure", length = 20)
    private String unitOfMeasure;

    @Column(name = "net_weight", precision = 15, scale = 3)
    private BigDecimal netWeight;

    @Column(name = "gross_weight", precision = 15, scale = 3)
    private BigDecimal grossWeight;

    @Column(name = "unit_fob_value", precision = 18, scale = 2)
    private BigDecimal unitFobValue;

    @Column(name = "fob_value", precision = 18, scale = 2)
    private BigDecimal fobValue;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "manufacturing_year")
    private Integer manufacturingYear;

    // ========================================
    // CHAMPS SPÉCIFIQUES VÉHICULES D'OCCASION
    // ========================================

    @Column(name = "is_used_vehicle")
    private Boolean isUsedVehicle = false;

    @Column(name = "vehicle_registration", length = 50)
    private String vehicleRegistration;

    @Column(name = "vehicle_chassis_number", length = 50)
    private String vehicleChassisNumber;

    @Column(name = "vehicle_engine_number", length = 50)
    private String vehicleEngineNumber;

    @Column(name = "vehicle_first_registration_date")
    private String vehicleFirstRegistrationDate;

    @Column(name = "vehicle_mileage")
    private Integer vehicleMileage;

    // ========================================
    // CHAMPS SPÉCIFIQUES AVICULTURE
    // ========================================

    @Column(name = "is_poultry_chicks")
    private Boolean isPoultryChicks = false;

    @Column(name = "is_eggs")
    private Boolean isEggs = false;

    @Column(name = "poultry_quantity")
    private Integer poultryQuantity;

    @Column(name = "sanitary_certificate", length = 50)
    private String sanitaryCertificate;

    // ========================================
    // CHAMPS SPÉCIFIQUES MÉDICAMENTS
    // ========================================

    @Column(name = "is_medication")
    private Boolean isMedication = false;

    @Column(name = "medication_amm_number", length = 50)
    private String medicationAmmNumber;

    @Column(name = "medication_dci", length = 200)
    private String medicationDci;

    @Column(name = "medication_dosage", length = 100)
    private String medicationDosage;

    @Column(name = "medication_form", length = 100)
    private String medicationForm;

    @Column(name = "medication_expiry_date")
    private String medicationExpiryDate;

    @Column(name = "medication_batch_number", length = 50)
    private String medicationBatchNumber;

    // ========================================
    // MÉTHODES UTILITAIRES
    // ========================================

    /**
     * Vérifie si c'est un véhicule d'occasion (routage vers Douane).
     */
    public boolean isUsedVehicle() {
        return isUsedVehicle != null && isUsedVehicle;
    }

    /**
     * Vérifie si ce sont des poussins (routage vers Douane).
     */
    public boolean isPoultryChicks() {
        return isPoultryChicks != null && isPoultryChicks;
    }

    /**
     * Vérifie si ce sont des œufs (routage vers Douane).
     */
    public boolean isEggs() {
        return isEggs != null && isEggs;
    }

    /**
     * Vérifie si c'est un médicament (nécessite visa technique).
     */
    public boolean isMedication() {
        return isMedication != null && isMedication;
    }

    /**
     * Calcule la valeur FOB de la ligne.
     */
    public void calculateFobValue() {
        if (unitFobValue != null && quantity != null) {
            this.fobValue = unitFobValue.multiply(quantity);
        }
    }

    /**
     * Vérifie si la marchandise est soumise au Programme de Vérification des Importations (PVI).
     */
    public boolean isSubjectToPvi() {
        // Les marchandises non soumises au PVI selon la liste officielle
        // Pour simplifier, on considère que toutes sont soumises sauf exceptions
        return !isUsedVehicle() && !isPoultryChicks() && !isEggs();
    }
}
