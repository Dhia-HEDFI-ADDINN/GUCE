package cm.guce.tenant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application principale du microservice de gestion des tenants.
 *
 * Ce microservice gère:
 * - La création et configuration des instances GUCE
 * - Le provisionnement des ressources (DB, Keycloak realm, etc.)
 * - Le déploiement et cycle de vie des instances
 * - Le monitoring centralisé des instances
 */
@SpringBootApplication(scanBasePackages = {"cm.guce.tenant", "cm.guce.common"})
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class TenantApplication {

    public static void main(String[] args) {
        SpringApplication.run(TenantApplication.class, args);
    }
}
