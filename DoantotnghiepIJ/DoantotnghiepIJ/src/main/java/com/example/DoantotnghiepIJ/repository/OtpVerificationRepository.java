package com.example.DoantotnghiepIJ.repository;


import com.example.DoantotnghiepIJ.Enum.OtpType;
import com.example.DoantotnghiepIJ.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpType(String email, OtpType otpType);
}