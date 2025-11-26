package cm.guce.referential.domain.port;

import cm.guce.referential.domain.model.HsCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour la gestion des codes du Système Harmonisé.
 */
@Repository
public interface HsCodeRepository extends JpaRepository<HsCode, UUID> {

    Optional<HsCode> findByCode(String code);

    List<HsCode> findByChapter(String chapter);

    List<HsCode> findByHeading(String heading);

    List<HsCode> findByParentIsNull();

    List<HsCode> findByParentId(UUID parentId);

    @Query("SELECT h FROM HsCode h WHERE h.code LIKE :prefix%")
    List<HsCode> findByCodeStartingWith(@Param("prefix") String prefix);

    @Query("SELECT h FROM HsCode h WHERE " +
            "(LOWER(h.descriptionFr) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(h.descriptionEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "h.code LIKE CONCAT('%', :query, '%')) " +
            "AND h.isActive = true")
    Page<HsCode> search(@Param("query") String query, Pageable pageable);

    List<HsCode> findByRequiresLicenseTrue();

    List<HsCode> findByRequiresPhytosanitaryTrue();

    List<HsCode> findByIsProhibitedTrue();

    List<HsCode> findByIsRestrictedTrue();

    boolean existsByCode(String code);

    @Query("SELECT DISTINCT h.chapter FROM HsCode h WHERE h.isActive = true ORDER BY h.chapter")
    List<String> findAllChapters();
}
