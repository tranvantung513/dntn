package com.example.DoantotnghiepIJ.dto.permission;


import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class PermissionResponse {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private String module;
}