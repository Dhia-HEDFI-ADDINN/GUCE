package cm.guce.generator.application.service;

import cm.guce.generator.domain.model.AttributeDefinition;
import cm.guce.generator.domain.model.EntityDefinition;
import cm.guce.generator.domain.model.RelationDefinition;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service de génération de code automatique.
 *
 * Ce service génère le code source Java et Angular à partir des définitions d'entités.
 * Il préserve les zones de code personnalisé lors de la régénération.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CodeGeneratorService {

    private final Configuration freemarkerConfig;

    // Patterns pour la préservation du code personnalisé
    private static final Pattern CUSTOM_CODE_PATTERN = Pattern.compile(
            "// @CUSTOM_START([\\s\\S]*?)// @CUSTOM_END",
            Pattern.MULTILINE
    );

    private static final String GENERATED_START = "// === GENERATED CODE START - DO NOT MODIFY ===";
    private static final String GENERATED_END = "// === GENERATED CODE END ===";
    private static final String CUSTOM_START = "// @CUSTOM_START";
    private static final String CUSTOM_END = "// @CUSTOM_END";

    /**
     * Génère tous les artefacts pour une entité.
     */
    public GenerationResult generateAll(EntityDefinition entity) {
        log.info("Generating all artifacts for entity: {}", entity.getName());

        GenerationResult result = new GenerationResult();
        result.setEntityName(entity.getName());
        result.setGeneratedAt(LocalDateTime.now());

        try {
            // Génération des artefacts Java
            result.addArtifact("Entity", generateEntity(entity));
            result.addArtifact("Repository", generateRepository(entity));
            result.addArtifact("CreateRequestDto", generateCreateDto(entity));
            result.addArtifact("ResponseDto", generateResponseDto(entity));
            result.addArtifact("Mapper", generateMapper(entity));
            result.addArtifact("Service", generateService(entity));
            result.addArtifact("Controller", generateController(entity));

            // Génération de la migration Liquibase
            result.addArtifact("LiquibaseChangeset", generateLiquibaseChangeset(entity));

            // Génération des artefacts Angular
            result.addArtifact("TypeScriptModel", generateTypeScriptModel(entity));
            result.addArtifact("AngularService", generateAngularService(entity));

            result.setSuccess(true);
            log.info("Successfully generated all artifacts for entity: {}", entity.getName());

        } catch (Exception e) {
            log.error("Error generating artifacts for entity: {}", entity.getName(), e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    /**
     * Génère l'entité JPA.
     */
    public String generateEntity(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/entity.ftl", model);
    }

    /**
     * Génère le repository.
     */
    public String generateRepository(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/repository.ftl", model);
    }

    /**
     * Génère le DTO de création.
     */
    public String generateCreateDto(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/create-dto.ftl", model);
    }

    /**
     * Génère le DTO de réponse.
     */
    public String generateResponseDto(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/response-dto.ftl", model);
    }

    /**
     * Génère le mapper MapStruct.
     */
    public String generateMapper(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/mapper.ftl", model);
    }

    /**
     * Génère le service.
     */
    public String generateService(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/service.ftl", model);
    }

    /**
     * Génère le controller REST.
     */
    public String generateController(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/controller.ftl", model);
    }

    /**
     * Génère le changeset Liquibase.
     */
    public String generateLiquibaseChangeset(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("java/liquibase-changeset.ftl", model);
    }

    /**
     * Génère le modèle TypeScript.
     */
    public String generateTypeScriptModel(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("angular/model.ftl", model);
    }

    /**
     * Génère le service Angular.
     */
    public String generateAngularService(EntityDefinition entity) throws IOException, TemplateException {
        Map<String, Object> model = buildEntityModel(entity);
        return processTemplate("angular/service.ftl", model);
    }

    /**
     * Fusionne le nouveau code avec l'ancien en préservant les zones personnalisées.
     */
    public String mergeWithExisting(String newCode, String existingCode) {
        if (existingCode == null || existingCode.isBlank()) {
            return newCode;
        }

        // Extraire les zones personnalisées de l'ancien code
        Map<String, String> customSections = extractCustomSections(existingCode);

        // Injecter les zones personnalisées dans le nouveau code
        return injectCustomSections(newCode, customSections);
    }

    /**
     * Extrait les zones de code personnalisé.
     */
    private Map<String, String> extractCustomSections(String code) {
        Map<String, String> sections = new HashMap<>();
        Matcher matcher = CUSTOM_CODE_PATTERN.matcher(code);

        int index = 0;
        while (matcher.find()) {
            sections.put("custom_" + index, matcher.group(1));
            index++;
        }

        return sections;
    }

    /**
     * Injecte les zones personnalisées dans le code généré.
     */
    private String injectCustomSections(String code, Map<String, String> customSections) {
        StringBuilder result = new StringBuilder(code);

        for (Map.Entry<String, String> entry : customSections.entrySet()) {
            // Trouver la position du marqueur de zone personnalisée
            int customStartPos = result.indexOf(CUSTOM_START);
            if (customStartPos != -1) {
                int customEndPos = result.indexOf(CUSTOM_END, customStartPos);
                if (customEndPos != -1) {
                    // Remplacer le contenu entre les marqueurs
                    result.replace(
                            customStartPos + CUSTOM_START.length(),
                            customEndPos,
                            entry.getValue()
                    );
                }
            }
        }

        return result.toString();
    }

    /**
     * Construit le modèle de données pour les templates.
     */
    private Map<String, Object> buildEntityModel(EntityDefinition entity) {
        Map<String, Object> model = new HashMap<>();

        model.put("entity", entity);
        model.put("className", entity.getClassName());
        model.put("camelCaseName", entity.getCamelCaseName());
        model.put("tableName", entity.getSnakeCaseTableName());
        model.put("packageName", entity.getPackageName());
        model.put("moduleName", entity.getModuleName());
        model.put("apiPath", entity.getApiPath());
        model.put("descriptionFr", entity.getDescriptionFr());

        // Attributs
        List<AttributeDefinition> attributes = entity.getAttributes();
        model.put("attributes", attributes);
        model.put("requiredAttributes", attributes.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsRequired()))
                .toList());
        model.put("searchableAttributes", attributes.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsSearchable()))
                .toList());

        // Relations
        List<RelationDefinition> relations = entity.getRelations();
        model.put("relations", relations);

        // Options de génération
        model.put("generateCrud", entity.getGenerateCrud());
        model.put("generateSearch", entity.getGenerateSearch());
        model.put("generateAudit", entity.getGenerateAudit());
        model.put("extendsBaseEntity", entity.getExtendsBaseEntity());

        // Marqueurs de zone
        model.put("generatedStart", GENERATED_START);
        model.put("generatedEnd", GENERATED_END);
        model.put("customStart", CUSTOM_START);
        model.put("customEnd", CUSTOM_END);

        // Métadonnées
        model.put("generatedAt", LocalDateTime.now());
        model.put("generatorVersion", "1.0.0");

        return model;
    }

    /**
     * Traite un template Freemarker.
     */
    private String processTemplate(String templateName, Map<String, Object> model)
            throws IOException, TemplateException {
        Template template = freemarkerConfig.getTemplate(templateName);
        StringWriter writer = new StringWriter();
        template.process(model, writer);
        return writer.toString();
    }

    /**
     * Résultat de la génération.
     */
    @lombok.Data
    public static class GenerationResult {
        private String entityName;
        private LocalDateTime generatedAt;
        private boolean success;
        private String errorMessage;
        private Map<String, String> artifacts = new HashMap<>();

        public void addArtifact(String name, String content) {
            artifacts.put(name, content);
        }
    }
}
