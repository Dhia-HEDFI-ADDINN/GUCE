package cm.guce.referential;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Application principale du microservice Référentiels.
 *
 * Ce microservice gère les données de référence :
 * - Pays et zones géographiques
 * - Devises et taux de change
 * - Codes du Système Harmonisé (SH)
 * - Types de documents
 * - Régimes douaniers
 * - Bureaux et administrations
 */
@SpringBootApplication(scanBasePackages = {"cm.guce.referential", "cm.guce.common"})
@EnableJpaAuditing
@EnableCaching
public class ReferentialApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReferentialApplication.class, args);
    }
}
