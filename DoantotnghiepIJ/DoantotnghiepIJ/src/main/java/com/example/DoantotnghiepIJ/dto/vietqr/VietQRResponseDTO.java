package com.example.DoantotnghiepIJ.dto.vietqr;

import lombok.Data;

@Data
public class VietQRResponseDTO {
    private String qrCodeBase64;
    private String paymentContent;
    private Long amount;
}