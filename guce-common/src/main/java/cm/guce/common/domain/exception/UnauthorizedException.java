package cm.guce.common.domain.exception;

/**
 * Exception levée pour les accès non autorisés.
 */
public class UnauthorizedException extends GUCEException {

    private static final String ERROR_CODE = "UNAUTHORIZED";

    public UnauthorizedException(String message) {
        super(ERROR_CODE, message);
    }

    public UnauthorizedException() {
        super(ERROR_CODE, "Accès non autorisé");
    }
}
