package com.example.DoantotnghiepIJ.dto.Table;


import lombok.Data;

@Data
public class RestaurantTableRequest {
    private String code;
    private String name;
    private Integer capacity;
    private String note;
}