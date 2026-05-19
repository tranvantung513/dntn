package com.example.DoantotnghiepIJ.dto.login;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String message;
    private String fullName;
    private String accessToken;
    private String tokenType = "Bearer";
}