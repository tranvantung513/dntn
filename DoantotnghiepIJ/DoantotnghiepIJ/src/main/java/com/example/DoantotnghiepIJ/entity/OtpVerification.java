package com.example.DoantotnghiepIJ.entity;

import com.example.DoantotnghiepIJ.Enum.OtpType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
public class OtpVerification {

    @Id
    @GeneratedValue
    private Long id;

    private String email;
    private String otp;
    private OtpType otpType;
    private LocalDateTime expiredAt;
    private LocalDateTime sentAt;
}