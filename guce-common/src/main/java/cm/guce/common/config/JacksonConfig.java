package cm.guce.common.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration Jackson pour la sérialisation JSON.
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Module pour Java 8 Date/Time
        mapper.registerModule(new JavaTimeModule());

        // Désactiver l'écriture des dates comme timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Ne pas inclure les valeurs nulles
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

        // Ignorer les propriétés inconnues lors de la désérialisation
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        // Activer l'indentation pour le débogage (désactiver en production)
        mapper.enable(SerializationFeature.INDENT_OUTPUT);

        return mapper;
    }
}
