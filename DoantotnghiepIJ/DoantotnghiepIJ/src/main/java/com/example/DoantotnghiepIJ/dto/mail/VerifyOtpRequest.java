package com.example.DoantotnghiepIJ.dto.mail;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String type;
}