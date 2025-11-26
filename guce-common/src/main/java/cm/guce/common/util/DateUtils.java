package cm.guce.common.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Utilitaires pour la gestion des dates.
 */
public final class DateUtils {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Africa/Douala");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_DATE;
    private static final DateTimeFormatter ISO_DATE_TIME = DateTimeFormatter.ISO_DATE_TIME;
    private static final DateTimeFormatter FR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FR_DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private DateUtils() {
        // Utility class
    }

    /**
     * Retourne la date/heure actuelle dans le fuseau horaire par défaut (Douala).
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(DEFAULT_ZONE);
    }

    /**
     * Retourne la date actuelle dans le fuseau horaire par défaut.
     */
    public static LocalDate today() {
        return LocalDate.now(DEFAULT_ZONE);
    }

    /**
     * Formate une date au format ISO.
     */
    public static String formatIsoDate(LocalDate date) {
        return date != null ? date.format(ISO_DATE) : null;
    }

    /**
     * Formate une date/heure au format ISO.
     */
    public static String formatIsoDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(ISO_DATE_TIME) : null;
    }

    /**
     * Formate une date au format français (dd/MM/yyyy).
     */
    public static String formatFrDate(LocalDate date) {
        return date != null ? date.format(FR_DATE) : null;
    }

    /**
     * Formate une date/heure au format français (dd/MM/yyyy HH:mm:ss).
     */
    public static String formatFrDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(FR_DATE_TIME) : null;
    }

    /**
     * Parse une date ISO.
     */
    public static LocalDate parseIsoDate(String date) {
        return date != null ? LocalDate.parse(date, ISO_DATE) : null;
    }

    /**
     * Parse une date/heure ISO.
     */
    public static LocalDateTime parseIsoDateTime(String dateTime) {
        return dateTime != null ? LocalDateTime.parse(dateTime, ISO_DATE_TIME) : null;
    }

    /**
     * Calcule le nombre de jours ouvrés entre deux dates.
     */
    public static long workingDaysBetween(LocalDate start, LocalDate end) {
        return start.datesUntil(end)
                .filter(d -> d.getDayOfWeek() != DayOfWeek.SATURDAY
                        && d.getDayOfWeek() != DayOfWeek.SUNDAY)
                .count();
    }

    /**
     * Ajoute des jours ouvrés à une date.
     */
    public static LocalDate addWorkingDays(LocalDate date, int days) {
        LocalDate result = date;
        int addedDays = 0;
        while (addedDays < days) {
            result = result.plusDays(1);
            if (result.getDayOfWeek() != DayOfWeek.SATURDAY
                    && result.getDayOfWeek() != DayOfWeek.SUNDAY) {
                addedDays++;
            }
        }
        return result;
    }

    /**
     * Vérifie si une date est dans le passé.
     */
    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(now());
    }

    /**
     * Vérifie si une date est dans le futur.
     */
    public static boolean isFuture(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(now());
    }

    /**
     * Calcule la durée entre deux dates/heures en minutes.
     */
    public static long minutesBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.MINUTES.between(start, end);
    }

    /**
     * Début de journée.
     */
    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    /**
     * Fin de journée.
     */
    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }
}
