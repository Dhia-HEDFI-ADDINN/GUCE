package cm.guce.common.util;

import java.text.Normalizer;
import java.util.Random;
import java.util.regex.Pattern;

/**
 * Utilitaires pour la manipulation de chaînes de caractères.
 */
public final class StringUtils {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Random RANDOM = new Random();

    private StringUtils() {
        // Utility class
    }

    /**
     * Vérifie si une chaîne est vide ou null.
     */
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Vérifie si une chaîne n'est pas vide.
     */
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    /**
     * Supprime les accents d'une chaîne.
     */
    public static String removeAccents(String str) {
        if (str == null) return null;
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return DIACRITICS.matcher(normalized).replaceAll("");
    }

    /**
     * Convertit en slug URL-friendly.
     */
    public static String toSlug(String str) {
        if (str == null) return null;
        return removeAccents(str)
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    /**
     * Génère un code alphanumérique aléatoire.
     */
    public static String generateCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Génère un numéro de référence avec préfixe et horodatage.
     * Format: PREFIX-YYYYMMDD-XXXXXX
     */
    public static String generateReference(String prefix) {
        String date = java.time.LocalDate.now().format(
                java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("%s-%s-%s", prefix, date, generateCode(6));
    }

    /**
     * Tronque une chaîne à la longueur spécifiée.
     */
    public static String truncate(String str, int maxLength) {
        if (str == null || str.length() <= maxLength) return str;
        return str.substring(0, maxLength - 3) + "...";
    }

    /**
     * Met en majuscule la première lettre.
     */
    public static String capitalize(String str) {
        if (isEmpty(str)) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    /**
     * Masque une partie d'une chaîne (pour les données sensibles).
     */
    public static String mask(String str, int visibleStart, int visibleEnd) {
        if (str == null || str.length() <= visibleStart + visibleEnd) {
            return str;
        }
        String start = str.substring(0, visibleStart);
        String end = str.substring(str.length() - visibleEnd);
        String masked = "*".repeat(str.length() - visibleStart - visibleEnd);
        return start + masked + end;
    }

    /**
     * Nettoie un numéro de téléphone (supprime espaces, tirets, etc.).
     */
    public static String cleanPhoneNumber(String phone) {
        if (phone == null) return null;
        return phone.replaceAll("[^0-9+]", "");
    }

    /**
     * Formate un montant avec séparateur de milliers.
     */
    public static String formatAmount(java.math.BigDecimal amount) {
        if (amount == null) return null;
        return String.format("%,.0f", amount);
    }
}
