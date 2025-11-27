package cm.guce.procedurebuilder;

import io.camunda.zeebe.spring.client.annotation.Deployment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * E-GUCE Procedure Builder Microservice
 *
 * Provides:
 * - Visual BPMN Workflow Designer (bpmn-js integration)
 * - BPMN parsing and validation
 * - Spring Boot code generation from BPMN
 * - Automated deployment to target GUCE instances
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
@Deployment(resources = "classpath*:/bpmn/**/*.bpmn")
public class ProcedureBuilderApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProcedureBuilderApplication.class, args);
    }
}
