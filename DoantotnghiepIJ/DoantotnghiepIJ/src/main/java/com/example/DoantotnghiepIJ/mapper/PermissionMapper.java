package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.permission.PermissionRequest;
import com.example.DoantotnghiepIJ.dto.permission.PermissionResponse;
import com.example.DoantotnghiepIJ.entity.Permission;

public class PermissionMapper {

    public static Permission toEntity(PermissionRequest req) {
        return Permission.builder()
                .code(req.getCode())
                .name(req.getName())
                .description(req.getDescription())
                .module(req.getModule())
                .build();
    }

    public static PermissionResponse toResponse(Permission entity) {
        return PermissionResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .module(entity.getModule())
                .build();
    }

    public static void update(Permission entity, PermissionRequest req) {
        entity.setCode(req.getCode());
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setModule(req.getModule());
    }
}