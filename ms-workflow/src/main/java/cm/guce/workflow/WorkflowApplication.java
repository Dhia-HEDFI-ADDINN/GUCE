package cm.guce.workflow;

import io.camunda.zeebe.spring.client.annotation.Deployment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Workflow Microservice Application
 *
 * Handles BPMN workflow orchestration using Camunda 8 / Zeebe
 * Features:
 * - Process definition deployment
 * - Process instance management
 * - User task assignment and completion
 * - Service task execution
 * - Event handling
 */
@SpringBootApplication
@Deployment(resources = "classpath*:bpmn/**/*.bpmn")
public class WorkflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkflowApplication.class, args);
    }
}
