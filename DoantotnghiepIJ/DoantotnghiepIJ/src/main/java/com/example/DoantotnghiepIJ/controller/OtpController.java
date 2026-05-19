package com.example.DoantotnghiepIJ.controller;

import com.example.DoantotnghiepIJ.Enum.OtpType;
import com.example.DoantotnghiepIJ.dto.mail.SendOtpRequest;
import com.example.DoantotnghiepIJ.dto.mail.VerifyOtpRequest;
import com.example.DoantotnghiepIJ.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest request) {

        OtpType type = OtpType.valueOf(request.getType());

        otpService.sendOtp(request.getEmail(), type);

        return ResponseEntity.ok("Đã gửi OTP");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {

        OtpType type = OtpType.valueOf(request.getType());

        boolean isValid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                type
        );

        if (!isValid) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("OTP không hợp lệ hoặc đã hết hạn");
        }

        return ResponseEntity.ok("Xác thực thành công");
    }
}