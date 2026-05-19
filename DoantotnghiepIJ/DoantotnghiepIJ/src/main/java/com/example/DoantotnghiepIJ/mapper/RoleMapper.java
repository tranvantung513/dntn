package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.role.RoleRequest;
import com.example.DoantotnghiepIJ.dto.role.RoleResponse;
import com.example.DoantotnghiepIJ.entity.Role;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RoleMapper {

    public Role toEntity(RoleRequest request) {
        return Role.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.getIsSystem())
                .isActive(role.getIsActive())
                .isDeleted(role.getIsDeleted())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}