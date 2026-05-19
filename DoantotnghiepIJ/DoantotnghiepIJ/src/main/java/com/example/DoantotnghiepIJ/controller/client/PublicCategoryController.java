package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.dto.CategoryDto.CategoryResponseDto;
import com.example.DoantotnghiepIJ.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public endpoint cho khách hàng — không yêu cầu xác thực.
 * Được whitelist trong SecurityConfig tại /api/categories/**
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;

    /** Lấy danh mục dạng cây (tree) */
    @GetMapping("/tree")
    public ResponseEntity<?> getTree() {
        return ResponseEntity.ok(categoryService.getTree());
    }

    /** Lấy danh mục kèm số lượng sản phẩm */
    @GetMapping("/with-count")
    public List<CategoryResponseDto> getCategoriesWithItemCount() {
        return categoryService.getCategoriesWithItemCount();
    }

    /** Lấy danh mục theo ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }
}
