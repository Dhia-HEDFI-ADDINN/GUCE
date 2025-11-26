package cm.guce.common.domain.exception;

/**
 * Exception levée pour les violations de règles métier.
 */
public class BusinessRuleException extends GUCEException {

    private static final String ERROR_CODE = "BUSINESS_RULE_VIOLATION";

    public BusinessRuleException(String message) {
        super(ERROR_CODE, message);
    }

    public BusinessRuleException(String ruleCode, String message) {
        super(ruleCode, message);
    }

    public BusinessRuleException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }
}
