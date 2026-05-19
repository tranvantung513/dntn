package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // ================= BASIC =================
    Optional<Category> findByName(String name);

    List<Category> findByParentIsNull();
    List<Category> findByDeletedFalse();


    // ================= PAGINATION =================
    Page<Category> findByDeletedFalse(Pageable pageable);

    Page<Category> findByDeletedFalseAndActive(Boolean active, Pageable pageable);

    Page<Category> findByDeletedFalseAndNameContainingIgnoreCase(
            String name, Pageable pageable
    );

    Page<Category> findByDeletedFalseAndActiveAndNameContainingIgnoreCase(
            Boolean active, String name, Pageable pageable
    );

    // ================= TREE =================
    @EntityGraph(attributePaths = {"children"})
    List<Category> findByParentIsNullAndDeletedFalse();

    // ================= STATS =================
    @Query("""
        SELECT COUNT(c)
        FROM Category c
        WHERE c.deleted = false
    """)
    long countAllCategories();

    @Query("""
        SELECT COUNT(c)
        FROM Category c
        LEFT JOIN MenuItem m ON m.category.id = c.id
        WHERE c.deleted = false AND m.id IS NULL
    """)
    long countEmptyCategories();

    // ================= ADVANCED (OPTIONAL) =================
    @Query("""
        SELECT c FROM Category c
        WHERE c.deleted = false
        AND (:active IS NULL OR c.active = :active)
        AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Category> search(
            @Param("keyword") String keyword,
            @Param("active") Boolean active,
            Pageable pageable
    );
//    số lượng món trong mỗi danh mục (bao gồm cả danh mục con)
@Query("""
    SELECT c.id, COUNT(m.id)
    FROM Category c
    LEFT JOIN c.menuItems m
        ON m.isDeleted = false
    WHERE c.deleted = false
    GROUP BY c.id
""")
List<Object[]> countItemsByCategory();
}