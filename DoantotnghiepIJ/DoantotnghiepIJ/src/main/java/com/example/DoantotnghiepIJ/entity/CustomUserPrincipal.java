package com.example.DoantotnghiepIJ.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CustomUserPrincipal {
    private Long userId;
    private String email;
    private String role;
}