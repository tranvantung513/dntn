package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.CategoryDto.CategoryResponseDto;
import com.example.DoantotnghiepIJ.dto.CategoryDto.CreateCategoryDto;
import com.example.DoantotnghiepIJ.dto.CategoryDto.UpdateCategoryDto;
import com.example.DoantotnghiepIJ.entity.Category;
import com.example.DoantotnghiepIJ.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAuthority('CATEGORY_CREATE')")
    public ResponseEntity<?> create(@RequestBody CreateCategoryDto dto) {
        return ResponseEntity.ok(categoryService.create(dto));
    }

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public Page<Category> getCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return categoryService.getCategories(
                keyword,
                active,
                sort,
                page,
                size
        );
    }

    // ================= GET TREE =================
    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public ResponseEntity<?> getTree() {
        return ResponseEntity.ok(categoryService.getTree());
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody UpdateCategoryDto dto
    ) {
        return ResponseEntity.ok(
                categoryService.update(id, dto)
        );
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_DELETE')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(
                "Deleted category with id: " + id
        );
    }

    // ================= DASHBOARD =================
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(
                categoryService.getCategoryStats()
        );
    }

    // ================= TOGGLE ACTIVE =================
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id
    ) {
        categoryService.toggleActive(id);
        return ResponseEntity.ok(
                "Updated status successfully"
        );
    }

    // ================= CATEGORY WITH ITEM COUNT =================
    @GetMapping("/with-count")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public List<CategoryResponseDto> getCategoriesWithItemCount() {
        return categoryService.getCategoriesWithItemCount();
    }
}