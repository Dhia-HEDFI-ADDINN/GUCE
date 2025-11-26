package cm.guce.tenant.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Administrateur initial d'un tenant.
 */
@Entity
@Table(name = "tenant_admin")
@Getter
@Setter
@NoArgsConstructor
public class TenantAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AdminRole role = AdminRole.FUNCTIONAL_ADMIN;

    @Column(name = "keycloak_user_id")
    private String keycloakUserId;

    @Column(name = "is_created")
    private Boolean isCreated = false;

    public enum AdminRole {
        SUPER_ADMIN,        // Acces complet
        FUNCTIONAL_ADMIN,   // Administration fonctionnelle
        TECHNICAL_ADMIN     // Administration technique
    }

    public TenantAdmin(String email, String firstName, String lastName, AdminRole role) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
