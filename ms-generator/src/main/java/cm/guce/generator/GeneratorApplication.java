package cm.guce.generator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Application principale du microservice Générateur de Code.
 *
 * Ce microservice est responsable de :
 * - Génération automatique de code Java (Entity, DTO, Service, Controller)
 * - Génération automatique de code Angular (Model, Service, Component)
 * - Génération de fichiers BPMN pour Camunda
 * - Génération de fichiers DMN pour Drools
 * - Génération de migrations Liquibase
 * - Préservation des zones de code personnalisé lors de la régénération
 */
@SpringBootApplication(scanBasePackages = {"cm.guce.generator", "cm.guce.common"})
@EnableJpaAuditing
public class GeneratorApplication {

    public static void main(String[] args) {
        SpringApplication.run(GeneratorApplication.class, args);
    }
}
