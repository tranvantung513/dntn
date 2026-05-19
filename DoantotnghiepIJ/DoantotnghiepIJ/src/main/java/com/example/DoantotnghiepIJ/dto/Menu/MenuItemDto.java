package com.example.DoantotnghiepIJ.dto.Menu;



import lombok.Data;

import java.util.UUID;

@Data
public class MenuItemDto {
    private UUID id;
    private String thumbnail;
    private String name;
    private String slug;
    private String description;
    private Double price;
    private Double discountPrice;
    private Long categoryId;
    private Integer quantity;
    private Boolean isActive;
    private Boolean isFeatured;
}