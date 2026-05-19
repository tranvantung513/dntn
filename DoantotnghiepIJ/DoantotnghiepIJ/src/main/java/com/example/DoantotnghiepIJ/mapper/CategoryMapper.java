package com.example.DoantotnghiepIJ.mapper;


import com.example.DoantotnghiepIJ.dto.CategoryDto.CategoryResponseDto;
import com.example.DoantotnghiepIJ.dto.CategoryDto.CategorySimpleDto;
import com.example.DoantotnghiepIJ.dto.CategoryDto.CreateCategoryDto;
import com.example.DoantotnghiepIJ.dto.CategoryDto.UpdateCategoryDto;
import com.example.DoantotnghiepIJ.entity.Category;

public class CategoryMapper {

    public static Category toEntity(CreateCategoryDto dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return category;
    }

    public static void updateEntity(Category category, UpdateCategoryDto dto) {
        if (dto.getName() != null) {
            category.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription());
        }
    }

    public static CategorySimpleDto toSimpleDto(Category category) {
        CategorySimpleDto dto = new CategorySimpleDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setPublicId(category.getPublicId());
        return dto;
    }
    public static CategoryResponseDto toDto(Category category) {
        if (category == null) return null;

        CategoryResponseDto dto = new CategoryResponseDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setPublicId(category.getPublicId());

        // 🔥 thêm dòng này
        dto.setActive(category.getActive());

        if (category.getChildren() != null) {
            dto.setChildren(
                    category.getChildren()
                            .stream()
                            // 🔥 filter chuẩn production
                            .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
                            .map(CategoryMapper::toDto)
                            .toList()
            );
        }

        return dto;
    }
}