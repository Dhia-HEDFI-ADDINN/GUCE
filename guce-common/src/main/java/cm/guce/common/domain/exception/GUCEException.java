package cm.guce.common.domain.exception;

import lombok.Getter;

/**
 * Exception de base pour toutes les erreurs métier GUCE.
 */
@Getter
public class GUCEException extends RuntimeException {

    private final String errorCode;
    private final Object[] args;

    public GUCEException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    public GUCEException(String errorCode, String message, Object... args) {
        super(String.format(message, args));
        this.errorCode = errorCode;
        this.args = args;
    }

    public GUCEException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }
}
