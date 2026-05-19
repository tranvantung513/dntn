package com.example.DoantotnghiepIJ.dto.Table;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RestaurantTableResponse {
    private UUID id;
    private String code;
    private String name;
    private Integer capacity;
    private Integer status;
    private String note;
}