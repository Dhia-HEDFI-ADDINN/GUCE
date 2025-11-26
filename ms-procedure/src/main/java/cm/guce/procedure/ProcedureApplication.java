package cm.guce.procedure;

import io.camunda.zeebe.spring.client.annotation.Deployment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Application principale du microservice Procédures.
 *
 * Ce microservice est le cœur du système Low-Code GUCE :
 * - Définition des procédures du commerce extérieur
 * - Gestion des formulaires dynamiques
 * - Configuration des circuits de validation
 * - Intégration avec Camunda 8 pour l'orchestration
 */
@SpringBootApplication(scanBasePackages = {"cm.guce.procedure", "cm.guce.common"})
@EnableJpaAuditing
@Deployment(resources = "classpath*:bpmn/*.bpmn")
public class ProcedureApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProcedureApplication.class, args);
    }
}
