package com.example.DoantotnghiepIJ.dto.mail;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String email;
    private String type; // REGISTER hoặc FORGOT_PASSWORD
}