package com.example.DoantotnghiepIJ.dto.CategoryDto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CategoryResponseDto {
    private Long id;
    private String name;
    private String description;
    private String publicId;
    private List<CategoryResponseDto> children;
    private Boolean active;
    private Long itemCount;
}