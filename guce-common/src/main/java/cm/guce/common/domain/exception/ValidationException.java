package cm.guce.common.domain.exception;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception levée pour les erreurs de validation.
 */
@Getter
public class ValidationException extends GUCEException {

    private static final String ERROR_CODE = "VALIDATION_ERROR";
    private final List<FieldError> fieldErrors;

    public ValidationException(String message) {
        super(ERROR_CODE, message);
        this.fieldErrors = new ArrayList<>();
    }

    public ValidationException(String message, List<FieldError> fieldErrors) {
        super(ERROR_CODE, message);
        this.fieldErrors = fieldErrors != null ? fieldErrors : new ArrayList<>();
    }

    public ValidationException addFieldError(String field, String message) {
        this.fieldErrors.add(new FieldError(field, message));
        return this;
    }

    public boolean hasErrors() {
        return !fieldErrors.isEmpty();
    }

    public record FieldError(String field, String message) {}
}
