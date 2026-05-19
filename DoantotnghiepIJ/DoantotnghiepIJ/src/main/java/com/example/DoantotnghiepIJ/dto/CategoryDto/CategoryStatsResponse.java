package com.example.DoantotnghiepIJ.dto.CategoryDto;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryStatsResponse {
    private long totalCategories;
    private long emptyCategories;
}