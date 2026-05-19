package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.Table.RestaurantTableRequest;
import com.example.DoantotnghiepIJ.dto.Table.RestaurantTableResponse;
import com.example.DoantotnghiepIJ.entity.RestaurantTable;

public class RestaurantTableMapper {

    public static RestaurantTable toEntity(RestaurantTableRequest request) {
        return RestaurantTable.builder()
                .code(request.getCode())
                .name(request.getName())
                .capacity(request.getCapacity())
                .note(request.getNote())
                .build();
    }

    public static RestaurantTableResponse toResponse(RestaurantTable entity) {
        return RestaurantTableResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .capacity(entity.getCapacity())
                .status(entity.getStatus())
                .note(entity.getNote())
                .build();
    }
}