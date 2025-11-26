package cm.guce.common.domain.exception;

import java.util.UUID;

/**
 * Exception levée lorsqu'une ressource n'est pas trouvée.
 */
public class ResourceNotFoundException extends GUCEException {

    private static final String ERROR_CODE = "RESOURCE_NOT_FOUND";

    public ResourceNotFoundException(String resourceType, UUID id) {
        super(ERROR_CODE, "%s avec l'ID %s non trouvé", resourceType, id);
    }

    public ResourceNotFoundException(String resourceType, String identifier) {
        super(ERROR_CODE, "%s avec l'identifiant %s non trouvé", resourceType, identifier);
    }

    public ResourceNotFoundException(String message) {
        super(ERROR_CODE, message);
    }
}
