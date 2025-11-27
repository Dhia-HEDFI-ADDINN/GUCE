package cm.guce.procedurebuilder.application.generator;

import cm.guce.procedurebuilder.domain.model.WorkflowDefinition;
import cm.guce.procedurebuilder.domain.model.WorkflowModel;
import cm.guce.procedurebuilder.domain.model.WorkflowModel.*;
import com.squareup.javapoet.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.lang.model.element.Modifier;
import java.util.*;

/**
 * Code Generator Engine - Transforms BPMN WorkflowModel into Spring Boot code
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CodeGeneratorEngine {

    private static final String BASE_PACKAGE = "cm.guce.generated";

    /**
     * Generate all Spring Boot code from workflow definition
     */
    public GeneratedCode generate(WorkflowDefinition workflowDef, WorkflowModel model) {
        log.info("Generating Spring Boot code for workflow: {}", model.getProcessId());

        String processPackage = BASE_PACKAGE + "." + sanitizePackageName(model.getProcessId());
        Map<String, String> generatedFiles = new LinkedHashMap<>();

        // Generate Controller
        String controllerCode = generateController(processPackage, model);
        generatedFiles.put(
            getClassName(model.getProcessId()) + "Controller.java",
            controllerCode
        );

        // Generate Service
        String serviceCode = generateService(processPackage, model);
        generatedFiles.put(
            getClassName(model.getProcessId()) + "Service.java",
            serviceCode
        );

        // Generate Job Workers for User Tasks
        for (UserTaskModel userTask : model.getUserTasks()) {
            String handlerCode = generateUserTaskHandler(processPackage, model, userTask);
            generatedFiles.put(
                getClassName(userTask.getId()) + "Handler.java",
                handlerCode
            );
        }

        // Generate Job Workers for Service Tasks
        for (ServiceTaskModel serviceTask : model.getServiceTasks()) {
            String handlerCode = generateServiceTaskHandler(processPackage, model, serviceTask);
            generatedFiles.put(
                getClassName(serviceTask.getId()) + "Handler.java",
                handlerCode
            );
        }

        // Generate Request DTO
        String requestDtoCode = generateRequestDto(processPackage, model);
        generatedFiles.put(
            getClassName(model.getProcessId()) + "Request.java",
            requestDtoCode
        );

        // Generate Response DTO
        String responseDtoCode = generateResponseDto(processPackage, model);
        generatedFiles.put(
            "ProcessInstanceResponse.java",
            responseDtoCode
        );

        // Generate pom.xml
        String pomXml = generatePomXml(model);
        generatedFiles.put("pom.xml", pomXml);

        // Generate application.yml
        String applicationYml = generateApplicationYml(model, workflowDef);
        generatedFiles.put("application.yml", applicationYml);

        // Copy BPMN file
        generatedFiles.put(
            model.getProcessId() + ".bpmn",
            workflowDef.getBpmnXml()
        );

        log.info("Generated {} files for workflow {}", generatedFiles.size(), model.getProcessId());

        return GeneratedCode.builder()
            .processId(model.getProcessId())
            .packageName(processPackage)
            .files(generatedFiles)
            .build();
    }

    /**
     * Generate REST Controller
     */
    private String generateController(String packageName, WorkflowModel model) {
        String className = getClassName(model.getProcessId()) + "Controller";
        String serviceName = getClassName(model.getProcessId()) + "Service";

        ClassName zeebeClient = ClassName.get("io.camunda.zeebe.client", "ZeebeClient");
        ClassName responseEntity = ClassName.get("org.springframework.http", "ResponseEntity");
        ClassName requestBody = ClassName.get("org.springframework.web.bind.annotation", "RequestBody");
        ClassName valid = ClassName.get("jakarta.validation", "Valid");
        ClassName slf4j = ClassName.get("lombok.extern.slf4j", "Slf4j");

        // Build class
        TypeSpec.Builder controllerBuilder = TypeSpec.classBuilder(className)
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(ClassName.get("org.springframework.web.bind.annotation", "RestController"))
            .addAnnotation(AnnotationSpec.builder(ClassName.get("org.springframework.web.bind.annotation", "RequestMapping"))
                .addMember("value", "$S", "/api/v1/procedures/" + toKebabCase(model.getProcessId()))
                .build())
            .addAnnotation(ClassName.get("lombok", "RequiredArgsConstructor"))
            .addAnnotation(slf4j)
            .addAnnotation(AnnotationSpec.builder(ClassName.get("io.swagger.v3.oas.annotations.tags", "Tag"))
                .addMember("name", "$S", model.getProcessName() != null ? model.getProcessName() : model.getProcessId())
                .addMember("description", "$S", "API for " + model.getProcessId() + " workflow")
                .build());

        // Add fields
        controllerBuilder.addField(FieldSpec.builder(zeebeClient, "zeebeClient", Modifier.PRIVATE, Modifier.FINAL).build());
        controllerBuilder.addField(FieldSpec.builder(
            ClassName.get(packageName, serviceName), "service", Modifier.PRIVATE, Modifier.FINAL).build());

        // Start process endpoint
        ClassName requestDto = ClassName.get(packageName, getClassName(model.getProcessId()) + "Request");
        ClassName responseDto = ClassName.get(packageName, "ProcessInstanceResponse");

        MethodSpec startMethod = MethodSpec.methodBuilder("startProcess")
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(AnnotationSpec.builder(ClassName.get("org.springframework.web.bind.annotation", "PostMapping"))
                .addMember("value", "$S", "/start")
                .build())
            .addAnnotation(AnnotationSpec.builder(ClassName.get("io.swagger.v3.oas.annotations", "Operation"))
                .addMember("summary", "$S", "Start a new " + model.getProcessId() + " process instance")
                .build())
            .returns(ParameterizedTypeName.get(responseEntity, responseDto))
            .addParameter(ParameterSpec.builder(requestDto, "request")
                .addAnnotation(valid)
                .addAnnotation(requestBody)
                .build())
            .addStatement("log.info($S, request)", "Starting process with request: {}")
            .addCode("\n")
            .addStatement("var instance = zeebeClient.newCreateInstanceCommand()\n" +
                "    .bpmnProcessId($S)\n" +
                "    .latestVersion()\n" +
                "    .variables(request.toVariables())\n" +
                "    .send()\n" +
                "    .join()", model.getProcessId())
            .addCode("\n")
            .addStatement("log.info($S, instance.getProcessInstanceKey())", "Process started with key: {}")
            .addStatement("return $T.ok(new $T(instance.getProcessInstanceKey()))",
                responseEntity, responseDto)
            .build();

        controllerBuilder.addMethod(startMethod);

        // Get process status endpoint
        MethodSpec getStatusMethod = MethodSpec.methodBuilder("getProcessStatus")
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(AnnotationSpec.builder(ClassName.get("org.springframework.web.bind.annotation", "GetMapping"))
                .addMember("value", "$S", "/{processInstanceKey}/status")
                .build())
            .addAnnotation(AnnotationSpec.builder(ClassName.get("io.swagger.v3.oas.annotations", "Operation"))
                .addMember("summary", "$S", "Get process instance status")
                .build())
            .returns(ParameterizedTypeName.get(responseEntity,
                ParameterizedTypeName.get(ClassName.get("java.util", "Map"),
                    ClassName.get(String.class), ClassName.get(Object.class))))
            .addParameter(ParameterSpec.builder(long.class, "processInstanceKey")
                .addAnnotation(ClassName.get("org.springframework.web.bind.annotation", "PathVariable"))
                .build())
            .addStatement("return $T.ok(service.getProcessStatus(processInstanceKey))", responseEntity)
            .build();

        controllerBuilder.addMethod(getStatusMethod);

        // Cancel process endpoint
        MethodSpec cancelMethod = MethodSpec.methodBuilder("cancelProcess")
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(AnnotationSpec.builder(ClassName.get("org.springframework.web.bind.annotation", "DeleteMapping"))
                .addMember("value", "$S", "/{processInstanceKey}")
                .build())
            .addAnnotation(AnnotationSpec.builder(ClassName.get("io.swagger.v3.oas.annotations", "Operation"))
                .addMember("summary", "$S", "Cancel a process instance")
                .build())
            .returns(ParameterizedTypeName.get(responseEntity, ClassName.get(Void.class).box()))
            .addParameter(ParameterSpec.builder(long.class, "processInstanceKey")
                .addAnnotation(ClassName.get("org.springframework.web.bind.annotation", "PathVariable"))
                .build())
            .addStatement("service.cancelProcess(processInstanceKey)")
            .addStatement("return $T.noContent().build()", responseEntity)
            .build();

        controllerBuilder.addMethod(cancelMethod);

        // Build file
        JavaFile javaFile = JavaFile.builder(packageName, controllerBuilder.build())
            .addFileComment("GENERATED CODE - DO NOT MODIFY\n")
            .addFileComment("Source: Procedure Builder - Workflow Designer\n")
            .addFileComment("Process: " + model.getProcessId())
            .build();

        return javaFile.toString();
    }

    /**
     * Generate Service class
     */
    private String generateService(String packageName, WorkflowModel model) {
        String className = getClassName(model.getProcessId()) + "Service";

        ClassName zeebeClient = ClassName.get("io.camunda.zeebe.client", "ZeebeClient");
        ClassName slf4j = ClassName.get("lombok.extern.slf4j", "Slf4j");

        TypeSpec.Builder serviceBuilder = TypeSpec.classBuilder(className)
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(ClassName.get("org.springframework.stereotype", "Service"))
            .addAnnotation(ClassName.get("lombok", "RequiredArgsConstructor"))
            .addAnnotation(slf4j);

        // Add fields
        serviceBuilder.addField(FieldSpec.builder(zeebeClient, "zeebeClient", Modifier.PRIVATE, Modifier.FINAL).build());

        // Get process status method
        MethodSpec getStatusMethod = MethodSpec.methodBuilder("getProcessStatus")
            .addModifiers(Modifier.PUBLIC)
            .returns(ParameterizedTypeName.get(ClassName.get("java.util", "Map"),
                ClassName.get(String.class), ClassName.get(Object.class)))
            .addParameter(long.class, "processInstanceKey")
            .addStatement("$T<$T, $T> status = new $T<>()",
                Map.class, String.class, Object.class, HashMap.class)
            .addStatement("status.put($S, processInstanceKey)", "processInstanceKey")
            .addStatement("status.put($S, $S)", "processId", model.getProcessId())
            .addComment("TODO: Query Operate API for detailed status")
            .addStatement("return status")
            .build();

        serviceBuilder.addMethod(getStatusMethod);

        // Cancel process method
        MethodSpec cancelMethod = MethodSpec.methodBuilder("cancelProcess")
            .addModifiers(Modifier.PUBLIC)
            .returns(void.class)
            .addParameter(long.class, "processInstanceKey")
            .addStatement("log.info($S, processInstanceKey)", "Cancelling process: {}")
            .addStatement("zeebeClient.newCancelInstanceCommand(processInstanceKey)\n" +
                "    .send()\n" +
                "    .join()")
            .build();

        serviceBuilder.addMethod(cancelMethod);

        // Publish message method
        MethodSpec publishMessageMethod = MethodSpec.methodBuilder("publishMessage")
            .addModifiers(Modifier.PUBLIC)
            .returns(void.class)
            .addParameter(String.class, "messageName")
            .addParameter(String.class, "correlationKey")
            .addParameter(ParameterizedTypeName.get(Map.class, String.class, Object.class), "variables")
            .addStatement("log.info($S, messageName, correlationKey)", "Publishing message {} with correlation key {}")
            .addStatement("zeebeClient.newPublishMessageCommand()\n" +
                "    .messageName(messageName)\n" +
                "    .correlationKey(correlationKey)\n" +
                "    .variables(variables)\n" +
                "    .send()\n" +
                "    .join()")
            .build();

        serviceBuilder.addMethod(publishMessageMethod);

        JavaFile javaFile = JavaFile.builder(packageName, serviceBuilder.build())
            .addFileComment("GENERATED CODE - DO NOT MODIFY\n")
            .addFileComment("Source: Procedure Builder - Workflow Designer\n")
            .addFileComment("Process: " + model.getProcessId())
            .build();

        return javaFile.toString();
    }

    /**
     * Generate User Task Handler
     */
    private String generateUserTaskHandler(String packageName, WorkflowModel model, UserTaskModel userTask) {
        String className = getClassName(userTask.getId()) + "Handler";
        String taskType = userTask.getTaskType() != null ? userTask.getTaskType() : toKebabCase(userTask.getId());

        ClassName slf4j = ClassName.get("lombok.extern.slf4j", "Slf4j");
        ClassName jobWorker = ClassName.get("io.camunda.zeebe.spring.client.annotation", "JobWorker");
        ClassName activatedJob = ClassName.get("io.camunda.zeebe.client.api.response", "ActivatedJob");
        ClassName jobClient = ClassName.get("io.camunda.zeebe.client.api.worker", "JobClient");

        TypeSpec.Builder handlerBuilder = TypeSpec.classBuilder(className)
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(ClassName.get("org.springframework.stereotype", "Component"))
            .addAnnotation(ClassName.get("lombok", "RequiredArgsConstructor"))
            .addAnnotation(slf4j);

        // Handler method
        MethodSpec handleMethod = MethodSpec.methodBuilder("handle" + getClassName(userTask.getId()))
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(AnnotationSpec.builder(jobWorker)
                .addMember("type", "$S", taskType)
                .addMember("autoComplete", "false")
                .build())
            .returns(void.class)
            .addParameter(activatedJob, "job")
            .addParameter(jobClient, "client")
            .addStatement("log.info($S, job.getKey())", "Handling user task: " + userTask.getName() + " - Job key: {}")
            .addCode("\n")
            .addComment("Get process variables")
            .addStatement("$T<$T, $T> variables = job.getVariablesAsMap()",
                Map.class, String.class, Object.class)
            .addCode("\n")
            .addComment("This is a User Task - it will be displayed in the task inbox")
            .addComment("The task will be completed via the REST API when the user submits the form")
            .addComment("Form key: " + (userTask.getFormKey() != null ? userTask.getFormKey() : "not defined"))
            .addCode("\n")
            .addComment("Optionally send notification about new task")
            .addStatement("log.debug($S, variables)", "Task variables: {}")
            .build();

        handlerBuilder.addMethod(handleMethod);

        JavaFile javaFile = JavaFile.builder(packageName, handlerBuilder.build())
            .addFileComment("GENERATED CODE - DO NOT MODIFY\n")
            .addFileComment("Source: Procedure Builder - Workflow Designer\n")
            .addFileComment("User Task: " + userTask.getName())
            .build();

        return javaFile.toString();
    }

    /**
     * Generate Service Task Handler
     */
    private String generateServiceTaskHandler(String packageName, WorkflowModel model, ServiceTaskModel serviceTask) {
        String className = getClassName(serviceTask.getId()) + "Handler";
        String taskType = serviceTask.getTaskType() != null ? serviceTask.getTaskType() : toKebabCase(serviceTask.getId());

        ClassName slf4j = ClassName.get("lombok.extern.slf4j", "Slf4j");
        ClassName jobWorker = ClassName.get("io.camunda.zeebe.spring.client.annotation", "JobWorker");
        ClassName activatedJob = ClassName.get("io.camunda.zeebe.client.api.response", "ActivatedJob");
        ClassName jobClient = ClassName.get("io.camunda.zeebe.client.api.worker", "JobClient");

        TypeSpec.Builder handlerBuilder = TypeSpec.classBuilder(className)
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(ClassName.get("org.springframework.stereotype", "Component"))
            .addAnnotation(ClassName.get("lombok", "RequiredArgsConstructor"))
            .addAnnotation(slf4j);

        // Handler method
        MethodSpec.Builder handleMethodBuilder = MethodSpec.methodBuilder("handle" + getClassName(serviceTask.getId()))
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(AnnotationSpec.builder(jobWorker)
                .addMember("type", "$S", taskType)
                .addMember("autoComplete", "true")
                .build())
            .returns(ParameterizedTypeName.get(Map.class, String.class, Object.class))
            .addParameter(activatedJob, "job")
            .addStatement("log.info($S, job.getKey())", "Handling service task: " + serviceTask.getName() + " - Job key: {}")
            .addCode("\n")
            .addComment("Get process variables")
            .addStatement("$T<$T, $T> variables = job.getVariablesAsMap()",
                Map.class, String.class, Object.class)
            .addCode("\n");

        // Add implementation based on service task type
        switch (serviceTask.getImplementation()) {
            case REST_CALL:
                handleMethodBuilder.addComment("TODO: Implement REST API call")
                    .addComment("Use WebClient or RestTemplate to call external service");
                break;
            case KAFKA_PUBLISH:
                handleMethodBuilder.addComment("TODO: Implement Kafka message publishing")
                    .addComment("Use KafkaTemplate to publish message");
                break;
            case SCRIPT:
                handleMethodBuilder.addComment("TODO: Implement script execution");
                break;
            default:
                handleMethodBuilder.addComment("Implement business logic here");
        }

        handleMethodBuilder
            .addCode("\n")
            .addComment("Return output variables")
            .addStatement("$T<$T, $T> output = new $T<>()",
                Map.class, String.class, Object.class, HashMap.class)
            .addStatement("output.put($S, true)", "taskCompleted")
            .addStatement("return output");

        handlerBuilder.addMethod(handleMethodBuilder.build());

        JavaFile javaFile = JavaFile.builder(packageName, handlerBuilder.build())
            .addFileComment("GENERATED CODE - DO NOT MODIFY\n")
            .addFileComment("Source: Procedure Builder - Workflow Designer\n")
            .addFileComment("Service Task: " + serviceTask.getName())
            .build();

        return javaFile.toString();
    }

    /**
     * Generate Request DTO
     */
    private String generateRequestDto(String packageName, WorkflowModel model) {
        String className = getClassName(model.getProcessId()) + "Request";

        TypeSpec.Builder dtoBuilder = TypeSpec.classBuilder(className)
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(ClassName.get("lombok", "Data"))
            .addAnnotation(ClassName.get("lombok", "NoArgsConstructor"))
            .addAnnotation(ClassName.get("lombok", "AllArgsConstructor"))
            .addAnnotation(ClassName.get("lombok", "Builder"));

        // Add common fields
        dtoBuilder.addField(FieldSpec.builder(String.class, "initiatorId", Modifier.PRIVATE)
            .addAnnotation(AnnotationSpec.builder(ClassName.get("jakarta.validation.constraints", "NotBlank"))
                .addMember("message", "$S", "Initiator ID is required")
                .build())
            .build());

        dtoBuilder.addField(FieldSpec.builder(String.class, "tenantId", Modifier.PRIVATE).build());

        // Add fields based on process variables
        for (Map.Entry<String, VariableDefinition> entry : model.getVariables().entrySet()) {
            VariableDefinition varDef = entry.getValue();
            Class<?> fieldType = mapVariableType(varDef.getType());

            FieldSpec.Builder fieldBuilder = FieldSpec.builder(fieldType, entry.getKey(), Modifier.PRIVATE);
            if (varDef.isRequired()) {
                fieldBuilder.addAnnotation(ClassName.get("jakarta.validation.constraints", "NotNull"));
            }
            dtoBuilder.addField(fieldBuilder.build());
        }

        // Add toVariables method
        MethodSpec toVariablesMethod = MethodSpec.methodBuilder("toVariables")
            .addModifiers(Modifier.PUBLIC)
            .returns(ParameterizedTypeName.get(Map.class, String.class, Object.class))
            .addStatement("$T<$T, $T> variables = new $T<>()",
                Map.class, String.class, Object.class, HashMap.class)
            .addStatement("variables.put($S, initiatorId)", "initiatorId")
            .addStatement("variables.put($S, tenantId)", "tenantId")
            .addComment("Add other variables as needed")
            .addStatement("return variables")
            .build();

        dtoBuilder.addMethod(toVariablesMethod);

        JavaFile javaFile = JavaFile.builder(packageName, dtoBuilder.build())
            .addFileComment("GENERATED CODE - DO NOT MODIFY\n")
            .addFileComment("Source: Procedure Builder - Workflow Designer")
            .build();

        return javaFile.toString();
    }

    /**
     * Generate Response DTO
     */
    private String generateResponseDto(String packageName, WorkflowModel model) {
        TypeSpec responseDto = TypeSpec.classBuilder("ProcessInstanceResponse")
            .addModifiers(Modifier.PUBLIC)
            .addAnnotation(ClassName.get("lombok", "Data"))
            .addAnnotation(ClassName.get("lombok", "AllArgsConstructor"))
            .addField(FieldSpec.builder(long.class, "processInstanceKey", Modifier.PRIVATE).build())
            .build();

        JavaFile javaFile = JavaFile.builder(packageName, responseDto)
            .addFileComment("GENERATED CODE - DO NOT MODIFY")
            .build();

        return javaFile.toString();
    }

    /**
     * Generate pom.xml
     */
    private String generatePomXml(WorkflowModel model) {
        String artifactId = toKebabCase(model.getProcessId());
        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <project xmlns="http://maven.apache.org/POM/4.0.0"
                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
                <modelVersion>4.0.0</modelVersion>

                <parent>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-parent</artifactId>
                    <version>3.2.0</version>
                    <relativePath/>
                </parent>

                <groupId>cm.guce.generated</groupId>
                <artifactId>%s</artifactId>
                <version>1.0.0-SNAPSHOT</version>
                <name>%s</name>
                <description>Generated workflow service for %s</description>

                <properties>
                    <java.version>21</java.version>
                    <camunda.version>8.4.0</camunda.version>
                </properties>

                <dependencies>
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-web</artifactId>
                    </dependency>
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-validation</artifactId>
                    </dependency>
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-actuator</artifactId>
                    </dependency>
                    <dependency>
                        <groupId>io.camunda</groupId>
                        <artifactId>spring-zeebe-starter</artifactId>
                        <version>${camunda.version}</version>
                    </dependency>
                    <dependency>
                        <groupId>org.springdoc</groupId>
                        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
                        <version>2.3.0</version>
                    </dependency>
                    <dependency>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                        <optional>true</optional>
                    </dependency>
                </dependencies>

                <build>
                    <plugins>
                        <plugin>
                            <groupId>org.springframework.boot</groupId>
                            <artifactId>spring-boot-maven-plugin</artifactId>
                        </plugin>
                    </plugins>
                </build>
            </project>
            """.formatted(artifactId, model.getProcessName(), model.getProcessId());
    }

    /**
     * Generate application.yml
     */
    private String generateApplicationYml(WorkflowModel model, WorkflowDefinition workflowDef) {
        return """
            server:
              port: 8080

            spring:
              application:
                name: %s

            zeebe:
              client:
                broker:
                  gateway-address: ${ZEEBE_ADDRESS:localhost:26500}
                security:
                  plaintext: ${ZEEBE_PLAINTEXT:true}
                worker:
                  default-name: %s-worker
                  threads: 4

            management:
              endpoints:
                web:
                  exposure:
                    include: health,info,metrics

            logging:
              level:
                cm.guce: DEBUG
                io.camunda: INFO
            """.formatted(model.getProcessId(), model.getProcessId());
    }

    // Utility methods
    private String getClassName(String id) {
        return Arrays.stream(id.split("[-_]"))
            .map(s -> s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase())
            .reduce("", String::concat);
    }

    private String toKebabCase(String input) {
        return input.replaceAll("([a-z])([A-Z])", "$1-$2")
            .replaceAll("_", "-")
            .toLowerCase();
    }

    private String sanitizePackageName(String name) {
        return name.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    private Class<?> mapVariableType(String type) {
        if (type == null) return Object.class;
        return switch (type.toLowerCase()) {
            case "string", "text" -> String.class;
            case "integer", "int" -> Integer.class;
            case "long" -> Long.class;
            case "double", "decimal" -> Double.class;
            case "boolean", "bool" -> Boolean.class;
            case "date" -> java.time.LocalDate.class;
            case "datetime" -> java.time.LocalDateTime.class;
            default -> Object.class;
        };
    }

    /**
     * Generated code result
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class GeneratedCode {
        private String processId;
        private String packageName;
        private Map<String, String> files;
    }
}
