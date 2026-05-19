package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Category;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findByIsFeaturedTrue();
    // check slug
    boolean existsBySlug(String slug);

    // get all (paging)
    Page<MenuItem> findByIsDeletedFalse(Pageable pageable);

    // search theo name
    Page<MenuItem> findByNameContainingIgnoreCaseAndIsDeletedFalse(
            String name, Pageable pageable);

    // search + status
    Page<MenuItem> findByNameContainingIgnoreCaseAndIsActiveAndIsDeletedFalse(
            String name, Boolean isActive, Pageable pageable);

    // search + status + category
    Page<MenuItem> findByNameContainingIgnoreCaseAndIsActiveAndCategory_IdAndIsDeletedFalse(
            String name, Boolean isActive, UUID categoryId, Pageable pageable);
    long countByIsDeletedFalse();

    long countByIsDeletedFalseAndIsActiveTrue();


    @Query("""
SELECT m FROM MenuItem m
WHERE m.isDeleted = false
AND m.isActive = true
ORDER BY m.name ASC
""")
    List<MenuItem> getAllForChat();

    @Query("""
SELECT m FROM MenuItem m
WHERE m.isDeleted = false
AND m.isActive = true
AND (
 LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
 OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
)
""")
    List<MenuItem> searchForChat(@Param("keyword") String keyword);

    @Query("""
SELECT m FROM MenuItem m
WHERE m.isDeleted = false
AND m.isActive = true
AND m.isCombo = true
""")
    List<MenuItem> findComboItems();

    @Query("""
SELECT m FROM MenuItem m
WHERE m.isDeleted = false
AND m.isActive = true
AND m.isFeatured = true
""")
    List<MenuItem> findFeaturedItems();

    @Query("""
SELECT m FROM MenuItem m
WHERE m.isDeleted = false
AND m.isActive = true
AND (
 (m.discountPrice IS NOT NULL AND m.discountPrice <= :price)
 OR (m.discountPrice IS NULL AND m.price <= :price)
)
""")
    List<MenuItem> findByPriceForChat(@Param("price") Double price);


    List<MenuItem> findByCategory(Category category);
}