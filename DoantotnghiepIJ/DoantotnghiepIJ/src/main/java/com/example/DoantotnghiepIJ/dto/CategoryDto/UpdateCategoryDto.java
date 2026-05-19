package com.example.DoantotnghiepIJ.dto.CategoryDto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCategoryDto {
    private String name;
    private String description;
    private Long parentId;
    private Boolean active;
}