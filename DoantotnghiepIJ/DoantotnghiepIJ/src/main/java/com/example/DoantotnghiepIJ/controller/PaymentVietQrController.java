package com.example.DoantotnghiepIJ.controller;

import com.example.DoantotnghiepIJ.dto.vietqr.VietQRResponseDTO;
import com.example.DoantotnghiepIJ.service.PaymentVietQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentVietQrController {

    private final PaymentVietQrService vietQrService;

    // ================== 1. TẠO QR ==================
    @PostMapping("/vietqr/{orderId}")
    public ResponseEntity<?> createQR(@PathVariable Long orderId) {

        VietQRResponseDTO response = vietQrService.createVietQR(orderId);

        return ResponseEntity.ok(response);
    }

    // ================== 2. CONFIRM THANH TOÁN ==================
    @PostMapping("/vietqr/confirm/{orderId}")
    public ResponseEntity<?> confirmPayment(@PathVariable Long orderId) {

        vietQrService.confirmPayment(orderId);

        return ResponseEntity.ok("Thanh toán thành công");
    }

    // ================== 3. TEST ENDPOINT ==================
    @GetMapping("/test")
    public String test() {
        return "Payment service is running...";
    }
}