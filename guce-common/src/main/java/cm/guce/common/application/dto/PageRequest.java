package cm.guce.common.application.dto;

import lombok.Data;

/**
 * DTO pour les requêtes de pagination.
 */
@Data
public class PageRequest {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private int page = DEFAULT_PAGE;
    private int size = DEFAULT_SIZE;
    private String sortBy;
    private String sortDirection = "ASC";

    public void setSize(int size) {
        this.size = Math.min(size, MAX_SIZE);
    }

    public org.springframework.data.domain.PageRequest toPageable() {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if (sortBy != null && !sortBy.isBlank()) {
            sort = "DESC".equalsIgnoreCase(sortDirection)
                    ? org.springframework.data.domain.Sort.by(sortBy).descending()
                    : org.springframework.data.domain.Sort.by(sortBy).ascending();
        }
        return org.springframework.data.domain.PageRequest.of(page, size, sort);
    }
}
