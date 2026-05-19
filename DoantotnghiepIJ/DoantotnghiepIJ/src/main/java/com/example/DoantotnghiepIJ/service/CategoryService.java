package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.CategoryDto.*;
import com.example.DoantotnghiepIJ.entity.Category;
import com.example.DoantotnghiepIJ.exception.*;
import com.example.DoantotnghiepIJ.mapper.CategoryMapper;
import com.example.DoantotnghiepIJ.repository.CategoryRepository;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // ================= CREATE =================
    public CategoryResponseDto create(CreateCategoryDto dto) {

        categoryRepository.findByName(dto.getName())
                .ifPresent(c -> {
                    throw new BadRequestException("Category already exists");
                });

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setActive(true);
        // set parent nếu có
        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent not found"));
            category.setParent(parent);
        }

        return CategoryMapper.toDto(categoryRepository.save(category));
    }

    // ================= TREE =================
    public List<CategoryResponseDto> getTree() {

        List<Category> roots = categoryRepository
                .findByParentIsNullAndDeletedFalse()
                .stream()
                // 🔥 lọc active ngay từ root
//                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .toList();

        return roots.stream()
                .map(CategoryMapper::toDto)
                .toList();
    }

    // ================= GET ALL (SEARCH + FILTER ACTIVE) =================
    public Page<Category> getCategories(String keyword, Boolean active, String sort, int page, int size) {

        // 🔥 xử lý sort
        Sort sortOption;

        if ("name_asc".equals(sort)) {
            sortOption = Sort.by("name").ascending();
        } else if ("name_desc".equals(sort)) {
            sortOption = Sort.by("name").descending();
        } else {
            sortOption = Sort.by("createdAt").descending(); // mặc định
        }

        Pageable pageable = PageRequest.of(page, size, sortOption);
        String search = (keyword != null) ? keyword.trim() : null;

        // 🔥 CASE 1: không search
        if (search == null || search.isEmpty()) {

            if (active == null) {
                return categoryRepository.findByDeletedFalse(pageable);
            }

            return categoryRepository.findByDeletedFalseAndActive(active, pageable);
        }

        // 🔥 CASE 2: có search
        if (active == null) {
            return categoryRepository
                    .findByDeletedFalseAndNameContainingIgnoreCase(search, pageable);
        }

        return categoryRepository
                .findByDeletedFalseAndActiveAndNameContainingIgnoreCase(active, search, pageable);
    }
    // ================= GET BY ID =================
    public CategoryResponseDto getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        return CategoryMapper.toDto(category);
    }

    // ================= UPDATE =================
    public CategoryResponseDto update(Long id, UpdateCategoryDto dto) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new BadRequestException("Cannot update deleted category");
        }

        // update basic fields
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        // 🔥 update active
        if (dto.getActive() != null) {
            category.setActive(dto.getActive());

            // optional: tắt luôn con
            if (!dto.getActive()) {
                disableChildren(category);
            }
        }

        // 🔥 xử lý parent
        if (dto.getParentId() != null) {

            if (dto.getParentId().equals(id)) {
                throw new BadRequestException("Category cannot be its own parent");
            }

            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent not found"));

            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return CategoryMapper.toDto(categoryRepository.save(category));
    }

    // ================= DELETE (SOFT) =================
    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new BadRequestException("Category already deleted");
        }

        category.setDeleted(true);
        categoryRepository.save(category);
    }

    // ================= TOGGLE ACTIVE =================
    public void toggleActive(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new BadRequestException("Cannot update deleted category");
        }

        category.setActive(!Boolean.TRUE.equals(category.getActive()));

        // optional: tắt luôn con
        if (!category.getActive()) {
            disableChildren(category);
        }

        categoryRepository.save(category);
    }

    // ================= DASHBOARD =================
    public CategoryStatsResponse getCategoryStats() {
        long total = categoryRepository.countAllCategories();
        long empty = categoryRepository.countEmptyCategories();

        return CategoryStatsResponse.builder()
                .totalCategories(total)
                .emptyCategories(empty)
                .build();
    }

    // ================= HELPER =================
    private void disableChildren(Category category) {
        if (category.getChildren() != null) {
            for (Category child : category.getChildren()) {
                child.setActive(false);
                disableChildren(child);
            }
        }
    }
    public List<CategoryResponseDto> getCategoriesWithItemCount() {

        List<Category> categories = categoryRepository.findByDeletedFalse();

        // 🔥 lấy count từ DB (1 query)
        List<Object[]> counts = categoryRepository.countItemsByCategory();

        // map: categoryId -> count
        Map<Long, Long> countMap = counts.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        return categories.stream().map(c -> {
            CategoryResponseDto dto = CategoryMapper.toDto(c);

            // 🔥 set item count
            dto.setItemCount(countMap.getOrDefault(c.getId(), 0L));

            return dto;
        }).toList();
    }
}